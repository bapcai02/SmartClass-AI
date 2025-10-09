<?php

namespace App\Repositories;

use App\Models\ClassRoom;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class ClassroomRepository
{
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return ClassRoom::query()
            ->with(['teacher:id,name,email', 'subject:id,name'])
            ->withCount('students')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findById(int $id): ClassRoom
    {
        /** @var ClassRoom|null $classroom */
        $classroom = ClassRoom::query()
            ->with([
                'teacher:id,name,email',
                'subject:id,name',
                'students:id,name',
            ])
            ->withCount('students')
            ->find($id);

        if (! $classroom) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        return $classroom;
    }

    public function create(array $data): ClassRoom
    {
        return ClassRoom::query()->create($data);
    }

    public function update(int $id, array $data): ClassRoom
    {
        $classroom = $this->findById($id);
        $classroom->fill($data);
        $classroom->save();

        return $classroom->refresh();
    }

    public function delete(int $id): void
    {
        $classroom = $this->findById($id);
        $classroom->delete();
    }

    /**
     * Fetch rich classroom detail with optional related datasets and counts.
     *
     * @param int $id
     * @param array $includes e.g. ['students','assignments','exams','resources']
     * @param array $limits e.g. ['students'=>20,'assignments'=>5]
     */
    public function findDetailById(int $id, array $includes = [], array $limits = []): ClassRoom
    {
        $query = ClassRoom::query()
            ->with([
                'teacher:id,name,email',
                'subject:id,name',
            ])
            ->withCount(['students', 'assignments', 'exams', 'resources']);

        if (in_array('students', $includes, true)) {
            $limit = $limits['students'] ?? null;
            $query->with(['students' => function ($q) use ($limit) {
                $q->select('users.id', 'users.name', 'users.email');
                if ($limit) { $q->limit((int) $limit); }
            }]);
        }

        if (in_array('assignments', $includes, true)) {
            $limit = $limits['assignments'] ?? 5;
            $query->with(['assignments' => function ($q) use ($limit) {
                $q->latest('id')->limit((int) $limit)->select('id', 'title', 'due_date', 'class_id');
            }]);
        }

        if (in_array('exams', $includes, true)) {
            $limit = $limits['exams'] ?? 5;
            $query->with(['exams' => function ($q) use ($limit) {
                $q->latest('id')->limit((int) $limit)->select('id', 'title', 'date', 'class_id');
            }]);
        }

        if (in_array('resources', $includes, true)) {
            $limit = $limits['resources'] ?? 5;
            $query->with(['resources' => function ($q) use ($limit) {
                $q->latest('id')
                    ->limit((int) $limit)
                    ->select('id', 'class_id', 'title', 'file_url', 'uploaded_by', 'uploaded_at', 'created_at')
                    ->with(['uploader:id,name']);
            }]);
        }

        if (in_array('timetables', $includes, true)) {
            $limit = $limits['timetables'] ?? 5;
            $query->with(['timetables' => function ($q) use ($limit) {
                $q->orderBy('day_of_week')->orderBy('start_time')
                    ->limit((int) $limit)
                    ->select('id','class_id','subject_id','teacher_id','day_of_week','start_time','end_time','room');
            }]);
        }

        /** @var ClassRoom|null $classroom */
        $classroom = $query->find($id);

        if (! $classroom) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        // Aggregate metrics (basic examples)
        // Attendance rate: present / (present + absent + late) for this class (via timetables)
        $attendance = DB::table('attendances')
            ->join('timetables', 'attendances.timetable_id', '=', 'timetables.id')
            ->where('timetables.class_id', $id)
            ->selectRaw("SUM(attendances.status = 'present') as present_count, SUM(attendances.status = 'absent') as absent_count, SUM(attendances.status = 'late') as late_count")
            ->first();

        $present = (int) ($attendance->present_count ?? 0);
        $absent = (int) ($attendance->absent_count ?? 0);
        $late = (int) ($attendance->late_count ?? 0);
        $totalAttend = $present + $absent + $late;
        $classroom->attendance_rate = $totalAttend > 0 ? round(($present / max(1, $totalAttend)) * 100) : null;

        // Average grade from exam_submissions (simple mean of grade)
        $avgGrade = DB::table('exam_submissions')
            ->join('exams', 'exam_submissions.exam_id', '=', 'exams.id')
            ->where('exams.class_id', $id)
            ->avg('exam_submissions.grade');
        $classroom->average_grade = $avgGrade ? round((float) $avgGrade, 2) : null;

        // Performance over time (last 6 weeks average grade by week)
        $series = DB::table('exam_submissions')
            ->join('exams', 'exam_submissions.exam_id', '=', 'exams.id')
            ->where('exams.class_id', $id)
            ->whereNotNull('exam_submissions.grade')
            ->selectRaw("DATE_FORMAT(COALESCE(exam_submissions.submitted_at, exam_submissions.created_at), '%x-%v') as yw, AVG(grade) as avg_grade")
            ->groupBy('yw')
            ->orderBy('yw', 'desc')
            ->limit(6)
            ->get()
            ->reverse()
            ->values();

        $classroom->performance_over_time = $series->map(function ($row) {
            return [
                'week' => $row->yw,
                'score' => round((float) $row->avg_grade, 2),
            ];
        });

        return $classroom;
    }

    public function paginateStudents(int $classId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        $base = DB::table('class_students')
            ->join('users', 'class_students.student_id', '=', 'users.id')
            ->where('class_students.class_id', $classId)
            ->select('users.id', 'users.name', 'users.email')
            ->orderBy('users.name');

        if ($search !== '') {
            $base->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%");
            });
        }

        // Attendance percent per student in this class
        $base->addSelect([
            'attendance_percent' => DB::raw("(
                SELECT ROUND(100 * SUM(a.status = 'present') / NULLIF(COUNT(*),0))
                FROM attendances a
                JOIN timetables tt ON a.timetable_id = tt.id
                WHERE tt.class_id = class_students.class_id AND a.student_id = users.id
            )"),
        ]);

        // Average grade per student in this class (exams)
        $base->addSelect([
            'avg_grade' => DB::raw("(
                SELECT ROUND(AVG(es.grade), 2)
                FROM exam_submissions es
                JOIN exams ex ON es.exam_id = ex.id
                WHERE ex.class_id = class_students.class_id AND es.student_id = users.id
            )"),
        ]);

        // Active status by recent attendance within 30 days
        $base->addSelect([
            'is_active' => DB::raw("(
                SELECT CASE WHEN MAX(COALESCE(a.checked_at, a.updated_at)) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END
                FROM attendances a
                JOIN timetables tt ON a.timetable_id = tt.id
                WHERE tt.class_id = class_students.class_id AND a.student_id = users.id
            )"),
        ]);

        return $base->paginate($perPage);
    }

    public function attachStudents(int $classId, array $studentIds): ClassRoom
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }
        $class->students()->syncWithoutDetaching($studentIds);
        return $class->loadCount('students');
    }

    public function detachStudents(int $classId, array $studentIds): ClassRoom
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }
        $class->students()->detach($studentIds);
        return $class->loadCount('students');
    }

    public function createResource(int $classId, array $data)
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }
        return $class->resources()->create($data);
    }

    public function getAttendance(int $classId, ?string $from = null, ?string $to = null): array
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        $query = DB::table('attendances as a')
            ->join('timetables as tt', 'a.timetable_id', '=', 'tt.id')
            ->join('users as u', 'a.student_id', '=', 'u.id')
            ->where('tt.class_id', $classId)
            ->select(
                'u.id as student_id',
                'u.name as student_name',
                DB::raw("DATE(COALESCE(a.checked_at, a.updated_at, a.created_at)) as date"),
                'a.status'
            );

        if ($from) { $query->whereDate(DB::raw("DATE(COALESCE(a.checked_at, a.updated_at, a.created_at))"), '>=', $from); }
        if ($to) { $query->whereDate(DB::raw("DATE(COALESCE(a.checked_at, a.updated_at, a.created_at))"), '<=', $to); }

        $rows = $query->orderBy('u.name')->orderBy('date')->get();

        $byStudent = [];
        foreach ($rows as $r) {
            $sid = (int) $r->student_id;
            if (!isset($byStudent[$sid])) {
                $byStudent[$sid] = [
                    'id' => $sid,
                    'name' => $r->student_name,
                    'marks' => [],
                ];
            }
            $byStudent[$sid]['marks'][$r->date] = $r->status; // 'present' | 'absent' | 'late'
        }

        // Summary
        $summary = DB::table('attendances as a')
            ->join('timetables as tt', 'a.timetable_id', '=', 'tt.id')
            ->where('tt.class_id', $classId)
            ->when($from, fn($q) => $q->whereDate(DB::raw("DATE(COALESCE(a.checked_at, a.updated_at, a.created_at))"), '>=', $from))
            ->when($to, fn($q) => $q->whereDate(DB::raw("DATE(COALESCE(a.checked_at, a.updated_at, a.created_at))"), '<=', $to))
            ->selectRaw("SUM(a.status='present') as present_cnt, SUM(a.status='absent') as absent_cnt, SUM(a.status='late') as late_cnt, COUNT(*) as total_cnt")
            ->first();

        return [
            'rows' => array_values($byStudent),
            'summary' => [
                'present' => (int) ($summary->present_cnt ?? 0),
                'absent' => (int) ($summary->absent_cnt ?? 0),
                'late' => (int) ($summary->late_cnt ?? 0),
                'pct' => ($summary->total_cnt ?? 0) ? round(((int) $summary->present_cnt) / max(1, (int) $summary->total_cnt) * 100) : 0,
            ],
        ];
    }

    /**
     * Get leaderboard entries for a class with student names.
     */
    public function getLeaderboard(int $classId, int $limit = 10): array
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        $rows = DB::table('leaderboard as l')
            ->join('users as u', 'l.student_id', '=', 'u.id')
            ->where('l.class_id', $classId)
            ->orderByRaw('COALESCE(l.rank, 999999) ASC')
            ->orderByDesc('l.total_points')
            ->limit($limit)
            ->select('l.student_id as id', 'u.name', 'l.total_points as points', 'l.rank')
            ->get();

        return $rows->map(fn($r) => [
            'id' => (int) $r->id,
            'name' => (string) $r->name,
            'points' => (int) $r->points,
            'rank' => $r->rank !== null ? (int) $r->rank : null,
        ])->values()->all();
    }

    /**
     * Paginate announcements for a class with author name.
     */
    public function getAnnouncements(int $classId, int $perPage = 15)
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        return DB::table('announcements as a')
            ->join('users as u', 'a.created_by', '=', 'u.id')
            ->where('a.class_id', $classId)
            ->orderByDesc('a.id')
            ->select('a.id', 'a.title', 'a.content', 'a.created_at', 'u.name as author')
            ->paginate($perPage);
    }

    /**
     * Create a new announcement for a class and return it with author name.
     */
    public function createAnnouncement(int $classId, array $data)
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        $id = DB::table('announcements')->insertGetId([
            'class_id' => $classId,
            'title' => $data['title'],
            'content' => $data['content'],
            'created_by' => $data['created_by'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('announcements as a')
            ->join('users as u', 'a.created_by', '=', 'u.id')
            ->where('a.id', $id)
            ->select('a.id', 'a.title', 'a.content', 'a.created_at', 'u.name as author')
            ->first();
    }

    /**
     * Build a gradebook matrix for a class with students x items (assignments + exams).
     * Returns structure: {
     *   students: [{ id, name }...],
     *   items: [{ id, type: 'assignment'|'exam', title, max?: number, due_date|date }...],
     *   grades: { [studentId]: { [itemKey]: number|null } }
     * }
     */
    public function getGradebook(int $classId): array
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        // Students
        $students = DB::table('class_students as cs')
            ->join('users as u', 'cs.student_id', '=', 'u.id')
            ->where('cs.class_id', $classId)
            ->orderBy('u.name')
            ->select('u.id', 'u.name')
            ->get();

        // Items: assignments + exams for the class
        $assignments = DB::table('assignments')
            ->where('class_id', $classId)
            ->select('id', DB::raw("'assignment' as type"), 'title', 'due_date')
            ->get();

        $exams = DB::table('exams')
            ->where('class_id', $classId)
            ->select('id', DB::raw("'exam' as type"), 'title', DB::raw("start_time as date"))
            ->get();

        // Normalize items to a common shape and stable order (by date then title)
        $items = [];
        foreach ($assignments as $a) {
            $items[] = [
                'id' => (int) $a->id,
                'type' => 'assignment',
                'title' => $a->title,
                'date' => (string) ($a->due_date ?? ''),
            ];
        }
        foreach ($exams as $e) {
            $items[] = [
                'id' => (int) $e->id,
                'type' => 'exam',
                'title' => $e->title,
                'date' => (string) ($e->date ?? ''),
            ];
        }

        usort($items, function ($l, $r) {
            $ld = $l['date'] ?: '9999-12-31';
            $rd = $r['date'] ?: '9999-12-31';
            if ($ld === $rd) {
                return strcmp($l['title'], $r['title']);
            }
            return strcmp($ld, $rd);
        });

        // Preload grades for assignments and exams
        $assignmentGrades = DB::table('assignment_submissions as s')
            ->join('assignments as a', 's.assignment_id', '=', 'a.id')
            ->where('a.class_id', $classId)
            ->whereNotNull('s.grade')
            ->select('s.student_id', 's.assignment_id', 's.grade')
            ->get();

        $examGrades = DB::table('exam_submissions as s')
            ->join('exams as e', 's.exam_id', '=', 'e.id')
            ->where('e.class_id', $classId)
            ->whereNotNull('s.grade')
            ->select('s.student_id', 's.exam_id', 's.grade')
            ->get();

        // Initialize grades matrix
        $grades = [];
        foreach ($students as $s) {
            $grades[$s->id] = [];
        }

        foreach ($assignmentGrades as $g) {
            $grades[$g->student_id]['assignment:'.$g->assignment_id] = (float) $g->grade;
        }
        foreach ($examGrades as $g) {
            $grades[$g->student_id]['exam:'.$g->exam_id] = (float) $g->grade;
        }

        return [
            'students' => $students->map(fn($s) => ['id' => (int) $s->id, 'name' => $s->name])->values(),
            'items' => array_map(function ($it) {
                return [
                    'id' => $it['id'],
                    'type' => $it['type'],
                    'title' => $it['title'],
                    'date' => $it['date'],
                    'key' => $it['type'].':'.$it['id'],
                ];
            }, $items),
            'grades' => $grades,
        ];
    }
}

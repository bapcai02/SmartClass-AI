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
                $q->latest('id')->limit((int) $limit)->select('id', 'title', 'type', 'url', 'class_id');
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
}



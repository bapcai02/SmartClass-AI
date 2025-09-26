<?php

namespace App\Repositories;

use App\Models\ClassRoom;
use App\Models\Exam;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ExamRepository
{
    public function listByClass(int $classId, int $perPage = 15): LengthAwarePaginator
    {
        /** @var ClassRoom|null $class */
        $class = ClassRoom::query()->find($classId);
        if (! $class) {
            throw new ModelNotFoundException('Classroom not found.');
        }

        return Exam::query()
            ->where('class_id', $classId)
            ->orderByDesc('start_time')
            ->paginate($perPage);
    }

    public function findInClass(int $classId, int $id): Exam
    {
        /** @var Exam|null $exam */
        $exam = Exam::query()->where('class_id', $classId)->find($id);
        if (! $exam) {
            throw new ModelNotFoundException('Exam not found.');
        }
        return $exam;
    }

    public function create(int $classId, array $data): Exam
    {
        $data['class_id'] = $classId;
        return Exam::query()->create($data);
    }

    public function update(int $classId, int $id, array $data): Exam
    {
        $exam = $this->findInClass($classId, $id);
        $exam->fill($data);
        $exam->save();
        return $exam->refresh();
    }

    public function delete(int $classId, int $id): void
    {
        $exam = $this->findInClass($classId, $id);
        $exam->delete();
    }

    /**
     * Stats and per-student results for an exam in a class.
     */
    public function getStats(int $classId, int $examId): array
    {
        $exam = $this->findInClass($classId, $examId);

        $students = \Illuminate\Support\Facades\DB::table('class_students as cs')
            ->join('users as u', 'cs.student_id', '=', 'u.id')
            ->where('cs.class_id', $classId)
            ->select('u.id', 'u.name', 'u.email')
            ->orderBy('u.name')
            ->get();

        $subs = \Illuminate\Support\Facades\DB::table('exam_submissions as s')
            ->where('s.exam_id', $examId)
            ->select('s.student_id', 's.submitted_at', 's.grade')
            ->get()
            ->keyBy('student_id');

        $now = now();
        $start = $exam->start_time ? \Carbon\Carbon::parse($exam->start_time) : null;
        $end = $exam->end_time ? \Carbon\Carbon::parse($exam->end_time) : null;

        $rows = [];
        $counts = [ 'taking' => 0, 'completed' => 0, 'missed' => 0, 'upcoming' => 0 ];
        foreach ($students as $stu) {
            $sub = $subs->get($stu->id);
            if ($sub) {
                $status = 'completed';
                $counts['completed']++;
            } else if ($start && $now->betweenIncluded($start, $end ?: $start)) {
                $status = 'taking';
                $counts['taking']++;
            } else if ($end && $now->greaterThan($end)) {
                $status = 'missed';
                $counts['missed']++;
            } else {
                $status = 'upcoming';
                $counts['upcoming']++;
            }
            $rows[] = [
                'id' => (int) $stu->id,
                'name' => (string) $stu->name,
                'email' => (string) $stu->email,
                'status' => $status,
                'grade' => $sub? (float) ($sub->grade ?? 0) : null,
                'submitted_at' => $sub? (string) ($sub->submitted_at ?? '') : null,
            ];
        }

        return [
            'counts' => [
                'total' => count($rows),
                'taking' => $counts['taking'],
                'completed' => $counts['completed'],
                'missed' => $counts['missed'],
                'upcoming' => $counts['upcoming'],
            ],
            'rows' => $rows,
        ];
    }

    public function submit(int $classId, int $examId, int $studentId, array $payload = []): void
    {
        $this->findInClass($classId, $examId);
        // Upsert submission; store timestamp; answers not modeled yet
        \Illuminate\Support\Facades\DB::table('exam_submissions')->updateOrInsert(
            [ 'exam_id' => $examId, 'student_id' => $studentId ],
            [ 'submitted_at' => now(), 'updated_at' => now(), 'created_at' => now() ]
        );
    }
}



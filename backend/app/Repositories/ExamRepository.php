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
}



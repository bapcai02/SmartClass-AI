<?php

namespace App\Repositories;

use App\Models\Assignment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AssignmentRepository
{
    public function paginateByClass(int $classId, int $perPage = 15): LengthAwarePaginator
    {
        return Assignment::query()
            ->where('class_id', $classId)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findInClass(int $classId, int $id): Assignment
    {
        /** @var Assignment|null $ass */
        $ass = Assignment::query()->where('class_id', $classId)->find($id);
        if (! $ass) {
            throw new ModelNotFoundException('Assignment not found.');
        }
        return $ass;
    }

    public function create(array $data): Assignment
    {
        return Assignment::query()->create($data);
    }

    public function update(int $classId, int $id, array $data): Assignment
    {
        $ass = $this->findInClass($classId, $id);
        $ass->fill($data);
        $ass->save();
        return $ass->refresh();
    }

    public function delete(int $classId, int $id): void
    {
        $ass = $this->findInClass($classId, $id);
        $ass->delete();
    }
}



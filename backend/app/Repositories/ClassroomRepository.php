<?php

namespace App\Repositories;

use App\Models\ClassRoom;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
}



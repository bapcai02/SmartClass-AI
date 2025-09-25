<?php

namespace App\Services;

use App\Repositories\ClassroomRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ClassroomService
{
    /** @var ClassroomRepository */
    private ClassroomRepository $repository;

    public function __construct(ClassroomRepository $repository)
    {
        $this->repository = $repository;
    }

    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($perPage);
    }

    public function get(int $id)
    {
        return $this->repository->findById($id);
    }

    public function getDetail(int $id, array $includes = [], array $limits = [])
    {
        return $this->repository->findDetailById($id, $includes, $limits);
    }

    public function getAttendance(int $id, ?string $from = null, ?string $to = null)
    {
        return $this->repository->getAttendance($id, $from, $to);
    }

    public function paginateStudents(int $classId, string $search = '', int $perPage = 15)
    {
        return $this->repository->paginateStudents($classId, $search, $perPage);
    }

    public function addStudents(int $classId, array $studentIds)
    {
        return $this->repository->attachStudents($classId, $studentIds);
    }

    public function removeStudents(int $classId, array $studentIds)
    {
        return $this->repository->detachStudents($classId, $studentIds);
    }

    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int $id): void
    {
        $this->repository->delete($id);
    }

    public function createResource(int $classId, array $data)
    {
        return $this->repository->createResource($classId, $data);
    }
}



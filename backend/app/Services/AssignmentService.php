<?php

namespace App\Services;

use App\Repositories\AssignmentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AssignmentService
{
    private AssignmentRepository $repo;

    public function __construct(AssignmentRepository $repo) {
        $this->repo = $repo;
    }

    public function listByClass(int $classId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repo->paginateByClass($classId, $perPage);
    }

    public function get(int $classId, int $id)
    {
        return $this->repo->findInClass($classId, $id);
    }

    public function create(int $classId, array $data)
    {
        $data['class_id'] = $classId;
        return $this->repo->create($data);
    }

    public function update(int $classId, int $id, array $data)
    {
        return $this->repo->update($classId, $id, $data);
    }

    public function delete(int $classId, int $id): void
    {
        $this->repo->delete($classId, $id);
    }

    public function getAllAssignments(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->repo->getAllAssignments($perPage, $filters);
    }

    public function getAssignmentStats(): array
    {
        return $this->repo->getAssignmentStats();
    }
}



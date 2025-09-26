<?php

namespace App\Services;

use App\Repositories\ExamRepository;

class ExamService
{
    /** @var ExamRepository */
    private ExamRepository $repository;

    public function __construct(ExamRepository $repository)
    {
        $this->repository = $repository;
    }

    public function listByClass(int $classId, int $perPage = 15)
    {
        return $this->repository->listByClass($classId, $perPage);
    }

    public function get(int $classId, int $id)
    {
        return $this->repository->findInClass($classId, $id);
    }

    public function create(int $classId, array $data)
    {
        return $this->repository->create($classId, $data);
    }

    public function update(int $classId, int $id, array $data)
    {
        return $this->repository->update($classId, $id, $data);
    }

    public function delete(int $classId, int $id): void
    {
        $this->repository->delete($classId, $id);
    }

    public function stats(int $classId, int $examId)
    {
        return $this->repository->getStats($classId, $examId);
    }

    public function submit(int $classId, int $examId, int $studentId, array $payload = []): void
    {
        $this->repository->submit($classId, $examId, $studentId, $payload);
    }
}



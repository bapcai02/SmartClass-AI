<?php

namespace App\Services;

use App\Repositories\ResourceRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ResourceService
{
    private ResourceRepository $repository;

    public function __construct(ResourceRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllResources(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->repository->getAllResources($perPage, $filters);
    }

    public function getResourceStats(): array
    {
        return $this->repository->getResourceStats();
    }

    public function getRecentResources(int $limit = 10): array
    {
        return $this->repository->getRecentResources($limit);
    }

    public function getResourcesByClass(int $classId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getResourcesByClass($classId, $perPage);
    }

    public function findById(int $id): ?\App\Models\Resource
    {
        return $this->repository->findById($id);
    }

    public function create(array $data): \App\Models\Resource
    {
        return $this->repository->create($data);
    }

    public function update(int $id, array $data): ?\App\Models\Resource
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}

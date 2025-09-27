<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserService
{
    private UserRepository $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function paginate(string $search = '', ?string $role = null, int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->paginate($search, $role, $perPage);
    }

    public function findById(int $id): ?\App\Models\User
    {
        return $this->repository->findById($id);
    }

    public function update(int $id, array $data): ?\App\Models\User
    {
        return $this->repository->update($id, $data);
    }

    public function getUserStats(int $userId): array
    {
        return $this->repository->getUserStats($userId);
    }

    public function getUserActivity(int $userId, int $limit = 10): array
    {
        return $this->repository->getUserActivity($userId, $limit);
    }
}



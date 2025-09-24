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
}



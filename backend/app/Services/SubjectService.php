<?php

namespace App\Services;

use App\Repositories\SubjectRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SubjectService
{
    private SubjectRepository $repository;

    public function __construct(SubjectRepository $repository)
    {
        $this->repository = $repository;
    }

    public function paginate(string $search = '', int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->paginate($search, $perPage);
    }
}



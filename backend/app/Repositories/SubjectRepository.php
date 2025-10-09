<?php

namespace App\Repositories;

use App\Models\Subject;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SubjectRepository
{
    public function paginate(string $search = '', int $perPage = 10): LengthAwarePaginator
    {
        $query = Subject::query();
        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->orderBy('name')->paginate($perPage);
    }
}



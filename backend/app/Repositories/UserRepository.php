<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function paginate(string $search = '', ?string $role = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query();
        if ($role) {
            $query->where('role', $role);
        }
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        return $query->orderBy('name')->paginate($perPage);
    }
}



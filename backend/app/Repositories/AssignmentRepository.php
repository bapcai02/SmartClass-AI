<?php

namespace App\Repositories;

use App\Models\Assignment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AssignmentRepository
{
    public function paginateByClass(int $classId, int $perPage = 15): LengthAwarePaginator
    {
        return Assignment::query()
            ->where('class_id', $classId)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findInClass(int $classId, int $id): Assignment
    {
        /** @var Assignment|null $ass */
        $ass = Assignment::query()->where('class_id', $classId)->find($id);
        if (! $ass) {
            throw new ModelNotFoundException('Assignment not found.');
        }
        return $ass;
    }

    public function create(array $data): Assignment
    {
        return Assignment::query()->create($data);
    }

    public function update(int $classId, int $id, array $data): Assignment
    {
        $ass = $this->findInClass($classId, $id);
        $ass->fill($data);
        $ass->save();
        return $ass->refresh();
    }

    public function delete(int $classId, int $id): void
    {
        $ass = $this->findInClass($classId, $id);
        $ass->delete();
    }

    public function getAllAssignments(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Assignment::query()
            ->with(['classRoom.subject', 'creator', 'submissions']);

        // Search by title or description
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by class
        if (!empty($filters['class_id'])) {
            $query->where('class_id', $filters['class_id']);
        }

        // Filter by subject
        if (!empty($filters['subject_id'])) {
            $query->whereHas('classRoom.subject', function($q) use ($filters) {
                $q->where('id', $filters['subject_id']);
            });
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $now = now();
            switch ($filters['status']) {
                case 'overdue':
                    $query->where('due_date', '<', $now);
                    break;
                case 'due_today':
                    $query->whereDate('due_date', $now->toDateString());
                    break;
                case 'due_this_week':
                    $query->whereBetween('due_date', [$now, $now->addWeek()]);
                    break;
                case 'upcoming':
                    $query->where('due_date', '>', $now);
                    break;
            }
        }

        // Filter by creator
        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        // Date range filter
        if (!empty($filters['date_from'])) {
            $query->where('due_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('due_date', '<=', $filters['date_to']);
        }

        return $query
            ->orderByDesc('due_date')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function getAssignmentStats(): array
    {
        $now = now();
        $total = Assignment::count();
        $overdue = Assignment::where('due_date', '<', $now)->count();
        $dueToday = Assignment::whereDate('due_date', $now->toDateString())->count();
        $dueThisWeek = Assignment::whereBetween('due_date', [$now, $now->addWeek()])->count();
        $upcoming = Assignment::where('due_date', '>', $now)->count();

        return [
            'total' => $total,
            'overdue' => $overdue,
            'due_today' => $dueToday,
            'due_this_week' => $dueThisWeek,
            'upcoming' => $upcoming,
        ];
    }
}



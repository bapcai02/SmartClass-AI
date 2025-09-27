<?php

namespace App\Repositories;

use App\Models\Resource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ResourceRepository
{
    public function getAllResources(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Resource::query()
            ->with(['classRoom.subject', 'uploader']);

        // Search by title
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('title', 'like', "%{$search}%");
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

        // Filter by uploader
        if (!empty($filters['uploaded_by'])) {
            $query->where('uploaded_by', $filters['uploaded_by']);
        }

        // Filter by file type
        if (!empty($filters['file_type'])) {
            $fileType = $filters['file_type'];
            switch ($fileType) {
                case 'pdf':
                    $query->where('file_url', 'like', '%.pdf');
                    break;
                case 'doc':
                case 'docx':
                    $query->where(function($q) {
                        $q->where('file_url', 'like', '%.doc')
                          ->orWhere('file_url', 'like', '%.docx');
                    });
                    break;
                case 'image':
                    $query->where(function($q) {
                        $q->where('file_url', 'like', '%.jpg')
                          ->orWhere('file_url', 'like', '%.jpeg')
                          ->orWhere('file_url', 'like', '%.png')
                          ->orWhere('file_url', 'like', '%.gif');
                    });
                    break;
                case 'video':
                    $query->where(function($q) {
                        $q->where('file_url', 'like', '%.mp4')
                          ->orWhere('file_url', 'like', '%.avi')
                          ->orWhere('file_url', 'like', '%.mov');
                    });
                    break;
            }
        }

        // Date range filter
        if (!empty($filters['date_from'])) {
            $query->where('uploaded_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('uploaded_at', '<=', $filters['date_to']);
        }

        return $query
            ->orderByDesc('uploaded_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function getResourceStats(): array
    {
        $total = Resource::count();
        $pdfCount = Resource::where('file_url', 'like', '%.pdf')->count();
        $docCount = Resource::where(function($q) {
            $q->where('file_url', 'like', '%.doc')
              ->orWhere('file_url', 'like', '%.docx');
        })->count();
        $imageCount = Resource::where(function($q) {
            $q->where('file_url', 'like', '%.jpg')
              ->orWhere('file_url', 'like', '%.jpeg')
              ->orWhere('file_url', 'like', '%.png')
              ->orWhere('file_url', 'like', '%.gif');
        })->count();
        $videoCount = Resource::where(function($q) {
            $q->where('file_url', 'like', '%.mp4')
              ->orWhere('file_url', 'like', '%.avi')
              ->orWhere('file_url', 'like', '%.mov');
        })->count();
        $otherCount = $total - $pdfCount - $docCount - $imageCount - $videoCount;

        return [
            'total' => $total,
            'pdf' => $pdfCount,
            'doc' => $docCount,
            'image' => $imageCount,
            'video' => $videoCount,
            'other' => $otherCount,
        ];
    }

    public function getRecentResources(int $limit = 10): array
    {
        return Resource::query()
            ->with(['classRoom.subject', 'uploader'])
            ->orderByDesc('uploaded_at')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getResourcesByClass(int $classId, int $perPage = 15): LengthAwarePaginator
    {
        return Resource::query()
            ->with(['classRoom.subject', 'uploader'])
            ->where('class_id', $classId)
            ->orderByDesc('uploaded_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?Resource
    {
        return Resource::with(['classRoom.subject', 'uploader'])->find($id);
    }

    public function create(array $data): Resource
    {
        return Resource::create($data);
    }

    public function update(int $id, array $data): ?Resource
    {
        $resource = Resource::find($id);
        if (!$resource) {
            return null;
        }
        
        $resource->update($data);
        return $resource->fresh(['classRoom.subject', 'uploader']);
    }

    public function delete(int $id): bool
    {
        $resource = Resource::find($id);
        if (!$resource) {
            return false;
        }
        
        return $resource->delete();
    }
}

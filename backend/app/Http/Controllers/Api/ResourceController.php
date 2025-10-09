<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResourceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    private ResourceService $service;

    public function __construct(ResourceService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        $filters = request()->only(['search', 'class_id', 'subject_id', 'uploaded_by', 'file_type', 'date_from', 'date_to']);
        return response()->json($this->service->getAllResources($perPage, $filters));
    }

    public function show(int $id): JsonResponse
    {
        $resource = $this->service->findById($id);
        if (!$resource) {
            return response()->json(['message' => 'Resource not found'], 404);
        }
        return response()->json($resource);
    }

    public function stats(): JsonResponse
    {
        return response()->json($this->service->getResourceStats());
    }

    public function recent(): JsonResponse
    {
        $limit = request()->integer('limit', 10) ?: 10;
        return response()->json($this->service->getRecentResources($limit));
    }

    public function byClass(int $classId): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        return response()->json($this->service->getResourcesByClass($classId, $perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'title' => ['required', 'string', 'max:255'],
            'file_url' => ['required', 'string', 'url'],
            'uploaded_by' => ['required', 'integer', 'exists:users,id'],
        ]);

        $data['uploaded_at'] = now();
        $resource = $this->service->create($data);
        return response()->json($resource, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'file_url' => ['sometimes', 'required', 'string', 'url'],
        ]);

        $resource = $this->service->update($id, $data);
        if (!$resource) {
            return response()->json(['message' => 'Resource not found'], 404);
        }

        return response()->json($resource);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->service->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Resource not found'], 404);
        }

        return response()->json(['message' => 'Resource deleted successfully']);
    }
}

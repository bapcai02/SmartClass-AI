<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AssignmentController extends Controller
{
    private AssignmentService $service;

    public function __construct(AssignmentService $service) {
        $this->service = $service;
    }

    public function index(int $classId): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        return response()->json($this->service->listByClass($classId, $perPage));
    }

    public function show(int $classId, int $id): JsonResponse
    {
        return response()->json($this->service->get($classId, $id));
    }

    public function store(int $classId): JsonResponse
    {
        $data = request()->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
            'created_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);
        DB::beginTransaction();
        try {
            $ass = $this->service->create($classId, $data);
            DB::commit();
            return response()->json($ass, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create assignment'], 500);
        }
    }

    public function update(int $classId, int $id): JsonResponse
    {
        $data = request()->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'due_date' => ['sometimes', 'required', 'date'],
        ]);
        DB::beginTransaction();
        try {
            $ass = $this->service->update($classId, $id, $data);
            DB::commit();
            return response()->json($ass);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update assignment'], 500);
        }
    }

    public function destroy(int $classId, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $this->service->delete($classId, $id);
            DB::commit();
            return response()->json(['message' => 'Deleted']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete assignment'], 500);
        }
    }

    public function all(): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        $filters = request()->only(['search', 'class_id', 'subject_id', 'status', 'created_by', 'date_from', 'date_to']);
        return response()->json($this->service->getAllAssignments($perPage, $filters));
    }

    public function stats(): JsonResponse
    {
        return response()->json($this->service->getAssignmentStats());
    }
}



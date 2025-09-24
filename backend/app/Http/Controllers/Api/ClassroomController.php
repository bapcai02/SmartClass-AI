<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClassroomService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClassroomController extends Controller
{
    /** @var ClassroomService */
    private ClassroomService $service;

    public function __construct(ClassroomService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $classrooms = $this->service->list($perPage);

        return response()->json($classrooms);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $classroom = $this->service->get($id);
            return response()->json($classroom);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:users,id'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $classroom = $this->service->create($validated);

        return response()->json($classroom, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'subject_id' => ['sometimes', 'nullable', 'integer', 'exists:subjects,id'],
            'teacher_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        try {
            $classroom = $this->service->update($id, $validated);
            return response()->json($classroom);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);
            return response()->json(['message' => 'Deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
    }
}



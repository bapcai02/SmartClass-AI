<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClassroomService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreClassroomRequest;
use App\Http\Requests\UpdateClassroomRequest;
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

    public function store(StoreClassroomRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $studentIds = $validated['student_ids'];
        unset($validated['student_ids']);

        try {
            DB::beginTransaction();
            $classroom = $this->service->create($validated);
            $classroom->students()->sync($studentIds);
            $classroom->load(['students:id,name']);
            DB::commit();
            return response()->json($classroom, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create classroom'], 500);
        }
    }

    public function update(UpdateClassroomRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $studentIds = $validated['student_ids'] ?? null;
        unset($validated['student_ids']);

        try {
            DB::beginTransaction();
            $classroom = $this->service->update($id, $validated);
            if ($studentIds !== null) {
                $classroom->students()->sync($studentIds);
                $classroom->load(['students:id,name']);
            }
            DB::commit();
            return response()->json($classroom);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update classroom'], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            DB::beginTransaction();
            $this->service->delete($id);
            DB::commit();
            return response()->json(['message' => 'Deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete classroom'], 500);
        }
    }
}



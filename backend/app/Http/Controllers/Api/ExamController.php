<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    /** @var ExamService */
    private ExamService $service;

    public function __construct(ExamService $service)
    {
        $this->service = $service;
    }

    public function index(int $classId): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        return response()->json($this->service->listByClass($classId, $perPage));
    }

    public function show(int $classId, int $id): JsonResponse
    {
        try {
            return response()->json($this->service->get($classId, $id));
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Exam not found'], 404);
        }
    }

    public function store(int $classId): JsonResponse
    {
        $data = request()->validate([
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'start_time' => ['required','date'],
            'end_time' => ['nullable','date','after_or_equal:start_time'],
            'created_by' => ['nullable','integer','exists:users,id'],
        ]);
        DB::beginTransaction();
        try {
            $exam = $this->service->create($classId, $data);
            DB::commit();
            return response()->json($exam, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create exam'], 500);
        }
    }

    public function update(int $classId, int $id): JsonResponse
    {
        $data = request()->validate([
            'title' => ['sometimes','string','max:255'],
            'description' => ['nullable','string'],
            'start_time' => ['sometimes','date'],
            'end_time' => ['nullable','date','after_or_equal:start_time'],
        ]);
        DB::beginTransaction();
        try {
            $exam = $this->service->update($classId, $id, $data);
            DB::commit();
            return response()->json($exam);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Exam not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update exam'], 500);
        }
    }

    public function destroy(int $classId, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $this->service->delete($classId, $id);
            DB::commit();
            return response()->json(['message' => 'Deleted']);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Exam not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete exam'], 500);
        }
    }

    public function stats(int $classId, int $id): JsonResponse
    {
        try {
            $data = $this->service->stats($classId, $id);
            return response()->json($data);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Exam not found'], 404);
        }
    }

    public function submit(int $classId, int $id): JsonResponse
    {
        $data = request()->validate([
            'student_id' => ['required','integer','exists:users,id'],
            'answers' => ['nullable','array'],
        ]);
        try {
            $this->service->submit($classId, $id, (int) $data['student_id'], $data['answers'] ?? []);
            return response()->json(['message' => 'Submitted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Exam not found'], 404);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function all(): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        $filters = request()->only(['search', 'class_id', 'subject_id', 'status', 'created_by', 'date_from', 'date_to']);
        return response()->json($this->service->getAllExams($perPage, $filters));
    }

    public function allStats(): JsonResponse
    {
        return response()->json($this->service->getExamStats());
    }
}



<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClassroomService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreClassroomRequest;
use App\Http\Requests\UpdateClassroomRequest;
use App\Http\Requests\AddClassStudentsRequest;
use App\Http\Requests\RemoveClassStudentsRequest;
use App\Http\Requests\UploadResourceRequest;

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

    public function detail(int $id): JsonResponse
    {
        try {
            $includes = array_filter(explode(',', (string) request()->get('include', '')));
            $limits = [
                'students' => request()->integer('per_page_students') ?: null,
                'assignments' => request()->integer('per_page_assignments') ?: null,
                'exams' => request()->integer('per_page_exams') ?: null,
                'resources' => request()->integer('per_page_resources') ?: null,
            ];
            $classroom = $this->service->getDetail($id, $includes, $limits);
            return response()->json($classroom);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
    }

    public function students(int $id): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        $search = (string) request()->get('search', '');
        $paginator = $this->service->paginateStudents($id, $search, $perPage);
        return response()->json($paginator);
    }

    public function attendance(int $id): JsonResponse
    {
        $from = request()->get('from');
        $to = request()->get('to');
        try {
            $data = $this->service->getAttendance($id, $from, $to);
            return response()->json($data);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
    }

    public function addStudents(AddClassStudentsRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $class = $this->service->addStudents($id, $data['student_ids']);
            DB::commit();
            return response()->json($class);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add students'], 500);
        }
    }

    public function removeStudents(RemoveClassStudentsRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $class = $this->service->removeStudents($id, $data['student_ids']);
            DB::commit();
            return response()->json($class);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to remove students'], 500);
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

    public function uploadResource(UploadResourceRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        try {
            DB::beginTransaction();
            $storedPath = $request->file('file')->store('resources', 'public');
            $url = Storage::url($storedPath);
            $userId = Auth::id();
            $resource = $this->service->createResource($id, [
                'title' => $data['title'] ?? $request->file('file')->getClientOriginalName(),
                'file_url' => $url,
                'uploaded_by' => $userId,
                'uploaded_at' => now(),
            ]);
            DB::commit();
            return response()->json($resource, 201);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Classroom not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to upload resource'], 500);
        }
    }

    public function downloadResource(int $id, int $rid)
    {
        try {
            $class = $this->service->get($id);
            $resource = $class->resources()->where('id', $rid)->firstOrFail();
            $path = str_starts_with($resource->file_url, '/storage/')
                ? str_replace('/storage/', 'public/', $resource->file_url)
                : $resource->file_url;
            if (str_starts_with($path, 'http')) {
                return redirect()->away($path);
            }
            $filePath = str_replace('public/', '', $path);
            if (!Storage::disk('public')->exists($filePath)) {
                return response()->json(['message' => 'File not found'], 404);
            }
            $name = ($resource->title ?: 'resource');
            $mime = \Illuminate\Support\Facades\File::mimeType(Storage::disk('public')->path($filePath)) ?: 'application/octet-stream';
            $stream = Storage::disk('public')->readStream($filePath);
            return response()->streamDownload(function() use ($stream) {
                fpassthru($stream);
            }, $name, [ 'Content-Type' => $mime ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Not found'], 404);
        }
    }

    public function destroyResource(int $id, int $rid): JsonResponse
    {
        try {
            DB::beginTransaction();
            $class = $this->service->get($id);
            $resource = $class->resources()->where('id', $rid)->firstOrFail();
            // Optionally delete file from storage if it's a local file
            if (str_starts_with($resource->file_url, '/storage/')) {
                $path = str_replace('/storage/', 'public/', $resource->file_url);
                $filePath = str_replace('public/', '', $path);
                if (Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }
            $resource->delete();
            DB::commit();
            return response()->json(['message' => 'Deleted']);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Not found'], 404);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete resource'], 500);
        }
    }

    public function grades(int $id): JsonResponse
    {
        try {
            $data = $this->service->getGradebook($id);
            return response()->json($data);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
    }
}



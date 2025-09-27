<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QaController extends Controller
{
    private QaService $service;

    public function __construct(QaService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        $perPage = request()->integer('per_page', 15) ?: 15;
        return response()->json($this->service->getAllPosts($perPage));
    }

    public function show(int $id): JsonResponse
    {
        $post = $this->service->getPostById($id);
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }
        return response()->json($post);
    }

    public function myPosts(): JsonResponse
    {
        $userId = Auth::id();
        $perPage = request()->integer('per_page', 15) ?: 15;
        return response()->json($this->service->getAllUserPosts($userId, $perPage));
    }

    public function myAnswers(): JsonResponse
    {
        $userId = Auth::id();
        $perPage = request()->integer('per_page', 15) ?: 15;
        return response()->json($this->service->getAllUserAnswers($userId, $perPage));
    }

    public function myStats(): JsonResponse
    {
        $userId = Auth::id();
        return response()->json($this->service->getUserQaStats($userId));
    }

    public function storePost(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question_text' => ['required', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string', 'url'],
        ]);

        $userId = Auth::id();
        $post = $this->service->createPost($userId, $data);
        return response()->json($post, 201);
    }

    public function storeAnswer(Request $request, int $postId): JsonResponse
    {
        $data = $request->validate([
            'answer_text' => ['required', 'string', 'max:1000'],
        ]);

        $userId = Auth::id();
        $answer = $this->service->createAnswer($postId, $userId, $data);
        return response()->json($answer, 201);
    }

    public function updatePost(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'question_text' => ['sometimes', 'required', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string', 'url'],
        ]);

        $userId = Auth::id();
        $post = $this->service->updatePost($id, $userId, $data);
        
        if (!$post) {
            return response()->json(['message' => 'Post not found or unauthorized'], 404);
        }

        return response()->json($post);
    }

    public function updateAnswer(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'answer_text' => ['sometimes', 'required', 'string', 'max:1000'],
        ]);

        $userId = Auth::id();
        $answer = $this->service->updateAnswer($id, $userId, $data);
        
        if (!$answer) {
            return response()->json(['message' => 'Answer not found or unauthorized'], 404);
        }

        return response()->json($answer);
    }

    public function destroyPost(int $id): JsonResponse
    {
        $userId = Auth::id();
        $deleted = $this->service->deletePost($id, $userId);
        
        if (!$deleted) {
            return response()->json(['message' => 'Post not found or unauthorized'], 404);
        }

        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function destroyAnswer(int $id): JsonResponse
    {
        $userId = Auth::id();
        $deleted = $this->service->deleteAnswer($id, $userId);
        
        if (!$deleted) {
            return response()->json(['message' => 'Answer not found or unauthorized'], 404);
        }

        return response()->json(['message' => 'Answer deleted successfully']);
    }
}

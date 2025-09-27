<?php

namespace App\Repositories;

use App\Models\QaPost;
use App\Models\QaAnswer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class QaRepository
{
    public function getAllUserPosts(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return QaPost::query()
            ->with(['user', 'answers.user'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getAllUserAnswers(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return QaAnswer::query()
            ->with(['user', 'post.user'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getAllPosts(int $perPage = 15): LengthAwarePaginator
    {
        return QaPost::query()
            ->with(['user', 'answers.user'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getPostById(int $id): ?QaPost
    {
        return QaPost::with(['user', 'answers.user'])->find($id);
    }

    public function createPost(int $userId, array $data): QaPost
    {
        $data['user_id'] = $userId;
        return QaPost::create($data);
    }

    public function createAnswer(int $postId, int $userId, array $data): QaAnswer
    {
        $data['qa_post_id'] = $postId;
        $data['user_id'] = $userId;
        return QaAnswer::create($data);
    }

    public function updatePost(int $postId, int $userId, array $data): ?QaPost
    {
        $post = QaPost::where('id', $postId)->where('user_id', $userId)->first();
        if (!$post) {
            return null;
        }
        
        $post->update($data);
        return $post->fresh(['user', 'answers.user']);
    }

    public function updateAnswer(int $answerId, int $userId, array $data): ?QaAnswer
    {
        $answer = QaAnswer::where('id', $answerId)->where('user_id', $userId)->first();
        if (!$answer) {
            return null;
        }
        
        $answer->update($data);
        return $answer->fresh(['user', 'post.user']);
    }

    public function deletePost(int $postId, int $userId): bool
    {
        $post = QaPost::where('id', $postId)->where('user_id', $userId)->first();
        if (!$post) {
            return false;
        }
        
        return $post->delete();
    }

    public function deleteAnswer(int $answerId, int $userId): bool
    {
        $answer = QaAnswer::where('id', $answerId)->where('user_id', $userId)->first();
        if (!$answer) {
            return false;
        }
        
        return $answer->delete();
    }

    public function getUserQaStats(int $userId): array
    {
        $totalQuestions = QaPost::where('user_id', $userId)->count();
        $totalAnswers = QaAnswer::where('user_id', $userId)->count();
        $recentQuestions = QaPost::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $recentAnswers = QaAnswer::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return [
            'total_questions' => $totalQuestions,
            'total_answers' => $totalAnswers,
            'recent_questions' => $recentQuestions,
            'recent_answers' => $recentAnswers,
        ];
    }
}

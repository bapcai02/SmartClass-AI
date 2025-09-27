<?php

namespace App\Services;

use App\Repositories\QaRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class QaService
{
    private QaRepository $repository;

    public function __construct(QaRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllUserPosts(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAllUserPosts($userId, $perPage);
    }

    public function getAllUserAnswers(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAllUserAnswers($userId, $perPage);
    }

    public function getAllPosts(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAllPosts($perPage);
    }

    public function getPostById(int $id): ?\App\Models\QaPost
    {
        return $this->repository->getPostById($id);
    }

    public function createPost(int $userId, array $data): \App\Models\QaPost
    {
        return $this->repository->createPost($userId, $data);
    }

    public function createAnswer(int $postId, int $userId, array $data): \App\Models\QaAnswer
    {
        return $this->repository->createAnswer($postId, $userId, $data);
    }

    public function updatePost(int $postId, int $userId, array $data): ?\App\Models\QaPost
    {
        return $this->repository->updatePost($postId, $userId, $data);
    }

    public function updateAnswer(int $answerId, int $userId, array $data): ?\App\Models\QaAnswer
    {
        return $this->repository->updateAnswer($answerId, $userId, $data);
    }

    public function deletePost(int $postId, int $userId): bool
    {
        return $this->repository->deletePost($postId, $userId);
    }

    public function deleteAnswer(int $answerId, int $userId): bool
    {
        return $this->repository->deleteAnswer($answerId, $userId);
    }

    public function getUserQaStats(int $userId): array
    {
        return $this->repository->getUserQaStats($userId);
    }
}

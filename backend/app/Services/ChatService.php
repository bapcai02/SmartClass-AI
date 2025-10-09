<?php

namespace App\Services;

use App\Repositories\ChatRepository;
use App\Models\ChatSession;
use App\Models\ChatConversation;

class ChatService
{
    public function __construct(
        private ChatRepository $chatRepository
    ) {}

    public function createSession(int $userId, ?string $title = null, ?array $context = null): ChatSession
    {
        return $this->chatRepository->createSession($userId, $title, $context);
    }

    public function getActiveSession(int $userId): ?ChatSession
    {
        return $this->chatRepository->getActiveSession($userId);
    }

    public function getSessionById(int $sessionId, int $userId): ?ChatSession
    {
        return $this->chatRepository->getSessionById($sessionId, $userId);
    }

    public function getUserSessions(int $userId, int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return $this->chatRepository->getUserSessions($userId, $limit);
    }

    public function createConversation(array $data): ChatConversation
    {
        return $this->chatRepository->createConversation($data);
    }

    public function getConversationsBySession(int $sessionId, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return $this->chatRepository->getConversationsBySession($sessionId, $limit);
    }

    public function updateSessionLastMessage(int $sessionId): void
    {
        $this->chatRepository->updateSessionLastMessage($sessionId);
    }

    public function deactivateSession(int $sessionId): void
    {
        $this->chatRepository->deactivateSession($sessionId);
    }

    public function deleteSession(int $sessionId, int $userId): bool
    {
        return $this->chatRepository->deleteSession($sessionId, $userId);
    }

    public function getUserChatStats(int $userId): array
    {
        return $this->chatRepository->getUserChatStats($userId);
    }
}

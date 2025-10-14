<?php

namespace App\Services;

use App\Repositories\ConversationRepository;

class ConversationService
{
    public function __construct(private ConversationRepository $repo) {}

    public function listForUser(int $userId, int $limit = 20)
    {
        return $this->repo->listForUser($userId, $limit);
    }

    public function getForUser(int $conversationId, int $userId)
    {
        return $this->repo->findForUser($conversationId, $userId);
    }

    public function paginateMessages(int $conversationId, int $perPage = 30)
    {
        return $this->repo->paginateMessages($conversationId, $perPage);
    }

    public function sendMessage(int $conversationId, int $senderId, array $payload)
    {
        return $this->repo->appendMessage($conversationId, $senderId, $payload);
    }

    public function getOrCreateDirect(int $currentUserId, int $otherUserId)
    {
        return $this->repo->findOrCreateDirect($currentUserId, $otherUserId);
    }
}



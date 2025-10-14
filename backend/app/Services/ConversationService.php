<?php

namespace App\Services;

use App\Repositories\ConversationRepository;

class ConversationService
{
    private ConversationRepository $repo;

    public function __construct(ConversationRepository $repo)
    {
        $this->repo = $repo;
    }

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

    public function createGroup(int $ownerId, string $title, array $participantIds)
    {
        return $this->repo->createGroup($ownerId, $title, $participantIds);
    }

    public function userCanManage(int $conversationId, int $userId): bool
    {
        return $this->repo->userIsOwner($conversationId, $userId);
    }

    public function addParticipants(int $conversationId, array $userIds): int
    {
        return $this->repo->addParticipants($conversationId, $userIds);
    }

    public function removeParticipant(int $conversationId, int $userId): int
    {
        return $this->repo->removeParticipant($conversationId, $userId);
    }
}



<?php

namespace App\Repositories;

use App\Models\ChatSession;
use App\Models\ChatConversation;
use Illuminate\Database\Eloquent\Collection;

class ChatRepository
{
    public function createSession(int $userId, ?string $title = null, ?array $context = null): ChatSession
    {
        return ChatSession::create([
            'user_id' => $userId,
            'title' => $title ?: 'New Chat',
            'context' => $context,
            'is_active' => true,
        ]);
    }

    public function getActiveSession(int $userId): ?ChatSession
    {
        return ChatSession::where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('last_message_at', 'desc')
            ->first();
    }

    public function getSessionById(int $sessionId, int $userId): ?ChatSession
    {
        return ChatSession::where('id', $sessionId)
            ->where('user_id', $userId)
            ->first();
    }

    public function getUserSessions(int $userId, int $limit = 20): Collection
    {
        return ChatSession::where('user_id', $userId)
            ->orderBy('last_message_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function createConversation(array $data): ChatConversation
    {
        return ChatConversation::create($data);
    }

    public function getConversationsBySession(int $sessionId, int $limit = 50): Collection
    {
        return ChatConversation::where('conversation_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();
    }

    public function updateSessionLastMessage(int $sessionId): void
    {
        ChatSession::where('id', $sessionId)->update([
            'last_message_at' => now(),
            'total_messages' => \DB::raw('total_messages + 1'),
        ]);
    }

    public function deactivateSession(int $sessionId): void
    {
        ChatSession::where('id', $sessionId)->update(['is_active' => false]);
    }

    public function deleteSession(int $sessionId, int $userId): bool
    {
        return ChatSession::where('id', $sessionId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function getUserChatStats(int $userId): array
    {
        $totalSessions = ChatSession::where('user_id', $userId)->count();
        $totalMessages = ChatConversation::where('user_id', $userId)->count();
        $activeSessions = ChatSession::where('user_id', $userId)->where('is_active', true)->count();
        
        $recentActivity = ChatConversation::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['message', 'response', 'created_at']);

        return [
            'total_sessions' => $totalSessions,
            'total_messages' => $totalMessages,
            'active_sessions' => $activeSessions,
            'recent_activity' => $recentActivity,
        ];
    }
}

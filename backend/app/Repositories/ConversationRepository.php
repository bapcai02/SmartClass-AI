<?php

namespace App\Repositories;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ConversationRepository
{
    public function listForUser(int $userId, int $limit = 20): Collection
    {
        $items = Conversation::query()
            ->with(['participants:id,name', 'creator:id,name'])
            ->withCount('messages')
            ->whereHas('participants', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            })
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get();

        $lastByConvo = Message::query()
            ->whereIn('conversation_id', $items->pluck('id'))
            ->select('id','conversation_id','sender_id','content','message_type','file_url','created_at')
            ->orderBy('conversation_id')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('conversation_id')
            ->map(fn($g) => $g->first());

        // attach last_message as attribute for presentation layer
        $items->each(function ($c) use ($lastByConvo) {
            $c->setAttribute('last_message', $lastByConvo->get($c->id));
        });

        return $items;
    }

    public function findForUser(int $conversationId, int $userId): ?Conversation
    {
        return Conversation::query()
            ->with(['participants:id,name'])
            ->where('id', $conversationId)
            ->whereHas('participants', fn($q) => $q->where('users.id', $userId))
            ->first();
    }

    public function paginateMessages(int $conversationId, int $perPage = 30): LengthAwarePaginator
    {
        return Message::query()
            ->with(['sender:id,name'])
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }
}



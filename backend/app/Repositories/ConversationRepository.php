<?php

namespace App\Repositories;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\User;

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

    public function appendMessage(int $conversationId, int $senderId, array $payload): Message
    {
        return DB::transaction(function () use ($conversationId, $senderId, $payload) {
            /** @var Message $m */
            $m = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $senderId,
                'content' => $payload['content'] ?? null,
                'message_type' => $payload['message_type'] ?? 'text',
                'file_url' => $payload['file_url'] ?? null,
            ]);

            Conversation::where('id', $conversationId)->update([
                'last_message_at' => now(),
                'messages_count' => DB::raw('messages_count + 1'),
            ]);

            return $m->load('sender:id,name');
        });
    }

    public function findOrCreateDirect(int $userA, int $userB): Conversation
    {
        $ids = [$userA, $userB];
        sort($ids);

        // Try find existing direct conversation with exactly these 2 participants
        $existing = Conversation::query()
            ->where('type', 'direct')
            ->whereHas('participants', fn($q) => $q->whereIn('users.id', $ids))
            ->withCount(['participants' => fn($q) => $q->whereIn('users.id', $ids)])
            ->get()
            ->first(function ($c) use ($ids) {
                return (int) $c->participants_count === 2;
            });

        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($userA, $userB) {
            $conv = Conversation::create([
                'type' => 'direct',
                'created_by' => $userA,
                'last_message_at' => now(),
            ]);

            DB::table('conversation_participants')->insert([
                ['conversation_id' => $conv->id, 'user_id' => $userA, 'role' => 'owner', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                ['conversation_id' => $conv->id, 'user_id' => $userB, 'role' => 'member', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ]);

            return $conv;
        });
    }

    public function createGroup(int $ownerId, string $title, array $participantIds): Conversation
    {
        return DB::transaction(function () use ($ownerId, $title, $participantIds) {
            $conv = Conversation::create([
                'type' => 'group',
                'title' => $title,
                'created_by' => $ownerId,
                'last_message_at' => now(),
            ]);

            $all = collect($participantIds)->unique()->push($ownerId)->unique()->values();
            $rows = $all->map(fn($uid) => [
                'conversation_id' => $conv->id,
                'user_id' => $uid,
                'role' => $uid === $ownerId ? 'owner' : 'member',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();
            DB::table('conversation_participants')->insert($rows);
            return $conv;
        });
    }

    public function userIsOwner(int $conversationId, int $userId): bool
    {
        return Conversation::query()
            ->where('id', $conversationId)
            ->where('created_by', $userId)
            ->exists();
    }

    public function addParticipants(int $conversationId, array $userIds): int
    {
        $now = now();
        $rows = collect($userIds)->unique()->map(fn($uid) => [
            'conversation_id' => $conversationId,
            'user_id' => $uid,
            'role' => 'member',
            'joined_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();
        return DB::table('conversation_participants')->upsert($rows, ['conversation_id','user_id'], ['updated_at']);
    }

    public function removeParticipant(int $conversationId, int $userId): int
    {
        return DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete();
    }
}



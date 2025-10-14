<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatSession;
use App\Models\Conversation;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('session.{sessionId}', function ($user, int $sessionId) {
    return ChatSession::query()
        ->where('id', $sessionId)
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel('conversation.{conversationId}', function ($user, int $conversationId) {
    return Conversation::query()
        ->where('id', $conversationId)
        ->whereHas('participants', fn($q) => $q->where('users.id', $user->id))
        ->exists();
});

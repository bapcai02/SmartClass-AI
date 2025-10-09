<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\ChatSession;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('session.{sessionId}', function ($user, int $sessionId) {
    return ChatSession::query()
        ->where('id', $sessionId)
        ->where('user_id', $user->id)
        ->exists();
});

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'message',
        'response',
        'image_path',
        'context',
        'conversation_id',
        'message_type',
        'tokens_used',
        'response_time_ms',
    ];

    protected $casts = [
        'context' => 'array',
        'tokens_used' => 'integer',
        'response_time_ms' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class, 'conversation_id');
    }
}

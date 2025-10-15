<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use App\Services\ConversationService;
use Illuminate\Support\Facades\Redis as RedisFacade;

class ConsumeChatRedis extends Command
{
    protected $signature = 'chat:consume-redis {channel=chat:incoming}';
    protected $description = 'Consume chat messages from Redis Pub/Sub and persist + broadcast';

    public function handle(ConversationService $service): int
    {
        $channel = (string) $this->argument('channel');
        $this->info("Subscribing Redis channel: {$channel}");

        Redis::subscribe([$channel], function ($message) use ($service) {
            try {
                $payload = json_decode($message, true);
                if (!is_array($payload)) return;
                $conversationId = (int) ($payload['conversationId'] ?? 0);
                $senderId = (int) ($payload['senderId'] ?? 0);
                $content = $payload['content'] ?? null;
                $messageType = $payload['message_type'] ?? 'text';
                $fileUrl = $payload['file_url'] ?? null;
                if (!$conversationId || !$senderId || (!$content && !$fileUrl)) return;

                $msg = $service->sendMessage($conversationId, $senderId, [
                    'content' => $content,
                    'message_type' => $messageType,
                    'file_url' => $fileUrl,
                ]);

                // Publish to outgoing bus for Socket.io to fan-out
                RedisFacade::publish('chat:outgoing', json_encode([
                    'id' => $msg->id,
                    'conversation_id' => $msg->conversation_id,
                    'sender' => ['id' => $msg->sender->id, 'name' => $msg->sender->name],
                    'content' => $msg->content,
                    'message_type' => $msg->message_type,
                    'file_url' => $msg->file_url,
                    'created_at' => $msg->created_at,
                ]));
            } catch (\Throwable $e) {
                // swallow to keep consumer alive
            }
        });

        return self::SUCCESS;
    }
}



<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConversationService;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ConversationController extends Controller
{
    private ConversationService $service;

    public function __construct(ConversationService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        $user = request()->user();
        $limit = request()->integer('limit', 20) ?: 20;
        $items = $this->service->listForUser($user->id, $limit);
        $data = $items->map(fn($c) => [
            'id' => $c->id,
            'type' => $c->type,
            'title' => $c->title,
            'created_by' => $c->created_by,
            'last_message_at' => $c->last_message_at,
            'messages_count' => $c->messages_count,
            'participants' => $c->participants->map(fn($u) => [ 'id' => $u->id, 'name' => $u->name ])->values(),
            'last_message' => $c->getAttribute('last_message'),
        ]);

        return response()->json([ 'items' => $data ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = request()->user();
        $perPage = request()->integer('per_page', 30) ?: 30;
        $conversation = $this->service->getForUser($id, $user->id);
        abort_unless($conversation, 404);
        $messages = $this->service->paginateMessages($id, $perPage);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'type' => $conversation->type,
                'title' => $conversation->title,
                'participants' => $conversation->participants->map(fn($u)=> ['id'=>$u->id,'name'=>$u->name])->values(),
            ],
            'messages' => $messages,
        ]);
    }

    public function send(int $id): JsonResponse
    {
        $user = request()->user();
        request()->validate([
            'content' => ['nullable','string'],
            'message_type' => ['nullable','in:text,image,file'],
            'file_url' => ['nullable','url'],
            'replied_to_id' => ['nullable','integer'],
        ]);
        $c = $this->service->getForUser($id, $user->id);
        abort_unless($c, 404);
        $msg = $this->service->sendMessage($id, $user->id, request()->only('content','message_type','file_url','replied_to_id'));
        // Publish to outgoing bus for Socket.io to fan-out
        Redis::publish('chat:outgoing', json_encode([
            'id' => $msg->id,
            'conversation_id' => $msg->conversation_id,
            'sender' => ['id' => $msg->sender->id, 'name' => $msg->sender->name],
            'content' => $msg->content,
            'message_type' => $msg->message_type,
            'file_url' => $msg->file_url,
            'replied_to_id' => $msg->replied_to_id,
            'created_at' => $msg->created_at,
        ]));
        return response()->json($msg);
    }

    public function direct(): JsonResponse
    {
        $user = request()->user();
        $otherId = request()->integer('user_id');
        abort_if(!$otherId, 422, 'user_id required');
        $conv = $this->service->getOrCreateDirect($user->id, $otherId);
        return response()->json(['id' => $conv->id]);
    }

    public function createGroup(): JsonResponse
    {
        $user = request()->user();
        $data = request()->validate([
            'title' => ['required','string','max:120'],
            'participant_ids' => ['array'],
            'participant_ids.*' => ['integer'],
        ]);
        $participantIds = collect($data['participant_ids'] ?? [])->unique()->reject(fn($id) => $id === $user->id)->values()->all();
        $conv = $this->service->createGroup($user->id, (string) $data['title'], $participantIds);
        return response()->json(['id' => $conv->id]);
    }

    public function addParticipants(int $id): JsonResponse
    {
        $user = request()->user();
        $data = request()->validate([
            'participant_ids' => ['required','array','min:1'],
            'participant_ids.*' => ['integer'],
        ]);
        abort_unless($this->service->userCanManage($id, $user->id), 403);
        $added = $this->service->addParticipants($id, $data['participant_ids']);
        return response()->json(['added' => $added]);
    }

    public function removeParticipant(int $id): JsonResponse
    {
        $user = request()->user();
        $data = request()->validate([
            'user_id' => ['required','integer'],
        ]);
        abort_unless($this->service->userCanManage($id, $user->id), 403);
        $ok = $this->service->removeParticipant($id, (int) $data['user_id']);
        return response()->json(['removed' => (bool) $ok]);
    }

    public function react(int $id): JsonResponse
    {
        $user = request()->user();
        $data = request()->validate([
            'message_id' => ['required','integer'],
            'emoji' => ['required','string','max:8'],
        ]);
        // Store reaction in a lightweight table or pivot-like structure
        
        \DB::table('message_reactions')->updateOrInsert(
            [ 'message_id' => $data['message_id'], 'user_id' => $user->id ],
            [ 'emoji' => $data['emoji'], 'updated_at' => now(), 'created_at' => now() ]
        );

        // Fan-out via Redis so Socket.io can update in realtime
        \Illuminate\Support\Facades\Redis::publish('chat:outgoing', json_encode([
            'type' => 'reaction',
            'conversation_id' => $id,
            'message_id' => $data['message_id'],
            'user_id' => $user->id,
            'emoji' => $data['emoji'],
            'created_at' => now()->toISOString(),
        ]));

        return response()->json(['ok' => true]);
    }
}

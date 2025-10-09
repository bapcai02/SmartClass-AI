<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;

class ConversationController extends Controller
{
    public function __construct(private ConversationService $service) {}

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
}



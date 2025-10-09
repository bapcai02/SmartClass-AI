<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Support\Facades\DB;

class ChatDemoSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()->limit(5)->get();
        if ($users->count() < 3) {
            return; // need some users
        }

        // 1-1 conversation between first two users
        $u1 = $users[0];
        $u2 = $users[1];

        $direct = Conversation::create([
            'type' => 'direct',
            'created_by' => $u1->id,
            'last_message_at' => now(),
        ]);

        DB::table('conversation_participants')->insert([
            ['conversation_id' => $direct->id, 'user_id' => $u1->id, 'role' => 'owner', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['conversation_id' => $direct->id, 'user_id' => $u2->id, 'role' => 'member', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('messages')->insert([
            ['conversation_id' => $direct->id, 'sender_id' => $u1->id, 'content' => 'Chào bạn!', 'message_type' => 'text', 'created_at' => now(), 'updated_at' => now()],
            ['conversation_id' => $direct->id, 'sender_id' => $u2->id, 'content' => 'Hi, hôm nay học gì?', 'message_type' => 'text', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Group conversation among first 4 users
        $group = Conversation::create([
            'type' => 'group',
            'title' => 'Nhóm Ôn Tập Toán',
            'created_by' => $u1->id,
            'last_message_at' => now(),
        ]);

        foreach ($users->take(4) as $idx => $u) {
            DB::table('conversation_participants')->insert([
                'conversation_id' => $group->id,
                'user_id' => $u->id,
                'role' => $idx === 0 ? 'owner' : 'member',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('messages')->insert([
            ['conversation_id' => $group->id, 'sender_id' => $u1->id, 'content' => 'Chào cả nhóm!', 'message_type' => 'text', 'created_at' => now(), 'updated_at' => now()],
            ['conversation_id' => $group->id, 'sender_id' => $u2->id, 'content' => 'Bắt đầu từ chương 1 nhé', 'message_type' => 'text', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}



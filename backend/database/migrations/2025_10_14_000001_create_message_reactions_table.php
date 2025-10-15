<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('message_reactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('user_id');
            $table->string('emoji', 8);
            $table->timestamps();
            $table->unique(['message_id','user_id']);
            $table->index('message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reactions');
    }
};



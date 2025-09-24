<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('qa_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('qa_post_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->text('answer_text');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qa_answers');
    }
};

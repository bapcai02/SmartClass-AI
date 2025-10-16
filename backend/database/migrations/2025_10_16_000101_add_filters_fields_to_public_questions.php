<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('public_questions', function (Blueprint $table) {
            if (!Schema::hasColumn('public_questions', 'difficulty')) {
                $table->unsignedTinyInteger('difficulty')->nullable()->after('content'); // 1-5
            }
            if (!Schema::hasColumn('public_questions', 'chapter')) {
                $table->string('chapter', 191)->nullable()->after('difficulty');
            }
            if (!Schema::hasColumn('public_questions', 'tags')) {
                $table->json('tags')->nullable()->after('chapter');
            }
            if (!Schema::hasColumn('public_questions', 'explanation')) {
                $table->text('explanation')->nullable()->after('tags');
            }
        });
    }

    public function down(): void
    {
        Schema::table('public_questions', function (Blueprint $table) {
            if (Schema::hasColumn('public_questions', 'explanation')) {
                $table->dropColumn('explanation');
            }
            if (Schema::hasColumn('public_questions', 'tags')) {
                $table->dropColumn('tags');
            }
            if (Schema::hasColumn('public_questions', 'chapter')) {
                $table->dropColumn('chapter');
            }
            if (Schema::hasColumn('public_questions', 'difficulty')) {
                $table->dropColumn('difficulty');
            }
        });
    }
};



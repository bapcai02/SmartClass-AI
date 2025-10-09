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
        Schema::create('public_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('public_exam_id')->constrained('public_exams')->cascadeOnDelete();
            $table->string('candidate_name')->nullable();
            $table->string('candidate_email')->nullable();
            $table->unsignedInteger('attempt_no')->default(1);
            $table->float('score')->default(0);
            $table->json('answers_json')->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->timestamps();
        });

        Schema::table('public_exams', function (Blueprint $table) {
            if (!Schema::hasColumn('public_exams', 'views')) $table->unsignedBigInteger('views')->default(0)->after('duration_minutes');
            if (!Schema::hasColumn('public_exams', 'attempts')) $table->unsignedBigInteger('attempts')->default(0)->after('views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('public_exams', function (Blueprint $table) {
            if (Schema::hasColumn('public_exams', 'attempts')) $table->dropColumn('attempts');
            if (Schema::hasColumn('public_exams', 'views')) $table->dropColumn('views');
        });
        Schema::dropIfExists('public_submissions');
    }
};

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
        Schema::create('public_subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('public_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Lớp 10, 11, 12...
            $table->timestamps();
        });

        Schema::create('public_exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('public_subject_id')->constrained('public_subjects')->cascadeOnDelete();
            $table->foreignId('public_class_id')->constrained('public_classes')->cascadeOnDelete();
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->timestamps();
        });

        Schema::create('public_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('public_exam_id')->constrained('public_exams')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('public_choices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('public_question_id')->constrained('public_questions')->cascadeOnDelete();
            $table->string('label', 2); // A, B, C, D
            $table->text('content');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_choices');
        Schema::dropIfExists('public_questions');
        Schema::dropIfExists('public_exams');
        Schema::dropIfExists('public_classes');
        Schema::dropIfExists('public_subjects');
    }
};

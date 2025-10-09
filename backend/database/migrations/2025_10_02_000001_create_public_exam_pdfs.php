<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_exam_pdfs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('public_subject_id')->constrained('public_subjects')->cascadeOnDelete();
            $table->foreignId('public_class_id')->constrained('public_classes')->cascadeOnDelete();
            $table->string('pdf_url');
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->unsignedSmallInteger('num_pages')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_exam_pdfs');
    }
};



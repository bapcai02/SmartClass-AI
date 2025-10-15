<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('public_exam_pdfs', function (Blueprint $table) {
            $table->string('category')->nullable()->after('public_class_id');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::table('public_exam_pdfs', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }
};



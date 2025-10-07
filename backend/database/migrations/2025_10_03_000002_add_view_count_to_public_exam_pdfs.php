<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('public_exam_pdfs', function (Blueprint $table) {
            if (!Schema::hasColumn('public_exam_pdfs', 'view_count')) {
                $table->unsignedBigInteger('view_count')->default(0)->after('download_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('public_exam_pdfs', function (Blueprint $table) {
            if (Schema::hasColumn('public_exam_pdfs', 'view_count')) {
                $table->dropColumn('view_count');
            }
        });
    }
};



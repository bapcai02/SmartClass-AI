<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_shares', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->string('target_type', 32); // exam|submission
            $table->unsignedBigInteger('target_id');
            $table->timestamp('expires_at')->nullable();
            $table->string('password_hash')->nullable();
            $table->unsignedInteger('max_views')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->timestamps();
            $table->index(['target_type','target_id']);
        });

        Schema::create('public_reports', function (Blueprint $table) {
            $table->id();
            $table->string('target_type', 32); // question|exam
            $table->unsignedBigInteger('target_id');
            $table->string('reason', 191);
            $table->text('details')->nullable();
            $table->string('contact', 191)->nullable();
            $table->string('status', 32)->default('open'); // open|reviewed|resolved|dismissed
            $table->timestamps();
            $table->index(['target_type','target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_reports');
        Schema::dropIfExists('public_shares');
    }
};



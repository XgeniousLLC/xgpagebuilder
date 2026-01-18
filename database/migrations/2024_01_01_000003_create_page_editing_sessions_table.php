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
        Schema::create('page_editing_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->unsignedBigInteger('admin_id');
            $table->string('session_token', 64)->unique();
            $table->string('editing_section', 50)->default('full_page'); // 'full_page', 'widget_123', 'section_456'
            $table->timestamp('last_activity');
            $table->timestamp('started_at');
            $table->json('metadata')->nullable(); // browser, IP, current widget being edited
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('page_id')->references('id')->on('pages')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');

            // Indexes for performance
            $table->index(['page_id', 'last_activity'], 'idx_page_active');
            $table->index(['admin_id', 'last_activity'], 'idx_admin_sessions');
            $table->index('session_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_editing_sessions');
    }
};
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
        Schema::create('page_builder_widgets', function (Blueprint $table) {
            $table->id();

            // Page relationship
            $table->foreignId('page_id')->constrained('pages')->onDelete('cascade');

            // Widget identification
            $table->string('widget_id')->index(); // Unique widget instance ID (e.g., 'widget_123abc')
            $table->string('widget_type', 100)->index(); // Widget type (button, heading, etc.)

            // Layout positioning
            $table->string('container_id')->nullable()->index(); // Section/container ID
            $table->string('column_id')->nullable()->index(); // Column ID within container
            $table->integer('sort_order')->default(0); // Order within container/column

            // Widget settings (normalized into separate JSON fields)
            $table->json('general_settings')->nullable(); // Content and behavior settings
            $table->json('style_settings')->nullable(); // Styling and appearance settings
            $table->json('advanced_settings')->nullable(); // Advanced options, visibility, etc.

            // Widget state and visibility
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_enabled')->default(true);

            // Performance caching
            $table->longText('cached_html')->nullable(); // Cached rendered HTML
            $table->text('cached_css')->nullable(); // Cached CSS styles
            $table->timestamp('cache_expires_at')->nullable(); // Cache expiration

            // Versioning and metadata
            $table->string('version', 20)->default('1.0.0'); // Widget version used
            $table->json('responsive_settings')->nullable(); // Device-specific overrides

            // Analytics tracking
            $table->integer('view_count')->default(0); // How many times widget was viewed
            $table->integer('interaction_count')->default(0); // Clicks, hovers, etc.
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamp('last_interacted_at')->nullable();

            // Audit trail
            $table->foreignId('created_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamps();

            // Indexes for performance
            $table->index(['page_id', 'is_visible', 'is_enabled']); // Page widgets listing
            $table->index(['widget_type', 'page_id']); // Widget type queries
            $table->index(['container_id', 'column_id', 'sort_order']); // Layout ordering
            $table->index(['page_id', 'container_id', 'column_id', 'sort_order'], 'idx_widgets_layout'); // Full layout query
            $table->index(['widget_type', 'view_count']); // Analytics queries
            $table->index(['cache_expires_at']); // Cache cleanup
            $table->index(['last_viewed_at', 'last_interacted_at']); // Analytics

            // Unique constraint for widget_id per page
            $table->unique(['page_id', 'widget_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_builder_widgets');
    }
};
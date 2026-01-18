<?php

namespace Xgenious\PageBuilder\Models;

use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PageBuilderContent Model
 * 
 * Stores page builder layout structure (containers and columns)
 * Widget data is now stored separately in the page_builder_widgets table
 *
 * @property int $id
 * @property int $page_id
 * @property array|null $content
 * @property string $version
 * @property bool $is_published
 * @property \Carbon\Carbon|null $published_at
 * @property int $created_by
 * @property int|null $updated_by
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read \App\Models\Page $page
 * @property-read \App\Models\Admin $creator
 * @property-read \App\Models\Admin|null $updater
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\PageBuilderWidget[] $widgets
 */
class PageBuilderContent extends Model
{
    protected $table = 'page_builder_content';
    
    protected $fillable = [
        'page_id',
        'content',
        'version',
        'is_published',
        'published_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime'
    ];
    
    /**
     * Get the page that owns this content
     */
    public function page(): BelongsTo
    {
        $pageModel = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
        return $this->belongsTo($pageModel);
    }
    
    /**
     * Get the admin who created this content
     */
    public function creator(): BelongsTo
    {
        $adminModel = config('xgpagebuilder.models.admin', \App\Models\Admin::class);
        return $this->belongsTo($adminModel, 'created_by');
    }
    
    /**
     * Get the admin who last updated this content
     */
    public function updater(): BelongsTo
    {
        $adminModel = config('xgpagebuilder.models.admin', \App\Models\Admin::class);
        return $this->belongsTo($adminModel, 'updated_by');
    }

    /**
     * Get all widgets for this page builder content
     */
    public function widgets(): HasMany
    {
        return $this->hasMany(PageBuilderWidget::class, 'page_id', 'page_id')
                    ->ordered();
    }

    /**
     * Get visible widgets only
     */
    public function visibleWidgets(): HasMany
    {
        return $this->widgets()->visible()->enabled();
    }

    /**
     * Get widgets by type
     */
    public function widgetsByType(string $type): HasMany
    {
        return $this->widgets()->ofType($type);
    }
    
    /**
     * Get the content with fallback to empty structure
     */
    protected function content(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? json_decode($value, true) : ['containers' => []],
            set: fn ($value) => json_encode($value ?? ['containers' => []])
        );
    }
    
    
    /**
     * Scope to get published content
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
    
    /**
     * Scope to get draft content
     */
    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }
    
    /**
     * Mark content as published
     */
    public function publish()
    {
        $this->update([
            'is_published' => true,
            'published_at' => now()
        ]);
    }
    
    /**
     * Mark content as draft
     */
    public function unpublish()
    {
        $this->update([
            'is_published' => false,
            'published_at' => null
        ]);
    }
    
    /**
     * Get the total count of widgets for this page
     */
    public function getWidgetCountAttribute(): int
    {
        return $this->widgets()->count();
    }

    /**
     * Get the count of visible widgets
     */
    public function getVisibleWidgetCountAttribute(): int
    {
        return $this->visibleWidgets()->count();
    }

    /**
     * Get widget analytics summary
     */
    public function getWidgetAnalytics(): array
    {
        $widgets = $this->widgets;

        return [
            'total_widgets' => $widgets->count(),
            'visible_widgets' => $widgets->where('is_visible', true)->count(),
            'enabled_widgets' => $widgets->where('is_enabled', true)->count(),
            'total_views' => $widgets->sum('view_count'),
            'total_interactions' => $widgets->sum('interaction_count'),
            'widgets_by_type' => $widgets->groupBy('widget_type')
                                       ->map(fn($group) => $group->count())
                                       ->toArray(),
            'cached_widgets' => $widgets->filter(fn($w) => $w->isCacheValid())->count()
        ];
    }

    /**
     * Clear all widget caches for this page
     */
    public function clearAllWidgetCaches(): int
    {
        $count = 0;
        $this->widgets->each(function($widget) use (&$count) {
            if ($widget->isCacheValid()) {
                $widget->clearCache();
                $count++;
            }
        });

        return $count;
    }

    /**
     * Get complete content structure with widget settings merged in
     * This combines the layout structure with detailed widget settings
     *
     * @return array Complete page content ready for rendering
     */
    public function getCompleteContent(): array
    {
        $content = $this->content ?? ['containers' => []];

        // Load all widgets for this page with their settings
        $widgets = $this->widgets()->get()->keyBy('widget_id');
        $processedContent = ['containers' => []];

        // Process each container - avoiding references that cause circular loops
        foreach ($content['containers'] ?? [] as $containerIndex => $container) {
            $processedContainer = $container;

            // Process each column in the container
            $processedContainer['columns'] = [];
            foreach ($container['columns'] ?? [] as $columnIndex => $column) {
                $processedColumn = $column;

                // Process each widget in the column
                $processedColumn['widgets'] = [];
                foreach ($column['widgets'] ?? [] as $widgetIndex => $widget) {
                    $widgetId = $widget['id'] ?? null;

                    if ($widgetId && $widgets->has($widgetId)) {
                        $widgetData = $widgets[$widgetId];
                        Log::info("Found widget {$widgetId} in database", ['type' => $widgetData->widget_type]);

                        // Helper to ensure settings are objects, not empty arrays
                        $ensureObject = function($value) {
                            if (empty($value) || (is_array($value) && count($value) === 0)) {
                                return [];  // Return empty array for now, frontend will convert
                            }
                            return $value;
                        };

                        // Get settings with proper fallback
                        $generalSettings = $ensureObject($widgetData->general_settings);
                        $styleSettings = $ensureObject($widgetData->style_settings);
                        $advancedSettings = $ensureObject($widgetData->advanced_settings);

                        // Merge widget settings into the content structure (frontend format)
                        $processedWidget = array_merge($widget, [
                            'type' => $widgetData->widget_type,
                            'content' => $generalSettings,  // Legacy widgets expect 'content'
                            'general' => $generalSettings,  // PHP widgets expect 'general'
                            'style' => $styleSettings,
                            'advanced' => $advancedSettings,
                            'is_visible' => $widgetData->is_visible ?? true,
                            'is_enabled' => $widgetData->is_enabled ?? true,
                        ]);

                        // Debug specific widgets
                        if ($widgetData->widget_type === 'heading') {
                            Log::info("Found heading widget {$widgetId} - merged data", [
                                'general_settings_from_db' => $widgetData->general_settings,
                                'processed_widget_general' => $processedWidget['general'],
                                'processed_widget_content' => $processedWidget['content']
                            ]);
                        }

                        // Deep clone arrays to prevent any references
                        // Use direct array cloning instead of json encode/decode to prevent circular reference issues
                        $processedWidget['content'] = $this->deepCloneArray($processedWidget['content']);
                        $processedWidget['general'] = $this->deepCloneArray($processedWidget['general']);
                        $processedWidget['style'] = $this->deepCloneArray($processedWidget['style']);
                        $processedWidget['advanced'] = $this->deepCloneArray($processedWidget['advanced']);
                    } else {
                        Log::warning("Widget {$widgetId} not found in database");
                        $processedWidget = $widget;
                    }

                    $processedColumn['widgets'][] = $processedWidget;
                }

                $processedContainer['columns'][] = $processedColumn;
            }

            $processedContent['containers'][] = $processedContainer;
        }

        return $processedContent;
    }

    /**
     * Deep clone an array to prevent circular references
     * Uses a reasonable depth limit for widget settings which can be deeply nested
     *
     * @param mixed $data The data to clone
     * @param int $depth Current depth level (starts at 0)
     * @param int $maxDepth Maximum allowed depth (default 10 for complex widget settings)
     * @return mixed The cloned data
     */
    private function deepCloneArray($data, int $depth = 0, int $maxDepth = 10)
    {
        // Strict depth limit - prevent infinite recursion
        if ($depth >= $maxDepth) {
            // At max depth, return scalar or empty representation
            if (is_scalar($data) || is_null($data)) {
                return $data;
            }
            return null; // Truncate deeply nested structures
        }

        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $result[$key] = $this->deepCloneArray($value, $depth + 1, $maxDepth);
            }
            return $result;
        } elseif (is_object($data)) {
            // Convert objects to arrays
            return $this->deepCloneArray((array) $data, $depth + 1, $maxDepth);
        } else {
            // Return scalar values as-is (string, int, bool, null)
            return $data;
        }
    }

    /**
     * Sync widgets with content structure
     * Updates widget positions based on current content layout
     */
    public function syncWidgetPositions(): void
    {
        $content = $this->content ?? ['containers' => []];
        $positionMap = [];

        // Build position map from content structure
        foreach ($content['containers'] ?? [] as $containerIndex => $container) {
            $containerId = $container['id'] ?? "container_{$containerIndex}";

            foreach ($container['columns'] ?? [] as $columnIndex => $column) {
                $columnId = $column['id'] ?? "column_{$columnIndex}";

                foreach ($column['widgets'] ?? [] as $widgetIndex => $widget) {
                    $widgetId = $widget['id'] ?? null;

                    if ($widgetId) {
                        $positionMap[$widgetId] = [
                            'container_id' => $containerId,
                            'column_id' => $columnId,
                            'sort_order' => $widgetIndex
                        ];
                    }
                }
            }
        }

        // Update widget positions
        foreach ($this->widgets as $widget) {
            if (isset($positionMap[$widget->widget_id])) {
                $position = $positionMap[$widget->widget_id];
                $widget->moveTo(
                    $position['container_id'],
                    $position['column_id'],
                    $position['sort_order']
                );
            }
        }
    }
}

<?php

namespace Xgenious\PageBuilder\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

/**
 * PageBuilderWidget Model
 *
 * Represents individual widget instances within the page builder system.
 * Each widget has its own settings, caching, and analytics tracking.
 *
 * @property int $id
 * @property int $page_id
 * @property string $widget_id
 * @property string $widget_type
 * @property string|null $container_id
 * @property string|null $column_id
 * @property int $sort_order
 * @property array|null $general_settings
 * @property array|null $style_settings
 * @property array|null $advanced_settings
 * @property bool $is_visible
 * @property bool $is_enabled
 * @property string|null $cached_html
 * @property string|null $cached_css
 * @property Carbon|null $cache_expires_at
 * @property string $version
 * @property array|null $responsive_settings
 * @property int $view_count
 * @property int $interaction_count
 * @property Carbon|null $last_viewed_at
 * @property Carbon|null $last_interacted_at
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read Page $page
 * @property-read Admin|null $creator
 * @property-read Admin|null $updater
 */
class PageBuilderWidget extends Model
{
    protected $table = 'page_builder_widgets';

    protected $fillable = [
        'page_id',
        'widget_id',
        'widget_type',
        'container_id',
        'column_id',
        'sort_order',
        'general_settings',
        'style_settings',
        'advanced_settings',
        'is_visible',
        'is_enabled',
        'cached_html',
        'cached_css',
        'cache_expires_at',
        'version',
        'responsive_settings',
        'view_count',
        'interaction_count',
        'last_viewed_at',
        'last_interacted_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'general_settings' => 'array',
        'style_settings' => 'array',
        'advanced_settings' => 'array',
        'responsive_settings' => 'array',
        'is_visible' => 'boolean',
        'is_enabled' => 'boolean',
        'cache_expires_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'last_interacted_at' => 'datetime',
        'view_count' => 'integer',
        'interaction_count' => 'integer',
        'sort_order' => 'integer'
    ];

    /**
     * Get the page that owns this widget
     */
    public function page(): BelongsTo
    {
        $pageModel = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
        return $this->belongsTo($pageModel);
    }

    /**
     * Get the admin who created this widget
     */
    public function creator(): BelongsTo
    {
        $adminModel = config('xgpagebuilder.models.admin', \App\Models\Admin::class);
        return $this->belongsTo($adminModel, 'created_by');
    }

    /**
     * Get the admin who last updated this widget
     */
    public function updater(): BelongsTo
    {
        $adminModel = config('xgpagebuilder.models.admin', \App\Models\Admin::class);
        return $this->belongsTo($adminModel, 'updated_by');
    }

    /**
     * Scope to get visible widgets
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to get enabled widgets
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to get widgets by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('widget_type', $type);
    }

    /**
     * Scope to get widgets in a specific container
     */
    public function scopeInContainer($query, string $containerId)
    {
        return $query->where('container_id', $containerId);
    }

    /**
     * Scope to get widgets in a specific column
     */
    public function scopeInColumn($query, string $columnId)
    {
        return $query->where('column_id', $columnId);
    }

    /**
     * Scope to order widgets by their sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Scope to get widgets with valid cache
     */
    public function scopeCached($query)
    {
        return $query->whereNotNull('cached_html')
                    ->where(function($q) {
                        $q->whereNull('cache_expires_at')
                          ->orWhere('cache_expires_at', '>', now());
                    });
    }

    /**
     * Scope to get widgets with expired cache
     */
    public function scopeCacheExpired($query)
    {
        return $query->where(function($q) {
            $q->whereNull('cached_html')
              ->orWhere('cache_expires_at', '<=', now());
        });
    }

    /**
     * Ensure settings are objects not arrays for JSON serialization
     * Empty arrays [] become empty objects {} in JSON
     */
    private function ensureObject($value)
    {
        if (empty($value) || (is_array($value) && array_keys($value) === range(0, count($value) - 1) && count($value) === 0)) {
            return new \stdClass();
        }
        return $value;
    }

    /**
     * Get all widget settings combined
     */
    protected function allSettings(): Attribute
    {
        return Attribute::make(
            get: fn () => [
                'general' => $this->ensureObject($this->general_settings),
                'style' => $this->ensureObject($this->style_settings),
                'advanced' => $this->ensureObject($this->advanced_settings)
            ]
        );
    }

    /**
     * Check if widget cache is valid
     */
    public function isCacheValid(): bool
    {
        return !empty($this->cached_html) &&
               (is_null($this->cache_expires_at) || $this->cache_expires_at->isFuture());
    }

    /**
     * Clear widget cache
     */
    public function clearCache(): void
    {
        $this->update([
            'cached_html' => null,
            'cached_css' => null,
            'cache_expires_at' => null
        ]);
    }

    /**
     * Cache widget output
     */
    public function cacheOutput(string $html, string $css = '', int $ttlMinutes = 60): void
    {
        $this->update([
            'cached_html' => $html,
            'cached_css' => $css,
            'cache_expires_at' => now()->addMinutes($ttlMinutes)
        ]);
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    /**
     * Increment interaction count
     */
    public function incrementInteractions(): void
    {
        $this->increment('interaction_count');
        $this->update(['last_interacted_at' => now()]);
    }

    /**
     * Hide the widget
     */
    public function hide(): void
    {
        $this->update(['is_visible' => false]);
    }

    /**
     * Show the widget
     */
    public function show(): void
    {
        $this->update(['is_visible' => true]);
    }

    /**
     * Disable the widget
     */
    public function disable(): void
    {
        $this->update(['is_enabled' => false]);
    }

    /**
     * Enable the widget
     */
    public function enable(): void
    {
        $this->update(['is_enabled' => true]);
    }

    /**
     * Move widget to a new position
     */
    public function moveTo(string $containerId = null, string $columnId = null, int $sortOrder = 0): void
    {
        $this->update([
            'container_id' => $containerId,
            'column_id' => $columnId,
            'sort_order' => $sortOrder
        ]);

        // Clear cache when position changes
        $this->clearCache();
    }

    /**
     * Update widget settings
     */
    public function updateSettings(array $settings): void
    {
        $updateData = [];

        if (isset($settings['general'])) {
            $updateData['general_settings'] = $settings['general'];
        }

        if (isset($settings['style'])) {
            $updateData['style_settings'] = $settings['style'];
        }

        if (isset($settings['advanced'])) {
            $updateData['advanced_settings'] = $settings['advanced'];
        }

        if (isset($settings['responsive'])) {
            $updateData['responsive_settings'] = $settings['responsive'];
        }

        $this->update($updateData);

        // Clear cache when settings change
        $this->clearCache();
    }

    /**
     * Duplicate this widget
     */
    public function duplicate(string $newWidgetId): PageBuilderWidget
    {
        return static::create([
            'page_id' => $this->page_id,
            'widget_id' => $newWidgetId,
            'widget_type' => $this->widget_type,
            'container_id' => $this->container_id,
            'column_id' => $this->column_id,
            'sort_order' => $this->sort_order + 1,
            'general_settings' => $this->general_settings,
            'style_settings' => $this->style_settings,
            'advanced_settings' => $this->advanced_settings,
            'is_visible' => $this->is_visible,
            'is_enabled' => $this->is_enabled,
            'version' => $this->version,
            'responsive_settings' => $this->responsive_settings,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by
        ]);
    }

    /**
     * Get widget analytics data
     */
    public function getAnalytics(): array
    {
        return [
            'view_count' => $this->view_count,
            'interaction_count' => $this->interaction_count,
            'last_viewed_at' => $this->last_viewed_at,
            'last_interacted_at' => $this->last_interacted_at,
            'engagement_rate' => $this->view_count > 0 ? ($this->interaction_count / $this->view_count) * 100 : 0,
            'cache_hit_rate' => $this->isCacheValid() ? 100 : 0
        ];
    }
}
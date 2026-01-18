<?php

namespace Xgenious\PageBuilder\Core;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class WidgetRegistry
{
    private static array $registeredWidgets = [];
    private static bool $autoDiscovered = false;
    private static array $searchableFields = ['name', 'description', 'tags'];

    /**
     * Register a widget class
     */
    public static function register(string $widgetClass): void
    {
        if (!class_exists($widgetClass)) {
            throw new \InvalidArgumentException("Widget class {$widgetClass} does not exist");
        }

        if (!is_subclass_of($widgetClass, BaseWidget::class)) {
            throw new \InvalidArgumentException("Widget class {$widgetClass} must extend BaseWidget");
        }

        $widget = new $widgetClass();
        $config = $widget->getWidgetConfig();
        
        // Validate category exists
        if (!WidgetCategory::categoryExists($config['category'])) {
            throw new \InvalidArgumentException("Invalid category: {$config['category']}");
        }

        self::$registeredWidgets[$config['type']] = [
            'class' => $widgetClass,
            'config' => $config,
            'instance' => $widget
        ];
    }

    /**
     * Register multiple widgets at once
     */
    public static function registerMultiple(array $widgetClasses): void
    {
        foreach ($widgetClasses as $widgetClass) {
            self::register($widgetClass);
        }
    }

    /**
     * Auto-discover widgets from plugins directory
     */
    public static function autoDiscover(string $widgetPath = null): void
    {
        if (self::$autoDiscovered) {
            return;
        }

        $widgetPath = $widgetPath ?: base_path('plugins/Pagebuilder');
        
        if (!File::exists($widgetPath)) {
            return;
        }

        $files = File::allFiles($widgetPath);
        
        foreach ($files as $file) {
            if ($file->getExtension() === 'php') {
                $relativePath = str_replace($widgetPath . '/', '', $file->getPathname());
                $className = self::pathToClassName($relativePath);
                
                if (class_exists($className) && is_subclass_of($className, BaseWidget::class)) {
                    try {
                        self::register($className);
                    } catch (\Exception $e) {
                        // Log error but continue discovery
                        \Log::warning("Failed to register widget {$className}: " . $e->getMessage());
                    }
                }
            }
        }

        self::$autoDiscovered = true;
    }

    /**
     * Convert file path to class name
     */
    private static function pathToClassName(string $path): string
    {
        $path = str_replace(['/', '.php'], ['\\', ''], $path);
        return "Plugins\\Pagebuilder\\{$path}";
    }

    /**
     * Get all registered widgets
     */
    public static function getAllWidgets(): array
    {
        self::autoDiscover();
        return self::$registeredWidgets;
    }

    /**
     * Get widgets by category
     */
    public static function getWidgetsByCategory(string $category): array
    {
        self::autoDiscover();
        
        if (!WidgetCategory::categoryExists($category)) {
            return [];
        }

        return array_filter(self::$registeredWidgets, function ($widget) use ($category) {
            return $widget['config']['category'] === $category;
        });
    }

    /**
     * Get widgets grouped by category
     */
    public static function getWidgetsGroupedByCategory(): array
    {
        self::autoDiscover();
        
        $grouped = [];
        $categories = WidgetCategory::getAllCategories();
        
        foreach ($categories as $categorySlug => $categoryInfo) {
            $widgets = self::getWidgetsByCategory($categorySlug);
            if (!empty($widgets)) {
                $grouped[$categorySlug] = [
                    'category' => $categoryInfo,
                    'widgets' => $widgets
                ];
            }
        }

        return $grouped;
    }

    /**
     * Search widgets by query
     */
    public static function searchWidgets(string $query, array $filters = []): array
    {
        self::autoDiscover();
        
        $query = strtolower(trim($query));
        $results = [];

        if (empty($query) && empty($filters)) {
            return self::$registeredWidgets;
        }

        foreach (self::$registeredWidgets as $type => $widget) {
            $config = $widget['config'];
            $matches = false;

            // Text search
            if (!empty($query)) {
                foreach (self::$searchableFields as $field) {
                    if ($field === 'tags') {
                        $searchText = implode(' ', $config[$field]);
                    } else {
                        $searchText = $config[$field];
                    }
                    
                    if (str_contains(strtolower($searchText), $query)) {
                        $matches = true;
                        break;
                    }
                }
            } else {
                $matches = true; // If no query, only apply filters
            }

            // Apply filters
            if ($matches && !empty($filters)) {
                if (isset($filters['category']) && $config['category'] !== $filters['category']) {
                    $matches = false;
                }
                
                if (isset($filters['is_pro']) && $config['is_pro'] !== $filters['is_pro']) {
                    $matches = false;
                }
                
                if (isset($filters['tags']) && !empty($filters['tags'])) {
                    $hasTag = false;
                    foreach ($filters['tags'] as $tag) {
                        if (in_array($tag, $config['tags'])) {
                            $hasTag = true;
                            break;
                        }
                    }
                    if (!$hasTag) {
                        $matches = false;
                    }
                }
            }

            if ($matches) {
                $results[$type] = $widget;
            }
        }

        return $results;
    }

    /**
     * Get widget instance by type
     */
    public static function getWidget(string $type): ?BaseWidget
    {
        self::autoDiscover();
        
        if (!isset(self::$registeredWidgets[$type])) {
            return null;
        }

        return self::$registeredWidgets[$type]['instance'];
    }

    /**
     * Get widget configuration by type
     */
    public static function getWidgetConfig(string $type): ?array
    {
        self::autoDiscover();
        
        if (!isset(self::$registeredWidgets[$type])) {
            return null;
        }

        return self::$registeredWidgets[$type]['config'];
    }

    /**
     * Check if widget type exists
     */
    public static function widgetExists(string $type): bool
    {
        self::autoDiscover();
        return isset(self::$registeredWidgets[$type]);
    }

    /**
     * Get widget fields by type and tab
     */
    public static function getWidgetFields(string $type, string $tab = null): ?array
    {
        $widget = self::getWidget($type);
        
        if (!$widget) {
            return null;
        }

        if ($tab) {
            return $widget->getFieldsByTab($tab);
        }

        return $widget->getAllFields();
    }

    /**
     * Get categories with widget counts
     */
    public static function getCategoriesWithCounts(): array
    {
        self::autoDiscover();
        
        $categories = WidgetCategory::getCategoriesForApi();
        $widgetCounts = [];

        // Count widgets per category
        foreach (self::$registeredWidgets as $widget) {
            $category = $widget['config']['category'];
            $widgetCounts[$category] = ($widgetCounts[$category] ?? 0) + 1;
        }

        // Add counts to categories
        foreach ($categories as &$category) {
            $category['widget_count'] = $widgetCounts[$category['slug']] ?? 0;
        }

        return $categories;
    }

    /**
     * Get popular widgets (most used)
     */
    public static function getPopularWidgets(int $limit = 10): array
    {
        self::autoDiscover();
        
        // This would typically query usage statistics from database
        // For now, return first N widgets sorted by name
        $widgets = self::$registeredWidgets;
        
        uasort($widgets, function ($a, $b) {
            return strcmp($a['config']['name'], $b['config']['name']);
        });

        return array_slice($widgets, 0, $limit, true);
    }

    /**
     * Get recently added widgets
     */
    public static function getRecentWidgets(int $limit = 10): array
    {
        self::autoDiscover();
        
        // This would typically sort by created_at from database
        // For now, return last N widgets by registration order
        $widgets = array_reverse(self::$registeredWidgets, true);
        
        return array_slice($widgets, 0, $limit, true);
    }

    /**
     * Get widgets for API response
     */
    public static function getWidgetsForApi(array $filters = []): array
    {
        $widgets = self::searchWidgets('', $filters);
        $result = [];

        foreach ($widgets as $type => $widget) {
            $config = $widget['config'];
            $category = WidgetCategory::getCategory($config['category']);
            
            // Skip hidden categories unless explicitly requested
            if (isset($category['hidden']) && $category['hidden'] && !($filters['show_hidden'] ?? false)) {
                continue;
            }
            
            $result[] = [
                'type' => $type,
                'name' => $config['name'],
                'icon' => $config['icon'],
                'category' => $config['category'],
                'category_name' => WidgetCategory::getCategoryName($config['category']),
                'description' => $config['description'],
                'tags' => $config['tags'],
                'is_pro' => $config['is_pro'],
                'sort_order' => $config['sort_order'],
                'is_active' => $config['is_active']
            ];
        }

        // Sort by category sort order, then by widget sort order, then by name
        usort($result, function ($a, $b) {
            $categoryA = WidgetCategory::getCategory($a['category']);
            $categoryB = WidgetCategory::getCategory($b['category']);
            
            if ($categoryA['sort_order'] !== $categoryB['sort_order']) {
                return $categoryA['sort_order'] <=> $categoryB['sort_order'];
            }
            
            if ($a['sort_order'] !== $b['sort_order']) {
                return $a['sort_order'] <=> $b['sort_order'];
            }
            
            return strcmp($a['name'], $b['name']);
        });

        return $result;
    }

    /**
     * Clear registry (useful for testing)
     */
    public static function clear(): void
    {
        self::$registeredWidgets = [];
        self::$autoDiscovered = false;
    }

    /**
     * Get registry statistics
     */
    public static function getStats(): array
    {
        self::autoDiscover();
        
        $stats = [
            'total_widgets' => count(self::$registeredWidgets),
            'categories' => [],
            'pro_widgets' => 0,
            'free_widgets' => 0
        ];

        foreach (self::$registeredWidgets as $widget) {
            $config = $widget['config'];
            $category = $config['category'];
            
            // Count by category
            $stats['categories'][$category] = ($stats['categories'][$category] ?? 0) + 1;
            
            // Count pro/free
            if ($config['is_pro']) {
                $stats['pro_widgets']++;
            } else {
                $stats['free_widgets']++;
            }
        }

        return $stats;
    }

    /**
     * Validate widget settings
     */
    public static function validateWidgetSettings(string $type, array $settings): array
    {
        $widget = self::getWidget($type);
        
        if (!$widget) {
            return ['Widget type not found'];
        }

        return $widget->validateSettings($settings);
    }

    /**
     * Cache registry data
     */
    public static function cache(): void
    {
        self::autoDiscover();
        
        $cacheData = [
            'widgets' => self::$registeredWidgets,
            'categories' => self::getCategoriesWithCounts(),
            'stats' => self::getStats(),
            'timestamp' => now()
        ];

        try {
            Cache::put('widget_registry', $cacheData, now()->addHours(24));
        } catch (\Exception $e) {
            // Cache table might not exist during migration, fail gracefully
            // Log the error but don't throw exception
            \Log::info('Widget registry cache could not be saved: ' . $e->getMessage());
        }
    }

    /**
     * Load from cache
     */
    public static function loadFromCache(): bool
    {
        try {
            $cacheData = Cache::get('widget_registry');
            
            if ($cacheData) {
                self::$registeredWidgets = $cacheData['widgets'];
                self::$autoDiscovered = true;
                return true;
            }

            return false;
        } catch (\Exception $e) {
            // Cache table might not exist during migration, fail gracefully
            return false;
        }
    }

    /**
     * Clear cache
     */
    public static function clearCache(): void
    {
        try {
            Cache::forget('widget_registry');
        } catch (\Exception $e) {
            // Cache table might not exist, fail gracefully
            \Log::info('Widget registry cache could not be cleared: ' . $e->getMessage());
        }
    }

    /**
     * Get widget default values from field definitions
     */
    public static function getWidgetDefaults(string $type): array
    {
        $widget = self::getWidget($type);
        
        if (!$widget) {
            return ['general' => [], 'style' => [], 'advanced' => []];
        }

        $defaults = [
            'general' => self::extractFieldDefaults($widget->getGeneralFields()),
            'style' => self::extractFieldDefaults($widget->getStyleFields()),
            'advanced' => self::extractFieldDefaults($widget->getAdvancedFields())
        ];

        return $defaults;
    }

    /**
     * Extract default values from field definitions
     */
    private static function extractFieldDefaults(array $fieldsData): array
    {
        $defaults = [];
        
        // The fieldsData is already in the format where keys are group names
        foreach ($fieldsData as $groupKey => $groupData) {
            if (!empty($groupData['fields']) && is_array($groupData['fields'])) {
                $defaults[$groupKey] = [];
                foreach ($groupData['fields'] as $fieldKey => $fieldConfig) {
                    if (isset($fieldConfig['default'])) {
                        $defaults[$groupKey][$fieldKey] = $fieldConfig['default'];
                    }
                }
            }
        }
        
        return $defaults;
    }

    /**
     * Render widget with settings
     */
    public static function renderWidget(string $type, array $settings): ?array
    {
        $widget = self::getWidget($type);
        
        if (!$widget) {
            return null;
        }

        try {
            // Generate a consistent widget ID for both HTML and CSS
            $widgetId = 'widget-' . uniqid();
            
            // Pass widget_id to settings so the widget can use it if needed
            $settings['widget_id'] = $widgetId;
            
            $html = $widget->render($settings);
            $css = $widget->generateCSS($widgetId, $settings);
            
            // Wrap the HTML in a container with the widget ID to ensure CSS selectors match
            // This fixes the issue where generated CSS selectors (.widget-{id}) didn't match the HTML
            $wrappedHtml = sprintf(
                '<div id="%s" class="%s xgp-widget xgp-widget-%s">%s</div>',
                $widgetId,
                $widgetId,
                $type,
                $html
            );
            
            return [
                'html' => $wrappedHtml,
                'css' => $css,
                'widget_type' => $type,
                'settings' => $settings
            ];
        } catch (\Exception $e) {
            \Log::error("Failed to render widget {$type}: " . $e->getMessage());
            return null;
        }
    }
}
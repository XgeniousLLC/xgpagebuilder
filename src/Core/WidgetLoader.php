<?php

namespace Xgenious\PageBuilder\Core;

use Xgenious\PageBuilder\Core\WidgetRegistry;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Plugins\Pagebuilder\Widgets\Theme\HeaderWidget;
use Illuminate\Support\Facades\File;

/**
 * WidgetLoader - INTERNAL core widget loading system
 *
 * This class handles the internal widget loading, registration, and management
 * for the page builder system. It should NOT be used directly by external code.
 *
 * External users should use WidgetRegistrar class instead.
 *
 * @internal This class is for internal use only
 * @see \Plugins\Pagebuilder\WidgetRegistrar For public API
 */
class WidgetLoader
{
    /**
     * Registered external widget paths for auto-discovery
     */
    private static array $customPaths = [];

    /**
     * Cache for preventing duplicate auto-discovery
     */
    private static array $discoveredPaths = [];
    // =================================================================
    // INTERNAL API - Core widget registration methods
    // =================================================================

    /**
     * Register a single widget class (internal use only)
     *
     * @internal
     * @param string $widgetClass Fully qualified class name
     * @throws \InvalidArgumentException If widget class is invalid
     */
    public static function registerWidget(string $widgetClass): void
    {
        WidgetRegistry::register($widgetClass);
    }

    /**
     * Register multiple widget classes at once (internal use only)
     *
     * @internal
     * @param array $widgetClasses Array of fully qualified class names
     */
    public static function registerWidgets(array $widgetClasses): void
    {
        WidgetRegistry::registerMultiple($widgetClasses);
    }

    /**
     * Register multiple categories at once (internal use only)
     *
     * @internal
     * @param array $categories Array of category definitions
     */
    public static function registerCategories(array $categories): void
    {
        foreach ($categories as $categoryData) {
            $slug = $categoryData['slug'] ?? null;
            $name = $categoryData['name'] ?? null;
            $icon = $categoryData['icon'] ?? null;
            $sortOrder = $categoryData['sortOrder'] ?? 100;

            if (!$slug || !$name || !$icon) {
                throw new \InvalidArgumentException(
                    "Category must include 'slug', 'name', and 'icon'"
                );
            }

            WidgetCategory::registerCustomCategory($slug, $name, $icon, $sortOrder);
        }
    }

    /**
     * Auto-discover and register widgets from a custom directory (internal use only)
     *
     * @internal
     * @param string $path Absolute path to widget directory
     * @param string|null $namespace Base namespace for discovered widgets (optional)
     * @param bool $recursive Whether to search subdirectories (default: true)
     */
    public static function discoverWidgetsFrom(string $path, ?string $namespace = null, bool $recursive = true): void
    {
        if (!File::exists($path)) {
            \Log::warning("Widget discovery path does not exist: {$path}");
            return;
        }

        // Avoid duplicate discovery
        $pathKey = $path . '|' . ($namespace ?? 'auto');
        if (in_array($pathKey, self::$discoveredPaths)) {
            return;
        }

        self::$discoveredPaths[] = $pathKey;

        $files = $recursive ? File::allFiles($path) : File::files($path);

        foreach ($files as $file) {
            if ($file->getExtension() === 'php') {
                $className = self::fileToClassName($file, $path, $namespace);

                if ($className && class_exists($className) && is_subclass_of($className, \Xgenious\PageBuilder\Core\BaseWidget::class)) {
                    try {
                        self::registerWidget($className);
                    } catch (\Exception $e) {
                        \Log::warning("Failed to register widget {$className}: " . $e->getMessage());
                    }
                }
            }
        }
    }

    /**
     * Add a path for automatic widget discovery (internal use only)
     *
     * @internal
     * @param string $path Absolute path to widget directory
     * @param string|null $namespace Base namespace for widgets
     * @param bool $recursive Whether to search subdirectories
     */
    public static function addWidgetPath(string $path, ?string $namespace = null, bool $recursive = true): void
    {
        self::$customPaths[] = [
            'path' => $path,
            'namespace' => $namespace,
            'recursive' => $recursive
        ];
    }

    /**
     * Register all available widgets (both core and custom)
     */
    public static function registerAllWidgets(): void
    {
        // Register core widgets
        self::registerCoreWidgets();

        // Auto-discover from custom paths
        self::discoverCustomWidgets();

        // Cache the registry for better performance
        WidgetRegistry::cache();
    }

    // =================================================================
    // INTERNAL METHODS - Hidden complexity, not part of public API
    // =================================================================

    /**
     * Register core page builder widgets
     */
    private static function registerCoreWidgets(): void
    {
        // Basic Widgets (Category: BASIC)
        self::registerBasicWidgets();

        // Layout Widgets (Category: LAYOUT)
        self::registerLayoutWidgets();

        // Media Widgets (Category: MEDIA)
        self::registerMediaWidgets();

        // Interactive Widgets (Category: INTERACTIVE)
        self::registerInteractiveWidgets();

        // Content Widgets (Category: CONTENT)
        self::registerContentWidgets();

        // Advanced Widgets (Category: ADVANCED)
        self::registerAdvancedWidgets();

        // Form Widgets (Category: FORM)
        self::registerFormWidgets();
    }

    /**
     * Auto-discover widgets from custom registered paths
     */
    private static function discoverCustomWidgets(): void
    {
        foreach (self::$customPaths as $pathConfig) {
            self::discoverWidgetsFrom(
                $pathConfig['path'],
                $pathConfig['namespace'],
                $pathConfig['recursive']
            );
        }
    }

    /**
     * Convert file path to class name with proper namespace
     */
    private static function fileToClassName(\SplFileInfo $file, string $basePath, ?string $namespace): ?string
    {
        $relativePath = str_replace($basePath, '', $file->getPathname());
        $relativePath = ltrim($relativePath, '/\\');
        $relativePath = str_replace(['/', '\\', '.php'], ['\\', '\\', ''], $relativePath);

        if ($namespace) {
            return $namespace . '\\' . $relativePath;
        }

        // Auto-detect namespace from file content (fallback)
        $content = File::get($file->getPathname());
        if (preg_match('/namespace\s+([^;]+);/', $content, $matches)) {
            $detectedNamespace = trim($matches[1]);
            $className = basename($relativePath);
            return $detectedNamespace . '\\' . $className;
        }

        return null;
    }

    /**
     * Register core widgets (basic and layout)
     */
    private static function registerBasicWidgets(): void
    {
        $coreWidgets = [
            \Xgenious\PageBuilder\Core\Widgets\HeadingWidget::class,
            \Xgenious\PageBuilder\Core\Widgets\ParagraphWidget::class,
            \Xgenious\PageBuilder\Core\Widgets\ListWidget::class,
            \Xgenious\PageBuilder\Core\Widgets\LinkWidget::class,
            \Xgenious\PageBuilder\Core\Widgets\ButtonWidget::class,
            HeaderWidget::class,
        ];

        WidgetRegistry::registerMultiple($coreWidgets);
    }

    /**
     * Register core layout widgets
     */
    private static function registerLayoutWidgets(): void
    {
        $coreLayoutWidgets = [
            \Xgenious\PageBuilder\Core\Widgets\SectionWidget::class,
            \Xgenious\PageBuilder\Core\Widgets\DividerWidget::class,
            \Xgenious\PageBuilder\Core\Widgets\SpacerWidget::class,
        ];

        WidgetRegistry::registerMultiple($coreLayoutWidgets);
    }

    /**
     * Register media widgets
     */
    private static function registerMediaWidgets(): void
    {
        $mediaWidgets = [
            \Plugins\Pagebuilder\Widgets\Media\ImageWidget::class,
            \Plugins\Pagebuilder\Widgets\Media\VideoWidget::class,
            \Plugins\Pagebuilder\Widgets\Media\IconWidget::class,
            \Plugins\Pagebuilder\Widgets\Media\ImageGalleryWidget::class,
        ];

        WidgetRegistry::registerMultiple($mediaWidgets);
    }

    /**
     * Register interactive widgets
     */
    private static function registerInteractiveWidgets(): void
    {
        $interactiveWidgets = [
            \Plugins\Pagebuilder\Widgets\Interactive\TabsWidget::class,
        ];

        WidgetRegistry::registerMultiple($interactiveWidgets);
    }

    /**
     * Register content widgets
     */
    private static function registerContentWidgets(): void
    {
        $contentWidgets = [
            \Plugins\Pagebuilder\Widgets\Content\TestimonialWidget::class,
        ];

        WidgetRegistry::registerMultiple($contentWidgets);
    }

    /**
     * Register advanced widgets
     */
    private static function registerAdvancedWidgets(): void
    {
        $advancedWidgets = [
            \Plugins\Pagebuilder\Widgets\Advanced\CodeWidget::class,
        ];

        WidgetRegistry::registerMultiple($advancedWidgets);
    }

    /**
     * Register form widgets
     */
    private static function registerFormWidgets(): void
    {
        $formWidgets = [

        ];

        WidgetRegistry::registerMultiple($formWidgets);
    }

    /**
     * Get all registered widgets for API/sidebar display
     */
    public static function getWidgetsForSidebar(): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getWidgetsForApi();
    }

    /**
     * Get widgets grouped by category for sidebar
     */
    public static function getWidgetsGroupedForSidebar(): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getWidgetsGroupedByCategory();
    }

    /**
     * Get widget statistics
     */
    public static function getWidgetStats(): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getStats();
    }

    /**
     * Get categories with widget counts
     */
    public static function getCategoriesWithCounts(): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getCategoriesWithCounts();
    }

    /**
     * Initialize the widget system
     * Call this method in your application bootstrap or service provider
     */
    public static function init(): void
    {
        // Try to load from cache first
        if (!WidgetRegistry::loadFromCache()) {
            // If cache is empty, register all widgets
            self::registerAllWidgets();
        }
    }

    /**
     * Get all custom widget paths registered for auto-discovery (internal use only)
     *
     * @internal
     */
    public static function getCustomPaths(): array
    {
        return self::$customPaths;
    }

    /**
     * Clear all custom widget paths (internal use only)
     *
     * @internal
     */
    public static function clearCustomPaths(): void
    {
        self::$customPaths = [];
        self::$discoveredPaths = [];
    }

    /**
     * Force refresh all widgets (clears cache and re-registers)
     */
    public static function refresh(): void
    {
        WidgetRegistry::clearCache();
        WidgetRegistry::clear();
        self::registerAllWidgets();
    }

    // =================================================================
    // QUERY METHODS - Widget retrieval and information
    // =================================================================

    /**
     * Get widget by type for rendering
     */
    public static function getWidget(string $type): ?\Xgenious\PageBuilder\Core\BaseWidget
    {
        self::registerAllWidgets();
        return WidgetRegistry::getWidget($type);
    }

    /**
     * Check if a widget type exists
     */
    public static function widgetExists(string $type): bool
    {
        self::registerAllWidgets();
        return WidgetRegistry::widgetExists($type);
    }

    /**
     * Search widgets
     */
    public static function searchWidgets(string $query, array $filters = []): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::searchWidgets($query, $filters);
    }

    /**
     * Get widget fields for the editor
     */
    public static function getWidgetFields(string $type, string $tab = null): ?array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getWidgetFields($type, $tab);
    }

    /**
     * Validate widget settings
     */
    public static function validateWidgetSettings(string $type, array $settings): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::validateWidgetSettings($type, $settings);
    }

    /**
     * Get popular widgets for quick access
     */
    public static function getPopularWidgets(int $limit = 6): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getPopularWidgets($limit);
    }

    /**
     * Get recently added widgets
     */
    public static function getRecentWidgets(int $limit = 6): array
    {
        self::registerAllWidgets();
        return WidgetRegistry::getRecentWidgets($limit);
    }
}

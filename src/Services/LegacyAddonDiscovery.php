<?php

namespace Xgenious\PageBuilder\Services;

use Xgenious\PageBuilder\Core\WidgetRegistry;
use Xgenious\PageBuilder\Core\LegacyAddonAdapter;
use Xgenious\PageBuilder\Core\BaseWidget;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * Legacy Addon Discovery Service
 * 
 * Automatically discovers and registers old PageBuilder addons
 * that extend LegacyAddonAdapter. This allows the package to work
 * with existing addons without manual registration.
 */
class LegacyAddonDiscovery
{
    /**
     * Discover and register widgets from configured paths
     */
    public static function discoverAndRegister(): void
    {
        $registered = 0;
        $failed = 0;

        // Discover new-style widgets (BaseWidget) from widget_paths config
        $widgetPaths = config('xgpagebuilder.widget_paths', []);
        
        foreach ($widgetPaths as $pathConfig) {
            $path = $pathConfig['path'] ?? null;
            $namespace = $pathConfig['namespace'] ?? null;
            
            if (!$path || !$namespace || !File::exists($path)) {
                Log::info("Widget path does not exist or is misconfigured: " . ($path ?? 'null'));
                continue;
            }

            $files = File::allFiles($path);
            
            foreach ($files as $file) {
                if ($file->getExtension() !== 'php') {
                    continue;
                }

                try {
                    // Build class name from file path using configured namespace
                    $relativePath = str_replace($path . '/', '', $file->getPathname());
                    $relativePath = str_replace(['/', '.php'], ['\\', ''], $relativePath);
                    $className = $namespace . '\\' . $relativePath;

                    if (class_exists($className)) {
                        $reflection = new \ReflectionClass($className);
                        
                        if ($reflection->isSubclassOf(BaseWidget::class) && !$reflection->isAbstract()) {
                            $instance = new $className();
                            
                            // Check if widget is enabled
                            if (method_exists($instance, 'enable') && !$instance->enable()) {
                                continue;
                            }
                            
                            WidgetRegistry::register($className);
                            $registered++;
                        }
                    }
                } catch (\Exception $e) {
                    $failed++;
                    Log::warning("Failed to register widget from file: {$file->getPathname()}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        // Also discover legacy addons if enabled
        if (config('xgpagebuilder.enable_legacy_addons', false)) {
            $addonPaths = config('xgpagebuilder.legacy_addon_paths', []);

            foreach ($addonPaths as $path) {
                if (!File::exists($path)) {
                    continue;
                }

                $files = File::allFiles($path);
                
                foreach ($files as $file) {
                    if ($file->getExtension() !== 'php') {
                        continue;
                    }

                    try {
                        $className = self::pathToClassName($path, $file->getPathname());

                        if (class_exists($className)) {
                            $reflection = new \ReflectionClass($className);
                            
                            if ($reflection->isSubclassOf(LegacyAddonAdapter::class) && !$reflection->isAbstract()) {
                                $instance = new $className();
                                if (method_exists($instance, 'enable') && !$instance->enable()) {
                                    continue;
                                }
                                
                                WidgetRegistry::register($className);
                                $registered++;
                                
                                Log::info("Registered legacy addon: {$className}");
                            }
                        }
                    } catch (\Exception $e) {
                        $failed++;
                        Log::warning("Failed to register addon from file: {$file->getPathname()}", [
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Convert file path to class name
     * 
     * @param string $basePath Base path to addon directory
     * @param string $filePath Full path to PHP file
     * @return string Full class name with namespace
     */
    private static function pathToClassName(string $basePath, string $filePath): string
    {
        // Get relative path from base
        $relativePath = str_replace($basePath . '/', '', $filePath);
        
        // Remove .php extension
        $relativePath = str_replace('.php', '', $relativePath);
        
        // Convert path separators to namespace separators
        $namespacePath = str_replace('/', '\\', $relativePath);
        
        // Build full class name
        // e.g., "Home/HeroSection" -> "plugins\PageBuilder\Addons\Home\HeroSection"
        return "plugins\\PageBuilder\\Addons\\{$namespacePath}";
    }

    /**
     * Get all discovered legacy addon classes
     * 
     * @return array Array of class names
     */
    public static function getDiscoveredAddons(): array
    {
        $addonPaths = config('xgpagebuilder.legacy_addon_paths', [
            base_path('plugins/PageBuilder/Addons'),
        ]);

        $addons = [];

        foreach ($addonPaths as $path) {
            if (!File::exists($path)) {
                continue;
            }

            $files = File::allFiles($path);
            
            foreach ($files as $file) {
                if ($file->getExtension() !== 'php') {
                    continue;
                }

                try {
                    $className = self::pathToClassName($path, $file->getPathname());

                    if (class_exists($className)) {
                        $reflection = new \ReflectionClass($className);
                        
                        if ($reflection->isSubclassOf(LegacyAddonAdapter::class) 
                            && !$reflection->isAbstract()) {
                            $addons[] = $className;
                        }
                    }
                } catch (\Exception $e) {
                    // Skip invalid classes
                }
            }
        }

        return $addons;
    }

    /**
     * Clear legacy addon cache
     */
    public static function clearCache(): void
    {
        WidgetRegistry::clearCache();
    }
}

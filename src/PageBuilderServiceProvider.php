<?php

namespace Xgenious\PageBuilder;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Xgenious\PageBuilder\Core\WidgetRegistry;
use Xgenious\PageBuilder\Services\LegacyAddonDiscovery;

class PageBuilderServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Merge package configuration
        $this->mergeConfigFrom(
            __DIR__ . '/../config/xgpagebuilder.php',
            'xgpagebuilder'
        );

        // Register services
        $this->app->singleton(WidgetRegistry::class, function ($app) {
            return new WidgetRegistry();
        });

        // Register render service
        $this->app->bind(
            \Xgenious\PageBuilder\Services\PageBuilderRenderService::class,
            function ($app) {
                return new \Xgenious\PageBuilder\Services\PageBuilderRenderService();
            }
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Load migrations
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');

        // Load package views
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'page-builder');

        // Register legacy view namespace for old addons
        if (File::exists(base_path('plugins/PageBuilder/views'))) {
            $this->loadViewsFrom(
                base_path('plugins/PageBuilder/views'),
                'pagebuilder'
            );
        }

        // Register routes
        $this->registerRoutes();

        // Register publishable assets
        $this->registerPublishables();

        // Register built-in widgets
        $this->registerWidgets();

        // Auto-discover and register widgets from configured paths
        // This discovers new BaseWidget classes from widget_paths config
        // and optionally legacy addons if enable_legacy_addons is true
        LegacyAddonDiscovery::discoverAndRegister();
    }

    /**
     * Register package routes.
     */
    protected function registerRoutes(): void
    {
        // Register API routes
        Route::group($this->routeConfiguration(), function () {
            $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
        });

        // Register web routes for the UI
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
    }

    /**
     * Get route configuration.
     */
    protected function routeConfiguration(): array
    {
        return [
            'prefix' => 'api/' . config('xgpagebuilder.route_prefix', 'page-builder'),
            'middleware' => ['api'],
        ];
    }

    /**
     * Register publishable assets.
     */
    protected function registerPublishables(): void
    {
        if ($this->app->runningInConsole()) {
            // Publish configuration
            $this->publishes([
                __DIR__ . '/../config/xgpagebuilder.php' => config_path('xgpagebuilder.php'),
            ], 'page-builder-config');

            // Publish migrations
            $this->publishes([
                __DIR__ . '/../database/migrations' => database_path('migrations'),
            ], 'page-builder-migrations');

            // Publish views
            $this->publishes([
                __DIR__ . '/../resources/views' => resource_path('views/vendor/page-builder'),
            ], 'page-builder-views');

            // Publish built assets (after npm run build)
            $this->publishes([
                __DIR__ . '/../public/build' => public_path('vendor/page-builder'),
            ], 'page-builder-assets');

            // Publish everything
            $this->publishes([
                __DIR__ . '/../config/xgpagebuilder.php' => config_path('xgpagebuilder.php'),
                __DIR__ . '/../database/migrations' => database_path('migrations'),
                __DIR__ . '/../resources/views' => resource_path('views/vendor/page-builder'),
                __DIR__ . '/../resources/js' => resource_path('js/vendor/page-builder'),
            ], 'page-builder');
        }
    }

    /**
     * Register built-in and custom widgets.
     */
    protected function registerWidgets(): void
    {
        $widgetRegistry = $this->app->make(WidgetRegistry::class);
        $widgetConfig = config('xgpagebuilder.widgets', []);

        // Register built-in widgets
        $builtInWidgets = [
            'header' => \Xgenious\PageBuilder\Widgets\Theme\HeaderWidget::class,
            'features' => \Xgenious\PageBuilder\Widgets\Theme\FeaturesWidget::class,
            'testimonial' => \Xgenious\PageBuilder\Widgets\Content\TestimonialWidget::class,
            'image' => \Xgenious\PageBuilder\Widgets\Media\ImageWidget::class,
            'image-gallery' => \Xgenious\PageBuilder\Widgets\Media\ImageGalleryWidget::class,
            'video' => \Xgenious\PageBuilder\Widgets\Media\VideoWidget::class,
            'icon' => \Xgenious\PageBuilder\Widgets\Media\IconWidget::class,
            'tabs' => \Xgenious\PageBuilder\Widgets\Interactive\TabsWidget::class,
            'code' => \Xgenious\PageBuilder\Widgets\Advanced\CodeWidget::class,
        ];

        foreach ($builtInWidgets as $key => $widgetClass) {
            // Only register if enabled in config
            if (isset($widgetConfig[$key]) && $widgetConfig[$key] === true) {
                if (class_exists($widgetClass)) {
                    $widgetRegistry->register($widgetClass);
                }
            }
        }

        // Register custom widgets
        $customWidgets = config('xgpagebuilder.custom_widgets', []);
        foreach ($customWidgets as $widgetClass) {
            if (class_exists($widgetClass)) {
                $widgetRegistry->register($widgetClass);
            }
        }
    }
}

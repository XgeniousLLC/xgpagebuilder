<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Route Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the route prefix and middleware for page builder routes.
    |
    */

    'route_prefix' => env('PAGE_BUILDER_ROUTE_PREFIX', 'page-builder'),

    'route_middleware' => ['web', 'auth:admin'],

    /*
    |--------------------------------------------------------------------------
    | Navigation Routes
    |--------------------------------------------------------------------------
    |
    | Configure route names for navigation buttons in the page builder editor.
    | These routes must exist in your host application.
    | The package will fallback gracefully if routes are not found.
    |
    */

    'routes' => [
        // Route name for previewing pages (should accept slug parameter)
        // Example: Route::get('/{slug}', [PageController::class, 'show'])->name('page.show');
        'preview' => env('PAGE_BUILDER_PREVIEW_ROUTE', 'page.show'),

        // Route name for returning to pages list
        // Example: Route::get('/admin/pages', [PageController::class, 'index'])->name('admin.pages.index');
        'back_to_pages' => env('PAGE_BUILDER_BACK_ROUTE', 'admin.pages.index'),

        // Direct URL fallback (if route resolution fails)
        'back_to_pages_url' => env('PAGE_BUILDER_BACK_URL', '/admin/dynamic-page/all'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Model Configuration
    |--------------------------------------------------------------------------
    |
    | Configure which models the package should use. This allows the package
    | to work with different host applications without model conflicts.
    |
    */

    'models' => [
        'page' => \App\Models\Backend\Page::class,
        'admin' => \App\Models\Backend\Admin::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Tables
    |--------------------------------------------------------------------------
    |
    | Customize the database table names used by the page builder.
    |
    */

    'tables' => [
        'content' => 'page_builder_content',
        'widgets' => 'page_builder_widgets',
        'editing_sessions' => 'page_editing_sessions',
    ],

    /*
    |--------------------------------------------------------------------------
    | Legacy Addon Support
    |--------------------------------------------------------------------------
    |
    | Enable automatic discovery and registration of legacy PageBuilder addons.
    | This allows old addons to work with the new system without modification.
    |
    */

    'enable_legacy_addons' => env('PAGE_BUILDER_LEGACY_ADDONS', false),

    'legacy_addon_paths' => [
        base_path('plugins/PageBuilder/Addons'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Widget Discovery Paths
    |--------------------------------------------------------------------------
    |
    | Paths where the package should look for BaseWidget classes.
    | These are the new-style widgets that extend BaseWidget directly.
    |
    */

    'widget_paths' => [
        [
            'path' => base_path('plugins/PageBuilder/Widgets'),
            'namespace' => 'plugins\\PageBuilder\\Widgets',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Widget Configuration
    |--------------------------------------------------------------------------
    |
    | Enable or disable specific widgets. Set to false to hide a widget
    | from the page builder interface.
    |
    */

    'widgets' => [
        // Theme Widgets
        'header' => true,
        'features' => true,

        // Content Widgets
        'testimonial' => true,

        // Media Widgets
        'image' => true,
        'image-gallery' => true,
        'video' => true,
        'icon' => true,

        // Interactive Widgets
        'tabs' => true,

        // Advanced Widgets
        'code' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Widgets
    |--------------------------------------------------------------------------
    |
    | Register your custom widget classes here. Each widget should extend
    | Xgenious\PageBuilder\Core\BaseWidget.
    |
    */

    'custom_widgets' => [
        // \plugins\PageBuilder\Widgets\HeroSectionWidget::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | CSS Generation
    |--------------------------------------------------------------------------
    |
    | Configure CSS generation behavior.
    |
    */

    'css' => [
        'minify' => env('PAGE_BUILDER_MINIFY_CSS', true),
        'cache' => env('PAGE_BUILDER_CACHE_CSS', true),
        'cache_ttl' => 3600, // Cache TTL in seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Frontend CSS Files for Editor
    |--------------------------------------------------------------------------
    |
    | List of frontend CSS files to load in the page builder editor.
    | These are scoped to canvas content only to avoid conflicts with editor UI.
    | Add your host app's CSS files here.
    |
    */

    'editor_frontend_css' => [
        'assets/frontend/css/bootstrap.css',
        'assets/frontend/css/helpers.css',
    ],

    /*
    |--------------------------------------------------------------------------
    | Frontend JS Files for Editor & Frontend
    |--------------------------------------------------------------------------
    |
    | JavaScript files from your host app that should be loaded in:
    | 1. Editor canvas (for interactive widgets)
    | 2. Frontend pages (for widget functionality)
    |
    | These are loaded at the end of <body> to ensure proper execution.
    |
    */

    'editor_frontend_js' => [
        'assets/frontend/website/js/plugin.js',
    ],

    /*
    |--------------------------------------------------------------------------
    | Media Upload Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how the page builder integrates with your host app's
    | media library. This allows widgets to use your existing media manager.
    |
    */

    'media' => [
        // Media upload route (host app's admin media upload endpoint)
        'upload_route' => 'admin.upload.media.file',

        // Media library route (host app's media browser)
        'library_route' => 'admin.upload.media.file.all',

        // Media delete route
        'delete_route' => 'admin.upload.media.file.delete',

        // Media base path (where media files are stored)
        'base_path' => 'assets/uploads',

        // Allowed file types
        'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],

        // Max file size in KB
        'max_size' => 5120, // 5MB

        // Use host app's media manager component
        // Set the component path if your host app has a media manager component
        'manager_component' => null, // e.g., 'admin.media.media-upload'
    ],

    /*
    |--------------------------------------------------------------------------
    | Asset Publishing
    |--------------------------------------------------------------------------
    |
    | Configure which assets should be published when running
    | vendor:publish command.
    |
    */

    'publish' => [
        'config' => true,
        'migrations' => true,
        'views' => true,
        'assets' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for sections, columns, and widgets.
    |
    */

    'defaults' => [
        'section' => [
            'contentWidth' => 'boxed',
            'maxWidth' => 1200,
            'padding' => [
                'top' => 60,
                'right' => 15,
                'bottom' => 60,
                'left' => 15,
                'unit' => 'px',
            ],
        ],

        'column' => [
            'padding' => [
                'top' => 0,
                'right' => 15,
                'bottom' => 0,
                'left' => 15,
                'unit' => 'px',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Editing Sessions
    |--------------------------------------------------------------------------
    |
    | Configure editing session behavior for concurrent editing protection.
    |
    */

    'editing_sessions' => [
        'enabled' => true,
        'timeout' => 300, // Session timeout in seconds (5 minutes)
        'heartbeat_interval' => 30, // Heartbeat interval in seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    |
    | Security-related configuration options.
    |
    */

    'security' => [
        'allowed_html_tags' => ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img'],
        'allowed_protocols' => ['http', 'https', 'mailto', 'tel'],
        'sanitize_input' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance
    |--------------------------------------------------------------------------
    |
    | Performance optimization settings.
    |
    */

    'performance' => [
        'lazy_load_widgets' => true,
        'optimize_images' => true,
        'defer_css' => false,
    ],
];

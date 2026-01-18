<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WidgetController;

/*
|--------------------------------------------------------------------------
| Widget API Routes
|--------------------------------------------------------------------------
|
| Here are the API routes for widget management, categorization, and 
| configuration. These routes handle widget discovery, field generation,
| and settings management for the page builder.
|
*/

Route::prefix('pagebuilder/widgets')
    ->group(function () {
    
    // Widget Discovery & Listing
    Route::get('/', [WidgetController::class, 'index'])
        ->name('api.widgets.index');
    
    Route::get('/popular', [WidgetController::class, 'popular'])
        ->name('api.widgets.popular');
    
    Route::get('/recent', [WidgetController::class, 'recent'])
        ->name('api.widgets.recent');
    
    Route::get('/search', [WidgetController::class, 'search'])
        ->name('api.widgets.search');
    
    // Widget Categories
    Route::get('/categories', [WidgetController::class, 'categories'])
        ->name('api.widgets.categories');
    
    Route::get('/category/{category}', [WidgetController::class, 'getByCategory'])
        ->name('api.widgets.by-category')
        ->where('category', '[a-z_]+');
    
    // Widget Configuration
    Route::get('/{type}/config', [WidgetController::class, 'getConfig'])
        ->name('api.widgets.config')
        ->where('type', '[a-z_]+');
    
    Route::get('/{type}/fields', [WidgetController::class, 'getFields'])
        ->name('api.widgets.fields')
        ->where('type', '[a-z_]+');
    
    Route::get('/{type}/fields/{tab}', [WidgetController::class, 'getFieldsByTab'])
        ->name('api.widgets.fields-by-tab')
        ->where('type', '[a-z_]+')
        ->where('tab', '[a-z_]+');
    
    // Widget Preview
    Route::post('/{type}/preview', [WidgetController::class, 'preview'])
        ->name('api.widgets.preview')
        ->where('type', '[a-z_]+');
    
    // Button Preset Management
    Route::prefix('button-presets')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\ButtonPresetController::class, 'index'])
            ->name('api.button-presets.index');
        
        Route::get('/popular', [App\Http\Controllers\Api\ButtonPresetController::class, 'popular'])
            ->name('api.button-presets.popular');
        
        Route::get('/recent', [App\Http\Controllers\Api\ButtonPresetController::class, 'recent'])
            ->name('api.button-presets.recent');
        
        Route::get('/categories', [App\Http\Controllers\Api\ButtonPresetController::class, 'categories'])
            ->name('api.button-presets.categories');
        
        Route::post('/{presetId}/apply', [App\Http\Controllers\Api\ButtonPresetController::class, 'apply'])
            ->name('api.button-presets.apply');
        
        Route::middleware(['admin'])->group(function () {
            Route::post('/', [App\Http\Controllers\Api\ButtonPresetController::class, 'store'])
                ->name('api.button-presets.store');
            
            Route::get('/{preset}', [App\Http\Controllers\Api\ButtonPresetController::class, 'show'])
                ->name('api.button-presets.show');
            
            Route::put('/{preset}', [App\Http\Controllers\Api\ButtonPresetController::class, 'update'])
                ->name('api.button-presets.update');
            
            Route::delete('/{preset}', [App\Http\Controllers\Api\ButtonPresetController::class, 'destroy'])
                ->name('api.button-presets.destroy');
        });
    });
    
    // Widget Settings Management
    Route::post('/validate-settings', [WidgetController::class, 'validateSettings'])
        ->name('api.widgets.validate-settings');
    
    Route::post('/save-settings', [WidgetController::class, 'saveSettings'])
        ->name('api.widgets.save-settings');
    
    // Registry Management (Admin only)
    Route::middleware(['admin'])->group(function () {
        Route::get('/stats', [WidgetController::class, 'stats'])
            ->name('api.widgets.stats');
        
        Route::post('/refresh', [WidgetController::class, 'refresh'])
            ->name('api.widgets.refresh');
        
        Route::delete('/cache', [WidgetController::class, 'clearCache'])
            ->name('api.widgets.clear-cache');
    });
});


/*
|--------------------------------------------------------------------------
| Page Builder Routes - MOVED to web.php
|--------------------------------------------------------------------------
|
| Page builder routes have been moved to web.php for consistent session authentication
| All page builder content management routes are now consolidated there.
|
*/

/*
|--------------------------------------------------------------------------
| Page Rendering Routes
|--------------------------------------------------------------------------
|
| These routes handle page rendering with consolidated CSS management
|
*/

Route::prefix('page-render')->group(function () {
    Route::post('/render', [App\Http\Controllers\Api\PageRenderController::class, 'renderPage'])
        ->name('api.page-render.render');
    
    Route::get('/css', [App\Http\Controllers\Api\PageRenderController::class, 'getPageCSS'])
        ->name('api.page-render.css');
    
    Route::get('/demo', [App\Http\Controllers\Api\PageRenderController::class, 'demoMultipleWidgets'])
        ->name('api.page-render.demo');
});

/*
|--------------------------------------------------------------------------
| Fallback Route Documentation
|--------------------------------------------------------------------------
|
| This route provides API documentation for widget endpoints
|
*/

Route::get('/widget-api-docs', function () {
    return response()->json([
        'name' => 'Widget Management API',
        'version' => '1.0.0',
        'description' => 'RESTful API for managing widgets, categories, and settings',
        'endpoints' => [
            'GET /api/widgets' => 'List all widgets with optional filters',
            'GET /api/widgets/categories' => 'Get all categories with widget counts',
            'GET /api/widgets/category/{category}' => 'Get widgets by category',
            'GET /api/widgets/search' => 'Search widgets by query',
            'GET /api/widgets/{type}/fields' => 'Get widget field configuration',
            'POST /api/widgets/validate-settings' => 'Validate widget settings',
            'POST /api/widgets/save-settings' => 'Save widget settings',
            'GET /api/widgets/popular' => 'Get popular widgets',
            'GET /api/widgets/recent' => 'Get recently added widgets',
            'GET /api/widgets/stats' => 'Get registry statistics (admin)',
            'POST /api/widgets/refresh' => 'Refresh widget registry (admin)',
            'DELETE /api/widgets/cache' => 'Clear registry cache (admin)'
        ],
        'authentication' => [
            'type' => 'Bearer Token (Sanctum)',
            'required_for' => ['save-settings', 'admin endpoints']
        ],
        'rate_limiting' => [
            'general' => '60 requests per minute',
            'search' => '30 requests per minute',
            'admin' => '100 requests per minute'
        ]
    ]);
})->name('api.widgets.docs');
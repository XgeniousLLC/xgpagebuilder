<?php

use Illuminate\Support\Facades\Route;
use Xgenious\PageBuilder\Http\Controllers\PageBuilderController;
use Xgenious\PageBuilder\Http\Controllers\EditingSessionController;
use Xgenious\PageBuilder\Http\Controllers\ColumnCSSController;

// Content Management Routes
Route::get('/pages/{pageId}/content', [PageBuilderController::class, 'getContent'])
    ->name('api.page-builder.get-content')
    ->whereNumber('pageId');

Route::get('/pages/{pageId}/history', [PageBuilderController::class, 'getHistory'])
    ->name('api.page-builder.history')
    ->whereNumber('pageId');

Route::get('/pages/{pageId}/widgets/{widgetId}', [PageBuilderController::class, 'getWidgetData'])
    ->name('api.page-builder.widget-data')
    ->whereNumber('pageId');

// Save/Publish Routes
Route::post('/save', [PageBuilderController::class, 'saveContent'])
    ->name('api.page-builder.save-content');

Route::post('/publish', [PageBuilderController::class, 'publish'])
    ->name('api.page-builder.publish');

Route::post('/unpublish', [PageBuilderController::class, 'unpublish'])
    ->name('api.page-builder.unpublish');

// Widget Settings Fetch Routes - Unified API for tab-based loading
Route::get('/pages/{pageId}/widgets/{widgetId}/settings/{tab}', [PageBuilderController::class, 'getWidgetSettings'])
    ->name('api.page-builder.get-widget-settings')
    ->whereNumber('pageId')
    ->whereIn('tab', ['general', 'style', 'advanced']);

// Individual Settings Save Routes
Route::post('/pages/{pageId}/widgets/{widgetId}/save-all-settings', [PageBuilderController::class, 'saveWidgetAllSettings'])
    ->name('api.page-builder.save-widget-all-settings')
    ->whereNumber('pageId');

Route::post('/pages/{pageId}/sections/{sectionId}/save-all-settings', [PageBuilderController::class, 'saveSectionAllSettings'])
    ->name('api.page-builder.save-section-all-settings')
    ->whereNumber('pageId');

Route::post('/pages/{pageId}/columns/{columnId}/save-all-settings', [PageBuilderController::class, 'saveColumnAllSettings'])
    ->name('api.page-builder.save-column-all-settings')
    ->whereNumber('pageId');

// Individual Widget Settings Save Routes
Route::post('/pages/{pageId}/widgets/{widgetId}/save-general-settings', [PageBuilderController::class, 'saveWidgetGeneralSettings'])
    ->name('api.page-builder.save-widget-general-settings')
    ->whereNumber('pageId');

Route::post('/pages/{pageId}/widgets/{widgetId}/save-style-settings', [PageBuilderController::class, 'saveWidgetStyleSettings'])
    ->name('api.page-builder.save-widget-style-settings')
    ->whereNumber('pageId');

Route::post('/pages/{pageId}/widgets/{widgetId}/save-advanced-settings', [PageBuilderController::class, 'saveWidgetAdvancedSettings'])
    ->name('api.page-builder.save-widget-advanced-settings')
    ->whereNumber('pageId');

// Column CSS Generation Routes
Route::post('/columns/css/generate', [ColumnCSSController::class, 'generateCSS'])
    ->name('api.page-builder.column-css.generate');

// Universal CSS Generation Routes
Route::post('/css/generate', [PageBuilderController::class, 'generateCSS'])
    ->name('api.page-builder.css.generate');

Route::post('/css/generate-bulk', [PageBuilderController::class, 'generateBulkCSS'])
    ->name('api.page-builder.css.generate-bulk');

Route::get('/defaults/{type}', [PageBuilderController::class, 'getDefaultSettings'])
    ->name('api.page-builder.defaults')
    ->where('type', 'section|column|widget');

// Editing Session Management Routes
Route::post('/pages/{pageId}/start-editing', [EditingSessionController::class, 'startSession'])
    ->name('api.page-builder.start-editing')
    ->whereNumber('pageId');

Route::put('/editing-sessions/{sessionToken}/heartbeat', [EditingSessionController::class, 'heartbeat'])
    ->name('api.page-builder.heartbeat');

Route::delete('/editing-sessions/{sessionToken}', [EditingSessionController::class, 'endSession'])
    ->name('api.page-builder.end-session');

Route::post('/pages/{pageId}/takeover', [EditingSessionController::class, 'takeover'])
    ->name('api.page-builder.takeover')
    ->whereNumber('pageId');

Route::get('/pages/{pageId}/editors', [EditingSessionController::class, 'getEditors'])
    ->name('api.page-builder.get-editors')
    ->whereNumber('pageId');

Route::post('/editing-sessions/cleanup', [EditingSessionController::class, 'cleanup'])
    ->name('api.page-builder.cleanup-sessions');

// Widget API Routes (for frontend widget panel)
Route::get('/widgets', [Xgenious\PageBuilder\Http\Controllers\WidgetController::class, 'index'])
    ->name('api.page-builder.widgets.index');

Route::get('/widgets/grouped', [Xgenious\PageBuilder\Http\Controllers\WidgetController::class, 'grouped'])
    ->name('api.page-builder.widgets.grouped');

Route::get('/widgets/search', [Xgenious\PageBuilder\Http\Controllers\WidgetController::class, 'search'])
    ->name('api.page-builder.widgets.search');

Route::post('/widgets/{type}/preview', [Xgenious\PageBuilder\Http\Controllers\WidgetController::class, 'preview'])
    ->name('api.page-builder.widgets.preview');

Route::get('/widgets/{type}', [Xgenious\PageBuilder\Http\Controllers\WidgetController::class, 'show'])
    ->name('api.page-builder.widgets.show');

Route::get('/widgets/{type}/fields/{tab}', [Xgenious\PageBuilder\Http\Controllers\WidgetController::class, 'getWidgetFields'])
    ->name('api.page-builder.widgets.fields');


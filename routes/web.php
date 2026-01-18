<?php

use Illuminate\Support\Facades\Route;
use Xgenious\PageBuilder\Http\Controllers\PageBuilderUIController;
use Xgenious\PageBuilder\Http\Controllers\AssetController;

// Serve page builder assets with correct MIME types
// This must be BEFORE any catch-all routes
Route::get('/vendor/page-builder/{path}', [AssetController::class, 'serve'])
    ->where('path', '.*')
    ->name('page-builder.assets');

// Page Builder UI Routes (web routes, not API)
Route::middleware(['web', 'auth:admin'])->group(function () {
    // Main page builder editor route
    Route::get('/admin/page-builder/edit/{pageId}', [PageBuilderUIController::class, 'edit'])
        ->name('admin.page-builder.edit')
        ->whereNumber('pageId');
});

---
layout: default
title: Configuration
nav_order: 3
---

# Configuration Guide

Complete reference for configuring XgPageBuilder.

---

## Configuration File

All configuration is in `config/xgpagebuilder.php`.

---

## Route Configuration

Configure route prefix and middleware:

```php
'route_prefix' => env('PAGE_BUILDER_ROUTE_PREFIX', 'page-builder'),
'route_middleware' => ['web', 'auth:admin'],
```

**Routes:**
- Editor: `/page-builder/edit/{pageId}`
- API: `/api/page-builder/*`

---

## Navigation Routes

Configure route names for navigation buttons in the page builder editor. These routes must exist in your application.

### Setup Steps

1. Define these routes in your `routes/web.php` and `routes/admin.php` files
2. Update the route names below to match your actual route names  
3. Test navigation buttons in the page builder editor

### Example Routes

```php
// Frontend preview route (accepts slug parameter)
Route::get('/{slug}', [PageController::class, 'show'])->name('page.show');

// Admin pages list route  
Route::get('/admin/pages', [PageController::class, 'index'])
    ->name('admin.pages.index')
    ->middleware(['auth:admin']);
```

### Configuration

```php
'routes' => [
    // Route name for previewing pages (should accept slug parameter)
    // Update this to match your actual frontend page route name
    'preview' => env('PAGE_BUILDER_PREVIEW_ROUTE', 'page.show'),

    // Route name for returning to pages list
    // Update this to match your actual admin pages list route name  
    'back_to_pages' => env('PAGE_BUILDER_BACK_ROUTE', 'admin.pages.index'),
],
```

---

## Model Configuration

Point to your application's models:

```php
'models' => [
    'page' => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

---

## Frontend CSS Files

Add your application's CSS files for the editor:

```php
'editor_frontend_css' => [
    'assets/frontend/css/bootstrap.css',
    'assets/frontend/css/your-styles.css',
],
```

These files are scoped to the canvas content only.

---

## Frontend JavaScript Files

Add JavaScript files for widget interactivity:

```php
'editor_frontend_js' => [
    'assets/frontend/js/your-app.js',
],
```

These load in both editor and frontend.

---

## Media Upload Integration

Configure media library integration:

```php
'media' => [
    'upload_route' => 'admin.upload.media.file',
    'library_route' => 'admin.upload.media.file.all',
    'delete_route' => 'admin.upload.media.file.delete',
    'base_path' => 'assets/uploads',
    'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'max_size' => 5120, // 5MB
],
```

---

## Widget Configuration

Enable or disable specific widgets:

```php
'widgets' => [
    'header' => true,
    'features' => true,
    'testimonial' => true,
    'image' => true,
    'image-gallery' => true,
    'video' => true,
    'icon' => true,
    'tabs' => true,
    'code' => true,
],
```

---

## Custom Widgets

Register your custom widget classes:

```php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\HeroSectionWidget::class,
    \Plugins\PageBuilder\Widgets\FeatureGridWidget::class,
],
```

See [Widget Development](widgets.html) for creating widgets.

---

## Database Tables

Customize table names:

```php
'tables' => [
    'content' => 'page_builder_content',
    'widgets' => 'page_builder_widgets',
    'editing_sessions' => 'page_editing_sessions',
],
```

---

## CSS Generation

Configure CSS generation behavior:

```php
'css' => [
    'minify' => env('PAGE_BUILDER_MINIFY_CSS', true),
    'cache' => env('PAGE_BUILDER_CACHE_CSS', true),
    'cache_ttl' => 3600, // seconds
],
```

---

## Security

Configure security options:

```php
'security' => [
    'allowed_html_tags' => ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img'],
    'allowed_protocols' => ['http', 'https', 'mailto', 'tel'],
    'sanitize_input' => true,
],
```

---

## Performance

Optimize performance:

```php
'performance' => [
    'lazy_load_widgets' => true,
    'optimize_images' => true,
    'defer_css' => false,
],
```

---

## Legacy Addon Support

Enable legacy addon support (optional):

```php
'enable_legacy_addons' => env('PAGE_BUILDER_LEGACY_ADDONS', false),
'legacy_addon_paths' => [
    base_path('plugins/PageBuilder/Addons'),
],
```

> **Note:** We recommend migrating to new widget format instead of using legacy addons.

---

## Environment Variables

Add to your `.env` file:

```env
PAGE_BUILDER_ROUTE_PREFIX=page-builder
PAGE_BUILDER_MINIFY_CSS=true
PAGE_BUILDER_CACHE_CSS=true
PAGE_BUILDER_LEGACY_ADDONS=false

# Navigation Routes (optional)
PAGE_BUILDER_PREVIEW_ROUTE=page.show
PAGE_BUILDER_BACK_ROUTE=admin.pages.index
```

---

## Built-in Traits

XgPageBuilder provides useful traits that you can use in your custom widgets.

### ExtractsFieldValues Trait

This trait provides helper methods for extracting values from complex field types like IMAGE and URL fields that can return either simple values or structured objects.

**Usage:**

```php
<?php

namespace App\PageBuilder\Widgets;

use Xgenious\XgPageBuilder\Core\BaseWidget;
use Xgenious\XgPageBuilder\Core\Traits\ExtractsFieldValues;

class MyCustomWidget extends BaseWidget
{
    use ExtractsFieldValues;

    public function render(array $data): string
    {
        // Extract image ID from IMAGE field
        $imageId = $this->extractImageId($data['background_image']);
        
        // Extract URL from URL field
        $buttonUrl = $this->extractUrl($data['button_link']);
        $buttonTarget = $this->extractUrlTarget($data['button_link']);
        
        // Extract image IDs from repeater field
        $galleryIds = $this->extractRepeaterImageIds($data['gallery_items'], 'image');
        
        // ...
    }
}
```

**Available Methods:**

| Method | Description |
|--------|-------------|
| `extractImageId($imageValue)` | Extract numeric ID from IMAGE field value |
| `extractImageUrl($imageValue)` | Extract URL string from IMAGE field value |
| `extractImageAlt($imageValue, $fallback)` | Extract alt text from IMAGE field value |
| `extractUrl($urlValue)` | Extract URL string from URL field value |
| `extractUrlTarget($urlValue)` | Extract target attribute from URL field value |
| `extractRepeaterImageIds($items, $fieldName)` | Extract image IDs from repeater items |
| `extractRepeaterMultipleImageIds($items, $fieldNames)` | Extract multiple image IDs from repeater items |

**Why use this trait?**

IMAGE and URL fields can return different formats:
- **Legacy format:** Simple numeric ID or string URL
- **New format:** Array/Object with additional metadata like `{id, url, alt, title, ...}`

This trait handles both formats automatically, ensuring backward compatibility.

---

## Next Steps

- [Widget Development](widgets.html) - Create custom widgets
- [Installation Guide](installation.html) - Installation instructions

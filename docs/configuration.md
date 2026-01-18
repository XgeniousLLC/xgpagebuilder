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
    \App\Widgets\MyCustomWidget::class,
    \App\Widgets\CallToActionWidget::class,
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
```

---

## Next Steps

- [Widget Development](widgets.html) - Create custom widgets
- [Installation Guide](installation.html) - Installation instructions

---
layout: default
title: Configuration
nav_order: 3
---

# Configuration Reference

All settings live in `config/xgpagebuilder.php` after publishing.

> See [DOCUMENTATION.md](DOCUMENTATION.md) for the full setup guide.

---

## Routes

```php
'route_prefix'     => env('PAGE_BUILDER_ROUTE_PREFIX', 'page-builder'),
'route_middleware' => ['web', 'auth:admin'],

'routes' => [
    // Route names (used with route())
    'preview'          => env('PAGE_BUILDER_PREVIEW_ROUTE', 'page.show'),      // "Preview" button
    'back_to_pages'    => env('PAGE_BUILDER_BACK_ROUTE', 'admin.pages.index'), // "Back" button (route name)

    // Literal URL fallback — used when the route name above doesn't exist
    'back_to_pages_url'=> '/admin/dynamic-page/all',
],
```

- `preview` and `back_to_pages` are **Laravel route names** (passed to `route()`).
- `back_to_pages_url` is a **literal URL path** used as a fallback if the named route doesn't exist in your app.

Editor opens at: `/{route_prefix}/edit/{pageId}`

---

## Models

```php
'models' => [
    'page'  => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

---

## Host App CSS & JS

```php
// CSS loaded in editor canvas (scoped — won't affect editor UI)
'editor_frontend_css' => [
    'assets/frontend/css/bootstrap.css',
    'assets/frontend/css/theme.css',
],

// JS loaded in editor + needed on frontend for widget interactivity
'editor_frontend_js' => [
    'assets/frontend/website/js/plugin.js',
],

// Optional: blade partial for CSS custom properties (--primary-color etc.)
'editor_css_variables_view' => null,
```

---

## Media Upload

```php
'media' => [
    'upload_route'  => 'admin.upload.media.file',
    'library_route' => 'admin.upload.media.file.all',
    'delete_route'  => 'admin.upload.media.file.delete',
    'base_path'     => 'assets/uploads',
    'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    'max_size'      => 5120,  // KB
],
```

---

## Custom Widgets

```php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\MyWidget::class,
],

// Or auto-discover from a folder:
'widget_paths' => [
    [
        'path'      => base_path('plugins/PageBuilder/Widgets'),
        'namespace' => 'Plugins\\PageBuilder\\Widgets',
    ],
],
```

---

## Database Tables

```php
'tables' => [
    'content'          => 'page_builder_content',
    'widgets'          => 'page_builder_widgets',
    'editing_sessions' => 'page_editing_sessions',
],
```

---

## CSS Output

```php
'css' => [
    'minify'    => env('PAGE_BUILDER_MINIFY_CSS', true),
    'cache'     => env('PAGE_BUILDER_CACHE_CSS', true),
    'cache_ttl' => 3600,
],
```

---

## Concurrent Editing

```php
'editing_sessions' => [
    'enabled'            => true,
    'timeout'            => 300,  // seconds until session auto-expires
    'heartbeat_interval' => 30,
],
```

---

## Demo Mode

```php
'demo_mode' => env('PAGE_BUILDER_DEMO_MODE', false),
```

Set `PAGE_BUILDER_DEMO_MODE=true` in `.env` to block saves and show a read-only ribbon.

---

## Legacy Addons

```php
'enable_legacy_addons' => env('PAGE_BUILDER_LEGACY_ADDONS', false),
'legacy_addon_paths'   => [base_path('plugins/PageBuilder/Addons')],
```

---

## ExtractsFieldValues Trait

Use this trait in widgets to safely extract values from IMAGE and URL fields,
which can return either a plain value (legacy) or a structured array (new format).

```php
use Xgenious\PageBuilder\Core\Traits\ExtractsFieldValues;

class MyWidget extends BaseWidget
{
    use ExtractsFieldValues;

    public function render(array $settings = []): string
    {
        $data = $settings['general']['content'] ?? [];

        $imageId    = $this->extractImageId($data['image']);          // numeric ID
        $imageUrl   = $this->extractImageUrl($data['image']);         // URL string
        $buttonUrl  = $this->extractUrl($data['button_link']);        // URL string
        $target     = $this->extractUrlTarget($data['button_link']);  // '_blank' etc.
    }
}
```

| Method | Returns |
|--------|---------|
| `extractImageId($value)` | Numeric attachment ID |
| `extractImageUrl($value)` | URL string |
| `extractImageAlt($value, $fallback)` | Alt text string |
| `extractUrl($value)` | URL string |
| `extractUrlTarget($value)` | Link target (`_blank`, `_self`, …) |
| `extractRepeaterImageIds($items, $fieldName)` | Array of IDs from a repeater |

---

## .env Reference

```env
PAGE_BUILDER_ROUTE_PREFIX=page-builder
PAGE_BUILDER_MINIFY_CSS=true
PAGE_BUILDER_CACHE_CSS=true
PAGE_BUILDER_LEGACY_ADDONS=false
PAGE_BUILDER_DEMO_MODE=false
PAGE_BUILDER_PREVIEW_ROUTE=page.show
PAGE_BUILDER_BACK_ROUTE=admin.pages.index
```

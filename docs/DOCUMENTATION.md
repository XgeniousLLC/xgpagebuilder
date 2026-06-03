# XgPageBuilder Documentation

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Host App Integration](#host-app-integration)
5. [Frontend Rendering](#frontend-rendering)
6. [Admin Panel Integration](#admin-panel-integration)
7. [Troubleshooting](#troubleshooting)

**More docs:**
- [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md) — build custom widgets
- [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md) — CSS pipeline, JS, responsive, media
- [fields.md](fields.md) — every PHP field type with all options

---

## Quick Start

```bash
composer require xgenious/xgpagebuilder

php artisan vendor:publish --tag=page-builder-config
php artisan vendor:publish --tag=page-builder-assets
php artisan migrate
php artisan config:clear
```

Open the editor at: `/page-builder/edit/{pageId}`

---

## Installation

**Requirements:** PHP 8.2+, Laravel 11 or 12, MySQL 5.7+ / PostgreSQL 10+

```bash
# 1. Install
composer require xgenious/xgpagebuilder

# 2. Publish config
php artisan vendor:publish --tag=page-builder-config

# 3. Publish built frontend assets
php artisan vendor:publish --tag=page-builder-assets

# 4. Run migrations (creates page_builder_content, page_builder_widgets, page_editing_sessions)
php artisan migrate
```

> **First time only:** The editor assets are pre-built and included in the package.
> If you need to rebuild (e.g. after modifying the package source): `cd vendor/xgenious/xgpagebuilder && npm install && npm run build`, then re-publish.

---

## Configuration

Edit `config/xgpagebuilder.php` after publishing.

### Models

Point to your app's Page and Admin models:

```php
'models' => [
    'page'  => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

### Routes

```php
'route_prefix'     => env('PAGE_BUILDER_ROUTE_PREFIX', 'page-builder'),
'route_middleware' => ['web', 'auth:admin'],

'routes' => [
    'preview'       => 'page.show',           // "Preview" button in editor
    'back_to_pages' => 'admin.pages.index',   // "Back" button in editor
],
```

Editor URL: `/{route_prefix}/edit/{pageId}`

### Host App CSS & JS (shown in editor canvas)

```php
// CSS scoped to canvas — your theme styles appear in edit preview
'editor_frontend_css' => [
    'assets/frontend/css/bootstrap.css',
    'assets/frontend/css/theme.css',
],

// JS loaded in editor + needed on frontend for interactive widgets
'editor_frontend_js' => [
    'assets/frontend/website/js/plugin.js',
],
```

### Media Upload

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

> Video uploads use the same `upload_route`. The `VIDEO` field manages its own MIME types (mp4, webm, mov, avi) and size limit (100 MB default) at the field level.

Your host app's upload/library endpoints must exist. Required routes:

```php
Route::post  ('/admin/upload/media',        [MediaController::class, 'upload'])->name('admin.upload.media.file');
Route::get   ('/admin/upload/media/all',    [MediaController::class, 'index']) ->name('admin.upload.media.file.all');
Route::delete('/admin/upload/media/{id}',   [MediaController::class, 'delete'])->name('admin.upload.media.file.delete');
```

The upload endpoint must return JSON in this format:

```json
{
    "id": 12,
    "url": "https://yourdomain.com/assets/uploads/photo.jpg",
    "mime_type": "image/jpeg"
}
```

The library endpoint must return a JSON array of the same structure. The page builder's IMAGE and VIDEO fields store the entire response object — this is why those fields return arrays (`['url'=>..., 'id'=>...]`) in widget `render()` methods.

### Custom Widgets

```php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\MyWidget::class,
],
```

See [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md) to build custom widgets.

### Legacy Addon Support

```php
'enable_legacy_addons' => env('PAGE_BUILDER_LEGACY_ADDONS', false),
'legacy_addon_paths'   => [base_path('plugins/PageBuilder/Addons')],
```

---

## Host App Integration

### 1. Add columns to pages table

Two flags control the page builder — one for the controller, one for the blade:

```php
Schema::table('pages', function (Blueprint $table) {
    $table->boolean('use_page_builder')->default(false);
    $table->string('page_builder_status')->default('off');  // 'on' or 'off'
});
```

- `use_page_builder` — triggers `renderPage()` in the controller
- `page_builder_status` — controls display in the blade view; set to `'on'` when page builder content should be shown

### 2. Add relationship to Page model

```php
// App\Models\Backend\Page
public function pageBuilderContent()
{
    return $this->hasOne(\Xgenious\PageBuilder\Models\PageBuilderContent::class, 'page_id');
}
```

### 3. Register the widget view namespace

In your `AppServiceProvider`, register the view namespace so widgets can use `pagebuilder::` in `view()` calls:

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    $this->loadViewsFrom(base_path('plugins/PageBuilder/views'), 'pagebuilder');
}
```

Adjust the path to wherever your widget blade views live.

### 4. Add editor link in admin

```blade
@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" target="_blank">
        Open Page Builder
    </a>
@endif
```

---

## Frontend Rendering

Render page builder content on your public pages.

### Controller

Attach the rendered output to the page model before passing to the view:

```php
use Xgenious\PageBuilder\Services\PageBuilderRenderService;

public function show($slug)
{
    $page = Page::where('slug', $slug)->firstOrFail();

    if ($page->use_page_builder) {
        $result = app(PageBuilderRenderService::class)->renderPage($page, true);
        $page->rendered_content             = $result['html'] ?? '';
        $page->pagebuilder_generated_styles = $result['css']  ?? '';
    }

    return view('frontend.pages.show', compact('page'));
}
```

> `renderPage($page, true)` returns `['html' => '...', 'css' => '...']`.
> Pass `true` as the second argument — without it, CSS is silently dropped.

### Blade view

```blade
@extends('layouts.frontend')

@section('content')
    @if($page->page_builder_status === 'on')
        @if(isset($page->rendered_content))
            <style>{!! $page->pagebuilder_generated_styles !!}</style>
            {!! $page->rendered_content !!}
        @endif
    @else
        {!! $page->content !!}
    @endif
@endsection
```

> Always output `pagebuilder_generated_styles` in a `<style>` tag **before** the HTML — it contains all widget spacing, color, and layout CSS.

### Render service methods

| Method | Input | Returns |
|--------|-------|---------|
| `renderPage($page, true)` | Page model | `['html'=>..., 'css'=>...]` |
| `renderPageBuilderContent($content)` | PageBuilderContent model | `['html'=>..., 'css'=>...]` |
| `renderPageContent(array $json)` | Raw JSON array | `['html'=>..., 'css'=>..., 'stats'=>...]` |
| `renderFromJson(string $json)` | JSON string | `['html'=>..., 'css'=>..., 'stats'=>...]` |

Always pass `true` as the second argument to `renderPage()`. The `$css` flag controls whether `CSSManager` collects and returns style-field-generated CSS. Without it, any spacing, colors, or layout values set in the editor Style tab are silently dropped.

---

## Admin Panel Integration

### Toggle page builder on a page

```blade
{{-- In your page edit form --}}
<label>
    <input type="checkbox" name="use_page_builder" value="1"
           {{ $page->use_page_builder ? 'checked' : '' }}>
    Use Page Builder
</label>

@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" target="_blank" class="btn btn-primary">
        Open Page Builder
    </a>
@endif
```

### Button in page list

```blade
@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" target="_blank">Edit</a>
@endif
```

---

## Troubleshooting

### Editor shows blank page

```bash
# Rebuild and re-publish assets
cd vendor/xgenious/xgpagebuilder && npm install && npm run build
php artisan vendor:publish --tag=page-builder-assets --force
php artisan config:clear && php artisan view:clear
```

### CSS not showing in editor canvas

Check paths in config:
```php
'editor_frontend_css' => ['assets/frontend/css/your-file.css'],
```
Paths are relative to `public/`. Verify files exist at `public/assets/frontend/css/your-file.css`.

### Widgets empty on frontend

The `$pbCss` must be output — missing CSS causes invisible content. Verify your blade view outputs both:
```blade
<style>{!! $pbCss !!}</style>
{!! $pbHtml !!}
```

### Media upload not working

```bash
php artisan route:list | grep media
```
Then update route names in config to match your actual routes.

### Custom widget not appearing in sidebar

```bash
php artisan config:clear
```
Verify the class is in `custom_widgets` and extends `BaseWidget`.

### Route conflicts

```php
'route_prefix' => 'admin/page-builder',
```

---

## Extending the Render Service

If you need to fix or augment rendering behaviour (e.g. column widths stored as percentages instead of integers), extend `PageBuilderRenderService`:

```php
// app/Services/CustomPageBuilderRenderService.php
namespace App\Services;

use Xgenious\PageBuilder\Services\PageBuilderRenderService;

class CustomPageBuilderRenderService extends PageBuilderRenderService
{
    public function renderPage($page, bool $css = false): array
    {
        $result     = parent::renderPage($page, true);
        $extraCss   = $this->generateColumnWidthFixes($page);
        $result['css'] .= $extraCss;

        return $css ? $result : ['html' => $result['html'], 'css' => ''];
    }

    private function generateColumnWidthFixes($page): string
    {
        // inspect JSON, build extra CSS rules
        return '';
    }
}
```

Bind it in `AppServiceProvider`:

```php
$this->app->bind(
    \Xgenious\PageBuilder\Services\PageBuilderRenderService::class,
    \App\Services\CustomPageBuilderRenderService::class,
);
```

Now `app(PageBuilderRenderService::class)` resolves your subclass everywhere.

---

## Common Commands

```bash
# Publish
php artisan vendor:publish --tag=page-builder-config
php artisan vendor:publish --tag=page-builder-assets
php artisan vendor:publish --tag=page-builder-views
php artisan vendor:publish --tag=page-builder-migrations

# Clear caches
php artisan config:clear && php artisan view:clear && php artisan cache:clear

# Check routes
php artisan route:list | grep page-builder

# Test render in tinker
$page = \App\Models\Backend\Page::find(1);
$result = app(\Xgenious\PageBuilder\Services\PageBuilderRenderService::class)->renderPage($page, true);
echo $result['html'];
```

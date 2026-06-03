---
layout: default
title: Installation
nav_order: 2
---

# Installation Guide

Complete guide to installing and setting up XgPageBuilder in your Laravel application.

---

## Requirements

- **PHP:** 8.2 or higher
- **Laravel:** 11.0 or 12.0
- **Database:** MySQL 5.7+ or PostgreSQL 10+

---

## Step 1: Install via Composer

```bash
composer require xgenious/xgpagebuilder
```

The package will be auto-discovered by Laravel.

---

## Step 2: Publish Config and Assets

```bash
php artisan vendor:publish --tag=page-builder-config
php artisan vendor:publish --tag=page-builder-assets
```

- `page-builder-config` — creates `config/xgpagebuilder.php`
- `page-builder-assets` — publishes the pre-built React editor to `public/assets/vendor/page-builder/`

---

## Step 3: Run Migrations

```bash
php artisan migrate
```

This creates:
- `page_builder_content` — stores page JSON content
- `page_builder_widgets` — stores widget data
- `page_editing_sessions` — manages concurrent editing locks

---

## Step 4: Add Columns to Your Pages Table

Create a migration for your existing `pages` table:

```php
// database/migrations/xxxx_add_page_builder_to_pages.php
Schema::table('pages', function (Blueprint $table) {
    $table->boolean('use_page_builder')->default(false);
    $table->string('page_builder_status')->default('off');
});
```

Both columns are required:

| Column | Type | Purpose |
|--------|------|---------|
| `use_page_builder` | boolean | Triggers `renderPage()` in the controller |
| `page_builder_status` | string (`'on'`/`'off'`) | Controls display in the blade view |

```bash
php artisan migrate
```

---

## Step 5: Configure Models

Update `config/xgpagebuilder.php` to point to your application's models:

```php
'models' => [
    'page'  => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

---

## Step 6: Update Page Model

Add the relationship to your Page model:

```php
// app/Models/Backend/Page.php
public function pageBuilderContent()
{
    return $this->hasOne(\Xgenious\PageBuilder\Models\PageBuilderContent::class, 'page_id');
}
```

---

## Step 7: Register Widget View Namespace

In `app/Providers/AppServiceProvider.php`, register the view namespace that widgets use for their blade templates:

```php
public function boot(): void
{
    $this->loadViewsFrom(base_path('plugins/PageBuilder/views'), 'pagebuilder');
}
```

Adjust the path to wherever your widget blade files live. Without this step, `view('pagebuilder::...')` calls in widget `render()` methods will throw "View not found".

---

## Step 8: Frontend Integration

Update your page controller:

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

> Always pass `true` as the second argument to `renderPage()`. Without it, CSS from style fields is silently dropped and your layout will break.

Update your Blade view:

```blade
@if($page->page_builder_status === 'on')
    @if(isset($page->rendered_content))
        <style>{!! $page->pagebuilder_generated_styles !!}</style>
        {!! $page->rendered_content !!}
    @endif
@else
    {!! $page->content !!}
@endif
```

---

## Step 9: Clear Caches

```bash
php artisan config:clear
php artisan view:clear
php artisan cache:clear
```

---

## Verification

Access the page builder editor at:

```
/{route_prefix}/edit/{pageId}
```

Default: `/page-builder/edit/1`

If you see the React interface, installation is complete.

---

## Optional: Publish Views

Publish views only if you need to customize the editor blade template:

```bash
php artisan vendor:publish --tag=page-builder-views
```

---

## Troubleshooting

### Editor shows blank page / Assets 404

```bash
cd vendor/xgenious/xgpagebuilder
npm install && npm run build
cd ../../..
php artisan vendor:publish --tag=page-builder-assets --force
```

Verify asset files exist:

```bash
ls public/assets/vendor/page-builder/assets/
# Should show: page-builder-standalone.[hash].js  page-builder-standalone.[hash].css
```

> Assets live at `/assets/vendor/page-builder/` — not `/vendor/page-builder/`. nginx commonly blocks `/vendor/` URL paths as a security rule.

### CSS Not Loading in Editor

```bash
php artisan vendor:publish --tag=page-builder-views --force
php artisan view:clear && php artisan config:clear
```

### Routes Not Found

```bash
php artisan route:list | grep page-builder
```

### Content Not Showing on Frontend

1. Check `page_builder_status` is `'on'` for the page (not just `use_page_builder`)
2. Verify blade outputs both `pagebuilder_generated_styles` and `rendered_content`

---

## Next Steps

- [Configuration Guide](configuration.html) — Configure routes, media, CSS, and more
- [Widget Development](widgets.html) — Create custom widgets
- [Frontend Integration](FRONTEND-INTEGRATION.html) — CSS pipeline, JS, responsive modes

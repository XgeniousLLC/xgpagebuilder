---
title: Installation
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

## Step 2: Publish Configuration

```bash
php artisan vendor:publish --tag=page-builder-config
```

This creates `config/xgpagebuilder.php` with all configuration options.

---

## Step 3: Run Migrations

```bash
php artisan migrate
```

This creates the following tables:
- `page_builder_content` - Stores page content
- `page_builder_widgets` - Stores widget data
- `page_editing_sessions` - Manages concurrent editing

---

## Step 4: Configure Models

Update `config/xgpagebuilder.php` to point to your application's models:

```php
'models' => [
    'page' => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

---

## Step 5: Update Page Model

Add the `use_page_builder` column to your pages table:

```php
// database/migrations/xxxx_add_page_builder_to_pages.php
Schema::table('pages', function (Blueprint $table) {
    $table->boolean('use_page_builder')->default(false);
});
```

Add relationships to your Page model:

```php
// app/Models/Backend/Page.php
public function pageBuilderContent()
{
    return $this->hasOne(\Xgenious\PageBuilder\Models\PageBuilderContent::class, 'page_id');
}

public function widgets()
{
    return $this->hasManyThrough(
        \Xgenious\PageBuilder\Models\PageBuilderWidget::class,
        \Xgenious\PageBuilder\Models\PageBuilderContent::class,
        'page_id',
        'page_id'
    );
}
```

---

## Step 6: Frontend Integration

Update your page controller to render page builder content:

```php
use Xgenious\PageBuilder\Services\PageBuilderRenderService;

public function show($slug)
{
    $page = Page::where('slug', $slug)->firstOrFail();
    
    if ($page->use_page_builder) {
        $pageBuilderService = app(PageBuilderRenderService::class);
        $page->rendered_content = $pageBuilderService->renderPage($page);
    }
    
    return view('frontend.pages.show', compact('page'));
}
```

Update your Blade view:

```blade
@if(isset($page->rendered_content))
    {!! $page->rendered_content !!}
@else
    {!! $page->content !!}
@endif
```

---

## Step 7: Clear Caches

```bash
php artisan config:clear
php artisan view:clear
php artisan cache:clear
```

---

## Optional: Publish Assets

Publish views for customization:

```bash
php artisan vendor:publish --tag=page-builder-views
```

Publish frontend assets:

```bash
php artisan vendor:publish --tag=page-builder-assets
```

---

## Verification

Access the page builder at:

```
/page-builder/edit/{pageId}
```

If you see the React interface, installation is successful!

---

## Troubleshooting

### CSS Not Loading

```bash
php artisan vendor:publish --tag=page-builder-views --force
php artisan view:clear
```

### Routes Not Found

Check that routes are registered:

```bash
php artisan route:list | grep page-builder
```

### Editor Shows Blank Page

Build and publish assets:

```bash
cd vendor/xgenious/xgpagebuilder
npm install && npm run build
cd ../../..
php artisan vendor:publish --tag=page-builder-assets --force
```

---

## Next Steps

- [Configuration Guide](configuration.html) - Configure the package
- [Widget Development](widgets.html) - Create custom widgets

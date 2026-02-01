# XgPageBuilder - Complete Documentation

A comprehensive guide to installing, configuring, and using the XgPageBuilder package in your Laravel application.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Host App Integration](#host-app-integration)
5. [Frontend Rendering](#frontend-rendering)
6. [Admin Panel Integration](#admin-panel-integration)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Install package
composer require xgenious/xgpagebuilder

# 2. Publish configuration
php artisan vendor:publish --tag=page-builder-config

# 3. Run migrations
php artisan migrate

# 4. Clear caches
php artisan config:clear
```

**That's it!** Your page builder is ready to use.

---

## Installation

### Requirements

- PHP 8.2 or higher
- Laravel 11.0 or 12.0
- MySQL 5.7+ or PostgreSQL 10+

### Step 1: Install via Composer

```bash
composer require xgenious/xgpagebuilder
```

The package will be auto-discovered by Laravel.

### Step 2: Publish Configuration

```bash
php artisan vendor:publish --tag=page-builder-config
```

This creates `config/xgpagebuilder.php` with all configuration options.

### Step 3: Run Migrations

```bash
php artisan migrate
```

This creates the following tables:
- `page_builder_content` - Stores page content
- `page_builder_widgets` - Stores widget data
- `page_editing_sessions` - Manages concurrent editing

### Step 4: Publish Assets (Optional)

Publish views for customization:

```bash
php artisan vendor:publish --tag=page-builder-views
```

Publish frontend assets:

```bash
php artisan vendor:publish --tag=page-builder-assets
```

---

## Configuration

After publishing, configure the package in `config/xgpagebuilder.php`:

### Model Configuration

Point the package to your application's models:

```php
'models' => [
    'page' => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

### Route Configuration

Customize route prefix and middleware:

```php
'route_prefix' => env('PAGE_BUILDER_ROUTE_PREFIX', 'page-builder'),
'route_middleware' => ['web', 'auth:admin'],
```

Routes will be available at:
- Editor: `/page-builder/edit/{pageId}`
- API: `/api/page-builder/*`

### Frontend CSS Files

Add your application's CSS files to load in the editor:

```php
'editor_frontend_css' => [
    'assets/frontend/css/bootstrap.css',
    'assets/frontend/css/your-styles.css',
],
```

These files are scoped to the canvas content only to avoid conflicts with the editor UI.

### Frontend JavaScript Files

Add JavaScript files for widget interactivity:

```php
'editor_frontend_js' => [
    'assets/frontend/js/your-app.js',
],
```

These files load in both the editor canvas and frontend pages.

### Media Upload Integration

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

### Widget Configuration

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

### Custom Widgets

Register your custom widget classes:

```php
'custom_widgets' => [
    \plugins\PageBuilder\Widgets\HeroSectionWidget::class,
],
```

See [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md) for creating custom widgets.

### Legacy Addon Support

If you have existing page builder addons:

```php
'enable_legacy_addons' => env('PAGE_BUILDER_LEGACY_ADDONS', false),
'legacy_addon_paths' => [
    base_path('plugins/PageBuilder/Addons'),
],
```

> **Note:** Legacy addons are supported for backward compatibility but we recommend migrating to the new widget format. See [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md) for migration guide.

---

## Host App Integration

### Step 1: Update Page Model

Add the `use_page_builder` column to your pages table:

```php
// database/migrations/xxxx_add_page_builder_to_pages.php
Schema::table('pages', function (Blueprint $table) {
    $table->boolean('use_page_builder')->default(false);
});
```

### Step 2: Add Relationships to Page Model

```php
// app/Models/Backend/Page.php
namespace App\Models\Backend;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'use_page_builder',
        // ... other fields
    ];

    /**
     * Relationship to page builder content
     */
    public function pageBuilderContent()
    {
        return $this->hasOne(\Xgenious\PageBuilder\Models\PageBuilderContent::class, 'page_id');
    }

    /**
     * Relationship to page builder widgets
     */
    public function widgets()
    {
        return $this->hasManyThrough(
            \Xgenious\PageBuilder\Models\PageBuilderWidget::class,
            \Xgenious\PageBuilder\Models\PageBuilderContent::class,
            'page_id',
            'page_id'
        );
    }
}
```

### Step 3: Add Navigation Link

In your admin panel, add a link to the page builder:

```blade
{{-- resources/views/backend/pages/edit.blade.php --}}

@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" 
       target="_blank" 
       class="btn btn-primary">
        <i class="fas fa-edit"></i> Open Page Builder
    </a>
@endif
```

---

## Frontend Rendering

### Step 1: Update Page Controller

In your frontend page controller, render page builder content:

```php
// app/Http/Controllers/Frontend/PageController.php
namespace App\Http\Controllers\Frontend;

use App\Models\Backend\Page;
use Xgenious\PageBuilder\Services\PageBuilderRenderService;

class PageController extends Controller
{
    public function show($slug)
    {
        $page = Page::where('slug', $slug)->firstOrFail();
        
        // Check if using page builder
        if ($page->use_page_builder) {
            $pageBuilderService = app(PageBuilderRenderService::class);
            $page->rendered_content = $pageBuilderService->renderPage($page);
        }
        
        return view('frontend.pages.show', compact('page'));
    }
}
```

### Step 2: Update Blade View

```blade
{{-- resources/views/frontend/pages/show.blade.php --}}
@extends('layouts.app')

@section('content')
    @if(isset($page->rendered_content))
        {{-- Page Builder Content --}}
        {!! $page->rendered_content !!}
    @else
        {{-- Traditional Content --}}
        {!! $page->content !!}
    @endif
@endsection
```

---

## Admin Panel Integration

### Option 1: Add Button to Page List

```blade
{{-- resources/views/backend/pages/index.blade.php --}}

@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" 
       target="_blank" 
       class="btn btn-sm btn-primary">
        Open Page Builder
    </a>
@endif
```

### Option 2: Add Button to Page Edit Form

```blade
{{-- resources/views/backend/pages/edit.blade.php --}}

<div class="form-group">
    <label>
        <input type="checkbox" name="use_page_builder" value="1" 
               {{ $page->use_page_builder ? 'checked' : '' }}>
        Enable Page Builder
    </label>
</div>

@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" 
       target="_blank" 
       class="btn btn-primary">
        <i class="fas fa-external-link-alt"></i> Open Page Builder
    </a>
@endif
```

---

## Troubleshooting

### CSS Not Loading in Editor

**Problem:** Styles don't appear in the editor canvas.

**Solution:**

1. Check `config/xgpagebuilder.php`:
   ```php
   'editor_frontend_css' => [
       'assets/frontend/css/your-styles.css', // Verify path is correct
   ],
   ```

2. Publish views and clear cache:
   ```bash
   php artisan vendor:publish --tag=page-builder-views --force
   php artisan view:clear
   php artisan config:clear
   ```

### Widget Content Not Showing on Frontend

**Problem:** Widgets appear empty on the frontend.

**Solution:**

1. Open the page in the editor
2. Click each widget and fill in the settings
3. Click "Save" button
4. Refresh the frontend page

**Verify data is saved:**
```bash
php artisan tinker
$page = \App\Models\Backend\Page::find(YOUR_PAGE_ID);
$service = app(\Xgenious\PageBuilder\Services\PageBuilderRenderService::class);
echo $service->renderPage($page);
```

### JavaScript Not Working

**Problem:** Interactive widgets don't work.

**Solution:**

1. Add JavaScript files to config:
   ```php
   'editor_frontend_js' => [
       'assets/frontend/js/your-app.js',
   ],
   ```

2. Publish views:
   ```bash
   php artisan vendor:publish --tag=page-builder-views --force
   ```

### Media Upload Not Working

**Problem:** Can't upload images in widgets.

**Solution:**

1. Verify routes exist in your application:
   ```bash
   php artisan route:list | grep media
   ```

2. Configure correct route names:
   ```php
   'media' => [
       'upload_route' => 'your.actual.upload.route',
       'library_route' => 'your.actual.media.route',
   ],
   ```

### Editor Shows Blank Page

**Problem:** Editor doesn't load.

**Solution:**

1. Build package assets:
   ```bash
   cd vendor/xgenious/xgpagebuilder
   npm install
   npm run build
   ```

2. Publish assets:
   ```bash
   php artisan vendor:publish --tag=page-builder-assets --force
   ```

3. Clear all caches:
   ```bash
   php artisan config:clear
   php artisan view:clear
   php artisan cache:clear
   php artisan optimize:clear
   ```

### Route Conflicts

**Problem:** Page builder routes conflict with existing routes.

**Solution:**

Change the route prefix:
```php
'route_prefix' => env('PAGE_BUILDER_ROUTE_PREFIX', 'admin/page-builder'),
```

### Widgets Not Appearing in Editor

**Problem:** Custom widgets don't show in the sidebar.

**Solution:**

1. Verify widget is registered:
   ```php
   'custom_widgets' => [
       \plugins\PageBuilder\Widgets\HeroSectionWidget::class,
   ],
   ```

2. Clear config cache:
   ```bash
   php artisan config:clear
   ```

3. Verify widget class extends `BaseWidget`:
   ```php
   use Xgenious\PageBuilder\Core\BaseWidget;
   
   class MyWidget extends BaseWidget
   {
       // ...
   }
   ```

---

## Common Commands

```bash
# Publish everything
php artisan vendor:publish --provider="Xgenious\PageBuilder\PageBuilderServiceProvider"

# Publish specific assets
php artisan vendor:publish --tag=page-builder-config
php artisan vendor:publish --tag=page-builder-views
php artisan vendor:publish --tag=page-builder-migrations
php artisan vendor:publish --tag=page-builder-assets

# Clear caches
php artisan config:clear
php artisan view:clear
php artisan cache:clear
php artisan optimize:clear

# Check routes
php artisan route:list | grep page-builder
```

---

## Next Steps

- **Create Custom Widgets:** See [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md)
- **Migrate Legacy Addons:** See [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md#migrating-legacy-addons)
- **Customize Editor:** Publish views and modify templates

---

## Support

For issues or questions:
- **Documentation:** This file and [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md)
- **GitHub Issues:** Report bugs and feature requests
- **Email:** support@xgenious.com

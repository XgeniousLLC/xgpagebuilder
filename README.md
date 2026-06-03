# XgPageBuilder

[![Latest Version on Packagist](https://img.shields.io/packagist/v/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)
[![Total Downloads](https://img.shields.io/packagist/dt/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)
[![License](https://img.shields.io/packagist/l/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)
[![PHP Version](https://img.shields.io/packagist/php-v/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)

A powerful, self-contained page builder package for Laravel with a modern React frontend. Build beautiful pages with drag-and-drop widgets, extensible architecture, and zero conflicts with your existing application.

📘 [XgPageBuilder Documentation](https://xgeniousllc.github.io/xgpagebuilder/)

---

## Features

- **Visual Page Builder** — Modern React drag-and-drop interface
- **Extensible Widget System** — 9+ built-in widgets with easy custom widget creation
- **Advanced Styling** — Comprehensive style controls with live CSS preview
- **Responsive Design** — Desktop / Tablet / Mobile preview modes
- **Highly Configurable** — Works seamlessly with existing Laravel apps
- **Performance Optimized** — Efficient CSS generation and caching
- **Secure** — XSS protection and input sanitization
- **Self-Contained Assets** — Pre-built React assets, no Node.js needed in your host app

---

## Requirements

- **PHP:** 8.2 or higher
- **Laravel:** 11.0 or 12.0
- **Database:** MySQL 5.7+ or PostgreSQL 10+

---

## Installation

### Step 1 — Install via Composer

```bash
composer require xgenious/xgpagebuilder
```

### Step 2 — Publish config and assets, run migrations

```bash
php artisan vendor:publish --tag=page-builder-config
php artisan vendor:publish --tag=page-builder-assets
php artisan migrate
php artisan config:clear
```

### Step 3 — Add columns to your pages table

Create a new migration:

```php
Schema::table('pages', function (Blueprint $table) {
    $table->boolean('use_page_builder')->default(false);
    $table->string('page_builder_status')->default('off');  // 'on' or 'off'
});
```

Two flags are needed:
- `use_page_builder` — triggers `renderPage()` in the controller
- `page_builder_status` — gates display in the blade view (`'on'` = show builder content)

### Step 4 — Register the widget view namespace

In `app/Providers/AppServiceProvider.php`:

```php
public function boot(): void
{
    $this->loadViewsFrom(base_path('plugins/PageBuilder/views'), 'pagebuilder');
}
```

Adjust the path to wherever your widget blade views live. This is required for `view('pagebuilder::...')` to work inside widget `render()` methods.

### Step 5 — Add model relationship

```php
// app/Models/Backend/Page.php
public function pageBuilderContent()
{
    return $this->hasOne(\Xgenious\PageBuilder\Models\PageBuilderContent::class, 'page_id');
}
```

### Step 6 — Point config to your models

```php
// config/xgpagebuilder.php
'models' => [
    'page'  => \App\Models\Backend\Page::class,
    'admin' => \App\Models\Backend\Admin::class,
],
```

---

## Usage

### Controller

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

> Always pass `true` as the second argument to `renderPage()`. Without it, CSS from style fields is silently dropped.

### Blade view

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

### Editor link in admin

```blade
@if($page->use_page_builder)
    <a href="{{ route('admin.page-builder.edit', $page->id) }}" target="_blank">
        Open Page Builder
    </a>
@endif
```

---

## Creating Custom Widgets

```php
namespace Plugins\PageBuilder\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\WidgetCategory;

class CallToActionWidget extends BaseWidget
{
    protected function getWidgetType(): string       { return 'call_to_action'; }
    protected function getWidgetName(): string       { return 'Call to Action'; }
    protected function getWidgetIcon(): string|array { return 'las la-bullhorn'; }
    protected function getCategory(): string         { return WidgetCategory::MARKETING; }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Content')
            ->registerField('title',       FieldManager::TEXT()->setLabel('Title')->setDefault('Get Started Today'))
            ->registerField('button_text', FieldManager::TEXT()->setLabel('Button Text')->setDefault('Sign Up'))
            ->registerField('button_url',  FieldManager::URL()->setLabel('Button URL')->setDefault('#'))
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array { return []; }

    public function render(array $settings = []): string
    {
        $content = $settings['general']['content'] ?? [];

        return view('pagebuilder::widgets.cta', [
            'title'      => $content['title']       ?? '',
            'buttonText' => $content['button_text'] ?? '',
            'buttonUrl'  => $content['button_url']  ?? '#',
        ])->render();
    }
}
```

> **Icon format:** always use Line Awesome format `'las la-ICONNAME'` (e.g. `'las la-bullhorn'`, `'las la-star'`).

> **IMAGE and VIDEO fields** return an array `['url' => '...', 'id' => ...]`, not a plain string. Always extract the URL: `$value['url'] ?? ''`.

Register in config and clear cache:

```php
// config/xgpagebuilder.php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\CallToActionWidget::class,
],
```

```bash
php artisan config:clear
```

See [Widget Development Guide](docs/WIDGET-DEVELOPMENT.md) for all field types and real-world examples.

---

## Built-in Widgets

- **Header Widget** — Hero sections with titles, subtitles, and CTAs
- **Features Widget** — Feature grids with icons and descriptions
- **Testimonial Widget** — Customer testimonials and reviews
- **Image Widget** — Responsive images with captions
- **Image Gallery Widget** — Photo galleries with lightbox
- **Video Widget** — Embedded videos (YouTube, Vimeo, self-hosted)
- **Icon Widget** — Icon displays with customization
- **Tabs Widget** — Tabbed content sections
- **Code Widget** — Syntax-highlighted code blocks

---

## Documentation

- **[Setup & Integration Guide](docs/DOCUMENTATION.md)** — Full installation, configuration, and host-app integration
- **[Widget Development Guide](docs/WIDGET-DEVELOPMENT.md)** — Create custom widgets and migrate legacy addons
- **[Frontend Integration](docs/FRONTEND-INTEGRATION.md)** — CSS pipeline, JS, responsive, media library
- **[Field Reference](docs/fields.md)** — All available PHP fields with examples
- **[Online Documentation](https://xgeniousllc.github.io/xgpagebuilder/)** — Full documentation website

---

## Quick Links

- **Editor URL:** `/{route_prefix}/edit/{pageId}` (default: `/page-builder/edit/{pageId}`)
- **API Endpoints:** `/api/page-builder/*`
- **Config file:** `config/xgpagebuilder.php`

---

## Publishing Options

```bash
# Configuration
php artisan vendor:publish --tag=page-builder-config

# Pre-built frontend assets (required)
php artisan vendor:publish --tag=page-builder-assets

# Views (for customization)
php artisan vendor:publish --tag=page-builder-views

# Migrations
php artisan vendor:publish --tag=page-builder-migrations
```

---

## Troubleshooting

### Assets 404 (page-builder.js / page-builder.css)

```bash
cd vendor/xgenious/xgpagebuilder
npm install && npm run build
cd ../../..
php artisan vendor:publish --tag=page-builder-assets --force
```

> Assets are published to `public/assets/vendor/page-builder/` — not `/vendor/page-builder/`. nginx commonly blocks `/vendor/` URL paths as a security rule.

### Editor shows blank page

```bash
php artisan vendor:publish --tag=page-builder-views --force
php artisan view:clear && php artisan config:clear
```

### Widgets not appearing in sidebar

```bash
php artisan config:clear
```

Verify the widget class is listed in `custom_widgets` in config and extends `BaseWidget`.

### Content not showing on frontend

1. Check `page_builder_status` is `'on'` for the page
2. Check `use_page_builder` is `true`
3. Verify blade outputs `$page->pagebuilder_generated_styles` in a `<style>` tag before `$page->rendered_content`

### Route conflicts

```php
// config/xgpagebuilder.php
'route_prefix' => 'admin/page-builder',
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

## Support

- **Email:** support@xgenious.com
- **Issues:** [GitHub Issues](https://github.com/XgeniousLLC/xgpagebuilder/issues)

---

**Made with ❤️ by Xgenious**

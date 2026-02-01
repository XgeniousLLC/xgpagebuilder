# XgPageBuilder

[![Latest Version on Packagist](https://img.shields.io/packagist/v/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)
[![Total Downloads](https://img.shields.io/packagist/dt/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)
[![License](https://img.shields.io/packagist/l/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)
[![PHP Version](https://img.shields.io/packagist/php-v/xgenious/xgpagebuilder.svg?style=flat-square)](https://packagist.org/packages/xgenious/xgpagebuilder)

A powerful, self-contained page builder package for Laravel with a modern React/Inertia frontend. Build beautiful pages with drag-and-drop widgets, extensible architecture, and zero conflicts with your existing application.

📘 [XgPageBuilder Documentation](https://xgeniousllc.github.io/xgpagebuilder/)


---

## ✨ Features

- 🎨 **Visual Page Builder** - Modern React-based drag-and-drop interface powered by Inertia.js
- 🧩 **Extensible Widget System** - 9+ built-in widgets with easy custom widget creation
- 🎯 **Advanced Styling** - Comprehensive style controls for every element
- 📱 **Responsive Design** - Mobile-first responsive controls
- 🔧 **Highly Configurable** - Works seamlessly with existing Laravel apps
- 🚀 **Performance Optimized** - Efficient CSS generation and caching
- 🔒 **Secure** - XSS protection and input sanitization
- 📦 **Self-Contained Assets** - Package builds its own NPM/React assets independently
- 🏗️ **No Host App Dependencies** - Host app doesn't need Node.js or frontend tooling

---

## 📋 Requirements

- **PHP:** 8.2 or higher
- **Laravel:** 11.0 or 12.0
- **Database:** MySQL 5.7+ or PostgreSQL 10+

---

## 🚀 Installation

Install the package via Composer:

```bash
composer require xgenious/xgpagebuilder
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=page-builder-config
```

Run migrations:

```bash
php artisan migrate
```

Clear caches:

```bash
php artisan config:clear
```

**That's it!** Your page builder is ready to use.

---

## ⚙️ Configuration

Configure the package in `config/xgpagebuilder.php`:

```php
return [
    // Route configuration
    'route_prefix' => 'page-builder',
    'route_middleware' => ['web', 'auth:admin'],

    // Point to your app's models
    'models' => [
        'page' => \App\Models\Backend\Page::class,
        'admin' => \App\Models\Backend\Admin::class,
    ],

    // Frontend CSS files for editor
    'editor_frontend_css' => [
        'assets/frontend/css/bootstrap.css',
        'assets/frontend/css/your-styles.css',
    ],

    // Frontend JS files
    'editor_frontend_js' => [
        'assets/frontend/js/your-app.js',
    ],

    // Media upload integration
    'media' => [
        'upload_route' => 'admin.upload.media.file',
        'library_route' => 'admin.upload.media.file.all',
    ],

    // Enable/disable widgets
    'widgets' => [
        'header' => true,
        'features' => true,
        'testimonial' => true,
        'image' => true,
        'video' => true,
        // ... more widgets
    ],

    // Register custom widgets
    'custom_widgets' => [
        \plugins\PageBuilder\Widgets\HeroSectionWidget::class,
    ],
];
```

See [Configuration Guide](docs/DOCUMENTATION.md#configuration) for all options.

---

## 📖 Usage

### Basic Integration

Update your Page model:

```php
// app/Models/Backend/Page.php
public function pageBuilderContent()
{
    return $this->hasOne(\Xgenious\PageBuilder\Models\PageBuilderContent::class, 'page_id');
}
```

Render page builder content in your controller:

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

Display in your Blade view:

```blade
@if(isset($page->rendered_content))
    {!! $page->rendered_content !!}
@else
    {!! $page->content !!}
@endif
```

### Creating Custom Widgets

Create a widget class:

```php
namespace plugins\PageBuilder\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class CallToActionWidget extends BaseWidget
{
    protected string $addon_name = 'call-to-action';
    protected string $addon_title = 'Call to Action';
    protected string $icon = 'la-bullhorn';
    protected string $category = 'marketing';

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Content')
            ->registerField('title', FieldManager::TEXT()
                ->setLabel('Title')
                ->setDefault('Get Started Today')
            )
            ->registerField('button_text', FieldManager::TEXT()
                ->setLabel('Button Text')
            )
            ->endGroup();
        
        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $title = $settings['general']['content']['title'] ?? '';
        $buttonText = $settings['general']['content']['button_text'] ?? '';
        
        return view('pagebuilder::widgets.cta', compact('title', 'buttonText'))->render();
    }
}
```

Register in config:

```php
'custom_widgets' => [
    \plugins\PageBuilder\Widgets\HeroSectionWidget::class,
],
```

See [Widget Development Guide](docs/WIDGET-DEVELOPMENT.md) for detailed examples.

---

## 🧩 Built-in Widgets

- **Header Widget** - Hero sections with titles, subtitles, and CTAs
- **Features Widget** - Feature grids with icons and descriptions
- **Testimonial Widget** - Customer testimonials and reviews
- **Image Widget** - Responsive images with captions
- **Image Gallery Widget** - Photo galleries with lightbox
- **Video Widget** - Embedded videos (YouTube, Vimeo, self-hosted)
- **Icon Widget** - Icon displays with customization
- **Tabs Widget** - Tabbed content sections
- **Code Widget** - Syntax-highlighted code blocks

---

## 📚 Documentation

- **[Complete Documentation](docs/DOCUMENTATION.md)** - Installation, configuration, and integration guide
- **[Widget Development Guide](docs/WIDGET-DEVELOPMENT.md)** - Create custom widgets and migrate legacy addons
- **[Online Documentation](https://xgeniousllc.github.io/xgpagebuilder/)** - Full documentation website

---

## 🎯 Quick Links

- **Editor URL:** `/page-builder/edit/{pageId}`
- **API Endpoints:** `/api/page-builder/*`
- **Configuration:** `config/xgpagebuilder.php`

---

## 🔧 Publishing Options

Publish everything:

```bash
php artisan vendor:publish --provider="Xgenious\PageBuilder\PageBuilderServiceProvider"
```

Publish specific assets:

```bash
# Configuration only
php artisan vendor:publish --tag=page-builder-config

# Views only
php artisan vendor:publish --tag=page-builder-views

# Migrations only
php artisan vendor:publish --tag=page-builder-migrations

# Frontend assets only
php artisan vendor:publish --tag=page-builder-assets
```

---

## 🏗️ Architecture Highlights

### No Model Conflicts
The package uses your host application's `Page` and `Admin` models via configuration. No conflicts with existing models!

### Self-Contained Assets
Package builds its own React/Vite assets:
- Host app doesn't need Node.js
- No npm dependencies in host app
- Pre-built assets committed to repo

### Coexistence Strategy
Old and new page builders work side-by-side:
- Existing pages continue working
- Gradual migration at your pace
- Per-page builder selection

---

## 🐛 Troubleshooting

### CSS Not Loading in Editor

```bash
php artisan vendor:publish --tag=page-builder-views --force
php artisan view:clear
php artisan config:clear
```

### Widgets Not Appearing

```bash
php artisan config:clear
```

### Route Conflicts

Adjust the `route_prefix` in `config/xgpagebuilder.php`:

```php
'route_prefix' => 'admin/page-builder',
```

See [Troubleshooting Guide](docs/DOCUMENTATION.md#troubleshooting) for more solutions.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

## 📞 Support

- **Email:** support@xgenious.com
- **Documentation:** [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)
- **Issues:** [GitHub Issues](https://github.com/XgeniousLLC/xgpagebuilder/issues)

---

## 🙏 Credits

Developed and maintained by [Xgenious](https://xgenious.com).

---

**Made with ❤️ by Xgenious**

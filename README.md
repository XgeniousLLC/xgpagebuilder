# XgPageBuilder - Laravel Page Builder Package

A powerful, self-contained page builder package for Laravel with React/Inertia frontend. Features drag-and-drop interface, extensible widgets.

## ✨ Features

-   🎨 **Visual Page Builder** - Modern React-based drag-and-drop interface with Inertia.js
-   🧩 **Extensible Widget System** - 9+ built-in widgets with easy custom widget creation
-   🎯 **Advanced Styling** - Comprehensive style controls for every element
-   📱 **Responsive Design** - Mobile-first responsive controls
-   🔧 **Highly Configurable** - Works with existing Laravel apps without conflicts
-   🚀 **Performance Optimized** - Efficient CSS generation and caching
-   🔒 **Secure** - XSS protection and input sanitization
-   📦 **Self-Contained Assets** - Package builds its own NPM/React assets independently
-   🏗️ **No Host App Dependencies** - Host app doesn't need Node.js or frontend tooling

## Requirements

-   PHP 8.2 or higher
-   Laravel 11.0 or 12.0
-   MySQL 5.7+ or PostgreSQL 10+

## Installation

### Step 1: Install via Composer

```bash
composer require xgenious/xgpagebuilder
```

### Step 2: Publish Configuration

```bash
php artisan vendor:publish --provider="Xgenious\PageBuilder\PageBuilderServiceProvider" --tag="page-builder-config"
```

### Step 3: Run Migrations

```bash
php artisan migrate
```

### Step 4: Publish Assets (Optional)

Publish views for customization:

```bash
php artisan vendor:publish --tag="page-builder-views"
```

Publish frontend assets:

```bash
php artisan vendor:publish --tag="page-builder-assets"
```

## ⚙️ Configuration

After publishing the configuration file, customize in `config/page-builder.php`:

```php
return [
    // Route configuration
    'route_prefix' => 'page-builder',
    'route_middleware' => ['web', 'auth'],

    // Host app models (prevents conflicts)
    'models' => [
        'page' => \App\Models\Backend\Page::class,
        'admin' => \App\Models\Admin::class,
    ],

    // Legacy addon support
    'enable_legacy_addons' => true,
    'legacy_addon_paths' => [
        base_path('plugins/PageBuilder/Addons'),
    ],

    // Enable/disable specific widgets
    'widgets' => [
        'header' => true,
        'features' => true,
        'testimonial' => true,
        // ... more widgets
    ],

    // Custom widgets
    'custom_widgets' => [
        \App\Widgets\CustomFeatureWidget::class,
    ],

    // Database table names
    'tables' => [
        'content' => 'page_builder_content',
        'widgets' => 'page_builder_widgets',
        'editing_sessions' => 'page_editing_sessions',
    ],
];
```

## 🚀 Quick Start

### For Package Developers

```bash
# Navigate to package directory
cd packages/xgenious/xgpagebuilder

# Install dependencies
npm install

# Build assets
npm run build
```

### For End Users

The package is ready to use! Pages with `use_page_builder` enabled will automatically render using the new system.

## 📖 Usage

### Basic Usage

**The package automatically integrates with your existing pages!** No manual rendering needed if you follow the setup in `COMPLETE-GUIDE.md`.

### Creating Widgets

#### Modern Widget (Recommended)

```php
namespace App\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class MyWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'my-widget';
    }

    protected function getWidgetName(): string
    {
        return 'My Widget';
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Content')
            ->registerField('title', FieldManager::TEXT()->setLabel('Title'))
            ->endGroup();
        
        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $title = $settings['general']['content']['title'] ?? '';
        return "<h1>{$title}</h1>";
    }
}
```

#### Migrating Legacy Addons

Simply change the base class:

```php
// Before
use plugins\PageBuilder\PageBuilderBase;
class MyAddon extends PageBuilderBase { }

// After
use Xgenious\PageBuilder\Core\LegacyAddonAdapter;
class MyAddon extends LegacyAddonAdapter {
    // Add getGeneralFields() method
    // Keep frontend_render() as-is
}
```

**Legacy addons are automatically discovered and registered!**

### Frontend Rendering (Already Configured)

The package integrates with `FrontendController`:

```php
// Automatically renders pages with page builder
if ($page_post->use_page_builder) {
    $pageBuilderService = app(\Xgenious\PageBuilder\Services\PageBuilderRenderService::class);
    $page_post->rendered_content = $pageBuilderService->renderPage($page_post);
}
```

View template handles new/old/regular content automatically.

## Available Widgets

### Built-in Widgets

-   **Header Widget** - Hero sections with titles, subtitles, and CTAs
-   **Features Widget** - Feature grids with icons and descriptions
-   **Testimonial Widget** - Customer testimonials and reviews
-   **Image Widget** - Responsive images with captions
-   **Image Gallery Widget** - Photo galleries with lightbox
-   **Video Widget** - Embedded videos (YouTube, Vimeo, self-hosted)
-   **Icon Widget** - Icon displays with customization
-   **Tabs Widget** - Tabbed content sections
-   **Code Widget** - Syntax-highlighted code blocks

### Creating Custom Widgets

Create a new widget class:

```php
namespace App\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;

class MyCustomWidget extends BaseWidget
{
    public function getName(): string
    {
        return 'my-custom-widget';
    }

    public function getTitle(): string
    {
        return 'My Custom Widget';
    }

    public function getGeneralFields(): array
    {
        return [
            'title' => [
                'type' => 'text',
                'label' => 'Title',
                'default' => 'Default Title'
            ]
        ];
    }

    public function render(array $settings): string
    {
        return view('widgets.my-custom-widget', compact('settings'))->render();
    }
}
```

Register your widget in `config/page-builder.php`:

```php
'custom_widgets' => [
    \App\Widgets\MyCustomWidget::class,
],
```

## API Routes

The package registers the following API routes (prefixed with your configured route prefix):

-   `GET /api/page-builder/pages/{pageId}/content` - Get page content
-   `POST /api/page-builder/save` - Save page content
-   `POST /api/page-builder/publish` - Publish page
-   `POST /api/page-builder/unpublish` - Unpublish page
-   `POST /api/page-builder/css/generate` - Generate CSS
-   ... and more

## Publishing Options

### Publish Everything

```bash
php artisan vendor:publish --provider="Xgenious\PageBuilder\PageBuilderServiceProvider"
```

### Publish Specific Assets

```bash
# Configuration only
php artisan vendor:publish --tag="page-builder-config"

# Views only
php artisan vendor:publish --tag="page-builder-views"

# Migrations only
php artisan vendor:publish --tag="page-builder-migrations"

# Frontend assets only
php artisan vendor:publish --tag="page-builder-assets"
```

## Advanced Configuration

### Custom Middleware

Add custom middleware to page builder routes:

```php
'route_middleware' => ['web', 'auth', 'can:edit-pages'],
```

### Disable Specific Widgets

```php
'widgets' => [
    'code' => false, // Disable code widget
    'video' => false, // Disable video widget
],
```

### Custom Table Names

```php
'tables' => [
    'content' => 'custom_page_content',
    'widgets' => 'custom_page_widgets',
],
```

## Troubleshooting

### CSS Not Applying

Make sure you're outputting the CSS in your layout:

```blade
<style>{!! $css !!}</style>
```

### Widgets Not Appearing

Check that widgets are enabled in `config/page-builder.php` and clear config cache:

```bash
php artisan config:clear
```

### Route Conflicts

Adjust the `route_prefix` in config to avoid conflicts with existing routes.

## Contributing

Contributions are welcome! Please submit pull requests to the main repository.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## 📚 Documentation

- **[COMPLETE-GUIDE.md](COMPLETE-GUIDE.md)** - Comprehensive implementation guide
- **[QUICKSTART-ADDON-CREATION.md](QUICKSTART-ADDON-CREATION.md)** - 5-minute addon creation tutorial
- **[MIGRATION.md](MIGRATION.md)** - Legacy system migration guide
- **[PACKAGE-STRATEGY.md](PACKAGE-STRATEGY.md)** - Package architecture decisions

## 🏗️ Architecture Highlights

### No Model Conflicts
The package uses your host application's `Page` and `Admin` models via configuration. No conflicts with existing models!

### Legacy Addon Bridge
The `LegacyAddonAdapter` class provides a seamless bridge for old addons:
- Automatically discovers addons in configured paths
- Converts old field definitions to new format
- Maintains backward compatibility with existing Blade views

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

## 🤝 Contributing

Contributions are welcome! For major changes, please open an issue first.

## 📞 Support

- Email: support@xgenious.com
- Documentation: See `COMPLETE-GUIDE.md`
- Issues: GitHub Issues

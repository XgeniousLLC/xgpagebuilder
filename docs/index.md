---
layout: default
title: Home
nav_order: 1
---

# XgPageBuilder

A powerful, self-contained page builder package for Laravel with a modern React/Inertia frontend.

[Get Started](installation.html){: .btn .btn-primary}
[View on GitHub](https://github.com/XgeniousLLC/xgpagebuilder){: .btn}

---

## Features

- 🎨 **Visual Page Builder** - Modern React-based drag-and-drop interface
- 🧩 **Extensible Widget System** - 9+ built-in widgets with easy custom widget creation
- 🎯 **Advanced Styling** - Comprehensive style controls for every element
- 📱 **Responsive Design** - Mobile-first responsive controls
- 🔧 **Highly Configurable** - Works seamlessly with existing Laravel apps
- 🚀 **Performance Optimized** - Efficient CSS generation and caching
- 🔒 **Secure** - XSS protection and input sanitization

---

## Quick Start

```bash
# 1. Install
composer require xgenious/xgpagebuilder

# 2. Publish config + assets, run migrations
php artisan vendor:publish --tag=page-builder-config
php artisan vendor:publish --tag=page-builder-assets
php artisan migrate
php artisan config:clear
```

Then complete these required integration steps:

1. **Add columns** to your `pages` table: `use_page_builder` (boolean) + `page_builder_status` (string)
2. **Register view namespace** in `AppServiceProvider::boot()`: `$this->loadViewsFrom(base_path('plugins/PageBuilder/views'), 'pagebuilder')`
3. **Add model relationship** and point config to your `Page` + `Admin` models
4. **Update controller** to call `renderPage($page, true)` and store html/css on the model
5. **Update blade** to check `page_builder_status === 'on'` and output both html and css

See the [Installation Guide](installation.html) for the full step-by-step walkthrough.

---

## Requirements

- **PHP:** 8.2 or higher
- **Laravel:** 11.0 or 12.0
- **Database:** MySQL 5.7+ or PostgreSQL 10+

---

## Next Steps

- [Installation Guide](installation.html) - Detailed installation instructions
- [Configuration](configuration.html) - Configure the package for your app
- [Widget Development](widgets.html) - Create custom widgets
- [Field Reference](fields.html) - All available PHP fields with examples
- [GitHub Repository](https://github.com/XgeniousLLC/xgpagebuilder) - View source code

---

## Support

- **Email:** support@xgenious.com
- **Issues:** [GitHub Issues](https://github.com/XgeniousLLC/xgpagebuilder/issues)

---

**Made with ❤️ by Xgenious**

---
layout: default
title: Home
nav_order: 1
---

# XgPageBuilder

A powerful, self-contained page builder package for Laravel with a modern React/Inertia frontend.

{: .fs-6 .fw-300 }

[Get Started](#quick-start){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/xgenious/xgpagebuilder){: .btn .fs-5 .mb-4 .mb-md-0 }

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

Install the package via Composer:

```bash
composer require xgenious/xgpagebuilder
```

Publish configuration:

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

## Requirements

- **PHP:** 8.2 or higher
- **Laravel:** 11.0 or 12.0
- **Database:** MySQL 5.7+ or PostgreSQL 10+

---

## Next Steps

- [Installation Guide](installation.html) - Detailed installation instructions
- [Configuration](configuration.html) - Configure the package for your app
- [Widget Development](widgets.html) - Create custom widgets
- [GitHub Repository](https://github.com/xgenious/xgpagebuilder) - View source code

---

## Support

- **Email:** support@xgenious.com
- **Issues:** [GitHub Issues](https://github.com/xgenious/xgpagebuilder/issues)

---

**Made with ❤️ by Xgenious**

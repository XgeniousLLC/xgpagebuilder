---
layout: default
title: Widget Development
nav_order: 4
---

# Widget Development

> For the full guide with all field types, real-world examples, and legacy migration, see [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md).

---

## Quick Example

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
    protected function getWidgetIcon(): string|array { return 'las la-bullhorn'; }  // format: 'las la-ICONNAME'
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

**Blade view:**

```blade
{{-- plugins/PageBuilder/views/widgets/cta.blade.php --}}
<div class="cta-section">
    <h2>{{ $title }}</h2>
    <a href="{{ $buttonUrl }}" class="btn btn-primary">{{ $buttonText }}</a>
</div>
```

**Register:**

```php
// config/xgpagebuilder.php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\CallToActionWidget::class,
],
```

```bash
php artisan config:clear
```

---

## Key Field Types

| Field | Usage |
|-------|-------|
| `FieldManager::TEXT()` | Single-line text |
| `FieldManager::TEXTAREA()` | Multi-line text |
| `FieldManager::WYSIWYG()` | Rich text editor |
| `FieldManager::NUMBER()` | Number input |
| `FieldManager::TOGGLE()` | Boolean switch |
| `FieldManager::SELECT()` | Dropdown |
| `FieldManager::COLOR()` | Color picker |
| `FieldManager::IMAGE()` | Image upload → **returns array** `['url'=>..., 'id'=>...]` |
| `FieldManager::VIDEO()` | Video upload → **returns array** `['url'=>..., 'poster'=>...]` |
| `FieldManager::URL()` | Link field |
| `FieldManager::ICON()` | Icon picker |
| `FieldManager::REPEATER()` | Repeatable group of fields |
| `FieldManager::DIMENSION()` | Margin/padding with CSS selector binding |

> IMAGE and VIDEO fields return **arrays**. Extract the URL with `$value['url'] ?? ''`.

---

## Widget Categories

```php
use Xgenious\PageBuilder\Core\WidgetCategory;

WidgetCategory::THEME        // theme-specific sections
WidgetCategory::BASIC        // basic content
WidgetCategory::CONTENT      // content widgets
WidgetCategory::MEDIA        // image, video, gallery
WidgetCategory::INTERACTIVE  // tabs, accordion, slider
WidgetCategory::MARKETING    // CTA, pricing, testimonials
```

---

---

## CSS in Widgets — Two Approaches

**Approach 1 — Inline `<style>` block in blade** (for fixed layout / values from `render()`)

Scope to `#{{ $uid }}` so multiple instances on the same page don't clash:

```blade
<style>
    #{{ $uid }} .my-section { background-color: {{ $bgColor }}; }
</style>
<section id="{{ $uid }}" class="my-section">...</section>
```

Pass `'uid' => 'prefix_' . uniqid()` from `render()`.

**Approach 2 — `getStyleFields()` with `setSelectors()`** (for values the editor user sets in the Style tab)

```php
public function getStyleFields(): array
{
    $control = new ControlManager();
    $control->addGroup('section', 'Section')
        ->registerField('margin', FieldManager::DIMENSION()
            ->setLabel('Margin')->asMargin()
            ->setSelectors(['{{WRAPPER}} .my-section'])
        )
        ->endGroup();
    return $control->getFields();
}
```

`{{WRAPPER}}` is replaced with `.pb-widget-{widgetId}` — each instance is isolated automatically. This CSS lands in `$page->pagebuilder_generated_styles` and is output once in the page `<style>` block.

Use **both together**: inline blade CSS for values you set in `render()`, `getStyleFields()` for spacing/colors the editor user configures.

---

For all field types, style CSS generation, and complete examples → [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md)

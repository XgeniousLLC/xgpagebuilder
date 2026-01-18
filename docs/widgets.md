---
layout: default
title: Widget Development
nav_order: 4
---

# Widget Development Guide

Learn how to create custom widgets for XgPageBuilder.

---

## Creating a Widget

Create a widget class that extends `BaseWidget`:

```php
// app/Widgets/CallToActionWidget.php
namespace App\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class CallToActionWidget extends BaseWidget
{
    protected string $addon_name = 'call-to-action';
    protected string $addon_title = 'Call to Action';
    protected string $addon_description = 'A call to action section';
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
                ->setDefault('Sign Up')
            )
            ->registerField('button_url', FieldManager::TEXT()
                ->setLabel('Button URL')
            )
            ->endGroup();
        
        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $title = $settings['general']['content']['title'] ?? '';
        $buttonText = $settings['general']['content']['button_text'] ?? '';
        $buttonUrl = $settings['general']['content']['button_url'] ?? '#';
        
        return view('widgets.cta', compact('title', 'buttonText', 'buttonUrl'))->render();
    }
}
```

---

## Create Widget View

```blade
{{-- resources/views/widgets/cta.blade.php --}}
<div class="cta-section">
    <div class="container">
        <h2>{{ $title }}</h2>
        <a href="{{ $buttonUrl }}" class="btn btn-primary">{{ $buttonText }}</a>
    </div>
</div>
```

---

## Register Widget

Add to `config/xgpagebuilder.php`:

```php
'custom_widgets' => [
    \App\Widgets\CallToActionWidget::class,
],
```

Clear cache:

```bash
php artisan config:clear
```

---

## Field Types

### Text Field

```php
FieldManager::TEXT()
    ->setLabel('Title')
    ->setPlaceholder('Enter title')
    ->setDefault('Default value')
```

### Textarea

```php
FieldManager::TEXTAREA()
    ->setLabel('Description')
    ->setRows(5)
```

### Rich Text Editor

```php
FieldManager::RICH_TEXT()
    ->setLabel('Content')
```

### Number

```php
FieldManager::NUMBER()
    ->setLabel('Count')
    ->setMin(0)
    ->setMax(100)
    ->setDefault(10)
```

### Color Picker

```php
FieldManager::COLOR()
    ->setLabel('Background Color')
    ->setDefault('#ffffff')
```

### Image Upload

```php
FieldManager::IMAGE()
    ->setLabel('Featured Image')
```

### Select Dropdown

```php
FieldManager::SELECT()
    ->setLabel('Layout')
    ->setOptions([
        'left' => 'Left Aligned',
        'center' => 'Center Aligned',
        'right' => 'Right Aligned',
    ])
    ->setDefault('center')
```

### Checkbox

```php
FieldManager::CHECKBOX()
    ->setLabel('Show Icon')
    ->setDefault(true)
```

### Icon Picker

```php
FieldManager::ICON()
    ->setLabel('Icon')
    ->setDefault('la-star')
```

### Repeater

```php
FieldManager::REPEATER()
    ->setLabel('Features')
    ->setFields([
        'title' => FieldManager::TEXT()->setLabel('Title'),
        'description' => FieldManager::TEXTAREA()->setLabel('Description'),
    ])
```

---

## Style Controls

Add style fields:

```php
public function getStyleFields(): array
{
    $control = new ControlManager();
    
    $control->addGroup('colors', 'Colors')
        ->registerField('background_color', FieldManager::COLOR()
            ->setLabel('Background Color')
            ->setDefault('#f8f9fa')
        )
        ->registerField('text_color', FieldManager::COLOR()
            ->setLabel('Text Color')
            ->setDefault('#212529')
        )
        ->endGroup();
    
    return $control->getFields();
}
```

---

## Widget Properties

### Required Properties

```php
protected string $addon_name = 'my-widget';      // Unique identifier
protected string $addon_title = 'My Widget';     // Display name
```

### Optional Properties

```php
protected string $addon_description = 'Widget description';
protected string $icon = 'la-star';              // Line Awesome icon
protected string $category = 'content';          // Widget category
```

### Categories

- `theme` - Theme-specific widgets
- `content` - Content widgets
- `media` - Media widgets
- `interactive` - Interactive widgets
- `marketing` - Marketing widgets
- `custom` - Custom widgets

---

## Best Practices

### 1. Use Descriptive Names

```php
// ✅ Good
protected string $addon_name = 'call-to-action';

// ❌ Bad
protected string $addon_name = 'widget1';
```

### 2. Group Related Fields

```php
$control->addGroup('content', 'Content')
    ->registerField('title', FieldManager::TEXT()->setLabel('Title'))
    ->registerField('description', FieldManager::TEXTAREA()->setLabel('Description'))
    ->endGroup();
```

### 3. Provide Defaults

```php
FieldManager::TEXT()
    ->setLabel('Title')
    ->setDefault('Default Title')
```

### 4. Handle Missing Data

```php
$title = $settings['general']['content']['title'] ?? 'Default Title';
```

### 5. Sanitize Output

```php
$title = e($settings['general']['content']['title'] ?? '');
```

---

## Complete Example

```php
namespace App\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class FeatureGridWidget extends BaseWidget
{
    protected string $addon_name = 'feature-grid';
    protected string $addon_title = 'Feature Grid';
    protected string $icon = 'la-th';
    protected string $category = 'content';

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Content')
            ->registerField('heading', FieldManager::TEXT()
                ->setLabel('Heading')
                ->setDefault('Our Features')
            )
            ->registerField('features', FieldManager::REPEATER()
                ->setLabel('Features')
                ->setFields([
                    'icon' => FieldManager::ICON()->setLabel('Icon'),
                    'title' => FieldManager::TEXT()->setLabel('Title'),
                    'description' => FieldManager::TEXTAREA()->setLabel('Description'),
                ])
            )
            ->endGroup();
        
        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $heading = $settings['general']['content']['heading'] ?? 'Our Features';
        $features = $settings['general']['content']['features'] ?? [];
        
        return view('widgets.feature-grid', compact('heading', 'features'))->render();
    }
}
```

---

## Next Steps

- [Configuration Guide](configuration.html) - Configure the package
- [Installation Guide](installation.html) - Installation instructions

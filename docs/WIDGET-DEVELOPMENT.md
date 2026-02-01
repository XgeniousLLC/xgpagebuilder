# Widget Development Guide

Learn how to create custom widgets for XgPageBuilder and migrate legacy addons.

---

## Table of Contents

1. [Creating Custom Widgets](#creating-custom-widgets)
2. [Field Types Reference](#field-types-reference)
3. [Style Controls](#style-controls)
4. [Migrating Legacy Addons](#migrating-legacy-addons)
5. [Best Practices](#best-practices)

---

## Creating Custom Widgets

### Real-World Example: Hero Section Widget

Here's a complete example of a production-ready hero section widget with background image, trusted users, and call-to-action buttons:

```php
// plugins/PageBuilder/Widgets/HeroSectionWidget.php
namespace plugins\PageBuilder\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use plugins\PageBuilder\Traits\ExtractsImageIds;

class HeroSectionWidget extends BaseWidget
{
    use ExtractsImageIds;
    
    protected function getWidgetType(): string
    {
        return 'hero-section';
    }

    protected function getWidgetName(): string
    {
        return 'Hero Section';
    }

    protected function getWidgetDescription(): string
    {
        return 'Create an impactful hero section with title, subtitle, trusted users, and call-to-action buttons';
    }

    protected function getCategory(): string
    {
        return 'theme';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-rocket';
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Background Section
        $control->addGroup('background', 'Background')
            ->registerField(
                'background_image',
                FieldManager::IMAGE()
                    ->setLabel('Background Image')
                    ->setDescription('Recommended: 1905x820')
            )
            ->endGroup();

        // Trusted Users Section
        $control->addGroup('trusted', 'Trusted Section')
            ->registerField(
                'trusted_text',
                FieldManager::TEXT()
                    ->setLabel('Trusted Text')
                    ->setDefault('Trusted by 20k users')
            )
            ->registerField(
                'trusted_images',
                FieldManager::REPEATER()
                    ->setLabel('Trusted User Images')
                    ->setAddButtonText('Add Image')
                    ->setFields([
                        'image' => FieldManager::IMAGE()->setLabel('User Image'),
                    ])
            )
            ->endGroup();

        // Hero Content
        $control->addGroup('content', 'Hero Content')
            ->registerField(
                'title',
                FieldManager::TEXT()
                    ->setLabel('Main Title')
                    ->setDefault('Transform Customer Support with Intelligent AI')
            )
            ->registerField(
                'subtitle',
                FieldManager::TEXTAREA()
                    ->setLabel('Subtitle / Description')
                    ->setRows(3)
                    ->setDefault('Provide instant accurate and personalized support smarter faster and always available')
            )
            ->endGroup();

        // Call-to-Action Buttons
        $control->addGroup('buttons', 'Buttons')
            ->registerField(
                'button_title_one',
                FieldManager::TEXT()
                    ->setLabel('Button One Title')
                    ->setDefault('Explore Demos')
            )
            ->registerField(
                'button_link_one',
                FieldManager::URL()
                    ->setLabel('Button One Link')
                    ->setDefault('#')
            )
            ->registerField(
                'button_title_two',
                FieldManager::TEXT()
                    ->setLabel('Button Two Title')
                    ->setDefault('Get Started')
            )
            ->registerField(
                'button_link_two',
                FieldManager::URL()
                    ->setLabel('Button Two Link')
                    ->setDefault('#')
            )
            ->endGroup();

        // Banner Image
        $control->addGroup('banner', 'Banner Image')
            ->registerField(
                'banner_image',
                FieldManager::IMAGE()
                    ->setLabel('Hero Banner Image')
                    ->setDescription('Recommended: 500x550')
            )
            ->endGroup();

        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];

        $background = $general['background'] ?? [];
        $trusted = $general['trusted'] ?? [];
        $content = $general['content'] ?? [];
        $buttons = $general['buttons'] ?? [];
        $banner = $general['banner'] ?? [];

        // Transform trusted_images repeater to match blade view format
        $trustedImages = ['image_' => []];
        if (!empty($trusted['trusted_images']) && is_array($trusted['trusted_images'])) {
            foreach ($trusted['trusted_images'] as $item) {
                $trustedImages['image_'][] = $this->extractImageId($item['image'] ?? '');
            }
        }

        return view('pagebuilder::home.hero-section', [
            'background_image' => $this->extractImageId($background['background_image'] ?? ''),
            'banner_image' => $this->extractImageId($banner['banner_image'] ?? ''),
            'title' => $content['title'] ?? '',
            'subtitle' => $content['subtitle'] ?? '',
            'button_title_one' => $buttons['button_title_one'] ?? '',
            'button_link_one' => $this->extractUrl($buttons['button_link_one'] ?? '#'),
            'button_title_two' => $buttons['button_title_two'] ?? '',
            'button_link_two' => $this->extractUrl($buttons['button_link_two'] ?? '#'),
            'trusted_text' => $trusted['trusted_text'] ?? '',
            'trusted_images' => $trustedImages,
        ])->render();
    }
}
```

### Create Widget View

```blade
{{-- core/plugins/PageBuilder/views/home/hero-section.blade.php --}}
@php
    $img_tag = render_image_markup_by_attachment_id($background_image, '', 'thumb');
    preg_match('/src="([^"]+)"/', $img_tag, $matches);
    $background_image_url = $matches[1];
@endphp

<section class="banner-section" style="background-image: url('{{ $background_image_url }}');">
    <div class="header-cover"></div>
    <div class="custom-container">
        <div class="hero-area">
            <div class="hero-content-part text-center">
                <div class="trusted-users flex-center">
                    <div class="images">
                        @foreach ($trusted_images['image_'] as $key => $data)
                            <div class="img rounded-image base-20">
                                {!! render_image_markup_by_attachment_id($data) !!}
                            </div>
                        @endforeach
                    </div>
                    <div class="text">
                        <span>{{ $trusted_text ?? 'Trusted by 20k users' }}</span>
                    </div>
                </div>
                <h1 class="main-title white-text">
                    {{ $title ?? __('Transform Customer Support with Intelligent AI') }}
                </h1>
                <p class="hero-para">
                    {{ $subtitle ?? __('Provide instant accurate and personalized support smarter faster and always available') }}
                </p>
                <div class="btn-wrapper d-flex justify-content-center gap-4">
                    <a href="{{ $button_link_one }}" class="cmn-btn white-btn-outline">
                        {{ $button_title_one ?? __('Explore Demos') }}
                    </a>
                    <a href="{{ $button_link_two }}" class="cmn-btn white-btn">
                        {{ $button_title_two ?? __('Get Started') }}
                    </a>
                </div>
            </div>
            <div class="hero-img">
                {!! render_image_markup_by_attachment_id($banner_image) !!}
            </div>
        </div>
    </div>
</section>
```

### Register Widget

Add to `config/xgpagebuilder.php`:

```php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\HeroSectionWidget::class,
],
```

Clear cache:

```bash
php artisan config:clear
```

---

## Field Types Reference

### Text Field

```php
FieldManager::TEXT()
    ->setLabel('Title')
    ->setPlaceholder('Enter title')
    ->setDefault('Default value')
```

### Textarea Field

```php
FieldManager::TEXTAREA()
    ->setLabel('Description')
    ->setPlaceholder('Enter description')
    ->setRows(5)
```

### Rich Text Editor

```php
FieldManager::RICH_TEXT()
    ->setLabel('Content')
    ->setDefault('<p>Default content</p>')
```

### Number Field

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
    ->setDefault('')
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

### Repeater Field

```php
FieldManager::REPEATER()
    ->setLabel('Features')
    ->setFields([
        'title' => FieldManager::TEXT()->setLabel('Feature Title'),
        'description' => FieldManager::TEXTAREA()->setLabel('Description'),
        'icon' => FieldManager::ICON()->setLabel('Icon'),
    ])
```

---

## Style Controls

### Spacing Controls

```php
public function getStyleFields(): array
{
    $control = new ControlManager();
    
    $control->addGroup('spacing', 'Spacing')
        ->registerField('padding_top', FieldManager::NUMBER()
            ->setLabel('Padding Top')
            ->setDefault(20)
        )
        ->registerField('padding_bottom', FieldManager::NUMBER()
            ->setLabel('Padding Bottom')
            ->setDefault(20)
        )
        ->registerField('margin_top', FieldManager::NUMBER()
            ->setLabel('Margin Top')
            ->setDefault(0)
        )
        ->registerField('margin_bottom', FieldManager::NUMBER()
            ->setLabel('Margin Bottom')
            ->setDefault(0)
        )
        ->endGroup();
    
    return $control->getFields();
}
```

### Typography Controls

```php
$control->addGroup('typography', 'Typography')
    ->registerField('font_size', FieldManager::NUMBER()
        ->setLabel('Font Size')
        ->setDefault(16)
    )
    ->registerField('font_weight', FieldManager::SELECT()
        ->setLabel('Font Weight')
        ->setOptions([
            '300' => 'Light',
            '400' => 'Normal',
            '500' => 'Medium',
            '600' => 'Semi Bold',
            '700' => 'Bold',
        ])
        ->setDefault('400')
    )
    ->registerField('text_align', FieldManager::SELECT()
        ->setLabel('Text Align')
        ->setOptions([
            'left' => 'Left',
            'center' => 'Center',
            'right' => 'Right',
        ])
        ->setDefault('left')
    )
    ->endGroup();
```

### Border Controls

```php
$control->addGroup('border', 'Border')
    ->registerField('border_width', FieldManager::NUMBER()
        ->setLabel('Border Width')
        ->setDefault(0)
    )
    ->registerField('border_color', FieldManager::COLOR()
        ->setLabel('Border Color')
        ->setDefault('#000000')
    )
    ->registerField('border_radius', FieldManager::NUMBER()
        ->setLabel('Border Radius')
        ->setDefault(0)
    )
    ->endGroup();
```

---

## Migrating Legacy Addons

### Why Migrate?

Legacy addons (extending `PageBuilderBase` or `LegacyAddonAdapter`) have limitations:
- ❌ Harder to maintain
- ❌ Less flexible field system
- ❌ May have rendering issues
- ❌ Not portable across projects

**New widgets (extending `BaseWidget`) are:**
- ✅ Easier to maintain
- ✅ More flexible
- ✅ Better data structure
- ✅ Portable and reusable

### Migration Steps

#### Before (Legacy Addon)

```php
namespace Plugins\PageBuilder\Addons\Home;

use Plugins\PageBuilder\PageBuilderBase;

class HeroSection extends PageBuilderBase
{
    protected $addon_name = 'hero-section';
    protected $addon_title = 'Hero Section';
    
    public function admin_render()
    {
        $output = Text::get([
            'name' => 'title',
            'label' => 'Title',
        ]);
        
        $output .= Textarea::get([
            'name' => 'description',
            'label' => 'Description',
        ]);
        
        return $output;
    }
    
    public function frontend_render()
    {
        $settings = $this->get_settings();
        $title = $settings['title'] ?? '';
        $description = $settings['description'] ?? '';
        
        return view('pagebuilder::hero-section', compact('title', 'description'))->render();
    }
}
```

#### After (New Widget)

```php
namespace Plugins\PageBuilder\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class HeroSectionWidget extends BaseWidget
{
    protected string $addon_name = 'hero-section';
    protected string $addon_title = 'Hero Section';
    protected string $addon_description = 'Homepage hero section';
    protected string $icon = 'la-home';
    protected string $category = 'theme';
    
    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Content')
            ->registerField('title', FieldManager::TEXT()
                ->setLabel('Title')
                ->setPlaceholder('Enter title')
            )
            ->registerField('description', FieldManager::TEXTAREA()
                ->setLabel('Description')
                ->setPlaceholder('Enter description')
            )
            ->endGroup();
        
        return $control->getFields();
    }
    
    public function render(array $settings = []): string
    {
        $title = $settings['general']['content']['title'] ?? '';
        $description = $settings['general']['content']['description'] ?? '';
        
        return view('pagebuilder::widgets.hero-section', compact('title', 'description'))->render();
    }
}
```

### Field Type Mapping

| Legacy | New |
|--------|-----|
| `Text::get()` | `FieldManager::TEXT()` |
| `Textarea::get()` | `FieldManager::TEXTAREA()` |
| `Summernote::get()` | `FieldManager::RICH_TEXT()` |
| `Number::get()` | `FieldManager::NUMBER()` |
| `ColorPicker::get()` | `FieldManager::COLOR()` |
| `Image::get()` | `FieldManager::IMAGE()` |
| `Select::get()` | `FieldManager::SELECT()` |
| `Checkbox::get()` | `FieldManager::CHECKBOX()` |
| `IconPicker::get()` | `FieldManager::ICON()` |
| `Repeater::get()` | `FieldManager::REPEATER()` |

### Settings Data Structure

**Legacy:**
```php
$settings = [
    'title' => 'My Title',
    'description' => 'My Description',
];
```

**New:**
```php
$settings = [
    'general' => [
        'content' => [
            'title' => 'My Title',
            'description' => 'My Description',
        ],
    ],
    'style' => [
        'colors' => [
            'background_color' => '#ffffff',
        ],
    ],
];
```

---

## Best Practices

### 1. Use Descriptive Names

```php
// ❌ Bad
protected string $addon_name = 'widget1';

// ✅ Good
protected string $addon_name = 'call-to-action';
```

### 2. Group Related Fields

```php
$control->addGroup('content', 'Content')
    ->registerField('title', FieldManager::TEXT()->setLabel('Title'))
    ->registerField('description', FieldManager::TEXTAREA()->setLabel('Description'))
    ->endGroup();

$control->addGroup('button', 'Button Settings')
    ->registerField('button_text', FieldManager::TEXT()->setLabel('Button Text'))
    ->registerField('button_url', FieldManager::TEXT()->setLabel('Button URL'))
    ->endGroup();
```

### 3. Provide Default Values

```php
FieldManager::TEXT()
    ->setLabel('Title')
    ->setDefault('Default Title') // Always provide defaults
```

### 4. Use Placeholders

```php
FieldManager::TEXT()
    ->setLabel('Email')
    ->setPlaceholder('example@domain.com') // Help users understand expected format
```

### 5. Sanitize Output

```php
public function render(array $settings = []): string
{
    $title = e($settings['general']['content']['title'] ?? ''); // Escape HTML
    $description = strip_tags($settings['general']['content']['description'] ?? ''); // Remove tags
    
    return view('pagebuilder::widgets.my-widget', compact('title', 'description'))->render();
}
```

### 6. Handle Missing Data Gracefully

```php
// ✅ Good - Always provide fallback
$title = $settings['general']['content']['title'] ?? 'Default Title';

// ❌ Bad - May cause errors
$title = $settings['general']['content']['title'];
```

### 7. Use Blade Components

```blade
{{-- core/plugins/PageBuilder/views/widgets/call-to-action.blade.php --}}
<div class="cta-section">
    <div class="container">
        <h2>{{ $title }}</h2>
        <p>{{ $description }}</p>
        
        @if($buttonText && $buttonUrl)
            <a href="{{ $buttonUrl }}" class="btn btn-primary">
                {{ $buttonText }}
            </a>
        @endif
    </div>
</div>
```

### 8. Add Widget Categories

```php
protected string $category = 'marketing'; // Groups widgets in sidebar

// Available categories:
// - 'theme' - Theme-specific widgets
// - 'content' - Content widgets
// - 'media' - Media widgets
// - 'interactive' - Interactive widgets
// - 'marketing' - Marketing widgets
// - 'custom' - Custom widgets
```

### 9. Use Appropriate Icons

```php
protected string $icon = 'la-bullhorn'; // Line Awesome icon class

// Common icons:
// - 'la-home' - Home/Hero sections
// - 'la-image' - Image widgets
// - 'la-video' - Video widgets
// - 'la-star' - Features/Testimonials
// - 'la-code' - Code blocks
// - 'la-bullhorn' - Call to action
```

### 10. Test Widget Rendering

```bash
php artisan tinker

$page = \App\Models\Backend\Page::find(1);
$service = app(\Xgenious\PageBuilder\Services\PageBuilderRenderService::class);
echo $service->renderPage($page);
```

---

## Example: Complete Widget

Here's a complete example of a feature grid widget:

```php
// Plugins/PageBuilder/Widgets/FeatureGridWidget.php
namespace Plugins\PageBuilder\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class FeatureGridWidget extends BaseWidget
{
    protected string $addon_name = 'feature-grid';
    protected string $addon_title = 'Feature Grid';
    protected string $addon_description = 'Display features in a grid layout';
    protected string $icon = 'la-th';
    protected string $category = 'content';

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Content')
            ->registerField('heading', FieldManager::TEXT()
                ->setLabel('Section Heading')
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

    public function getStyleFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('layout', 'Layout')
            ->registerField('columns', FieldManager::SELECT()
                ->setLabel('Columns')
                ->setOptions([
                    '2' => '2 Columns',
                    '3' => '3 Columns',
                    '4' => '4 Columns',
                ])
                ->setDefault('3')
            )
            ->endGroup();
        
        $control->addGroup('colors', 'Colors')
            ->registerField('heading_color', FieldManager::COLOR()
                ->setLabel('Heading Color')
                ->setDefault('#212529')
            )
            ->registerField('icon_color', FieldManager::COLOR()
                ->setLabel('Icon Color')
                ->setDefault('#007bff')
            )
            ->endGroup();
        
        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $heading = $settings['general']['content']['heading'] ?? 'Our Features';
        $features = $settings['general']['content']['features'] ?? [];
        $columns = $settings['style']['layout']['columns'] ?? '3';
        $headingColor = $settings['style']['colors']['heading_color'] ?? '#212529';
        $iconColor = $settings['style']['colors']['icon_color'] ?? '#007bff';
        
        return view('pagebuilder::widgets.feature-grid', compact(
            'heading',
            'features',
            'columns',
            'headingColor',
            'iconColor'
        ))->render();
    }
}
```

```blade
{{-- core/plugins/PageBuilder/views/widgets/feature-grid.blade.php --}}
<div class="feature-grid">
    <h2 style="color: {{ $headingColor }};">{{ $heading }}</h2>
    
    <div class="row">
        @foreach($features as $feature)
            <div class="col-md-{{ 12 / $columns }}">
                <div class="feature-item">
                    <i class="las {{ $feature['icon'] ?? 'la-star' }}" 
                       style="color: {{ $iconColor }};"></i>
                    <h3>{{ $feature['title'] ?? '' }}</h3>
                    <p>{{ $feature['description'] ?? '' }}</p>
                </div>
            </div>
        @endforeach
    </div>
</div>
```

---

## Next Steps

- Create your first custom widget
- Test in the page builder editor
- Share widgets across projects
- Contribute widgets to the community

For more information, see [DOCUMENTATION.md](DOCUMENTATION.md).

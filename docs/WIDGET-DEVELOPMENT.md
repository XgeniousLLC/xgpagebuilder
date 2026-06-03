# Widget Development Guide

How to create custom widgets for XgPageBuilder.

---

## Table of Contents

1. [Widget Structure](#widget-structure)
2. [Minimal Widget Example](#minimal-widget-example)
3. [Real-World Example (Header with Slider)](#real-world-example-header-with-slider)
4. [Field Types Reference](#field-types-reference)
5. [Style Fields & CSS Generation](#style-fields--css-generation)
6. [Registering Widgets](#registering-widgets)
7. [Migrating Legacy Addons](#migrating-legacy-addons)

---

## Widget Structure

Every widget extends `BaseWidget` and implements three methods:

```php
namespace Plugins\PageBuilder\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\WidgetCategory;

class MyWidget extends BaseWidget
{
    protected function getWidgetType(): string        { return 'my_widget'; }
    protected function getWidgetName(): string        { return 'My Widget'; }
    protected function getWidgetIcon(): string|array  { return 'las la-star'; }  // format: 'las la-ICONNAME'
    protected function getWidgetDescription(): string { return 'A short description'; }
    protected function getCategory(): string          { return WidgetCategory::THEME; }
    protected function getWidgetTags(): array         { return ['my', 'widget']; }

    // Editor fields — General tab
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Content')
            ->registerField('title', FieldManager::TEXT()->setLabel('Title')->setDefault('Hello'))
            ->endGroup();

        return $control->getFields();
    }

    // Editor fields — Style tab (optional)
    public function getStyleFields(): array
    {
        return []; // return [] to hide the Style tab
    }

    // Frontend + editor preview render
    public function render(array $settings = []): string
    {
        $title = $settings['general']['content']['title'] ?? 'Hello';

        return view('pagebuilder::widgets.my-widget', compact('title'))->render();
        // 'pagebuilder::' is the namespace registered in AppServiceProvider via loadViewsFrom()
        // Use whatever namespace you registered — e.g. 'widgetbuilder::' is another common choice
    }
}
```

**Settings structure** inside `render()`:
```php
$settings = [
    'general' => [
        'group_key' => [
            'field_key' => 'value',
        ],
    ],
    'style' => [ ... ],
]
```

**Widget categories** (`WidgetCategory::*`):
`THEME`, `BASIC`, `CONTENT`, `MEDIA`, `INTERACTIVE`, `MARKETING`

---

## Minimal Widget Example

The simplest working widget:

```php
class SimpleCardWidget extends BaseWidget
{
    protected function getWidgetType(): string { return 'simple_card'; }
    protected function getWidgetName(): string { return 'Simple Card'; }
    protected function getWidgetIcon(): string|array { return 'las la-credit-card'; }  // format: 'las la-ICONNAME'
    protected function getCategory(): string   { return WidgetCategory::CONTENT; }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Content')
            ->registerField('title',       FieldManager::TEXT()->setLabel('Title')->setDefault('Card Title'))
            ->registerField('description', FieldManager::TEXTAREA()->setLabel('Description'))
            ->registerField('image',       FieldManager::IMAGE()->setLabel('Image'))
            ->registerField('link',        FieldManager::URL()->setLabel('Link URL')->setDefault('#'))
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array { return []; }

    public function render(array $settings = []): string
    {
        $content = $settings['general']['content'] ?? [];

        return view('pagebuilder::widgets.simple-card', [
            'title'       => $content['title']       ?? '',
            'description' => $content['description'] ?? '',
            'imageUrl'    => $this->resolveUrl($content['image'] ?? ''),
            'link'        => $this->resolveUrl($content['link']  ?? '#'),
        ])->render();
    }

    // IMAGE and VIDEO fields return arrays — extract the URL safely
    private function resolveUrl($value): string
    {
        return is_array($value) ? ($value['url'] ?? '') : (string)$value;
    }
}
```

> **Important:** `IMAGE` and `VIDEO` fields store an array `['url'=>'...', 'id'=>...]`, not a plain string.
> Always use a helper like `resolveUrl()` above to extract the URL.

---

## Real-World Example (Header with Slider)

A production widget with background media, CTA buttons, REPEATER images, TOGGLE, DIMENSION, and a JS slider.

```php
// core/plugins/WidgetBuilder/Widgets/landlord/Header/HeaderOne.php
namespace Plugins\WidgetBuilder\Widgets\landlord\Header;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\WidgetCategory;

class HeaderOne extends BaseWidget
{
    protected function getWidgetType(): string        { return 'header_one'; }
    protected function getWidgetName(): string        { return 'Header One'; }
    protected function getWidgetIcon(): string|array  { return 'las la-heading'; }
    protected function getCategory(): string          { return WidgetCategory::THEME; }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Content')
            ->registerField('title', FieldManager::TEXT()
                ->setLabel('Title')
                ->setDefault('Build Your <span class="highlighted-text">E-Commerce</span> Store Within Minutes')
                ->setDescription('Wrap text in <span class="highlighted-text">...</span> to highlight it')
            )
            ->registerField('subtitle', FieldManager::TEXT()
                ->setLabel('Subtitle')
                ->setDefault('Try Now. No credit card required.')
            )
            ->endGroup();

        $control->addGroup('buttons', 'Buttons')
            ->registerField('primary_button_text', FieldManager::TEXT()->setLabel('Primary Button Text')->setDefault('Start Free Trial'))
            ->registerField('primary_button_url',  FieldManager::TEXT()->setLabel('Primary Button URL')->setDefault('#'))
            ->registerField('secondary_button_text', FieldManager::TEXT()->setLabel('Secondary Button Text')->setDefault('Watch Demo'))
            ->registerField('secondary_button_url',  FieldManager::TEXT()->setLabel('Secondary Button URL')->setDefault('#'))
            ->endGroup();

        $control->addGroup('background', 'Background')
            ->registerField('background_image', FieldManager::IMAGE()->setLabel('Background Image'))
            ->registerField('background_video', FieldManager::VIDEO()->setLabel('Background Video')->setDescription('Replaces background image if set'))
            ->endGroup();

        $control->addGroup('showcase', 'Showcase Slider')
            ->registerField('showcase_images', FieldManager::REPEATER()
                ->setLabel('Showcase Images')
                ->setMin(1)
                ->setMax(20)
                ->setFields([
                    'image' => FieldManager::IMAGE()->setLabel('Image')->setRequired(true),
                ])
            )
            ->endGroup();

        $control->addGroup('slider_settings', 'Slider Settings')
            ->registerField('autoplay',        FieldManager::TOGGLE()->setLabel('Auto Play')->setDefault(true))
            ->registerField('autoplay_speed',  FieldManager::NUMBER()->setLabel('Auto Play Speed (ms)')->setDefault(4000)->setMin(1000)->setMax(15000)->setStep(500))
            ->registerField('transition_speed', FieldManager::NUMBER()->setLabel('Transition Speed (ms)')->setDefault(500)->setMin(200)->setMax(2000)->setStep(100))
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('section_style', 'Section')
            ->registerField('section_margin', FieldManager::DIMENSION()
                ->setLabel('Margin')
                ->setSides(['top', 'bottom'])
                ->asMargin()
                ->setDefault(['top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'unit' => 'px'])
                ->setLinked(true)
                ->setAllowNegative(false)
                ->setSelectors(['{{WRAPPER}} .header_one_container_outer'])
            )
            ->endGroup();

        return $control->getFields();
    }

    private function resolveUrl($value): string
    {
        return is_array($value) ? ($value['url'] ?? '') : (string)$value;
    }

    public function render(array $settings = []): string
    {
        $general        = $settings['general'] ?? [];
        $content        = $general['content'] ?? [];
        $buttons        = $general['buttons'] ?? [];
        $bg             = $general['background'] ?? [];
        $showcase       = $general['showcase'] ?? [];
        $sliderSettings = $general['slider_settings'] ?? [];

        $images = [];
        foreach ($showcase['showcase_images'] ?? [] as $item) {
            $url = $this->resolveUrl($item['image'] ?? '');
            if ($url) $images[] = $url;
        }

        return view('widgetbuilder::landlord.header.header_one', [
            'uid'              => 'ho_' . uniqid(),   // unique ID for slider JS
            'title'            => $content['title']    ?? '',
            'subtitle'         => $content['subtitle'] ?? '',
            'primaryBtnText'   => $buttons['primary_button_text']   ?? 'Start Free Trial',
            'primaryBtnUrl'    => $buttons['primary_button_url']    ?? '#',
            'secondaryBtnText' => $buttons['secondary_button_text'] ?? 'Watch Demo',
            'secondaryBtnUrl'  => $buttons['secondary_button_url']  ?? '#',
            'bgImage'          => $this->resolveUrl($bg['background_image'] ?? ''),
            'bgVideo'          => $this->resolveUrl($bg['background_video'] ?? ''),
            'images'           => $images,
            'autoplay'         => (bool)($sliderSettings['autoplay'] ?? true),
            'autoplaySpeed'    => (int)($sliderSettings['autoplay_speed'] ?? 4000),
            'transitionSpeed'  => (int)($sliderSettings['transition_speed'] ?? 500),
        ])->render();
    }
}
```

**Blade view** (`views/landlord/header/header_one.blade.php`):

```blade
{{--
  Inline <style> block — scoped to #{{ $uid }}.
  Use this for layout / colour values passed from render().
  For user-configurable spacing/style values, use getStyleFields() instead.
--}}
<style>
    #{{ $uid }} .header_one_container_outer { padding-top: 80px; padding-bottom: 80px; }
</style>

<section id="{{ $uid }}" class="header__one_section_wrapper">
    <div class="relative overflow-hidden w-full">

        {{-- Background --}}
        <div class="absolute inset-0 -z-1">
            @if(!empty($bgVideo))
                <video class="w-full h-full object-cover" autoplay muted loop>
                    <source src="{{ $bgVideo }}" type="video/mp4">
                </video>
            @elseif(!empty($bgImage))
                <img src="{{ $bgImage }}" class="w-full h-full object-cover" alt="">
            @endif
            <div class="absolute inset-0 bg-gradient-to-br from-black/30 to-black"></div>
        </div>

        {{-- Hero content --}}
        <div class="header_one_container_outer container mx-auto px-4 flex flex-col items-center relative z-10">
            <h1 class="text-white font-bold text-center">{!! $title !!}</h1>
            <div class="flex gap-6 mt-8">
                <a href="{{ $primaryBtnUrl }}" class="secondary-btn">{{ $primaryBtnText }}</a>
                <a href="{{ $secondaryBtnUrl }}" class="primary-btn">{{ $secondaryBtnText }}</a>
            </div>
            <span class="mt-6">{{ $subtitle }}</span>
        </div>

        {{-- Owl Carousel slider --}}
        @if(!empty($images))
            <div class="slider-wrap">
                <div class="owl-carousel"
                     data-autoplay="{{ $autoplay ? 'true' : 'false' }}"
                     data-speed="{{ $autoplaySpeed }}"
                     data-transition="{{ $transitionSpeed }}">
                    @foreach($images as $image)
                        <div><img class="w-full h-full object-fill" src="{{ $image }}" alt=""></div>
                    @endforeach
                </div>
            </div>
        @endif

    </div>
</section>
```

> **`uid`** — `'uid' => 'ho_' . uniqid()` in `render()` gives each widget instance a unique HTML ID. Scope inline `<style>` rules to `#{{ $uid }}` so multiple instances on the same page don't clash.

---

## Field Types Reference

All fields are created via `FieldManager::*()` and chained with options.

### Text

```php
FieldManager::TEXT()
    ->setLabel('Title')
    ->setPlaceholder('Enter title')
    ->setDefault('Default value')
    ->setRequired(true)
```

### Textarea

```php
FieldManager::TEXTAREA()
    ->setLabel('Description')
    ->setRows(4)
    ->setDefault('Default text')
```

### WYSIWYG (Rich Text Editor)

```php
FieldManager::WYSIWYG()
    ->setLabel('Content')
    ->setDefault('<p>Default content</p>')
```

### Number

```php
FieldManager::NUMBER()
    ->setLabel('Speed (ms)')
    ->setMin(100)
    ->setMax(10000)
    ->setStep(100)
    ->setDefault(500)
```

### Toggle (Switch)

Boolean on/off switch.

```php
FieldManager::TOGGLE()
    ->setLabel('Auto Play')
    ->setDefault(true)
```

Value in `render()` is a plain `bool`:
```php
$autoplay = (bool)($settings['general']['group']['autoplay'] ?? true);
```

### Select

```php
FieldManager::SELECT()
    ->setLabel('Alignment')
    ->setOptions([
        'left'   => 'Left',
        'center' => 'Center',
        'right'  => 'Right',
    ])
    ->setDefault('center')
```

### Multi-Select

```php
FieldManager::MULTISELECT()
    ->setLabel('Tags')
    ->setOptions(['php' => 'PHP', 'js' => 'JavaScript'])
    ->setDefault(['php'])
```

### Radio

```php
FieldManager::RADIO()
    ->setLabel('Layout')
    ->setOptions(['grid' => 'Grid', 'list' => 'List'])
    ->setDefault('grid')
```

### Checkbox

```php
FieldManager::CHECKBOX()
    ->setLabel('Show Icon')
    ->setDefault(true)
```

### Range Slider

```php
FieldManager::RANGE()
    ->setLabel('Opacity')
    ->setMin(0)
    ->setMax(100)
    ->setStep(5)
    ->setDefault(100)
```

### Color

```php
FieldManager::COLOR()
    ->setLabel('Text Color')
    ->setDefault('#ffffff')
```

### Image

Returns an **array** — use `$value['url']` to get the URL.

```php
FieldManager::IMAGE()
    ->setLabel('Featured Image')
    ->setRequired(false)
```

```php
// In render() — IMAGE returns ['url'=>'...', 'id'=>...]
$imageUrl = $settings['general']['content']['image']['url'] ?? '';
```

### Video

Returns an **array** — use `$value['url']` to get the URL.

```php
FieldManager::VIDEO()
    ->setLabel('Demo Video')
    ->setDescription('MP4 or WebM, max 100 MB')
    ->setAllowedTypes(['video/mp4', 'video/webm'])
    ->setMaxSize(104857600)   // bytes (100 MB)
    ->setControls(true)
    ->setAutoplay(false)
    ->setMuted(false)
    ->setLoop(false)
    ->setPreload('metadata')  // 'auto' | 'metadata' | 'none'
    ->setAllowPoster(true)
```

```php
// In render() — VIDEO returns ['url'=>'...', 'poster'=>'...', 'mime_type'=>'...', ...]
$videoUrl  = $settings['general']['media']['video']['url']    ?? '';
$posterUrl = $settings['general']['media']['video']['poster'] ?? '';
```

```blade
@if($videoUrl)
    <video src="{{ $videoUrl }}" poster="{{ $posterUrl }}" controls preload="metadata">
        Your browser does not support video.
    </video>
@endif
```

### URL / Link

```php
FieldManager::URL()
    ->setLabel('Button URL')
    ->setDefault('#')
```

Variant helpers (same field, different defaults/labels):
`URL()`, `ENHANCED_URL()`, `WEB_LINK()`, `EMAIL_LINK()`, `PHONE_LINK()`, `DOWNLOAD_LINK()`, `INTERNAL_LINK()`

### Icon

```php
FieldManager::ICON()
    ->setLabel('Icon')
    ->setDefaultIcon('las la-star')
    ->setAllowEmpty(true)
```

(`ICON_INPUT()` is an alias for `ICON()`.)

### Repeater

```php
FieldManager::REPEATER()
    ->setLabel('Features')
    ->setMin(1)
    ->setMax(10)
    ->setAddButtonText('Add Feature')
    ->setFields([
        'icon'        => FieldManager::ICON()->setLabel('Icon'),
        'title'       => FieldManager::TEXT()->setLabel('Title'),
        'description' => FieldManager::TEXTAREA()->setLabel('Description'),
    ])
```

```php
// In render() — repeater returns an array of items
foreach ($settings['general']['content']['features'] ?? [] as $item) {
    $title = $item['title'] ?? '';
    $icon  = $item['icon']  ?? '';
}
```

### Dimension (Margin / Padding)

Used in `getStyleFields()` to bind spacing to a CSS selector. CSS is auto-generated.

```php
FieldManager::DIMENSION()
    ->setLabel('Padding')
    ->setSides(['top', 'right', 'bottom', 'left'])  // which sides to show
    ->asPadding()                                    // or ->asMargin()
    ->setDefault(['top'=>'20','right'=>'20','bottom'=>'20','left'=>'20','unit'=>'px'])
    ->setLinked(false)          // true = lock all sides together
    ->setAllowNegative(false)
    ->setSelectors(['{{WRAPPER}} .my-section'])  // {{WRAPPER}} = .pb-widget-{id}
```

### Gradient

```php
FieldManager::GRADIENT()
    ->setLabel('Background Gradient')
```

### Alignment

```php
FieldManager::ALIGNMENT()
    ->setLabel('Text Alignment')
    ->setDefault('center')
```

### Pre-built Group Fields

These bundle multiple related controls into one field:

```php
FieldManager::BACKGROUND_GROUP()  // background color, image, gradient, position, size
FieldManager::TYPOGRAPHY_GROUP()  // font family, size, weight, line-height, letter-spacing
FieldManager::BORDER_SHADOW_GROUP() // border width/color/radius + box shadow
```

---

## Style Fields & CSS Generation

Fields registered in `getStyleFields()` with `.setSelectors([...])` automatically generate CSS.

`{{WRAPPER}}` in the selector is replaced with `.pb-widget-{widgetId}` so each widget instance is isolated.

```php
public function getStyleFields(): array
{
    $control = new ControlManager();

    $control->addGroup('section', 'Section')
        ->registerField('margin', FieldManager::DIMENSION()
            ->setLabel('Margin')
            ->setSides(['top', 'bottom'])
            ->asMargin()
            ->setDefault(['top'=>'0','right'=>'0','bottom'=>'0','left'=>'0','unit'=>'px'])
            ->setLinked(true)
            ->setSelectors(['{{WRAPPER}} .my-outer-class'])
        )
        ->registerField('bg_color', FieldManager::COLOR()
            ->setLabel('Background Color')
            ->setDefault('#ffffff')
            ->setSelectors(['{{WRAPPER}} .my-outer-class' => 'background-color: {{VALUE}};'])
        )
        ->endGroup();

    return $control->getFields();
}
```

Generated output (per widget instance):
```css
.pb-widget-abc123 .my-outer-class {
    margin-top: 40px;
    margin-bottom: 40px;
    background-color: #f5f5f5;
}
```

Responsive breakpoints are handled automatically when users set values per device (Desktop / Tablet / Mobile) in the editor.

---

## Registering Widgets

```php
// config/xgpagebuilder.php
'custom_widgets' => [
    \Plugins\PageBuilder\Widgets\MyWidget::class,
    \Plugins\PageBuilder\Widgets\AnotherWidget::class,
],
```

```bash
php artisan config:clear
```

To auto-discover widgets from a folder, add a path:
```php
'widget_paths' => [
    [
        'path'      => base_path('plugins/PageBuilder/Widgets'),  // filesystem path (lowercase 'plugins')
        'namespace' => 'Plugins\\PageBuilder\\Widgets',           // PHP namespace (uppercase 'Plugins')
    ],
],
```

> **Path casing:** use lowercase `plugins/` for filesystem paths and uppercase `Plugins\` for PHP namespaces. These are different things — the namespace must match your class declarations exactly.

### Register the widget view namespace

Widget `render()` methods use `view('pagebuilder::...')`. Register the namespace in `AppServiceProvider`:

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    $this->loadViewsFrom(base_path('plugins/PageBuilder/views'), 'pagebuilder');
}
```

Adjust the path to wherever your widget blade files live.

You can use any namespace name — `'pagebuilder'`, `'widgetbuilder'`, etc. Just use the same name consistently in your widget `render()` calls:

```php
// registered as 'pagebuilder' → use 'pagebuilder::'
return view('pagebuilder::widgets.my-widget', [...])->render();

// registered as 'widgetbuilder' → use 'widgetbuilder::'
return view('widgetbuilder::landlord.header.header_one', [...])->render();
```

---

## Migrating Legacy Addons

### Before (Legacy)

```php
class HeroSection extends PageBuilderBase
{
    protected $addon_name  = 'hero-section';
    protected $addon_title = 'Hero Section';

    public function admin_render()
    {
        return Text::get(['name' => 'title', 'label' => 'Title'])
             . Textarea::get(['name' => 'description', 'label' => 'Description']);
    }

    public function frontend_render()
    {
        $settings = $this->get_settings();
        return view('pagebuilder::hero-section', $settings)->render();
    }
}
```

### After (New)

```php
class HeroSectionWidget extends BaseWidget
{
    protected function getWidgetType(): string       { return 'hero-section'; }
    protected function getWidgetName(): string       { return 'Hero Section'; }
    protected function getWidgetIcon(): string|array { return 'las la-rocket'; }
    protected function getCategory(): string         { return WidgetCategory::THEME; }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Content')
            ->registerField('title',       FieldManager::TEXT()->setLabel('Title'))
            ->registerField('description', FieldManager::TEXTAREA()->setLabel('Description'))
            ->endGroup();

        return $control->getFields();
    }

    // Required — return [] to hide the Style tab, or add DIMENSION/COLOR fields for user styling
    public function getStyleFields(): array { return []; }

    public function render(array $settings = []): string
    {
        $content = $settings['general']['content'] ?? [];
        return view('pagebuilder::widgets.hero-section', [
            'title'       => $content['title']       ?? '',
            'description' => $content['description'] ?? '',
        ])->render();
    }
}
```

### Field type mapping

| Legacy | New |
|--------|-----|
| `Text::get()` | `FieldManager::TEXT()` |
| `Textarea::get()` | `FieldManager::TEXTAREA()` |
| `Summernote::get()` | `FieldManager::WYSIWYG()` |
| `Number::get()` | `FieldManager::NUMBER()` |
| `ColorPicker::get()` | `FieldManager::COLOR()` |
| `Image::get()` | `FieldManager::IMAGE()` |
| `Video::get()` | `FieldManager::VIDEO()` |
| `Select::get()` | `FieldManager::SELECT()` |
| `Checkbox::get()` | `FieldManager::CHECKBOX()` |
| `IconPicker::get()` | `FieldManager::ICON()` |
| `Repeater::get()` | `FieldManager::REPEATER()` |

### Settings structure change

```php
// Legacy
$settings['title']

// New — grouped by tab > group > field
$settings['general']['content']['title']
$settings['style']['colors']['background_color']
```

---

For frontend rendering, see [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md).
For installation, see [DOCUMENTATION.md](DOCUMENTATION.md).

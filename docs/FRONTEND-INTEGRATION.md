# Frontend Integration Guide

How the editor and public pages work — assets, CSS, JS, media, and rendering.

---

## Table of Contents

1. [How It Works (Overview)](#how-it-works-overview)
2. [Asset Build & Publish](#asset-build--publish)
3. [Editor Loading](#editor-loading)
4. [Rendering on Public Pages](#rendering-on-public-pages)
5. [How CSS Works](#how-css-works)
6. [Loading Widget JavaScript (Sliders, Carousels)](#loading-widget-javascript-sliders-carousels)
7. [Host App CSS in the Editor](#host-app-css-in-the-editor)
8. [CSS Variables (Design Tokens)](#css-variables-design-tokens)
9. [Media Library](#media-library)
10. [Responsive Device Modes](#responsive-device-modes)
11. [Widget CSS: Two Approaches](#widget-css-two-approaches)
12. [Extending the Render Service](#extending-the-render-service)
13. [Concurrent Editing Sessions](#concurrent-editing-sessions)
14. [Demo Mode](#demo-mode)

---

## How It Works (Overview)

```
EDITOR (admin)
  editor.blade.php
  ├── reads manifest.json → loads hashed CSS + JS bundle
  ├── injects window.pageBuilderData (page, content, routes, media config)
  ├── loads host app CSS scoped to .page-builder-canvas
  ├── loads host app JS (plugin.js, jQuery, etc.)
  └── <div id="page-builder-root"> ← React app mounts here

  React app: WidgetPanel + Canvas (drag-drop) + SettingsPanel
  Style changes → POST /api/page-builder/css/generate → live CSS injection
  Save → POST /api/page-builder/save

FRONTEND (public)
  Controller:
    $result = app(PageBuilderRenderService::class)->renderPage($page, true)
    $page->rendered_content             = $result['html']
    $page->pagebuilder_generated_styles = $result['css']

  PageBuilderRenderService::renderPage($page, true)
  ├── loops containers → sections
  ├── loops columns
  ├── loops widgets → $widget->render($settings) → HTML
  │                 → $widget->generateCSS($id, $settings) → CSS
  └── returns ['html' => '...', 'css' => '...']

  Blade: @if($page->page_builder_status === 'on')
    <style>{!! $page->pagebuilder_generated_styles !!}</style>
    {!! $page->rendered_content !!}
```

---

## Asset Build & Publish

The editor is a **pre-built React app** — you don't need Node.js in your host app.

```bash
# Publish the pre-built assets to your host app's public/ folder
php artisan vendor:publish --tag=page-builder-assets
```

Assets land at:
```
public/assets/vendor/page-builder/
├── .vite/manifest.json
└── assets/
    ├── page-builder-standalone.[hash].js
    └── page-builder-standalone.[hash].css
```

The editor blade reads `manifest.json` at runtime to load the correct hashed filenames automatically.

**If you need to rebuild** (only needed when modifying package source):
```bash
cd vendor/xgenious/xgpagebuilder
npm install && npm run build
php artisan vendor:publish --tag=page-builder-assets --force
```

---

## Editor Loading

**Route:** `GET /{route_prefix}/edit/{pageId}`

On page load, `editor.blade.php` injects `window.pageBuilderData`:

```javascript
window.pageBuilderData = {
    page:      { id: 1, title: "Home", slug: "home" },
    content:   { containers: [...] },  // current saved JSON
    contentId: 5,
    apiUrl:    "https://yourapp.com/api/page-builder",
    routes: {
        preview:     "/home",           // "Preview" button
        backToPages: "/admin/pages"     // "Back" button
    },
    config: {
        media: {
            uploadUrl:    "/admin/upload/media",
            libraryUrl:   "/admin/upload/media/all",
            allowedTypes: ["image/jpeg", "image/png", ...],
            maxSize:      5242880
        }
    }
};
```

React reads this on mount and initialises the editor state.

---

## Rendering on Public Pages

### Controller

Attach the output to the page model, then pass the model to the view:

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

> Always pass `true` as the second argument. Without it, `CSSManager` does not collect CSS and all style-field values (spacing, colors, layout) are silently dropped.

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

Two separate flags control output:

| Flag | Where set | Purpose |
|------|-----------|---------|
| `use_page_builder` | Page model / admin toggle | Triggers `renderPage()` in the controller |
| `page_builder_status` | Page model / admin toggle | Gates display in the blade (`'on'` = show builder content) |

### Render service methods

| Method | Use when |
|--------|----------|
| `renderPage($page, true)` | You have a Page model |
| `renderPageBuilderContent($content)` | You have a PageBuilderContent model |
| `renderPageContent(array $json)` | You have the raw JSON array |
| `renderFromJson(string $json)` | You have the JSON as a string |

All return `['html' => '...', 'css' => '...']`.

### HTML structure

```html
<section class="pb-section pb-section-{id} section-layout-boxed">
  <div class="section-inner">
    <div class="xgp_row">
      <div class="pb-column pb-column-{id} xgp_column xgp_col_6">
        <div id="{id}" class="{id} xgp-widget xgp-widget-header_one">
          <!-- your widget's render() output -->
        </div>
      </div>
    </div>
  </div>
</section>
```

Column grid is 12-column: `xgp_col_6` = half, `xgp_col_12` = full.

---

## How CSS Works

CSS has three layers, all merged into one `<style>` block.

### Layer 1 — Widget style fields

Fields in `getStyleFields()` with `.setSelectors([...])` auto-generate CSS.
`{{WRAPPER}}` is replaced with `.pb-widget-{widgetId}` — each instance is isolated.

```php
FieldManager::DIMENSION()
    ->setSelectors(['{{WRAPPER}} .my-section'])
```

Generated:
```css
.pb-widget-abc123 .my-section {
    margin-top: 40px;
    margin-bottom: 40px;
}
```

### Layer 2 — Section & column CSS

Auto-generated from section and column settings (padding, background, borders, flex layout).

### Layer 3 — Consolidated output

`CSSManager` collects all CSS during render and outputs it once, deduplicated:

```php
$result['css']  // → one string, ready for <style>{!! $css !!}</style>
```

### Live CSS in the editor

When a style field changes in the editor:
```
POST /api/page-builder/css/generate  { widgetId, widgetType, settings }
→ returns CSS string
→ injected into <style id="page-builder-dynamic-styles"> immediately
```
Changes are visible in the canvas in real time, without saving.

---

## Loading Widget JavaScript (Sliders, Carousels)

Widgets that need JS (sliders, accordions, tabs) work through **your host app's existing JS bundle**.

### Step 1 — Register your bundle

```php
// config/xgpagebuilder.php
'editor_frontend_js' => [
    'assets/frontend/website/js/plugin.js',   // jQuery + all plugin initialisers
],
```

This file is loaded inside the editor canvas **and** should also be included on your frontend pages.

### Step 2 — Output data attributes in the widget blade view

```blade
<div id="{{ $uid }}" class="slider-wrap">
    <div class="owl-carousel"
         data-autoplay="{{ $autoplay ? 'true' : 'false' }}"
         data-speed="{{ $autoplaySpeed }}"
         data-transition="{{ $transitionSpeed }}">
        @foreach($images as $image)
            <div><img src="{{ $image }}" alt=""></div>
        @endforeach
    </div>
</div>
```

### Step 3 — Initialise from plugin.js

```javascript
// assets/frontend/website/js/plugin.js
$(document).ready(function () {
    $('.owl-carousel').each(function () {
        var $el = $(this);
        $el.owlCarousel({
            loop:            true,
            autoplay:        $el.data('autoplay') === 'true',
            autoplayTimeout: parseInt($el.data('speed'))      || 4000,
            smartSpeed:      parseInt($el.data('transition')) || 500,
            items:           1,
        });
    });
});
```

### Why `uid`?

Passing `'uid' => 'prefix_' . uniqid()` from `render()` gives each widget instance its own
unique HTML `id`. Multiple sliders on the same page can be targeted independently.

---

## Host App CSS in the Editor

The editor canvas shows your theme styles so the edit preview matches the real frontend.

Register your CSS files:
```php
// config/xgpagebuilder.php
'editor_frontend_css' => [
    'assets/frontend/css/bootstrap.css',
    'assets/frontend/css/theme.css',
],
```

The editor automatically:
1. Fetches each CSS file via `fetch()`
2. Rewrites all `url(...)` paths to absolute URLs (fonts and images resolve correctly)
3. Scopes every rule to `.page-builder-canvas` so editor UI is never affected
   - `h1 { ... }` → `.page-builder-canvas h1 { ... }`
   - `:root { ... }` → `.page-builder-canvas { ... }`
4. Injects the result as a `<style>` tag

---

## CSS Variables (Design Tokens)

If your theme uses CSS custom properties (`--primary-color`, `--font-size-base`, etc.),
expose them via a blade partial:

```php
// config/xgpagebuilder.php
'editor_css_variables_view' => 'admin.partials.css-variables',
```

```blade
{{-- resources/views/admin/partials/css-variables.blade.php --}}
<style>
    :root {
        --primary-color: {{ get_static_option('primary_color') ?? '#6366f1' }};
        --font-family:   'Inter', sans-serif;
    }
</style>
```

---

## Media Library

The package reuses your host app's media upload routes.

**Required routes in your host app:**

```php
Route::post  ('/admin/upload/media',        [MediaController::class, 'upload'])->name('admin.upload.media.file');
Route::get   ('/admin/upload/media/all',    [MediaController::class, 'index']) ->name('admin.upload.media.file.all');
Route::delete('/admin/upload/media/{id}',   [MediaController::class, 'delete'])->name('admin.upload.media.file.delete');
```

**IMAGE and VIDEO fields return arrays, not plain strings:**

```php
// Stored value for IMAGE or VIDEO
['id' => 12, 'url' => 'https://…/photo.jpg', 'poster' => '…', 'mime_type' => '…']

// Always extract the URL safely in render()
private function resolveUrl($value): string
{
    return is_array($value) ? ($value['url'] ?? '') : (string)$value;
}
```

---

## Responsive Device Modes

The editor has three device preview modes:

| Mode    | Canvas width | Generated CSS breakpoint |
|---------|-------------|--------------------------|
| Desktop | 100%        | *(no media query)*        |
| Tablet  | 768px       | `@media (max-width: 1024px)` |
| Mobile  | 375px       | `@media (max-width: 768px)` |

Style fields that support per-device values store them separately.
CSS is wrapped in the correct `@media` block automatically.

---

## Widget CSS: Two Approaches

Widgets can output CSS in two complementary ways. Use both together in production widgets.

### 1 — Inline `<style>` block (structural / fixed CSS)

Put static CSS at the top of the blade view, scoped to a `uid`-prefixed ID. This is the right place for layout, typography, and colour values that come from `render()` settings:

```blade
{{-- header_one.blade.php --}}
<style>
    #{{ $uid }} .hs-section      { background-color: {{ $bgColor }}; }
    #{{ $uid }} .hs-section h1   { color: {{ $textColor }}; font-size: {{ $fontSize }}px; }
</style>

<section id="{{ $uid }}" class="hs-section">
    <h1>{!! $title !!}</h1>
</section>
```

This is fast and keeps each widget instance isolated via `$uid`.

### 2 — `getStyleFields()` (user-configurable spacing / style tab)

Fields in `getStyleFields()` with `.setSelectors()` produce CSS through `CSSManager`. This CSS lands in `$page->pagebuilder_generated_styles` and is output **once** in the blade `<style>` block — not repeated per widget.

```php
public function getStyleFields(): array
{
    $control = new ControlManager();

    $control->addGroup('section', 'Section')
        ->registerField('margin', FieldManager::DIMENSION()
            ->setLabel('Margin')
            ->setSides(['top', 'bottom'])->asMargin()
            ->setDefault(['top'=>'0','right'=>'0','bottom'=>'0','left'=>'0','unit'=>'px'])
            ->setSelectors(['{{WRAPPER}} .hs-section'])
        )
        ->endGroup();

    return $control->getFields();
}
```

`{{WRAPPER}}` is replaced with `.pb-widget-{widgetId}` — each instance is still isolated.

**Rule of thumb:** use inline blade CSS for values you control in `render()`; use `getStyleFields()` for values the editor user controls in the Style tab.

---

## Extending the Render Service

If you need to fix or augment rendering (e.g. column widths saved as percentages instead of integers), extend `PageBuilderRenderService`:

```php
// app/Services/CustomPageBuilderRenderService.php
namespace App\Services;

use Xgenious\PageBuilder\Services\PageBuilderRenderService;

class CustomPageBuilderRenderService extends PageBuilderRenderService
{
    public function renderPage($page, bool $css = false): array
    {
        $result   = parent::renderPage($page, true);
        $extraCss = $this->generateExtraFixes($page);
        $result['css'] .= $extraCss;

        return $css ? $result : ['html' => $result['html'], 'css' => ''];
    }

    private function generateExtraFixes($page): string
    {
        // parse page JSON, build any extra CSS rules needed
        return '';
    }
}
```

Bind it in `AppServiceProvider`:

```php
$this->app->bind(
    \Xgenious\PageBuilder\Services\PageBuilderRenderService::class,
    \App\Services\CustomPageBuilderRenderService::class,
);
```

`app(PageBuilderRenderService::class)` resolves your subclass everywhere, including the editor's CSS-generate API.

---

## Concurrent Editing Sessions

Prevents two admins from overwriting each other.

When the editor opens → session claimed → heartbeat every 30 s → released on close.
If another session is active, a modal appears: _"User X is editing this page."_

```php
// config/xgpagebuilder.php
'editing_sessions' => [
    'enabled'            => true,
    'timeout'            => 300,   // seconds until session auto-expires
    'heartbeat_interval' => 30,
],
```

---

## Demo Mode

Blocks all saves, shows a "Demo Mode — View Only" ribbon. Useful for live demos.

```php
// config/xgpagebuilder.php
'demo_mode' => env('PAGE_BUILDER_DEMO_MODE', false),
```

```env
PAGE_BUILDER_DEMO_MODE=true
```

All `POST /api/page-builder/*` requests are intercepted client-side and a toastr warning
is shown instead of saving. No real error reaches the React app.

---

For creating widgets, see [WIDGET-DEVELOPMENT.md](WIDGET-DEVELOPMENT.md).
For installation and configuration, see [DOCUMENTATION.md](DOCUMENTATION.md).

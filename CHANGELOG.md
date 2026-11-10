# Changelog

All notable changes to the Laravel Page Builder package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.2] - 2026-11-10

### Fixed
- Blade-backed widgets now resolve templates from the package's `page-builder::` view namespace first, then host-app (`widgets.*`) and legacy (`pagebuilder::widgets.*`) namespaces. Fixes Header/Features rendering "no blade template found for widget: ...".
- FeaturesWidget no longer reports the wrong widget name in its fallback message.

## [1.9.1] - 2026-11-10

### Added
- `central_domains` and `context_excluded_widget_namespaces` config keys. Host apps can hide widget namespaces per editor context (both default to empty/opt-in).

### Fixed
- The widget API now filters widgets by editor context. The landlord/central panel no longer receives tenant/site widgets, and tenant panels no longer receive landlord-only widgets. Context is determined from the request host against `central_domains` (falling back to `tenancy.central_domains`).

## [1.9.0] - 2026-11-10

### Added
- `GET /api/page-builder/widgets/{type}/thumbnail` endpoint — renders a widget with its default settings and returns the HTML/CSS for a sidebar preview. Results are cached server-side (12 hours; failures cached briefly) so browsing the panel does not re-run widget queries.
- Visual widget previews in the editor sidebar: scaled live renders, lazy-loaded with `IntersectionObserver`, with the existing icon as a graceful fallback.
- Visual wireframe previews for section layouts in the Sections tab.

### Changed
- The drag overlay now uses the lite widget formatter. It previously called `formatWidgetsForReact()`, which fetched field defaults for every widget on each drag.
- `widgetService` now caches the widget list, field definitions, and defaults, and de-duplicates in-flight requests.
- `PhpWidgetRenderer` only re-renders when the widget's settings actually change, not on every parent/store update.

### Fixed
- Dragging a widget no longer fires hundreds of HTTP requests (previously 3 per widget — roughly 540 calls per drag with 180 widgets).

## [1.8.0] - 2026-10-21

### Added
- Laravel 13 support (`illuminate/*` `^13.0`, Testbench `^11`).

## [1.7.1] - 2026-06-03

### Fixed
- **Critical:** Fixed typo `$reurn_data` → `$return_data` in `PageBuilderRenderService::renderPage()` that caused an "Undefined variable" runtime error on every page render
- **Critical:** Removed malformed import `use Illuminate\Support\FacadesLog` (missing backslash) in `PageBuilderController` that prevented the controller from loading
- Fixed `renderPageBuilderContent()` being called twice per render in `renderPage()` — the full widget and CSS pipeline was executing redundantly on every request

### Changed
- `renderPage()` return type annotation updated from `mixed` to `array` to accurately reflect the actual return value

### Documentation
- **README:** Rewrote installation section with all 6 required steps in correct order; fixed widget example from legacy `$addon_name` property pattern to correct `getWidgetType()` method pattern; fixed controller/blade examples to use `renderPage($page, true)` with `page_builder_status` check
- **installation.md:** Added `page_builder_status` column (required alongside `use_page_builder`); added Step 7 for registering widget view namespace in `AppServiceProvider`; fixed controller and blade examples; corrected step order (asset publish before migrate)
- **DOCUMENTATION.md:** Added required media upload route definitions and expected JSON response format; added `fields.md` cross-reference; added `CustomPageBuilderRenderService` extension pattern with service container binding
- **FRONTEND-INTEGRATION.md:** Updated overview diagram with correct controller pattern; added two-flag table (`use_page_builder` vs `page_builder_status`); added "Widget CSS: Two Approaches" section; added "Extending the Render Service" section
- **WIDGET-DEVELOPMENT.md:** Standardised icon format to `'las la-ICONNAME'` throughout; clarified view namespace registration and usage (`pagebuilder::` vs custom names); added path casing note (`plugins/` filesystem vs `Plugins\` PHP namespace); added `getStyleFields()` required-but-can-return-`[]` note in migration guide
- **widgets.md:** Added "CSS in Widgets — Two Approaches" section explaining inline blade `<style>` vs `getStyleFields()` and `{{WRAPPER}}` token; highlighted IMAGE/VIDEO array return requirement
- **configuration.md:** Clarified `back_to_pages` (route name) vs `back_to_pages_url` (literal URL fallback)
- **fields.md:** Fixed ICON field `setDefaultIcon` and template usage examples to use correct `'las la-ICONNAME'` format
- **index.md:** Quick Start now lists all 5 required integration steps instead of just install commands

## [1.0.0]

### Initial Release
- Complete page builder system extracted from WebForge application
- Converted to reusable Laravel package
- Full namespace migration from `Plugins\Pagebuilder` to `Xgenious\PageBuilder`
- Laravel 11+ and PHP 8.2+ support

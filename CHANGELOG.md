# Changelog

All notable changes to the Laravel Page Builder package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

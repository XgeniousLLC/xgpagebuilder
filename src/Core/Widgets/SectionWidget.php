<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\BladeRenderable;

/**
 * SectionWidget - Enhanced container widget for grouping other widgets
 * 
 * Features:
 * - Container for other widgets with enhanced layout controls
 * - Full-width vs Boxed layout options with responsive controls
 * - Advanced background controls via BACKGROUND_GROUP
 * - Enhanced spacing with responsive dimension controls
 * - Container width controls with custom breakpoints
 * - Vertical alignment and minimum height options
 * - Automatic CSS generation via BaseWidget
 * - Template system support with BladeRenderable
 * 
 * @package plugins\Pagebuilder\Core\Widgets
 */
class SectionWidget extends BaseWidget
{
    use BladeRenderable;
    protected function getWidgetType(): string
    {
        return 'section';
    }

    protected function getWidgetName(): string
    {
        return 'Section';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-columns';
    }

    protected function getWidgetDescription(): string
    {
        return 'A container section for organizing and styling groups of widgets';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    /**
     * Sections need default style fields for proper functionality
     * Override default behavior to inherit background, spacing, border controls
     */
    protected function shouldInheritDefaultStyleFields(): bool
    {
        return true;
    }

    protected function getWidgetTags(): array
    {
        return ['section', 'container', 'layout', 'wrapper', 'group'];
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Enhanced Layout Settings Group
        $control->addGroup('layout', 'Layout Settings')
            ->registerField(
                'layout_type',
                FieldManager::SELECT()
                    ->setLabel('Layout Type')
                    ->setOptions([
                        'boxed' => 'Boxed (Contained)',
                        'full_width' => 'Full Width',
                        'full_width_contained' => 'Full Width with Contained Content'
                    ])
                    ->setDefault('boxed')
                    ->setDescription('Choose the section layout behavior')
            )
            ->registerField(
                'container_width',
                FieldManager::SELECT()
                    ->setLabel('Container Width')
                    ->setOptions([
                        'default' => 'Default (1200px)',
                        'wide' => 'Wide (1400px)',
                        'full' => 'Full Width (1600px)',
                        'custom' => 'Custom Width'
                    ])
                    ->setDefault('default')
                    ->setCondition(['layout_type' => ['boxed', 'full_width_contained']])
                    ->setDescription('Maximum container width for contained layouts')
            )
            ->registerField(
                'custom_width',
                FieldManager::NUMBER()
                    ->setLabel('Custom Width')
                    ->setUnit('px')
                    ->setMin(320)
                    ->setMax(2000)
                    ->setDefault(1200)
                    ->setCondition(['container_width' => 'custom'])
                    ->setDescription('Custom maximum width in pixels')
            )
            ->registerField(
                'content_alignment',
                FieldManager::ALIGNMENT()
                    ->setLabel('Content Alignment')
                    ->asTextAlign()
                    ->setShowNone(false)
                    ->setShowJustify(false)
                    ->setDefault('center')
                    ->setCondition(['layout_type' => ['boxed', 'full_width_contained']])
                    ->setDescription('Horizontal alignment of contained content')
            )
            ->endGroup();

        // Section Dimensions Group
        $control->addGroup('dimensions', 'Dimensions')
            ->registerField(
                'min_height',
                FieldManager::NUMBER()
                    ->setLabel('Minimum Height')
                    ->setUnit('px')
                    ->setMin(0)
                    ->setMax(1000)
                    ->setDefault(0)
                    ->setDescription('Minimum section height - useful for hero sections')
            )
            ->registerField(
                'height_unit',
                FieldManager::SELECT()
                    ->setLabel('Height Unit')
                    ->setOptions([
                        'auto' => 'Auto (Content Based)',
                        'viewport' => 'Viewport Height (100vh)',
                        'custom' => 'Custom Height'
                    ])
                    ->setDefault('auto')
                    ->setDescription('How section height should be calculated')
            )
            ->registerField(
                'custom_height',
                FieldManager::NUMBER()
                    ->setLabel('Custom Height')
                    ->setUnit('px')
                    ->setMin(200)
                    ->setMax(2000)
                    ->setDefault(600)
                    ->setCondition(['height_unit' => 'custom'])
                    ->setDescription('Fixed height for the section')
            )
            ->registerField(
                'vertical_alignment',
                FieldManager::SELECT()
                    ->setLabel('Vertical Alignment')
                    ->setOptions([
                        'top' => 'Top',
                        'center' => 'Center',
                        'bottom' => 'Bottom'
                    ])
                    ->setDefault('top')
                    ->setCondition(['height_unit' => ['viewport', 'custom']])
                    ->setDescription('Vertical alignment of content within the section')
            )
            ->endGroup();

        // Section Identity Group
        $control->addGroup('identity', 'Section Identity')
            ->registerField(
                'section_id',
                FieldManager::TEXT()
                    ->setLabel('Section ID')
                    ->setPlaceholder('hero-section')
                    ->setDescription('Unique ID for navigation and styling (will be slugified)')
            )
            ->registerField(
                'section_label',
                FieldManager::TEXT()
                    ->setLabel('Section Label')
                    ->setPlaceholder('Hero Section')
                    ->setDescription('Internal label for section management (not displayed)')
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Section-specific styling - Background and effects
        $control->addGroup('section_background', 'Section Background')
            ->registerField(
                'section_bg',
                FieldManager::BACKGROUND_GROUP()
                    ->setLabel('Background')
                    ->setAllowedTypes(['none', 'color', 'gradient', 'image'])
                    ->setDefaultType('none')
                    ->setEnableHover(false)
                    ->setEnableImage(true)
                    ->setSelectors([
                        '{{WRAPPER}}.widget-section' => 'background: {{VALUE}};'
                    ])
                    ->setDescription('Configure section background with color, gradient, image or overlay')
            )
            ->endGroup();

        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        // Try Blade template first if available
        if ($this->hasBladeTemplate()) {
            $templateData = $this->prepareTemplateData($settings);
            return $this->renderBladeTemplate($this->getDefaultTemplatePath(), $templateData);
        }

        // Fallback to manual HTML generation
        return $this->renderManually($settings);
    }

    /**
     * Manual HTML rendering with enhanced layout options
     */
    private function renderManually(array $settings): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        // Layout settings
        $layout = $general['layout'] ?? [];
        $layoutType = $layout['layout_type'] ?? 'boxed';
        $containerWidth = $layout['container_width'] ?? 'default';
        $customWidth = $layout['custom_width'] ?? 1200;
        $contentAlignment = $layout['content_alignment'] ?? 'center';

        // Dimensions
        $dimensions = $general['dimensions'] ?? [];
        $minHeight = $dimensions['min_height'] ?? 0;
        $heightUnit = $dimensions['height_unit'] ?? 'auto';
        $customHeight = $dimensions['custom_height'] ?? 600;
        $verticalAlignment = $dimensions['vertical_alignment'] ?? 'flex-start';

        // Identity
        $identity = $general['identity'] ?? [];
        $sectionId = !empty($identity['section_id']) ? $this->sanitizeAttribute('id', $identity['section_id']) : '';
        $sectionLabel = $identity['section_label'] ?? '';

        // Use BaseWidget's automatic CSS class generation
        $classString = $this->buildCssClasses($settings);

        // Add layout-specific classes
        $layoutClasses = [];
        $layoutClasses[] = "layout-{$layoutType}";
        $layoutClasses[] = "container-{$containerWidth}";
        $layoutClasses[] = "content-align-{$contentAlignment}";
        $layoutClasses[] = "height-{$heightUnit}";
        $layoutClasses[] = "vertical-{$verticalAlignment}";

        $finalClasses = $classString . ' ' . implode(' ', $layoutClasses);

        // Use BaseWidget's automatic CSS generation
        $styleAttr = $this->generateStyleAttribute(['general' => $general, 'style' => $style]);

        // Add layout-specific styles
        $layoutStyles = [];

        // Container width
        if ($layoutType !== 'full_width') {
            $maxWidth = match ($containerWidth) {
                'wide' => '1400px',
                'full' => '1600px',
                'custom' => $customWidth . 'px',
                default => '1200px'
            };
            $layoutStyles[] = "max-width: {$maxWidth}";
        }

        // Height settings
        if ($heightUnit === 'viewport') {
            $layoutStyles[] = 'min-height: 100vh';
        } elseif ($heightUnit === 'custom') {
            $layoutStyles[] = "height: {$customHeight}px";
        } elseif ($minHeight > 0) {
            $layoutStyles[] = "min-height: {$minHeight}px";
        }

        // Combine styles
        $additionalStyles = !empty($layoutStyles) ? implode('; ', $layoutStyles) : '';
        $combinedStyles = trim($styleAttr . '; ' . $additionalStyles, '; ');
        $finalStyleAttr = !empty($combinedStyles) ? " style=\"{$combinedStyles}\"" : '';

        // Build section attributes
        $attributes = [
            'class' => $finalClasses,
            'data-widget-type' => $this->getWidgetType(),
            'data-layout-type' => $layoutType,
            'data-container-width' => $containerWidth
        ];

        if (!empty($sectionId)) {
            $attributes['id'] = $sectionId;
        }

        if (!empty($sectionLabel)) {
            $attributes['data-section-label'] = $sectionLabel;
        }

        $attributesString = $this->buildAttributes($attributes);

        // Return enhanced section HTML
        $containerClass = $layoutType === 'full_width' ? 'section-content-full' : 'section-content-container';

        return "<section {$attributesString}{$finalStyleAttr}>
    <div class=\"{$containerClass}\">
        <!-- Section content will be added here -->
    </div>
</section>";
    }
}

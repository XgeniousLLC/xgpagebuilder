<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * SpacerWidget - Provides flexible spacing control with responsive options
 *
 * Features:
 * - Adjustable height with multiple units
 * - Responsive spacing for different breakpoints
 * - Visibility controls for different devices
 * - Custom background for visual debugging
 * - Min/max height constraints
 *
 * @package Plugins\Pagebuilder\Widgets\Layout
 */
class SpacerWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'spacer';
    }

    protected function getWidgetName(): string
    {
        return 'Spacer';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-expand-arrows-alt';
    }

    protected function getWidgetDescription(): string
    {
        return 'Add flexible vertical spacing with responsive controls and device visibility options';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['spacer', 'spacing', 'gap', 'margin', 'layout', 'vertical'];
    }

    /**
     * General settings for spacer dimensions and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Spacing Configuration Group
        $control->addGroup('spacing', 'Spacing Configuration')
            ->registerField('height', FieldManager::NUMBER()
                ->setLabel('Height')
                ->setDefault(50)
                ->setMin(0)
                ->setMax(500)
                ->setUnit('px')
                ->setResponsive(true)
                ->setDescription('The height of the spacer element')
            )
            ->registerField('min_height', FieldManager::NUMBER()
                ->setLabel('Minimum Height')
                ->setDefault(0)
                ->setMin(0)
                ->setMax(200)
                ->setUnit('px')
                ->setResponsive(true)
                ->setDescription('Minimum height constraint')
            )
            ->registerField('max_height', FieldManager::NUMBER()
                ->setLabel('Maximum Height')
                ->setDefault('')
                ->setMin(0)
                ->setMax(1000)
                ->setUnit('px')
                ->setResponsive(true)
                ->setDescription('Maximum height constraint (leave empty for no limit)')
            )
            ->endGroup();

        // Responsive Behavior Group
        $control->addGroup('responsive', 'Responsive Behavior')
            ->registerField('hide_on_desktop', FieldManager::TOGGLE()
                ->setLabel('Hide on Desktop')
                ->setDefault(false)
                ->setDescription('Hide spacer on desktop devices (1024px and up)')
            )
            ->registerField('hide_on_tablet', FieldManager::TOGGLE()
                ->setLabel('Hide on Tablet')
                ->setDefault(false)
                ->setDescription('Hide spacer on tablet devices (768px - 1023px)')
            )
            ->registerField('hide_on_mobile', FieldManager::TOGGLE()
                ->setLabel('Hide on Mobile')
                ->setDefault(false)
                ->setDescription('Hide spacer on mobile devices (767px and below)')
            )
            ->endGroup();

        // Advanced Options Group
        $control->addGroup('advanced_options', 'Advanced Options')
            ->registerField('spacer_type', FieldManager::SELECT()
                ->setLabel('Spacer Type')
                ->setDefault('vertical')
                ->setOptions([
                    'vertical' => 'Vertical Spacing',
                    'horizontal' => 'Horizontal Spacing',
                    'both' => 'Both Directions'
                ])
                ->setDescription('Direction of the spacing')
            )
            ->registerField('horizontal_width', FieldManager::NUMBER()
                ->setLabel('Horizontal Width')
                ->setDefault(50)
                ->setMin(0)
                ->setMax(500)
                ->setUnit('px')
                ->setResponsive(true)
                ->setCondition(['spacer_type' => ['in', ['horizontal', 'both']]])
                ->setDescription('Width for horizontal spacing')
            )
            ->registerField('inline_spacer', FieldManager::TOGGLE()
                ->setLabel('Inline Spacer')
                ->setDefault(false)
                ->setCondition(['spacer_type' => ['in', ['horizontal', 'both']]])
                ->setDescription('Make spacer inline instead of block level')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings for spacer appearance and debugging
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Appearance Group
        $control->addGroup('appearance', 'Appearance')
            ->registerField('show_background', FieldManager::TOGGLE()
                ->setLabel('Show Background')
                ->setDefault(false)
                ->setDescription('Show background color for visual debugging')
            )
            ->registerField('background_color', FieldManager::COLOR()
                ->setLabel('Background Color')
                ->setDefault('#F3F4F6')
                ->setCondition(['show_background' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('background_opacity', FieldManager::NUMBER()
                ->setLabel('Background Opacity')
                ->setDefault(0.3)
                ->setMin(0)
                ->setMax(1)
                ->setStep(0.1)
                ->setCondition(['show_background' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'opacity: {{VALUE}};'
                ])
            )
            ->endGroup();

        // Border & Effects Group
        $control->addGroup('border', 'Border & Effects')
            ->registerField('show_border', FieldManager::TOGGLE()
                ->setLabel('Show Border')
                ->setDefault(false)
                ->setDescription('Show border for visual debugging')
            )
            ->registerField('border_style', FieldManager::SELECT()
                ->setLabel('Border Style')
                ->setDefault('dashed')
                ->setOptions([
                    'solid' => 'Solid',
                    'dashed' => 'Dashed',
                    'dotted' => 'Dotted',
                    'double' => 'Double'
                ])
                ->setCondition(['show_border' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'border-style: {{VALUE}};'
                ])
            )
            ->registerField('border_width', FieldManager::NUMBER()
                ->setLabel('Border Width')
                ->setDefault(1)
                ->setMin(1)
                ->setMax(10)
                ->setUnit('px')
                ->setCondition(['show_border' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'border-width: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('border_color', FieldManager::COLOR()
                ->setLabel('Border Color')
                ->setDefault('#E5E7EB')
                ->setCondition(['show_border' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'border-color: {{VALUE}};'
                ])
            )
            ->registerField('border_radius', FieldManager::DIMENSION()
                ->setLabel('Border Radius')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setMin(0)
                ->setMax(50)
                ->setLinked(true)
                ->setCondition(['show_border' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        // Debug Information Group
        $control->addGroup('debug', 'Debug Information')
            ->registerField('show_label', FieldManager::TOGGLE()
                ->setLabel('Show Label')
                ->setDefault(false)
                ->setDescription('Show spacer label for debugging purposes')
            )
            ->registerField('label_text', FieldManager::TEXT()
                ->setLabel('Label Text')
                ->setDefault('SPACER')
                ->setCondition(['show_label' => true])
                ->setDescription('Custom text to display in the spacer')
            )
            ->registerField('label_color', FieldManager::COLOR()
                ->setLabel('Label Color')
                ->setDefault('#6B7280')
                ->setCondition(['show_label' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-label' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('label_font_size', FieldManager::NUMBER()
                ->setLabel('Label Font Size')
                ->setDefault(12)
                ->setMin(8)
                ->setMax(20)
                ->setUnit('px')
                ->setCondition(['show_label' => true])
                ->setSelectors([
                    '{{WRAPPER}} .spacer-label' => 'font-size: {{VALUE}}{{UNIT}};'
                ])
            )
            ->endGroup();

        // Advanced Styling Group
        $control->addGroup('advanced_style', 'Advanced Styling')
            ->registerField('box_shadow', FieldManager::TEXT()
                ->setLabel('Box Shadow')
                ->setDefault('none')
                ->setPlaceholder('0 1px 3px rgba(0,0,0,0.1)')
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'box-shadow: {{VALUE}};'
                ])
            )
            ->registerField('transform', FieldManager::TEXT()
                ->setLabel('Transform')
                ->setDefault('none')
                ->setPlaceholder('scale(1.1) or rotate(5deg)')
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'transform: {{VALUE}};'
                ])
            )
            ->registerField('z_index', FieldManager::NUMBER()
                ->setLabel('Z-Index')
                ->setDefault('')
                ->setMin(-1000)
                ->setMax(1000)
                ->setSelectors([
                    '{{WRAPPER}} .spacer-element' => 'z-index: {{VALUE}};'
                ])
                ->setDescription('Stacking order of the spacer element')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the spacer HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        $height = $general['height'] ?? 50;
        $minHeight = $general['min_height'] ?? 0;
        $maxHeight = $general['max_height'] ?? '';

        $hideOnDesktop = $general['hide_on_desktop'] ?? false;
        $hideOnTablet = $general['hide_on_tablet'] ?? false;
        $hideOnMobile = $general['hide_on_mobile'] ?? false;

        $spacerType = $general['spacer_type'] ?? 'vertical';
        $horizontalWidth = $general['horizontal_width'] ?? 50;
        $inlineSpacer = $general['inline_spacer'] ?? false;

        $showBackground = $style['show_background'] ?? false;
        $showBorder = $style['show_border'] ?? false;
        $showLabel = $style['show_label'] ?? false;
        $labelText = htmlspecialchars($style['label_text'] ?? 'SPACER', ENT_QUOTES, 'UTF-8');

        // Build CSS classes
        $classes = ['spacer-element', 'spacer-' . $spacerType];

        // Add responsive visibility classes
        if ($hideOnDesktop) {
            $classes[] = 'hide-desktop';
        }
        if ($hideOnTablet) {
            $classes[] = 'hide-tablet';
        }
        if ($hideOnMobile) {
            $classes[] = 'hide-mobile';
        }

        // Add visual debugging classes
        if ($showBackground) {
            $classes[] = 'has-background';
        }
        if ($showBorder) {
            $classes[] = 'has-border';
        }
        if ($showLabel) {
            $classes[] = 'has-label';
        }

        // Add inline class if needed
        if ($inlineSpacer && in_array($spacerType, ['horizontal', 'both'])) {
            $classes[] = 'inline-spacer';
        }

        $classString = implode(' ', $classes);

        // Build inline styles
        $styles = [];

        // Height for vertical spacing
        if (in_array($spacerType, ['vertical', 'both'])) {
            $heightUnit = is_numeric($height) ? $height . 'px' : $height;
            $styles[] = 'height: ' . $heightUnit;

            if ($minHeight > 0) {
                $minHeightUnit = is_numeric($minHeight) ? $minHeight . 'px' : $minHeight;
                $styles[] = 'min-height: ' . $minHeightUnit;
            }

            if (!empty($maxHeight)) {
                $maxHeightUnit = is_numeric($maxHeight) ? $maxHeight . 'px' : $maxHeight;
                $styles[] = 'max-height: ' . $maxHeightUnit;
            }
        }

        // Width for horizontal spacing
        if (in_array($spacerType, ['horizontal', 'both'])) {
            $widthUnit = is_numeric($horizontalWidth) ? $horizontalWidth . 'px' : $horizontalWidth;
            $styles[] = 'width: ' . $widthUnit;

            if ($inlineSpacer) {
                $styles[] = 'display: inline-block';
            }
        }

        // For "both" type, make it a flexible box
        if ($spacerType === 'both') {
            $styles[] = 'display: flex';
            $styles[] = 'align-items: center';
            $styles[] = 'justify-content: center';
        }

        $styleString = !empty($styles) ? ' style="' . implode('; ', $styles) . '"' : '';

        // Build content
        $content = '';
        if ($showLabel) {
            $labelClasses = ['spacer-label'];
            $labelClass = implode(' ', $labelClasses);
            $content = "<span class=\"{$labelClass}\">{$labelText}</span>";
        }

        return "<div class=\"{$classString}\"{$styleString}>{$content}</div>";
    }

    /**
     * Generate CSS for this widget instance
     */
    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $styleControl = new ControlManager();

        // Register style fields for CSS generation
        $this->registerStyleFields($styleControl);

        $css = $styleControl->generateCSS($widgetId, $settings['style'] ?? []);

        // Add responsive visibility CSS
        $general = $settings['general'] ?? [];

        if ($general['hide_on_desktop'] ?? false) {
            $css .= "\n@media (min-width: 1024px) {";
            $css .= "\n    #{$widgetId} .spacer-element.hide-desktop { display: none !important; }";
            $css .= "\n}";
        }

        if ($general['hide_on_tablet'] ?? false) {
            $css .= "\n@media (min-width: 768px) and (max-width: 1023px) {";
            $css .= "\n    #{$widgetId} .spacer-element.hide-tablet { display: none !important; }";
            $css .= "\n}";
        }

        if ($general['hide_on_mobile'] ?? false) {
            $css .= "\n@media (max-width: 767px) {";
            $css .= "\n    #{$widgetId} .spacer-element.hide-mobile { display: none !important; }";
            $css .= "\n}";
        }

        // Add label positioning CSS
        $style = $settings['style'] ?? [];
        if ($style['show_label'] ?? false) {
            $css .= "\n#{$widgetId} .spacer-element.has-label {";
            $css .= "\n    position: relative;";
            $css .= "\n    display: flex;";
            $css .= "\n    align-items: center;";
            $css .= "\n    justify-content: center;";
            $css .= "\n}";

            $css .= "\n#{$widgetId} .spacer-label {";
            $css .= "\n    font-family: monospace;";
            $css .= "\n    font-weight: 500;";
            $css .= "\n    text-transform: uppercase;";
            $css .= "\n    letter-spacing: 1px;";
            $css .= "\n    user-select: none;";
            $css .= "\n    pointer-events: none;";
            $css .= "\n}";
        }

        // Add spacer type specific CSS
        $spacerType = $general['spacer_type'] ?? 'vertical';

        if ($spacerType === 'horizontal') {
            $css .= "\n#{$widgetId} .spacer-horizontal {";
            $css .= "\n    height: auto;";
            $css .= "\n    min-height: 1px;";
            $css .= "\n}";
        }

        if ($spacerType === 'both') {
            $css .= "\n#{$widgetId} .spacer-both {";
            $css .= "\n    box-sizing: border-box;";
            $css .= "\n}";
        }

        return $css;
    }

    /**
     * Helper method to register style fields for CSS generation
     */
    private function registerStyleFields(ControlManager $control): void
    {
        // Re-register fields from getStyleFields() for CSS generation
        $this->getStyleFields();
    }
}

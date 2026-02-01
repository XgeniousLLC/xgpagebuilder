<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * DividerWidget - Provides customizable divider lines with decorative options
 * 
 * Features:
 * - Multiple line styles (solid, dashed, dotted, double)
 * - Adjustable thickness and color
 * - Width control with alignment
 * - Decorative elements (text, icons)
 * - Spacing controls
 * - Gradient support
 * 
 * @package plugins\Pagebuilder\Widgets\Layout
 */
class DividerWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'divider';
    }

    protected function getWidgetName(): string
    {
        return 'Divider';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-minus';
    }

    protected function getWidgetDescription(): string
    {
        return 'Add decorative divider lines with customizable styles and optional text or icons';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['divider', 'separator', 'line', 'border', 'decoration', 'layout'];
    }

    /**
     * General settings for divider content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Divider Style Group
        $control->addGroup('style_type', 'Divider Style')
            ->registerField(
                'divider_type',
                FieldManager::SELECT()
                    ->setLabel('Divider Type')
                    ->setDefault('simple')
                    ->setOptions([
                        'simple' => 'Simple Line',
                        'text' => 'Line with Text',
                        'icon' => 'Line with Icon',
                        'gradient' => 'Gradient Line'
                    ])
                    ->setDescription('Choose the type of divider')
            )
            ->registerField(
                'line_style',
                FieldManager::SELECT()
                    ->setLabel('Line Style')
                    ->setDefault('solid')
                    ->setOptions([
                        'solid' => 'Solid',
                        'dashed' => 'Dashed',
                        'dotted' => 'Dotted',
                        'double' => 'Double',
                        'groove' => 'Groove',
                        'ridge' => 'Ridge',
                        'inset' => 'Inset',
                        'outset' => 'Outset'
                    ])
                    ->setDescription('Style of the divider line')
            )
            ->endGroup();

        // Text Content Group
        $control->addGroup('text_content', 'Text Content')
            ->registerField(
                'divider_text',
                FieldManager::TEXT()
                    ->setLabel('Divider Text')
                    ->setDefault('OR')
                    ->setPlaceholder('Enter text for divider')
                    ->setCondition(['divider_type' => 'text'])
                    ->setDescription('Text to display in the middle of the divider')
            )
            ->registerField(
                'text_position',
                FieldManager::SELECT()
                    ->setLabel('Text Position')
                    ->setDefault('center')
                    ->setOptions([
                        'left' => 'Left',
                        'center' => 'Center',
                        'right' => 'Right'
                    ])
                    ->setCondition(['divider_type' => 'text'])
            )
            ->endGroup();

        // Icon Content Group
        $control->addGroup('icon_content', 'Icon Content')
            ->registerField(
                'divider_icon',
                FieldManager::ICON()
                    ->setLabel('Divider Icon')
                    ->setDefault('star')
                    ->setCondition(['divider_type' => 'icon'])
                    ->setDescription('Icon to display in the middle of the divider')
            )
            ->registerField(
                'icon_position',
                FieldManager::SELECT()
                    ->setLabel('Icon Position')
                    ->setDefault('center')
                    ->setOptions([
                        'left' => 'Left',
                        'center' => 'Center',
                        'right' => 'Right'
                    ])
                    ->setCondition(['divider_type' => 'icon'])
            )
            ->endGroup();

        // Dimensions Group
        $control->addGroup('dimensions', 'Dimensions')
            ->registerField(
                'divider_width',
                FieldManager::NUMBER()
                    ->setLabel('Divider Width')
                    ->setDefault(100)
                    ->setMin(10)
                    ->setMax(100)
                    ->setUnit('%')
                    ->setResponsive(true)
                    ->setDescription('Width of the divider')
            )
            ->registerField(
                'divider_alignment',
                FieldManager::SELECT()
                    ->setLabel('Divider Alignment')
                    ->setDefault('center')
                    ->setOptions([
                        'left' => 'Left',
                        'center' => 'Center',
                        'right' => 'Right'
                    ])
                    ->setResponsive(true)
                    ->setDescription('Alignment of the divider')
            )
            ->registerField(
                'thickness',
                FieldManager::NUMBER()
                    ->setLabel('Line Thickness')
                    ->setDefault(1)
                    ->setMin(1)
                    ->setMax(20)
                    ->setUnit('px')
                    ->setDescription('Thickness of the divider line')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings with comprehensive divider styling controls
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Line Colors Group
        $control->addGroup('line_colors', 'Line Colors')
            ->registerField(
                'line_color',
                FieldManager::COLOR()
                    ->setLabel('Line Color')
                    ->setDefault('#CCCCCC')
                    ->setCondition(['divider_type' => ['!=', 'gradient']])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-line' => 'border-color: {{VALUE}};',
                        '{{WRAPPER}} .divider-line::before' => 'border-color: {{VALUE}};',
                        '{{WRAPPER}} .divider-line::after' => 'border-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'gradient_start',
                FieldManager::COLOR()
                    ->setLabel('Gradient Start Color')
                    ->setDefault('#3B82F6')
                    ->setCondition(['divider_type' => 'gradient'])
                    ->setDescription('Starting color for gradient divider')
            )
            ->registerField(
                'gradient_end',
                FieldManager::COLOR()
                    ->setLabel('Gradient End Color')
                    ->setDefault('#EF4444')
                    ->setCondition(['divider_type' => 'gradient'])
                    ->setDescription('Ending color for gradient divider')
            )
            ->registerField(
                'gradient_direction',
                FieldManager::SELECT()
                    ->setLabel('Gradient Direction')
                    ->setDefault('to right')
                    ->setOptions([
                        'to right' => 'Left to Right',
                        'to left' => 'Right to Left',
                        '45deg' => 'Diagonal (45°)',
                        '-45deg' => 'Diagonal (-45°)',
                        'to top' => 'Bottom to Top',
                        'to bottom' => 'Top to Bottom'
                    ])
                    ->setCondition(['divider_type' => 'gradient'])
            )
            ->endGroup();

        // Text Styling Group
        $control->addGroup('text_style', 'Text Style')
            ->registerField(
                'text_color',
                FieldManager::COLOR()
                    ->setLabel('Text Color')
                    ->setDefault('#333333')
                    ->setCondition(['divider_type' => 'text'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-text' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'text_background',
                FieldManager::COLOR()
                    ->setLabel('Text Background')
                    ->setDefault('#FFFFFF')
                    ->setCondition(['divider_type' => 'text'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-text' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'text_font_size',
                FieldManager::NUMBER()
                    ->setLabel('Text Font Size')
                    ->setDefault(14)
                    ->setMin(10)
                    ->setMax(32)
                    ->setUnit('px')
                    ->setCondition(['divider_type' => 'text'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-text' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'text_font_weight',
                FieldManager::SELECT()
                    ->setLabel('Text Font Weight')
                    ->setDefault('500')
                    ->addFontWeightOptions()
                    ->setCondition(['divider_type' => 'text'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-text' => 'font-weight: {{VALUE}};'
                    ])
            )
            ->registerField(
                'text_padding',
                FieldManager::DIMENSION()
                    ->setLabel('Text Padding')
                    ->setDefault(['top' => 0, 'right' => 15, 'bottom' => 0, 'left' => 15])
                    ->setUnits(['px', 'em'])
                    ->setMin(0)
                    ->setMax(50)
                    ->setCondition(['divider_type' => 'text'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-text' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Icon Styling Group
        $control->addGroup('icon_style', 'Icon Style')
            ->registerField(
                'icon_color',
                FieldManager::COLOR()
                    ->setLabel('Icon Color')
                    ->setDefault('#666666')
                    ->setCondition(['divider_type' => 'icon'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-icon' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'icon_background',
                FieldManager::COLOR()
                    ->setLabel('Icon Background')
                    ->setDefault('#FFFFFF')
                    ->setCondition(['divider_type' => 'icon'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-icon' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'icon_size',
                FieldManager::NUMBER()
                    ->setLabel('Icon Size')
                    ->setDefault(16)
                    ->setMin(8)
                    ->setMax(48)
                    ->setUnit('px')
                    ->setCondition(['divider_type' => 'icon'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-icon' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'icon_padding',
                FieldManager::DIMENSION()
                    ->setLabel('Icon Padding')
                    ->setDefault(['top' => 8, 'right' => 15, 'bottom' => 8, 'left' => 15])
                    ->setUnits(['px', 'em'])
                    ->setMin(0)
                    ->setMax(50)
                    ->setCondition(['divider_type' => 'icon'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-icon' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'icon_border_radius',
                FieldManager::NUMBER()
                    ->setLabel('Icon Border Radius')
                    ->setDefault(0)
                    ->setMin(0)
                    ->setMax(50)
                    ->setUnit('px')
                    ->setCondition(['divider_type' => 'icon'])
                    ->setSelectors([
                        '{{WRAPPER}} .divider-icon' => 'border-radius: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField(
                'margin_top',
                FieldManager::NUMBER()
                    ->setLabel('Top Spacing')
                    ->setDefault(20)
                    ->setMin(0)
                    ->setMax(100)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .divider-container' => 'margin-top: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'margin_bottom',
                FieldManager::NUMBER()
                    ->setLabel('Bottom Spacing')
                    ->setDefault(20)
                    ->setMin(0)
                    ->setMax(100)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .divider-container' => 'margin-bottom: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Effects Group
        $control->addGroup('effects', 'Effects')
            ->registerField(
                'shadow',
                FieldManager::TEXT()
                    ->setLabel('Box Shadow')
                    ->setDefault('none')
                    ->setPlaceholder('0 2px 4px rgba(0,0,0,0.1)')
                    ->setSelectors([
                        '{{WRAPPER}} .divider-line' => 'box-shadow: {{VALUE}};'
                    ])
            )
            ->registerField(
                'opacity',
                FieldManager::NUMBER()
                    ->setLabel('Opacity')
                    ->setDefault(1)
                    ->setMin(0)
                    ->setMax(1)
                    ->setStep(0.1)
                    ->setSelectors([
                        '{{WRAPPER}} .divider-container' => 'opacity: {{VALUE}};'
                    ])
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the divider HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        // Extract from correct groups based on field definitions
        $styleType = $general['style_type'] ?? [];
        $dividerType = $styleType['divider_type'] ?? 'simple';
        $lineStyle = $styleType['line_style'] ?? 'solid';

        $lineAppearance = $general['line_appearance'] ?? [];
        $dividerWidth = $lineAppearance['divider_width'] ?? 100;
        $dividerAlignment = $lineAppearance['divider_alignment'] ?? 'center';
        $thickness = $lineAppearance['thickness'] ?? 1;

        $textContent = $general['text_content'] ?? [];
        $dividerText = htmlspecialchars($textContent['divider_text'] ?? 'OR', ENT_QUOTES, 'UTF-8');
        $textPosition = $textContent['text_position'] ?? 'center';

        $iconContent = $general['icon_content'] ?? [];
        $dividerIcon = $iconContent['divider_icon'] ?? 'star';
        $iconPosition = $iconContent['icon_position'] ?? 'center';

        // Build container classes
        $containerClasses = ['divider-container', 'divider-' . $dividerType];

        if ($dividerAlignment !== 'center') {
            $containerClasses[] = 'align-' . $dividerAlignment;
        }

        $containerClass = implode(' ', $containerClasses);

        // Build line classes
        $lineClasses = ['divider-line', 'style-' . $lineStyle];
        $lineClass = implode(' ', $lineClasses);

        // Build inline styles
        $containerStyle = '';
        $lineStyleCss = '';

        // Container alignment
        if ($dividerAlignment === 'center') {
            $containerStyle .= 'text-align: center;';
        } elseif ($dividerAlignment === 'right') {
            $containerStyle .= 'text-align: right;';
        } else {
            $containerStyle .= 'text-align: left;';
        }

        // Line styles
        $lineStyleCss .= 'width: ' . $dividerWidth . '%; ';
        $lineStyleCss .= 'border-top-width: ' . $thickness . 'px; ';
        $lineStyleCss .= 'border-top-style: ' . $lineStyle . '; ';

        if ($dividerType === 'gradient') {
            $gradientStart = $style['gradient_start'] ?? '#3B82F6';
            $gradientEnd = $style['gradient_end'] ?? '#EF4444';
            $gradientDirection = $style['gradient_direction'] ?? 'to right';

            $lineStyleCss .= 'background: linear-gradient(' . $gradientDirection . ', ' . $gradientStart . ', ' . $gradientEnd . '); ';
            $lineStyleCss .= 'border: none; ';
            $lineStyleCss .= 'height: ' . $thickness . 'px; ';
        } else {
            $lineColor = $style['line_color'] ?? '#CCCCCC';
            $lineStyleCss .= 'border-color: ' . $lineColor . '; ';
        }

        // Generate HTML based on divider type
        switch ($dividerType) {
            case 'text':
                return $this->renderTextDivider($containerClass, $containerStyle, $lineClass, $lineStyleCss, $dividerText, $textPosition);

            case 'icon':
                return $this->renderIconDivider($containerClass, $containerStyle, $lineClass, $lineStyleCss, $dividerIcon, $iconPosition);

            case 'gradient':
            case 'simple':
            default:
                return $this->renderSimpleDivider($containerClass, $containerStyle, $lineClass, $lineStyleCss);
        }
    }

    /**
     * Render simple divider
     */
    private function renderSimpleDivider(string $containerClass, string $containerStyle, string $lineClass, string $lineStyle): string
    {
        return "<div class=\"{$containerClass}\" style=\"{$containerStyle}\">
            <div class=\"{$lineClass}\" style=\"{$lineStyle}\"></div>
        </div>";
    }

    /**
     * Render text divider
     */
    private function renderTextDivider(string $containerClass, string $containerStyle, string $lineClass, string $lineStyle, string $text, string $position): string
    {
        $textClasses = ['divider-text', 'position-' . $position];
        $textClass = implode(' ', $textClasses);

        if ($position === 'center') {
            return "<div class=\"{$containerClass}\" style=\"{$containerStyle}\">
                <div class=\"divider-wrapper\">
                    <div class=\"{$lineClass}\" style=\"{$lineStyle}\"></div>
                    <span class=\"{$textClass}\">{$text}</span>
                </div>
            </div>";
        } else {
            $flexDirection = $position === 'left' ? 'row' : 'row-reverse';
            return "<div class=\"{$containerClass}\" style=\"{$containerStyle}\">
                <div class=\"divider-wrapper\" style=\"display: flex; align-items: center; flex-direction: {$flexDirection};\">
                    <span class=\"{$textClass}\">{$text}</span>
                    <div class=\"{$lineClass}\" style=\"{$lineStyle} flex: 1;\"></div>
                </div>
            </div>";
        }
    }

    /**
     * Render icon divider
     */
    private function renderIconDivider(string $containerClass, string $containerStyle, string $lineClass, string $lineStyle, string $icon, string $position): string
    {
        $iconClasses = ['divider-icon', 'icon-' . $icon, 'position-' . $position];
        $iconClass = implode(' ', $iconClasses);

        if ($position === 'center') {
            return "<div class=\"{$containerClass}\" style=\"{$containerStyle}\">
                <div class=\"divider-wrapper\">
                    <div class=\"{$lineClass}\" style=\"{$lineStyle}\"></div>
                    <i class=\"{$iconClass}\"></i>
                </div>
            </div>";
        } else {
            $flexDirection = $position === 'left' ? 'row' : 'row-reverse';
            return "<div class=\"{$containerClass}\" style=\"{$containerStyle}\">
                <div class=\"divider-wrapper\" style=\"display: flex; align-items: center; flex-direction: {$flexDirection};\">
                    <i class=\"{$iconClass}\"></i>
                    <div class=\"{$lineClass}\" style=\"{$lineStyle} flex: 1;\"></div>
                </div>
            </div>";
        }
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

        // Add divider-specific CSS
        $general = $settings['general'] ?? [];
        $dividerType = $general['divider_type'] ?? 'simple';

        if (in_array($dividerType, ['text', 'icon'])) {
            $prefix = $sectionId ? "#{$sectionId} " : '';

            $css .= "\n{$prefix}#{$widgetId} .divider-wrapper {";
            $css .= "\n    position: relative;";
            $css .= "\n    display: flex;";
            $css .= "\n    align-items: center;";
            $css .= "\n    justify-content: center;";
            $css .= "\n}";

            $css .= "\n{$prefix}#{$widgetId} .divider-wrapper .divider-line {";
            $css .= "\n    position: absolute;";
            $css .= "\n    top: 50%;";
            $css .= "\n    left: 0;";
            $css .= "\n    right: 0;";
            $css .= "\n    transform: translateY(-50%);";
            $css .= "\n}";

            $css .= "\n{$prefix}#{$widgetId} .divider-text,";
            $css .= "\n{$prefix}#{$widgetId} .divider-icon {";
            $css .= "\n    position: relative;";
            $css .= "\n    z-index: 1;";
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

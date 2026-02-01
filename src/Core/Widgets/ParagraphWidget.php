<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * ParagraphWidget - Provides rich text paragraph content with advanced typography controls
 * 
 * Features:
 * - Rich text content editing
 * - Full typography controls
 * - Text alignment options
 * - Responsive settings
 * - Drop cap functionality
 * - Advanced styling options
 * 
 * @package plugins\Pagebuilder\Widgets\Basic
 */
class ParagraphWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'paragraph';
    }

    protected function getWidgetName(): string
    {
        return 'Paragraph';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-paragraph';
    }

    protected function getWidgetDescription(): string
    {
        return 'Add paragraph text content with rich formatting and advanced typography controls';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['paragraph', 'text', 'content', 'typography', 'rich-text', 'body'];
    }

    /**
     * General settings for paragraph content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Content Group
        $control->addGroup('content', 'Content Settings')
            ->registerField(
                'paragraph_text',
                FieldManager::WYSIWYG()
                    ->setLabel('Paragraph Text')
                    ->setDefault('Your paragraph text goes here. You can write multiple sentences and they will be displayed as a well-formatted paragraph with proper spacing and typography.')
                    ->setRequired(true)
                    ->setRows(8)
                    ->setPlaceholder('Enter your paragraph content here...')
                    ->setDescription('The main text content of the paragraph. HTML tags are supported.')
            )
            ->registerField(
                'text_align',
                FieldManager::ALIGNMENT()
                    ->setLabel('Text Alignment')
                    ->asTextAlign()
                    ->setShowNone(false)
                    ->setShowJustify(true)
                    ->setDefault('left')
                    ->setResponsive(true)
                    ->setDescription('Set text alignment')
            )
            ->endGroup();

        // Typography Enhancement Group
        $control->addGroup('enhancement', 'Text Enhancement')
            ->registerField(
                'enable_drop_cap',
                FieldManager::TOGGLE()
                    ->setLabel('Enable Drop Cap')
                    ->setDefault(false)
                    ->setDescription('Add a large decorative first letter')
            )
            ->registerField(
                'drop_cap_lines',
                FieldManager::NUMBER()
                    ->setLabel('Drop Cap Lines')
                    ->setDefault(3)
                    ->setMin(2)
                    ->setMax(5)
                    ->setCondition(['enable_drop_cap' => true])
                    ->setDescription('Number of lines the drop cap should span')
            )
            ->registerField(
                'highlight_text',
                FieldManager::TEXT()
                    ->setLabel('Text to Highlight')
                    ->setDefault('')
                    ->setPlaceholder('word or phrase')
                    ->setDescription('Specific text to highlight within the paragraph')
            )
            ->registerField(
                'highlight_color',
                FieldManager::COLOR()
                    ->setLabel('Highlight Color')
                    ->setDefault('#FFFF00')
                    ->setCondition(['highlight_text' => ['!=', '']])
                    ->setDescription('Background color for highlighted text')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings with comprehensive typography and spacing controls
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Typography Group - Enhanced unified control
        $control->addGroup('typography', 'Typography')
            ->registerField(
                'paragraph_typography',
                FieldManager::TYPOGRAPHY_GROUP()
                    ->setLabel('Typography')
                    ->setDefaultTypography([
                        'font_family' => 'inherit',
                        'font_size' => ['value' => 16, 'unit' => 'px'],
                        'font_weight' => '400',
                        'line_height' => ['value' => 1.6, 'unit' => 'em'],
                        'letter_spacing' => ['value' => 0, 'unit' => 'px'],
                        'word_spacing' => ['value' => 0, 'unit' => 'px'],
                        'text_transform' => 'none',
                        'font_style' => 'normal'
                    ])
                    ->setEnableResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'font-family: {{FONT_FAMILY}}; font-size: {{FONT_SIZE}}; font-weight: {{FONT_WEIGHT}}; line-height: {{LINE_HEIGHT}}; letter-spacing: {{LETTER_SPACING}}; word-spacing: {{WORD_SPACING}}; text-transform: {{TEXT_TRANSFORM}}; font-style: {{FONT_STYLE}};'
                    ])
                    ->setDescription('Configure all typography settings for the paragraph')
            )
            ->endGroup();

        // Drop Cap Styling
        $control->addGroup('drop_cap_style', 'Drop Cap Style')
            ->registerField(
                'drop_cap_font_size',
                FieldManager::NUMBER()
                    ->setLabel('Drop Cap Size')
                    ->setDefault(48)
                    ->setMin(24)
                    ->setMax(120)
                    ->setUnit('px')
                    ->setCondition(['enable_drop_cap' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element::first-letter' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'drop_cap_color',
                FieldManager::COLOR()
                    ->setLabel('Drop Cap Color')
                    ->setDefault('#333333')
                    ->setCondition(['enable_drop_cap' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element::first-letter' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'drop_cap_font_weight',
                FieldManager::SELECT()
                    ->setLabel('Drop Cap Weight')
                    ->setDefault('700')
                    ->addFontWeightOptions()
                    ->setCondition(['enable_drop_cap' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element::first-letter' => 'font-weight: {{VALUE}};'
                    ])
            )
            ->registerField(
                'drop_cap_margin',
                FieldManager::DIMENSION()
                    ->setLabel('Drop Cap Margin')
                    ->setDefault(['top' => 0, 'right' => 8, 'bottom' => 0, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem'])
                    ->setMin(0)
                    ->setMax(20)
                    ->setResponsive(true)
                    ->setCondition(['enable_drop_cap' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element::first-letter' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
                    ->setDescription('Set spacing around the drop cap')
            )
            ->endGroup();

        // Colors Group
        $control->addGroup('colors', 'Colors')
            ->registerField(
                'text_color',
                FieldManager::COLOR()
                    ->setLabel('Text Color')
                    ->setDefault('#333333')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'selection_background',
                FieldManager::COLOR()
                    ->setLabel('Text Selection Background')
                    ->setDefault('#007cba')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element::selection' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'selection_color',
                FieldManager::COLOR()
                    ->setLabel('Text Selection Color')
                    ->setDefault('#ffffff')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element::selection' => 'color: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Text Effects
        $control->addGroup('effects', 'Text Effects')
            ->registerField(
                'text_shadow',
                FieldManager::TEXT()
                    ->setLabel('Text Shadow')
                    ->setDefault('none')
                    ->setPlaceholder('1px 1px 2px rgba(0,0,0,0.1)')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'text-shadow: {{VALUE}};'
                    ])
                    ->setDescription('CSS text-shadow property')
            )
            ->registerField(
                'text_indent',
                FieldManager::NUMBER()
                    ->setLabel('Text Indent')
                    ->setDefault(0)
                    ->setMin(-50)
                    ->setMax(100)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'text-indent: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField(
                'margin',
                FieldManager::DIMENSION()
                    ->setLabel('Margin')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 16, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setAllowNegative(true)
                    ->setMin(-50)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
                    ->setDescription('Set the external spacing around the paragraph')
            )
            ->registerField(
                'padding',
                FieldManager::DIMENSION()
                    ->setLabel('Padding')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setMin(0)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Background Group - Enhanced control
        $control->addGroup('background', 'Background')
            ->registerField(
                'paragraph_background',
                FieldManager::BACKGROUND_GROUP()
                    ->setLabel('Background')
                    ->setAllowedTypes(['none', 'color', 'gradient', 'image'])
                    ->setDefaultType('none')
                    ->setEnableImage(true)
                    ->setEnableHover(false)
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'background: {{VALUE}};'
                    ])
                    ->setDescription('Configure paragraph background with color, gradient, image or none')
            )
            ->endGroup();

        // Border & Effects Group
        $control->addGroup('border', 'Border & Effects')
            ->registerField(
                'border_width',
                FieldManager::NUMBER()
                    ->setLabel('Border Width')
                    ->setDefault(0)
                    ->setMin(0)
                    ->setMax(10)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'border-width: {{VALUE}}{{UNIT}}; border-style: solid;'
                    ])
            )
            ->registerField(
                'border_color',
                FieldManager::COLOR()
                    ->setLabel('Border Color')
                    ->setDefault('#000000')
                    ->setCondition(['border_width' => ['>', 0]])
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'border-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'border_radius',
                FieldManager::DIMENSION()
                    ->setLabel('Border Radius')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setMin(0)
                    ->setMax(50)
                    ->setLinked(true)
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'box_shadow',
                FieldManager::TEXT()
                    ->setLabel('Box Shadow')
                    ->setDefault('none')
                    ->setPlaceholder('0 2px 4px rgba(0,0,0,0.1)')
                    ->setSelectors([
                        '{{WRAPPER}} .paragraph-element' => 'box-shadow: {{VALUE}};'
                    ])
                    ->setDescription('CSS box-shadow property')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the paragraph HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $content = $general['content'] ?? [];
        $enhancement = $general['enhancement'] ?? [];
        $style = $settings['style'] ?? [];

        $text = $content['paragraph_text'] ?? 'Your paragraph text goes here.';
        $align = $content['text_align'] ?? 'left';

        $enableDropCap = $enhancement['enable_drop_cap'] ?? false;
        $dropCapLines = $enhancement['drop_cap_lines'] ?? 3;
        $highlightText = $enhancement['highlight_text'] ?? '';
        $highlightColor = $enhancement['highlight_color'] ?? '#FFFF00';

        $classes = ['paragraph-element'];

        // Add alignment class
        if ($align !== 'left') {
            $classes[] = 'text-' . $align;
        }

        // Add drop cap class
        if ($enableDropCap) {
            $classes[] = 'has-drop-cap';
            $classes[] = 'drop-cap-' . $dropCapLines . '-lines';
        }

        // Process text highlighting
        if (!empty($highlightText) && !empty($highlightColor)) {
            $highlightStyle = 'background-color: ' . htmlspecialchars($highlightColor, ENT_QUOTES, 'UTF-8') . '; padding: 2px 4px; border-radius: 2px;';
            $text = str_ireplace(
                $highlightText,
                '<span class="highlighted-text" style="' . $highlightStyle . '">' . htmlspecialchars($highlightText, ENT_QUOTES, 'UTF-8') . '</span>',
                $text
            );
        }

        $classString = implode(' ', $classes);

        // Handle basic HTML formatting in text (allowing common tags)
        $allowedTags = '<strong><b><em><i><u><br><a><span>';
        $text = strip_tags($text, $allowedTags);

        return "<p class=\"{$classString}\">{$text}</p>";
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

        // Add drop cap specific CSS if enabled
        $general = $settings['general'] ?? [];
        $enhancement = $general['enhancement'] ?? [];
        if ($enhancement['enable_drop_cap'] ?? false) {
            $dropCapLines = $enhancement['drop_cap_lines'] ?? 3;
            $css .= "\n#{$widgetId} .paragraph-element.has-drop-cap::first-letter {";
            $css .= "\n    float: left;";
            $css .= "\n    line-height: " . ($dropCapLines * 0.8) . ";";
            $css .= "\n    margin-right: 8px;";
            $css .= "\n    margin-top: 0;";
            $css .= "\n    margin-bottom: 0;";
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

<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * LinkWidget - Provides versatile link elements with button and text styles
 * 
 * Features:
 * - Text and button-style links
 * - Icon integration
 * - Multiple target options
 * - Advanced typography controls
 * - Hover effects and transitions
 * - Download attribute support
 * - NoFollow and custom attributes
 * 
 * @package plugins\Pagebuilder\Widgets\Basic
 */
class LinkWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'link';
    }

    protected function getWidgetName(): string
    {
        return 'Link';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-link';
    }

    protected function getWidgetDescription(): string
    {
        return 'Create versatile links with text or button styling, icons, and advanced options';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['link', 'button', 'url', 'navigation', 'cta', 'anchor'];
    }

    /**
     * General settings for link content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Link Content Group
        $control->addGroup('content', 'Link Content')
            ->registerField(
                'link_text',
                FieldManager::TEXT()
                    ->setLabel('Link Text')
                    ->setDefault('Click Here')
                    ->setRequired(true)
                    ->setPlaceholder('Enter link text')
                    ->setDescription('The visible text for the link')
            )
            ->registerField(
                'link_url',
                FieldManager::URL()
                    ->setLabel('Link URL')
                    ->setDefault('#')
                    ->setRequired(true)
                    ->setPlaceholder('https://example.com')
                    ->setDescription('The destination URL')
            )
            ->registerField(
                'link_title',
                FieldManager::TEXT()
                    ->setLabel('Link Title')
                    ->setDefault('')
                    ->setPlaceholder('Link description (tooltip)')
                    ->setDescription('Title attribute shown on hover')
            )
            ->endGroup();

        // Link Type Group
        $control->addGroup('type', 'Link Type & Style')
            ->registerField(
                'link_style',
                FieldManager::SELECT()
                    ->setLabel('Link Style')
                    ->setDefault('text')
                    ->setOptions([
                        'text' => 'Text Link',
                        'button' => 'Button Style',
                        'inline' => 'Inline Link'
                    ])
                    ->setDescription('Choose how the link should appear')
            )
            ->registerField(
                'button_size',
                FieldManager::SELECT()
                    ->setLabel('Button Size')
                    ->setDefault('medium')
                    ->setOptions([
                        'small' => 'Small',
                        'medium' => 'Medium',
                        'large' => 'Large',
                        'extra-large' => 'Extra Large'
                    ])
                    ->setCondition(['link_style' => 'button'])
                    ->setDescription('Predefined button sizes')
            )
            ->registerField(
                'full_width',
                FieldManager::TOGGLE()
                    ->setLabel('Full Width')
                    ->setDefault(false)
                    ->setCondition(['link_style' => 'button'])
                    ->setDescription('Make button span full width of container')
            )
            ->endGroup();

        // Icon Group
        $control->addGroup('icon', 'Icon Settings')
            ->registerField(
                'show_icon',
                FieldManager::TOGGLE()
                    ->setLabel('Show Icon')
                    ->setDefault(false)
                    ->setDescription('Display an icon with the link')
            )
            ->registerField(
                'icon_name',
                FieldManager::ICON()
                    ->setLabel('Choose Icon')
                    ->setDefault('external-link')
                    ->setCondition(['show_icon' => true])
                    ->setDescription('Select an icon from the library')
            )
            ->registerField(
                'icon_position',
                FieldManager::SELECT()
                    ->setLabel('Icon Position')
                    ->setDefault('right')
                    ->setOptions([
                        'left' => 'Left',
                        'right' => 'Right',
                        'top' => 'Top',
                        'bottom' => 'Bottom'
                    ])
                    ->setCondition(['show_icon' => true])
            )
            ->registerField(
                'icon_only',
                FieldManager::TOGGLE()
                    ->setLabel('Icon Only')
                    ->setDefault(false)
                    ->setCondition(['show_icon' => true])
                    ->setDescription('Show only icon without text')
            )
            ->endGroup();

        // Behavior Group
        $control->addGroup('behavior', 'Link Behavior')
            ->registerField(
                'link_target',
                FieldManager::SELECT()
                    ->setLabel('Link Target')
                    ->setDefault('_self')
                    ->setOptions([
                        '_self' => 'Same Window',
                        '_blank' => 'New Window',
                        '_parent' => 'Parent Frame',
                        '_top' => 'Top Frame'
                    ])
                    ->setDescription('Where to open the link')
            )
            ->registerField(
                'link_rel',
                FieldManager::SELECT()
                    ->setLabel('Link Relationship')
                    ->setDefault('none')
                    ->setOptions([
                        'none' => 'None',
                        'nofollow' => 'NoFollow',
                        'sponsored' => 'Sponsored',
                        'ugc' => 'User Generated Content',
                        'noopener' => 'No Opener',
                        'noreferrer' => 'No Referrer',
                        'nofollow noopener' => 'NoFollow + No Opener'
                    ])
                    ->setDescription('Relationship attributes for SEO and security')
            )
            ->registerField(
                'download_attr',
                FieldManager::TOGGLE()
                    ->setLabel('Download Link')
                    ->setDefault(false)
                    ->setDescription('Force download instead of navigation')
            )
            ->registerField(
                'download_filename',
                FieldManager::TEXT()
                    ->setLabel('Download Filename')
                    ->setDefault('')
                    ->setPlaceholder('filename.pdf')
                    ->setCondition(['download_attr' => true])
                    ->setDescription('Suggested filename for download')
            )
            ->endGroup();

        // Accessibility Group
        $control->addGroup('accessibility', 'Accessibility')
            ->registerField(
                'aria_label',
                FieldManager::TEXT()
                    ->setLabel('ARIA Label')
                    ->setDefault('')
                    ->setPlaceholder('Descriptive label for screen readers')
                    ->setDescription('Additional description for accessibility')
            )
            ->registerField(
                'custom_attributes',
                FieldManager::TEXTAREA()
                    ->setLabel('Custom Attributes')
                    ->setDefault('')
                    ->setRows(3)
                    ->setPlaceholder('data-attribute="value"&#10;custom-attr="value"')
                    ->setDescription('Additional HTML attributes (one per line)')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings with comprehensive link and button styling
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Typography Group
        $control->addGroup('typography', 'Typography')
            ->registerField(
                'font_family',
                FieldManager::SELECT()
                    ->setLabel('Font Family')
                    ->setDefault('inherit')
                    ->setOptions([
                        'inherit' => 'Inherit',
                        'Arial, sans-serif' => 'Arial',
                        'Helvetica, sans-serif' => 'Helvetica',
                        'Georgia, serif' => 'Georgia',
                        'Times New Roman, serif' => 'Times New Roman',
                        'Courier New, monospace' => 'Courier New',
                        'Verdana, sans-serif' => 'Verdana',
                        'Tahoma, sans-serif' => 'Tahoma',
                        'Trebuchet MS, sans-serif' => 'Trebuchet MS'
                    ])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'font-family: {{VALUE}};'
                    ])
            )
            ->registerField(
                'font_size',
                FieldManager::NUMBER()
                    ->setLabel('Font Size')
                    ->setDefault(16)
                    ->setMin(10)
                    ->setMax(48)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'font_weight',
                FieldManager::SELECT()
                    ->setLabel('Font Weight')
                    ->setDefault('400')
                    ->addFontWeightOptions()
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'font-weight: {{VALUE}};'
                    ])
            )
            ->registerField(
                'line_height',
                FieldManager::NUMBER()
                    ->setLabel('Line Height')
                    ->setDefault(1.4)
                    ->setMin(1)
                    ->setMax(3)
                    ->setStep(0.1)
                    ->setUnit('em')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'line-height: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'letter_spacing',
                FieldManager::NUMBER()
                    ->setLabel('Letter Spacing')
                    ->setDefault(0)
                    ->setMin(-2)
                    ->setMax(5)
                    ->setStep(0.1)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'letter-spacing: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'text_transform',
                FieldManager::SELECT()
                    ->setLabel('Text Transform')
                    ->setDefault('none')
                    ->setOptions([
                        'none' => 'None',
                        'uppercase' => 'Uppercase',
                        'lowercase' => 'Lowercase',
                        'capitalize' => 'Capitalize'
                    ])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'text-transform: {{VALUE}};'
                    ])
            )
            ->registerField(
                'text_decoration',
                FieldManager::SELECT()
                    ->setLabel('Text Decoration')
                    ->setDefault('underline')
                    ->setOptions([
                        'none' => 'None',
                        'underline' => 'Underline',
                        'overline' => 'Overline',
                        'line-through' => 'Line Through'
                    ])
                    ->setCondition(['link_style' => 'text'])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'text-decoration: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Colors Group
        $control->addGroup('colors', 'Colors')
            ->registerField(
                'text_color',
                FieldManager::COLOR()
                    ->setLabel('Text Color')
                    ->setDefault('#007cba')
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'text_hover_color',
                FieldManager::COLOR()
                    ->setLabel('Hover Text Color')
                    ->setDefault('#005a87')
                    ->setSelectors([
                        '{{WRAPPER}} .link-element:hover' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'background_color',
                FieldManager::COLOR()
                    ->setLabel('Background Color')
                    ->setDefault('')
                    ->setCondition(['link_style' => 'button'])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element.button-style' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'background_hover_color',
                FieldManager::COLOR()
                    ->setLabel('Hover Background Color')
                    ->setDefault('')
                    ->setCondition(['link_style' => 'button'])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element.button-style:hover' => 'background-color: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Button Spacing (for button style)
        $control->addGroup('button_spacing', 'Button Spacing')
            ->registerField(
                'button_padding',
                FieldManager::DIMENSION()
                    ->setLabel('Button Padding')
                    ->setDefault(['top' => 12, 'right' => 24, 'bottom' => 12, 'left' => 24])
                    ->setUnits(['px', 'em', 'rem'])
                    ->setMin(0)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setCondition(['link_style' => 'button'])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element.button-style' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Icon Styling Group
        $control->addGroup('icon_style', 'Icon Style')
            ->registerField(
                'icon_size',
                FieldManager::NUMBER()
                    ->setLabel('Icon Size')
                    ->setDefault(16)
                    ->setMin(8)
                    ->setMax(48)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setCondition(['show_icon' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .link-icon' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'icon_color',
                FieldManager::COLOR()
                    ->setLabel('Icon Color')
                    ->setDefault('')
                    ->setCondition(['show_icon' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .link-icon' => 'color: {{VALUE}};'
                    ])
                    ->setDescription('Leave empty to inherit text color')
            )
            ->registerField(
                'icon_hover_color',
                FieldManager::COLOR()
                    ->setLabel('Icon Hover Color')
                    ->setDefault('')
                    ->setCondition(['show_icon' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element:hover .link-icon' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'icon_spacing',
                FieldManager::NUMBER()
                    ->setLabel('Icon Spacing')
                    ->setDefault(8)
                    ->setMin(0)
                    ->setMax(30)
                    ->setUnit('px')
                    ->setCondition(['show_icon' => true])
                    ->setDescription('Space between icon and text')
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
                        '{{WRAPPER}} .link-element' => 'border-width: {{VALUE}}{{UNIT}}; border-style: solid;'
                    ])
            )
            ->registerField(
                'border_color',
                FieldManager::COLOR()
                    ->setLabel('Border Color')
                    ->setDefault('#000000')
                    ->setCondition(['border_width' => ['>', 0]])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'border-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'border_hover_color',
                FieldManager::COLOR()
                    ->setLabel('Hover Border Color')
                    ->setDefault('')
                    ->setCondition(['border_width' => ['>', 0]])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element:hover' => 'border-color: {{VALUE}};'
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
                        '{{WRAPPER}} .link-element' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'box_shadow',
                FieldManager::TEXT()
                    ->setLabel('Box Shadow')
                    ->setDefault('none')
                    ->setPlaceholder('0 2px 4px rgba(0,0,0,0.1)')
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'box-shadow: {{VALUE}};'
                    ])
            )
            ->registerField(
                'box_shadow_hover',
                FieldManager::TEXT()
                    ->setLabel('Hover Box Shadow')
                    ->setDefault('')
                    ->setPlaceholder('0 4px 8px rgba(0,0,0,0.2)')
                    ->setSelectors([
                        '{{WRAPPER}} .link-element:hover' => 'box-shadow: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Position & Alignment Group
        $control->addGroup('alignment', 'Position & Alignment')
            ->registerField(
                'link_alignment',
                FieldManager::SELECT()
                    ->setLabel('Link Alignment')
                    ->setDefault('left')
                    ->setOptions([
                        'left' => 'Left',
                        'center' => 'Center',
                        'right' => 'Right',
                        'justify' => 'Justify'
                    ])
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .link-container' => 'text-align: {{VALUE}};'
                    ])
            )
            ->registerField(
                'display',
                FieldManager::SELECT()
                    ->setLabel('Display Type')
                    ->setDefault('inline-block')
                    ->setOptions([
                        'inline' => 'Inline',
                        'inline-block' => 'Inline Block',
                        'block' => 'Block',
                        'flex' => 'Flex'
                    ])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'display: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField(
                'margin',
                FieldManager::DIMENSION()
                    ->setLabel('Margin')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setAllowNegative(true)
                    ->setMin(-50)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Animation & Effects Group
        $control->addGroup('animation', 'Animation & Effects')
            ->registerField(
                'transition_duration',
                FieldManager::NUMBER()
                    ->setLabel('Transition Duration')
                    ->setDefault(300)
                    ->setMin(0)
                    ->setMax(2000)
                    ->setStep(50)
                    ->setUnit('ms')
                    ->setSelectors([
                        '{{WRAPPER}} .link-element' => 'transition-duration: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'hover_transform',
                FieldManager::SELECT()
                    ->setLabel('Hover Transform')
                    ->setDefault('none')
                    ->setOptions([
                        'none' => 'None',
                        'scale(1.05)' => 'Scale Up',
                        'scale(0.95)' => 'Scale Down',
                        'translateY(-2px)' => 'Move Up',
                        'translateY(2px)' => 'Move Down',
                        'skew(2deg)' => 'Skew',
                        'rotate(2deg)' => 'Rotate'
                    ])
                    ->setSelectors([
                        '{{WRAPPER}} .link-element:hover' => 'transform: {{VALUE}};'
                    ])
            )
            ->registerField(
                'hover_opacity',
                FieldManager::NUMBER()
                    ->setLabel('Hover Opacity')
                    ->setDefault(1)
                    ->setMin(0)
                    ->setMax(1)
                    ->setStep(0.1)
                    ->setSelectors([
                        '{{WRAPPER}} .link-element:hover' => 'opacity: {{VALUE}};'
                    ])
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the link HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        // Access nested content structure
        $content = $general['content'] ?? [];
        $type = $general['type'] ?? [];
        $icon = $general['icon'] ?? [];
        $behavior = $general['behavior'] ?? [];
        $accessibility = $general['accessibility'] ?? [];

        $linkText = htmlspecialchars(is_array($content['link_text'] ?? '') ? 'Click Here' : ($content['link_text'] ?? 'Click Here'), ENT_QUOTES, 'UTF-8');
        $linkUrl = htmlspecialchars(is_array($content['link_url'] ?? '') ? '#' : ($content['link_url'] ?? '#'), ENT_QUOTES, 'UTF-8');
        $linkTitle = htmlspecialchars(is_array($content['link_title'] ?? '') ? '' : ($content['link_title'] ?? ''), ENT_QUOTES, 'UTF-8');

        $linkStyle = $type['link_style'] ?? 'text';
        $buttonSize = $type['button_size'] ?? 'medium';
        $fullWidth = $type['full_width'] ?? false;

        $showIcon = $icon['show_icon'] ?? false;
        $iconName = $icon['icon_name'] ?? 'external-link';
        $iconPosition = $icon['icon_position'] ?? 'right';
        $iconOnly = $icon['icon_only'] ?? false;

        $linkTarget = $behavior['link_target'] ?? '_self';
        $linkRel = $behavior['link_rel'] ?? 'none';
        $downloadAttr = $behavior['download_attr'] ?? false;
        $downloadFilename = $behavior['download_filename'] ?? '';

        $ariaLabel = htmlspecialchars($accessibility['aria_label'] ?? '', ENT_QUOTES, 'UTF-8');
        $customAttributes = $accessibility['custom_attributes'] ?? '';

        $linkAlignment = $style['link_alignment'] ?? 'left';
        $iconSpacing = $style['icon_spacing'] ?? 8;

        // Build CSS classes
        $classes = ['link-element'];

        if ($linkStyle === 'button') {
            $classes[] = 'button-style';
            $classes[] = 'button-' . $buttonSize;

            if ($fullWidth) {
                $classes[] = 'button-full-width';
            }
        } elseif ($linkStyle === 'inline') {
            $classes[] = 'inline-style';
        }

        if ($showIcon) {
            $classes[] = 'has-icon';
            $classes[] = 'icon-' . $iconPosition;

            if ($iconOnly) {
                $classes[] = 'icon-only';
            }
        }

        $classString = implode(' ', $classes);

        // Build link attributes
        $attributes = [
            'href' => $linkUrl,
            'class' => $classString,
            'target' => $linkTarget
        ];

        if (!empty($linkTitle)) {
            $attributes['title'] = $linkTitle;
        }

        if ($linkRel !== 'none') {
            $attributes['rel'] = $linkRel;
        }

        if ($downloadAttr) {
            $attributes['download'] = !empty($downloadFilename) ? $downloadFilename : true;
        }

        if (!empty($ariaLabel)) {
            $attributes['aria-label'] = $ariaLabel;
        }

        // Add custom attributes
        if (!empty($customAttributes)) {
            $customAttrs = array_filter(array_map('trim', explode("\n", $customAttributes)));
            foreach ($customAttrs as $attr) {
                if (strpos($attr, '=') !== false) {
                    list($key, $value) = explode('=', $attr, 2);
                    $key = trim($key);
                    $value = trim($value, '"\'');
                    if (!empty($key)) {
                        $attributes[$key] = $value;
                    }
                }
            }
        }

        // Build attributes string
        $attributesString = '';
        foreach ($attributes as $attr => $value) {
            if (is_bool($value)) {
                if ($value) {
                    $attributesString .= ' ' . $attr;
                }
            } else {
                $attributesString .= ' ' . $attr . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
            }
        }

        // Build content
        $content = '';
        $iconHtml = '';

        if ($showIcon) {
            $iconStyle = '';
            if ($iconSpacing > 0) {
                $spacingProperty = '';
                switch ($iconPosition) {
                    case 'left':
                        $spacingProperty = 'margin-right';
                        break;
                    case 'right':
                        $spacingProperty = 'margin-left';
                        break;
                    case 'top':
                        $spacingProperty = 'margin-bottom';
                        break;
                    case 'bottom':
                        $spacingProperty = 'margin-top';
                        break;
                }
                if ($spacingProperty) {
                    $iconStyle = ' style="' . $spacingProperty . ': ' . $iconSpacing . 'px;"';
                }
            }

            $iconHtml = '<i class="link-icon icon-' . htmlspecialchars($iconName, ENT_QUOTES, 'UTF-8') . '"' . $iconStyle . '></i>';
        }

        $textHtml = $iconOnly ? '' : '<span class="link-text">' . $linkText . '</span>';

        // Arrange content based on icon position
        switch ($iconPosition) {
            case 'left':
                $content = $iconHtml . $textHtml;
                break;
            case 'right':
                $content = $textHtml . $iconHtml;
                break;
            case 'top':
                $content = '<span class="link-content-vertical">' . $iconHtml . $textHtml . '</span>';
                break;
            case 'bottom':
                $content = '<span class="link-content-vertical">' . $textHtml . $iconHtml . '</span>';
                break;
            default:
                $content = $textHtml . $iconHtml;
        }

        // If only icon, just use icon
        if ($iconOnly) {
            $content = $iconHtml;
        }

        // Container classes
        $containerClasses = ['link-container'];
        if ($linkAlignment !== 'left') {
            $containerClasses[] = 'align-' . $linkAlignment;
        }

        $containerClass = implode(' ', $containerClasses);

        return "<div class=\"{$containerClass}\"><a{$attributesString}>{$content}</a></div>";
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

        // Add button size CSS
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        if (($general['link_style'] ?? 'text') === 'button') {
            $css .= $this->generateButtonSizeCSS($widgetId, $general['button_size'] ?? 'medium');

            if ($general['full_width'] ?? false) {
                $css .= "\n#{$widgetId} .link-element.button-full-width { width: 100%; }";
            }
        }

        // Add icon positioning CSS
        if ($general['show_icon'] ?? false) {
            $css .= $this->generateIconPositionCSS($widgetId, $general['icon_position'] ?? 'right');
        }

        return $css;
    }

    /**
     * Generate button size specific CSS
     */
    private function generateButtonSizeCSS(string $widgetId, string $size): string
    {
        $sizes = [
            'small' => ['padding' => '8px 16px', 'font-size' => '14px'],
            'medium' => ['padding' => '12px 24px', 'font-size' => '16px'],
            'large' => ['padding' => '16px 32px', 'font-size' => '18px'],
            'extra-large' => ['padding' => '20px 40px', 'font-size' => '20px']
        ];

        if (!isset($sizes[$size])) {
            return '';
        }

        $sizeConfig = $sizes[$size];
        $css = "\n#{$widgetId} .link-element.button-{$size} {";
        $css .= "\n    padding: {$sizeConfig['padding']};";
        $css .= "\n    font-size: {$sizeConfig['font-size']};";
        $css .= "\n}";

        return $css;
    }

    /**
     * Generate icon position specific CSS
     */
    private function generateIconPositionCSS(string $widgetId, string $position): string
    {
        $css = '';

        if (in_array($position, ['top', 'bottom'])) {
            $css .= "\n#{$widgetId} .link-content-vertical {";
            $css .= "\n    display: flex;";
            $css .= "\n    flex-direction: column;";
            $css .= "\n    align-items: center;";
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

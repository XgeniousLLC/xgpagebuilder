<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * ListWidget - Provides ordered and unordered lists with advanced styling
 * 
 * Features:
 * - Ordered and unordered lists
 * - Nested list support
 * - Custom list markers/icons
 * - Full typography controls
 * - Item spacing controls
 * - Icon integration
 * - Advanced styling options
 * 
 * @package plugins\Pagebuilder\Widgets\Basic
 */
class ListWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'list';
    }

    protected function getWidgetName(): string
    {
        return 'List';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-list';
    }

    protected function getWidgetDescription(): string
    {
        return 'Create ordered or unordered lists with custom styling and icon support';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['list', 'ordered', 'unordered', 'bullets', 'items', 'content', 'nested'];
    }

    /**
     * General settings for list content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // List Type Group
        $control->addGroup('list_type', 'List Configuration')
            ->registerField(
                'list_style',
                FieldManager::SELECT()
                    ->setLabel('List Type')
                    ->setDefault('unordered')
                    ->setOptions([
                        'unordered' => 'Unordered List (Bullets)',
                        'ordered' => 'Ordered List (Numbers)',
                        'custom' => 'Custom Icon List'
                    ])
                    ->setDescription('Choose the type of list to display')
            )
            ->registerField(
                'ordered_type',
                FieldManager::SELECT()
                    ->setLabel('Numbering Type')
                    ->setDefault('decimal')
                    ->setOptions([
                        'decimal' => '1, 2, 3...',
                        'decimal-leading-zero' => '01, 02, 03...',
                        'lower-roman' => 'i, ii, iii...',
                        'upper-roman' => 'I, II, III...',
                        'lower-alpha' => 'a, b, c...',
                        'upper-alpha' => 'A, B, C...',
                        'lower-greek' => 'α, β, γ...'
                    ])
                    ->setCondition(['list_style' => 'ordered'])
                    ->setDescription('Choose numbering style for ordered lists')
            )
            ->registerField(
                'unordered_type',
                FieldManager::SELECT()
                    ->setLabel('Bullet Type')
                    ->setDefault('disc')
                    ->setOptions([
                        'disc' => 'Filled Circle',
                        'circle' => 'Empty Circle',
                        'square' => 'Square',
                        'none' => 'No Bullet'
                    ])
                    ->setCondition(['list_style' => 'unordered'])
                    ->setDescription('Choose bullet style for unordered lists')
            )
            ->registerField(
                'custom_icon',
                FieldManager::ICON()
                    ->setLabel('Custom Icon')
                    ->setDefault('check')
                    ->setCondition(['list_style' => 'custom'])
                    ->setDescription('Choose custom icon for list items')
            )
            ->endGroup();

        // List Items Group
        $control->addGroup('items', 'List Items')
            ->registerField(
                'list_items',
                FieldManager::REPEATER()
                    ->setLabel('List Items')
                    ->setDefault([
                        ['text' => 'First list item', 'link' => '', 'nested_items' => ''],
                        ['text' => 'Second list item', 'link' => '', 'nested_items' => ''],
                        ['text' => 'Third list item', 'link' => '', 'nested_items' => '']
                    ])
                    ->setFields([
                        'text' => FieldManager::TEXT()
                            ->setLabel('Item Text')
                            ->setRequired(true)
                            ->setDefault('List item text'),
                        'link' => FieldManager::URL()
                            ->setLabel('Link URL (optional)')
                            ->setPlaceholder('https://example.com'),
                        'link_target' => FieldManager::SELECT()
                            ->setLabel('Link Target')
                            ->setDefault('_self')
                            ->setOptions([
                                '_self' => 'Same Window',
                                '_blank' => 'New Window'
                            ])
                            ->setCondition(['link' => ['!=', '']]),
                        'nested_items' => FieldManager::TEXTAREA()
                            ->setLabel('Nested Items (one per line)')
                            ->setRows(3)
                            ->setPlaceholder('Sub-item 1&#10;Sub-item 2&#10;Sub-item 3')
                            ->setDescription('Enter nested list items, one per line')
                    ])
                    ->setDescription('Add and manage list items with optional nested content')
            )
            ->endGroup();

        // Behavior Group
        $control->addGroup('behavior', 'List Behavior')
            ->registerField(
                'enable_nested',
                FieldManager::TOGGLE()
                    ->setLabel('Enable Nested Lists')
                    ->setDefault(true)
                    ->setDescription('Allow nested sub-lists within items')
            )
            ->registerField(
                'start_number',
                FieldManager::NUMBER()
                    ->setLabel('Start Number')
                    ->setDefault(1)
                    ->setMin(0)
                    ->setMax(999)
                    ->setCondition(['list_style' => 'ordered'])
                    ->setDescription('Starting number for ordered lists')
            )
            ->registerField(
                'reverse_order',
                FieldManager::TOGGLE()
                    ->setLabel('Reverse Order')
                    ->setDefault(false)
                    ->setCondition(['list_style' => 'ordered'])
                    ->setDescription('Count down instead of up')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings with comprehensive list styling controls
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // List Container Group
        $control->addGroup('container', 'List Container')
            ->registerField(
                'list_alignment',
                FieldManager::SELECT()
                    ->setLabel('List Alignment')
                    ->setDefault('left')
                    ->setOptions([
                        'left' => 'Left',
                        'center' => 'Center',
                        'right' => 'Right'
                    ])
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .list-container' => 'text-align: {{VALUE}};'
                    ])
            )
            ->registerField(
                'list_position',
                FieldManager::SELECT()
                    ->setLabel('List Position')
                    ->setDefault('outside')
                    ->setOptions([
                        'inside' => 'Inside',
                        'outside' => 'Outside'
                    ])
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'list-style-position: {{VALUE}};'
                    ])
            )
            ->endGroup();

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
                        '{{WRAPPER}} .list-element' => 'font-family: {{VALUE}};'
                    ])
            )
            ->registerField(
                'font_size',
                FieldManager::NUMBER()
                    ->setLabel('Font Size')
                    ->setDefault(16)
                    ->setMin(10)
                    ->setMax(32)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'font_weight',
                FieldManager::SELECT()
                    ->setLabel('Font Weight')
                    ->setDefault('400')
                    ->addFontWeightOptions()
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'font-weight: {{VALUE}};'
                    ])
            )
            ->registerField(
                'line_height',
                FieldManager::NUMBER()
                    ->setLabel('Line Height')
                    ->setDefault(1.5)
                    ->setMin(1)
                    ->setMax(3)
                    ->setStep(0.1)
                    ->setUnit('em')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .list-element li' => 'line-height: {{VALUE}}{{UNIT}};'
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
                        '{{WRAPPER}} .list-element' => 'letter-spacing: {{VALUE}}{{UNIT}};'
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
                        '{{WRAPPER}} .list-element' => 'text-transform: {{VALUE}};'
                    ])
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
                        '{{WRAPPER}} .list-element' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'marker_color',
                FieldManager::COLOR()
                    ->setLabel('Marker/Number Color')
                    ->setDefault('#666666')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element li::marker' => 'color: {{VALUE}};',
                        '{{WRAPPER}} .list-element.custom-icon .list-icon' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'link_color',
                FieldManager::COLOR()
                    ->setLabel('Link Color')
                    ->setDefault('#007cba')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element a' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'link_hover_color',
                FieldManager::COLOR()
                    ->setLabel('Link Hover Color')
                    ->setDefault('#005a87')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element a:hover' => 'color: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField(
                'item_spacing',
                FieldManager::NUMBER()
                    ->setLabel('Item Spacing')
                    ->setDefault(8)
                    ->setMin(0)
                    ->setMax(50)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .list-element li' => 'margin-bottom: {{VALUE}}{{UNIT}};'
                    ])
                    ->setDescription('Space between list items')
            )
            ->registerField(
                'nested_indent',
                FieldManager::NUMBER()
                    ->setLabel('Nested Indent')
                    ->setDefault(20)
                    ->setMin(0)
                    ->setMax(100)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element ul ul, {{WRAPPER}} .list-element ol ol' => 'margin-left: {{VALUE}}{{UNIT}};'
                    ])
                    ->setDescription('Indentation for nested lists')
            )
            ->registerField(
                'marker_spacing',
                FieldManager::NUMBER()
                    ->setLabel('Marker Spacing')
                    ->setDefault(8)
                    ->setMin(0)
                    ->setMax(30)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element.custom-icon .list-icon' => 'margin-right: {{VALUE}}{{UNIT}};'
                    ])
                    ->setCondition(['list_style' => 'custom'])
                    ->setDescription('Space between custom icon and text')
            )
            ->registerField(
                'list_padding',
                FieldManager::DIMENSION()
                    ->setLabel('List Padding')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 20])
                    ->setUnits(['px', 'em', 'rem'])
                    ->setMin(0)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'list_margin',
                FieldManager::DIMENSION()
                    ->setLabel('List Margin')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 16, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setAllowNegative(true)
                    ->setMin(-50)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Custom Icon Styling
        $control->addGroup('icon_style', 'Custom Icon Style')
            ->registerField(
                'icon_size',
                FieldManager::NUMBER()
                    ->setLabel('Icon Size')
                    ->setDefault(16)
                    ->setMin(8)
                    ->setMax(32)
                    ->setUnit('px')
                    ->setCondition(['list_style' => 'custom'])
                    ->setSelectors([
                        '{{WRAPPER}} .list-element.custom-icon .list-icon' => 'font-size: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'icon_background',
                FieldManager::COLOR()
                    ->setLabel('Icon Background')
                    ->setDefault('')
                    ->setCondition(['list_style' => 'custom'])
                    ->setSelectors([
                        '{{WRAPPER}} .list-element.custom-icon .list-icon' => 'background-color: {{VALUE}};'
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
                    ->setCondition(['list_style' => 'custom'])
                    ->setSelectors([
                        '{{WRAPPER}} .list-element.custom-icon .list-icon' => 'border-radius: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'icon_padding',
                FieldManager::DIMENSION()
                    ->setLabel('Icon Padding')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                    ->setUnits(['px', 'em'])
                    ->setMin(0)
                    ->setMax(20)
                    ->setCondition(['list_style' => 'custom'])
                    ->setSelectors([
                        '{{WRAPPER}} .list-element.custom-icon .list-icon' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Background & Border Group
        $control->addGroup('background', 'Background & Border')
            ->registerField(
                'background_color',
                FieldManager::COLOR()
                    ->setLabel('Background Color')
                    ->setDefault('')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'border_width',
                FieldManager::NUMBER()
                    ->setLabel('Border Width')
                    ->setDefault(0)
                    ->setMin(0)
                    ->setMax(10)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'border-width: {{VALUE}}{{UNIT}}; border-style: solid;'
                    ])
            )
            ->registerField(
                'border_color',
                FieldManager::COLOR()
                    ->setLabel('Border Color')
                    ->setDefault('#000000')
                    ->setCondition(['border_width' => ['>', 0]])
                    ->setSelectors([
                        '{{WRAPPER}} .list-element' => 'border-color: {{VALUE}};'
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
                        '{{WRAPPER}} .list-element' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the list HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        $listStyle = $general['list_type']['list_style'] ?? 'unordered';
        $orderedType = $general['list_type']['ordered_type'] ?? 'decimal';
        $unorderedType = $general['list_type']['unordered_type'] ?? 'disc';
        $customIcon = $general['list_type']['custom_icon'] ?? 'check';

        $listItems = $general['items']['list_items'] ?? [];
        $enableNested = $general['behavior']['enable_nested'] ?? true;
        $startNumber = $general['behavior']['start_number'] ?? 1;
        $reverseOrder = $general['behavior']['reverse_order'] ?? false;

        $listAlignment = $style['list_alignment'] ?? 'left';

        // Use default items if none provided
        if (empty($listItems)) {
            $listItems = [
                ['text' => 'First list item', 'link' => '', 'nested_items' => ''],
                ['text' => 'Second list item', 'link' => '', 'nested_items' => ''],
                ['text' => 'Third list item', 'link' => '', 'nested_items' => '']
            ];
        }

        $classes = ['list-container'];
        if ($listAlignment !== 'left') {
            $classes[] = 'align-' . $listAlignment;
        }

        $containerClass = implode(' ', $classes);

        // Generate list HTML
        $listTag = $listStyle === 'ordered' ? 'ol' : 'ul';
        $listClasses = ['list-element'];

        if ($listStyle === 'custom') {
            $listClasses[] = 'custom-icon';
            $listClasses[] = 'icon-' . $customIcon;
        }

        $listClass = implode(' ', $listClasses);

        // Build list attributes
        $listAttributes = ['class' => $listClass];

        if ($listStyle === 'ordered') {
            $listAttributes['style'] = 'list-style-type: ' . $orderedType . ';';
            if ($startNumber !== 1) {
                $listAttributes['start'] = $startNumber;
            }
            if ($reverseOrder) {
                $listAttributes['reversed'] = 'reversed';
            }
        } elseif ($listStyle === 'unordered') {
            $listAttributes['style'] = 'list-style-type: ' . $unorderedType . ';';
        } else {
            $listAttributes['style'] = 'list-style-type: none;';
        }

        $listAttrs = '';
        foreach ($listAttributes as $attr => $value) {
            $listAttrs .= ' ' . $attr . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
        }

        // Generate list items
        $itemsHtml = '';
        foreach ($listItems as $item) {
            $itemsHtml .= $this->renderListItem($item, $listStyle, $customIcon, $enableNested);
        }

        return "<div class=\"{$containerClass}\"><{$listTag}{$listAttrs}>{$itemsHtml}</{$listTag}></div>";
    }

    /**
     * Render individual list item with nested support
     */
    private function renderListItem(array $item, string $listStyle, string $customIcon, bool $enableNested): string
    {
        // Sanitize TEXT 
        $textRaw = $item['text'] ?? '';

        if (is_array($textRaw)) {
            $textRaw = $textRaw['value']
                ?? $textRaw['text']
                ?? reset($textRaw)
                ?? '';
        }

        $text = htmlspecialchars((string)$textRaw, ENT_QUOTES, 'UTF-8');


        // Sanitize LINK
        $linkRaw = $item['link'] ?? '';
        if (is_array($linkRaw)) {
            $linkRaw = reset($linkRaw) ?? '';
        }
        $link = (string) $linkRaw;


        // Sanitize LINK TARGET
        $linkTargetRaw = $item['link_target'] ?? '_self';
        if (is_array($linkTargetRaw)) {
            $linkTargetRaw = reset($linkTargetRaw) ?? '_self';
        }
        $linkTarget = (string) $linkTargetRaw;


        // Sanitize CUSTOM ICON
        if (is_array($customIcon)) {
            $customIcon = reset($customIcon) ?? '';
        }
        $customIcon = (string)$customIcon;


        // Nested items    
        $nestedItems = $item['nested_items'] ?? '';

        $itemContent = '';


        // Custom icon
        if ($listStyle === 'custom') {
            $itemContent .= '<i class="list-icon icon-'
                . htmlspecialchars($customIcon, ENT_QUOTES, 'UTF-8')
                . '"></i>';
        }


        /* Add text + link */
        if (!empty($link)) {

            $itemContent .= '<a href="'
                . htmlspecialchars($link, ENT_QUOTES, 'UTF-8')
                . '" target="'
                . htmlspecialchars($linkTarget, ENT_QUOTES, 'UTF-8')
                . '">'
                . $text
                . '</a>';
        } else {

            $itemContent .= '<span class="list-text">' . $text . '</span>';
        }


        /* Nested items */
        if ($enableNested && !empty($nestedItems)) {
            $itemContent .= $this->renderNestedList($nestedItems, $listStyle, $customIcon);
        }


        return '<li>' . $itemContent . '</li>';
    }

    /**
     * Render nested list from textarea input
     */
    private function renderNestedList(string $nestedItems, string $listStyle, string $customIcon): string
    {
        $items = array_filter(array_map('trim', explode("\n", $nestedItems)));

        if (empty($items)) {
            return '';
        }

        $listTag = $listStyle === 'ordered' ? 'ol' : 'ul';
        $nestedClass = 'nested-list';

        if ($listStyle === 'custom') {
            $nestedClass .= ' custom-icon icon-' . $customIcon;
        }

        $nestedHtml = '';
        foreach ($items as $item) {
            $itemText = htmlspecialchars($item, ENT_QUOTES, 'UTF-8');
            $iconHtml = '';

            if ($listStyle === 'custom') {
                $iconHtml = '<i class="list-icon icon-' . htmlspecialchars($customIcon, ENT_QUOTES, 'UTF-8') . '"></i>';
            }

            $nestedHtml .= '<li>' . $iconHtml . '<span class="list-text">' . $itemText . '</span></li>';
        }

        return '<' . $listTag . ' class="' . $nestedClass . '">' . $nestedHtml . '</' . $listTag . '>';
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

        // Add custom icon positioning CSS
        $general = $settings['general'] ?? [];
        if (($general['list_style'] ?? 'unordered') === 'custom') {
            $css .= "\n#{$widgetId} .list-element.custom-icon li {";
            $css .= "\n    display: flex;";
            $css .= "\n    align-items: flex-start;";
            $css .= "\n}";
            $css .= "\n#{$widgetId} .list-element.custom-icon .list-icon {";
            $css .= "\n    flex-shrink: 0;";
            $css .= "\n    margin-top: 0.2em;";
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

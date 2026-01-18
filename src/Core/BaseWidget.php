<?php

namespace Xgenious\PageBuilder\Core;

use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\CSSManager;
use App\Utils\XSSProtection;

abstract class BaseWidget
{
    use AutoStyleGenerator;
    use WidgetWrapper;
    protected string $widget_type;
    protected string $widget_name;
    protected string|array $widget_icon;
    protected string $widget_category;
    protected string $widget_description;
    protected array $widget_tags = [];
    protected array $settings_tabs = ['general', 'style', 'advanced'];
    protected bool $is_pro = false;
    protected int $sort_order = 0;
    protected bool $is_active = true;

    public function __construct()
    {
        $this->widget_type = $this->getWidgetType();
        $this->widget_name = $this->getWidgetName();
        $this->widget_icon = $this->normalizeIcon($this->getWidgetIcon());
        $this->widget_category = $this->getCategory();
        $this->widget_description = $this->getWidgetDescription();
        $this->widget_tags = $this->getWidgetTags();
        $this->is_pro = $this->isPro();
    }

    // Abstract methods that must be implemented by child classes
    abstract protected function getWidgetType(): string;
    abstract protected function getWidgetName(): string;
    /**
     * Get widget icon.
     * Can return:
     * - String: 'lni-text-format' (Lineicons)
     * - String: 'la-heading' (Line Awesome)
     * - Array: ['type' => 'svg', 'content' => '<svg>...</svg>']
     * - Array: ['type' => 'lineicons', 'icon' => 'lni-text-format']
     * - Array: ['type' => 'line-awesome', 'icon' => 'la-heading']
     */
    abstract protected function getWidgetIcon(): string|array;
    abstract protected function getWidgetDescription(): string;
    abstract protected function getCategory(): string;
    abstract public function getGeneralFields(): array;
    abstract public function getStyleFields(): array;

    /**
     * Whether this widget should inherit default style fields
     * By default, widgets do NOT inherit default fields (only show their own PHP-defined fields)
     * Override to return true for sections, columns, and special widgets that need defaults
     */
    protected function shouldInheritDefaultStyleFields(): bool
    {
        return false;
    }

    /**
     * Whether this widget should inherit default general fields
     * By default, widgets do NOT inherit default fields (only show their own PHP-defined fields)
     * Override to return true for sections, columns, and special widgets that need defaults
     */
    protected function shouldInheritDefaultGeneralFields(): bool
    {
        return false;
    }

    /**
     * Get essential default general fields for all widgets
     * These are the core general controls that every widget should have
     */
    protected function getDefaultGeneralFields(): array
    {
        // Base widgets can define common general fields here
        // For now, return empty - widgets define their own general fields
        return [];
    }

    /**
     * Get essential default style fields for all widgets
     * These are the core styling controls that every widget should have
     */
    protected function getDefaultStyleFields(): array
    {
        $control = new ControlManager();

        // Background Group
        $control->addGroup('background', 'Background')
            ->registerField('widget_background', FieldManager::BACKGROUND_GROUP()
                ->setLabel('Background')
                ->setAllowedTypes(['none', 'color', 'gradient', 'image'])
                ->setDefaultType('none')
                ->setEnableHover(false)
                ->setEnableImage(true)
                ->setSelectors([
                    '{{WRAPPER}}' => 'background: {{VALUE}};'
                ])
                ->setDescription('Configure widget background with color, gradient, image or none')
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setMin(0)
                ->setMax(200)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}}' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
                ->setDescription('Set internal spacing for the widget')
            )
            ->registerField('margin', FieldManager::DIMENSION()
                ->setLabel('Margin')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setAllowNegative(true)
                ->setMin(-200)
                ->setMax(200)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}}' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
                ->setDescription('Set external spacing around the widget')
            )
            ->endGroup();

        // Border Group
        $control->addGroup('border', 'Border')
            ->registerField('border_width', FieldManager::NUMBER()
                ->setLabel('Border Width')
                ->setDefault(0)
                ->setMin(0)
                ->setMax(20)
                ->setUnit('px')
                ->setSelectors([
                    '{{WRAPPER}}' => 'border-width: {{VALUE}}{{UNIT}}; border-style: solid;'
                ])
            )
            ->registerField('border_color', FieldManager::COLOR()
                ->setLabel('Border Color')
                ->setDefault('#e2e8f0')
                ->setCondition(['border_width' => ['>', 0]])
                ->setSelectors([
                    '{{WRAPPER}}' => 'border-color: {{VALUE}};'
                ])
            )
            ->registerField('border_radius', FieldManager::DIMENSION()
                ->setLabel('Border Radius')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setMin(0)
                ->setMax(100)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}}' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        return $control->getFields();
    }

    // Optional overrideable methods
    protected function getWidgetTags(): array
    {
        return [];
    }

    protected function isPro(): bool
    {
        return false;
    }

    protected function getSortOrder(): int
    {
        return 0;
    }

    /**
     * Get essential default advanced fields for all widgets
     * These are technical controls that every widget should have
     */
    public function getAdvancedFields(): array
    {
        $control = new ControlManager();

        // Visibility Group
        $control->addGroup('visibility', 'Visibility')
            ->registerField('visible', FieldManager::TOGGLE()
                ->setLabel('Visible')
                ->setDefault(true)
                ->setDescription('Show or hide this widget')
            )
            ->registerField('hide_on_desktop', FieldManager::TOGGLE()
                ->setLabel('Hide on Desktop')
                ->setDefault(false)
                ->setDescription('Hide widget on desktop devices (1025px+)')
            )
            ->registerField('hide_on_tablet', FieldManager::TOGGLE()
                ->setLabel('Hide on Tablet')
                ->setDefault(false)
                ->setDescription('Hide widget on tablet devices (769px-1024px)')
            )
            ->registerField('hide_on_mobile', FieldManager::TOGGLE()
                ->setLabel('Hide on Mobile')
                ->setDefault(false)
                ->setDescription('Hide widget on mobile devices (max 768px)')
            )
            ->endGroup();

        // Custom Attributes Group
        $control->addGroup('custom_attributes', 'Custom Attributes')
            ->registerField('custom_css_class', FieldManager::TEXT()
                ->setLabel('CSS Class')
                ->setPlaceholder('custom-class-name')
                ->setDescription('Add custom CSS classes to the widget')
            )
            ->registerField('custom_id', FieldManager::TEXT()
                ->setLabel('Custom ID')
                ->setPlaceholder('custom-element-id')
                ->setDescription('Set a unique ID for the widget element')
            )
            ->registerField('z_index', FieldManager::NUMBER()
                ->setLabel('Z-Index')
                ->setDefault(1)
                ->setMin(-1000)
                ->setMax(1000)
                ->setDescription('Set the stacking order of the widget')
            )
            ->endGroup();

        // Animation Group
        $control->addGroup('animation', 'Animation')
            ->registerField('animation_type', FieldManager::SELECT()
                ->setLabel('Animation Type')
                ->setOptions([
                    'none' => 'None',
                    'fade-in' => 'Fade In',
                    'slide-up' => 'Slide Up',
                    'slide-down' => 'Slide Down',
                    'slide-left' => 'Slide Left',
                    'slide-right' => 'Slide Right',
                    'zoom-in' => 'Zoom In',
                    'bounce' => 'Bounce'
                ])
                ->setDefault('none')
                ->setDescription('Choose an entrance animation for the widget')
            )
            ->registerField('animation_duration', FieldManager::NUMBER()
                ->setLabel('Duration')
                ->setDefault(500)
                ->setMin(100)
                ->setMax(3000)
                ->setStep(100)
                ->setUnit('ms')
                ->setCondition(['animation_type' => ['!=', 'none']])
                ->setDescription('Animation duration in milliseconds')
            )
            ->registerField('animation_delay', FieldManager::NUMBER()
                ->setLabel('Delay')
                ->setDefault(0)
                ->setMin(0)
                ->setMax(2000)
                ->setStep(100)
                ->setUnit('ms')
                ->setCondition(['animation_type' => ['!=', 'none']])
                ->setDescription('Delay before animation starts in milliseconds')
            )
            ->endGroup();

        // Custom CSS Group
        $control->addGroup('custom_css', 'Custom CSS')
            ->registerField('custom_css', FieldManager::TEXTAREA()
                ->setLabel('Custom CSS')
                ->setPlaceholder('/* Add your custom CSS here */')
                ->setRows(8)
                ->setDescription('Add custom CSS rules for advanced styling')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Normalize icon data to consistent format
     */
    protected function normalizeIcon($icon): array
    {
        // If it's already an array with correct format, return as is
        if (is_array($icon) && isset($icon['type'])) {
            return $icon;
        }
        
        // If it's a string, detect the icon type
        if (is_string($icon)) {
            // Line Awesome icons start with 'la-'
            if (str_starts_with($icon, 'la-')) {
                return [
                    'type' => 'line-awesome',
                    'icon' => $icon
                ];
            }
            
            // Lineicons start with 'lni-'
            if (str_starts_with($icon, 'lni-')) {
                return [
                    'type' => 'lineicons',
                    'icon' => $icon
                ];
            }
            
            // If it looks like SVG content
            if (str_contains($icon, '<svg')) {
                return [
                    'type' => 'svg',
                    'content' => $icon
                ];
            }
            
            // Default to lineicons for backward compatibility
            return [
                'type' => 'lineicons',
                'icon' => $icon
            ];
        }
        
        // Fallback
        return [
            'type' => 'lineicons',
            'icon' => 'lni-layout'
        ];
    }

    // Public getters
    public function getWidgetConfig(): array
    {
        return [
            'type' => $this->widget_type,
            'name' => $this->widget_name,
            'icon' => $this->widget_icon,
            'category' => $this->widget_category,
            'description' => $this->widget_description,
            'tags' => $this->widget_tags,
            'settings_tabs' => $this->settings_tabs,
            'is_pro' => $this->is_pro,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active
        ];
    }

    public function getFieldsByTab(string $tab): array
    {
        switch ($tab) {
            case 'general':
                $widgetGeneralFields = $this->getGeneralFields();
                if ($this->shouldInheritDefaultGeneralFields()) {
                    $defaultGeneralFields = $this->getDefaultGeneralFields();
                    return array_merge($defaultGeneralFields, $widgetGeneralFields);
                }
                return $widgetGeneralFields;
            case 'style':
                $widgetStyleFields = $this->getStyleFields();
                if ($this->shouldInheritDefaultStyleFields()) {
                    // Merge default style fields with widget-specific style fields
                    // Widget fields take priority over defaults
                    $defaultStyleFields = $this->getDefaultStyleFields();
                    return array_merge($defaultStyleFields, $widgetStyleFields);
                }
                return $widgetStyleFields;
            case 'advanced':
                return $this->getAdvancedFields();
            default:
                return [];
        }
    }

    public function getAllFields(): array
    {
        return [
            'general' => $this->getGeneralFields(),
            'style' => $this->getStyleFields(), // Use the direct style fields from widget
            'advanced' => $this->getAdvancedFields()
        ];
    }

    // Widget rendering method (can be overridden)
    public function render(array $settings = []): string
    {
        return '<div class="widget-placeholder">Widget: ' . $this->widget_name . '</div>';
    }

    /**
     * Universal template data preparation for Blade rendering
     * Standardizes data structure passed to all widget templates
     * 
     * @param array $settings Widget settings from page builder
     * @return array Standardized template data
     */
    protected function prepareTemplateData(array $settings): array
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];
        $advanced = $settings['advanced'] ?? [];

        $templateData = [
            'settings' => $settings,
            'general' => $general,
            'style' => $style,
            'advanced' => $advanced,
            'widget' => [
                'type' => $this->getWidgetType(),
                'name' => $this->getWidgetName(),
                'icon' => $this->getWidgetIcon(),
                'description' => $this->getWidgetDescription()
            ],
            'css_classes' => $this->buildCssClasses($settings),
            'inline_styles' => $this->generateInlineStyles(['style' => $style]),
            'widget_id' => $this->generateWidgetId(),
            'widget_attributes' => $this->buildWidgetAttributes($settings)
        ];

        // Add WidgetHelper instance for easy settings access in blade templates
        $templateData['helper'] = new WidgetHelper($templateData);

        return $templateData;
    }

    /**
     * Universal CSS class builder for consistent widget classes
     * Automatically generates standard widget classes plus setting-based classes
     * 
     * @param array $settings Widget settings
     * @return string Space-separated CSS classes
     */
    protected function buildCssClasses(array $settings): string
    {
        $classes = $this->getBaseWidgetClasses();
        $classes = array_merge($classes, $this->extractClassesFromSettings($settings));
        $classes = array_merge($classes, $this->getWidgetSpecificClasses($settings));

        // Remove duplicates and empty values
        $classes = array_unique(array_filter($classes, function($class) {
            return !empty($class) && is_string($class);
        }));

        return implode(' ', $classes);
    }

    /**
     * Get base widget classes that all widgets should have
     * 
     * @return array Base CSS classes
     */
    protected function getBaseWidgetClasses(): array
    {
        return [
            'xgp-widget',
            'xgp-' . $this->getWidgetType(),
            'pagebuilder-widget',
            'pagebuilder-' . $this->getWidgetType()
        ];
    }

    /**
     * Extract CSS classes from widget settings automatically
     * Looks for common patterns in settings that should become CSS classes
     * 
     * @param array $settings Widget settings
     * @return array CSS classes derived from settings
     */
    protected function extractClassesFromSettings(array $settings): array
    {
        $classes = [];
        $general = $settings['general'] ?? [];
        
        // Process general settings for automatic class generation
        foreach ($general as $groupName => $group) {
            if (!is_array($group)) continue;
            
            foreach ($group as $fieldName => $value) {
                $classes = array_merge($classes, $this->fieldValueToClasses($fieldName, $value));
            }
        }

        return $classes;
    }

    /**
     * Convert specific field values to CSS classes
     * 
     * @param string $fieldName Field name
     * @param mixed $value Field value
     * @return array CSS classes for this field
     */
    protected function fieldValueToClasses(string $fieldName, $value): array
    {
        $classes = [];

        switch ($fieldName) {
            case 'text_align':
                if ($value && $value !== 'left') {
                    $classes[] = 'text-' . $value;
                }
                break;
                
            case 'size':
                if ($value) {
                    $classes[] = 'size-' . $value;
                }
                break;
                
            case 'style':
            case 'button_style':
                if ($value) {
                    $classes[] = 'style-' . $value;
                }
                break;
                
            case 'full_width':
                if ($value) {
                    $classes[] = 'full-width';
                }
                break;
                
            case 'disabled':
                if ($value) {
                    $classes[] = 'disabled';
                }
                break;

            case 'heading_level':
                if ($value) {
                    $classes[] = 'heading-' . $value;
                }
                break;
        }

        return $classes;
    }

    /**
     * Get widget-specific classes (override in child classes for custom classes)
     * 
     * @param array $settings Widget settings
     * @return array Widget-specific CSS classes
     */
    protected function getWidgetSpecificClasses(array $settings): array
    {
        return [];
    }

    /**
     * Generate a unique widget ID for CSS and JavaScript targeting
     * 
     * @return string Unique widget ID
     */
    protected function generateWidgetId(): string
    {
        return 'widget-' . $this->getWidgetType() . '-' . uniqid();
    }

    /**
     * Build widget container attributes
     * 
     * @param array $settings Widget settings
     * @return array HTML attributes for widget container
     */
    protected function buildWidgetAttributes(array $settings): array
    {
        $advanced = $settings['advanced'] ?? [];
        $custom = $advanced['custom'] ?? [];

        $attributes = [
            'class' => $this->buildCssClasses($settings),
            'data-widget-type' => $this->getWidgetType()
        ];

        // Add custom ID if specified
        if (!empty($custom['custom_id'])) {
            $attributes['id'] = $this->sanitizeAttribute('id', $custom['custom_id']);
        }

        // Add z-index style if specified
        if (!empty($custom['z_index']) && $custom['z_index'] != 1) {
            $attributes['style'] = 'z-index: ' . (int)$custom['z_index'] . ';';
        }

        return $attributes;
    }

    /**
     * Enhanced automatic CSS generation for widgets
     * Combines base CSS, widget-specific CSS, and field-generated CSS
     * 
     * @param string $widgetId Unique widget instance ID
     * @param array $settings Widget settings
     * @return string Generated CSS
     */
    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $cssParts = [];
        
        // 1. Base widget CSS (responsive, common styles)
        $baseCss = $this->getBaseWidgetCSS($widgetId, $sectionId);
        if (!empty($baseCss)) {
            $cssParts[] = $baseCss;
        }
        
        // 2. Widget-specific default CSS (overrideable)
        $defaultCss = $this->getWidgetDefaultCSS($widgetId);
        if (!empty($defaultCss)) {
            $cssParts[] = $defaultCss;
        }
        
        // 3. Field-generated CSS from AutoStyleGenerator
        $fieldCss = $this->generateFieldCSS($widgetId, $settings, $sectionId);
        if (!empty($fieldCss)) {
            $cssParts[] = $fieldCss;
        }
        
        // 4. Custom CSS from advanced settings
        $customCss = $this->getCustomCSS($widgetId, $settings);
        if (!empty($customCss)) {
            $cssParts[] = $customCss;
        }

        return implode("\n\n", array_filter($cssParts));
    }

    /**
     * Get base CSS that all widgets need (responsive utilities, etc.)
     *
     * @param string $widgetId Widget instance ID
     * @param string|null $sectionId Section ID for CSS scoping
     * @return string Base CSS
     */
    protected function getBaseWidgetCSS(string $widgetId, ?string $sectionId = null): string
    {
        $prefix = $sectionId ? ".{$sectionId} " : '';

        return "
/* Base Widget Styles for {$widgetId} */
{$prefix}.{$widgetId}.xgp-widget {
    position: relative;
    box-sizing: border-box;
}

{$prefix}.{$widgetId}.xgp-widget * {
    box-sizing: border-box;
}

/* Responsive Utilities */
@media (max-width: 768px) {
    {$prefix}.{$widgetId}.hide-mobile {
        display: none !important;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    {$prefix}.{$widgetId}.hide-tablet {
        display: none !important;
    }
}

@media (min-width: 1025px) {
    {$prefix}.{$widgetId}.hide-desktop {
        display: none !important;
    }
}";
    }

    /**
     * Get widget-specific default CSS (override in child classes)
     * 
     * @param string $widgetId Widget instance ID
     * @return string Widget default CSS
     */
    protected function getWidgetDefaultCSS(string $widgetId): string
    {
        return '';
    }

    /**
     * Generate CSS from field configurations using ControlManager
     *
     * @param string $widgetId Widget instance ID
     * @param array $settings Widget settings
     * @param string|null $sectionId Section ID for CSS scoping
     * @return string Field-generated CSS
     */
    protected function generateFieldCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        try {
            // Get style fields configuration with their selectors
            $styleFields = $this->getStyleFields();
            $styleSettings = $settings['style'] ?? [];

            return $this->generateCSSFromFieldsData($styleFields, $styleSettings, $widgetId, $sectionId);
        } catch (\Exception $e) {
            // Fallback to automatic inline style generation if field processing fails
            $inlineStyles = $this->generateInlineStyles(['style' => $settings['style'] ?? []]);

            if (!empty($inlineStyles)) {
                // Wrap inline styles with widget selector for proper CSS
                $prefix = $sectionId ? "#{$sectionId} " : '';
                return "{$prefix}#{$widgetId} .{$this->getWidgetType()}-element { {$inlineStyles} }";
            }

            return '';
        }
    }

    /**
     * Generate CSS from field data structure
     */
    protected function generateCSSFromFieldsData(array $fields, array $values, string $widgetId, ?string $sectionId = null): string
    {
        $css = '';

        foreach ($fields as $fieldKey => $fieldConfig) {
            // Handle groups
            if (isset($fieldConfig['type']) && $fieldConfig['type'] === 'group' && isset($fieldConfig['fields'])) {
                $groupValues = $values[$fieldKey] ?? [];
                $css .= $this->generateCSSFromFieldsData($fieldConfig['fields'], $groupValues, $widgetId, $sectionId);
            }
            // Handle tabs container
            elseif ($fieldKey === '_tabs' && is_array($fieldConfig)) {
                foreach ($fieldConfig as $tabKey => $tabConfig) {
                    $tabValues = $values[$tabKey] ?? [];

                    // Process direct fields in tab
                    if (isset($tabConfig['fields'])) {
                        $css .= $this->generateCSSFromFieldsData($tabConfig['fields'], $tabValues, $widgetId, $sectionId);
                    }

                    // Process groups in tab - handle both nested and flat data structures
                    if (isset($tabConfig['groups'])) {
                        foreach ($tabConfig['groups'] as $groupKey => $groupConfig) {
                            if (isset($groupConfig['fields'])) {
                                // First try nested structure: tabValues[groupKey]
                                $groupValues = $tabValues[$groupKey] ?? [];

                                // If no nested data, check if fields are stored directly in tab
                                if (empty($groupValues)) {
                                    $groupValues = $tabValues; // Use tab values directly for flat structure
                                }

                                $css .= $this->generateCSSFromFieldsData($groupConfig['fields'], $groupValues, $widgetId, $sectionId);
                            }
                        }
                    }
                }
            }
            // Handle individual fields with selectors
            elseif (isset($fieldConfig['selectors']) && !empty($fieldConfig['selectors'])) {
                $fieldValue = $values[$fieldKey] ?? null;

                if ($fieldValue !== null) {
                    $css .= $this->generateSingleFieldCSS($fieldConfig, $fieldValue, $widgetId, $sectionId);
                }
            }
        }

        return $css;
    }

    /**
     * Generate CSS for a single field with its selectors
     */
    protected function generateSingleFieldCSS(array $fieldConfig, $value, string $widgetId, ?string $sectionId = null): string
    {
        $css = '';
        $selectors = $fieldConfig['selectors'];

        // Handle group fields (like BACKGROUND_GROUP) that should use single selector
        if (is_string($selectors)) {
            // Single selector for group fields - let the field type handle CSS generation
            $prefix = $sectionId ? ".{$sectionId} " : '';
            $processedSelector = str_replace('{{WRAPPER}}', "{$prefix}.{$widgetId}", $selectors);
            $cssProperties = $this->generateFieldTypeCSS($fieldConfig, $value);

            if (!empty($cssProperties)) {
                $css .= "{$processedSelector} { {$cssProperties} }\n";
            }
        }
        // Handle array selectors
        elseif (is_array($selectors)) {
            // Check if it's a simple array with just selectors (for group fields like BACKGROUND_GROUP)
            if (array_is_list($selectors)) {
                // Array contains just selectors, use the first one for group fields
                $selector = $selectors[0] ?? '';
                $prefix = $sectionId ? ".{$sectionId} " : '';
                $processedSelector = str_replace('{{WRAPPER}}', "{$prefix}.{$widgetId}", $selector);
                $cssProperties = $this->generateFieldTypeCSS($fieldConfig, $value);

                if (!empty($cssProperties)) {
                    $css .= "{$processedSelector} { {$cssProperties} }\n";
                }
            } else {
                // Traditional array with selector => property mapping for simple fields
                $unit = $fieldConfig['unit'] ?? '';

                foreach ($selectors as $selector => $properties) {
                    // Replace wrapper placeholder
                    $prefix = $sectionId ? ".{$sectionId} " : '';
                    $processedSelector = str_replace('{{WRAPPER}}', "{$prefix}.{$widgetId}", $selector);

                    // Process properties based on field type
                    $processedProperties = $this->processFieldProperties($properties, $value, $unit, $fieldConfig);

                    if (!empty($processedProperties)) {
                        $css .= "{$processedSelector} { {$processedProperties} }\n";
                    }
                }
            }
        }

        return $css;
    }

    /**
     * Generate CSS properties based on field type
     */
    protected function generateFieldTypeCSS(array $fieldConfig, $value): string
    {
        $type = $fieldConfig['type'] ?? '';

        switch ($type) {
            case 'background_group':
                return $this->generateBackgroundCSS($value);

            case 'color':
                return "color: {$value};";

            case 'dimension':
                if (is_array($value)) {
                    $unit = $fieldConfig['unit'] ?? 'px';
                    $top = $value['top'] ?? 0;
                    $right = $value['right'] ?? 0;
                    $bottom = $value['bottom'] ?? 0;
                    $left = $value['left'] ?? 0;
                    return "padding: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit};";
                }
                break;

            case 'number':
                $unit = $fieldConfig['unit'] ?? '';
                return "value: {$value}{$unit};";

            case 'typography_group':
                // Use TypographyField's built-in CSS generation
                if (class_exists('\Xgenious\PageBuilder\Core\Fields\TypographyField')) {
                    return \Xgenious\PageBuilder\Core\Fields\TypographyField::generateCSS($value);
                }
                return '';

            case 'gradient':
                if (!empty($value)) {
                    return "background: {$value};";
                }
                return '';

            case 'alignment':
                if (!empty($value)) {
                    return "text-align: {$value};";
                }
                return '';

            case 'range':
                $unit = $fieldConfig['unit'] ?? '';
                return "{$value}{$unit};";

            case 'border_shadow_group':
                return $this->generateBorderShadowCSS($value);
        }

        return '';
    }

    /**
     * Generate background CSS from background group value
     */
    protected function generateBackgroundCSS($backgroundValue): string
    {
        if (!is_array($backgroundValue)) {
            return '';
        }

        $styles = [];
        $type = $backgroundValue['type'] ?? 'none';

        switch ($type) {
            case 'color':
                if (!empty($backgroundValue['color'])) {
                    $styles[] = "background-color: {$backgroundValue['color']};";
                }
                break;

            case 'gradient':
                if (!empty($backgroundValue['gradient'])) {
                    $gradient = $backgroundValue['gradient'];
                    $gradientType = $gradient['type'] ?? 'linear';
                    $angle = $gradient['angle'] ?? 135;
                    $colorStops = $gradient['colorStops'] ?? [];

                    if (!empty($colorStops)) {
                        $stopsCSS = array_map(function($stop) {
                            return "{$stop['color']} {$stop['position']}%";
                        }, $colorStops);

                        if ($gradientType === 'linear') {
                            $styles[] = "background: linear-gradient({$angle}deg, " . implode(', ', $stopsCSS) . ");";
                        } elseif ($gradientType === 'radial') {
                            $styles[] = "background: radial-gradient(circle, " . implode(', ', $stopsCSS) . ");";
                        }
                    }
                }
                break;

            case 'image':
                if (!empty($backgroundValue['image'])) {
                    $image = $backgroundValue['image'];
                    if (!empty($image['url'])) {
                        $styles[] = "background-image: url('{$image['url']}');";
                        $styles[] = "background-size: " . ($image['size'] ?? 'cover') . ";";
                        $styles[] = "background-position: " . ($image['position'] ?? 'center center') . ";";
                        $styles[] = "background-repeat: " . ($image['repeat'] ?? 'no-repeat') . ";";
                    }
                }
                break;
        }

        return implode(' ', $styles);
    }

    /**
     * Generate border and shadow CSS from border shadow group value
     */
    protected function generateBorderShadowCSS($borderShadowValue): string
    {
        if (!is_array($borderShadowValue)) {
            return '';
        }

        $styles = [];

        // Generate border CSS
        if (isset($borderShadowValue['border'])) {
            $border = $borderShadowValue['border'];

            // Border width
            if (isset($border['width']) && is_array($border['width'])) {
                $width = $border['width'];
                $top = $width['top'] ?? 0;
                $right = $width['right'] ?? 0;
                $bottom = $width['bottom'] ?? 0;
                $left = $width['left'] ?? 0;

                if ($top || $right || $bottom || $left) {
                    $styles[] = "border-width: {$top}px {$right}px {$bottom}px {$left}px;";
                    $styles[] = "border-style: " . ($border['style'] ?? 'solid') . ";";

                    if (!empty($border['color'])) {
                        $styles[] = "border-color: {$border['color']};";
                    }
                }
            }

            // Border radius
            if (isset($border['radius']) && is_array($border['radius'])) {
                $radius = $border['radius'];
                $topLeft = $radius['top'] ?? $radius['top-left'] ?? 0;
                $topRight = $radius['right'] ?? $radius['top-right'] ?? 0;
                $bottomRight = $radius['bottom'] ?? $radius['bottom-right'] ?? 0;
                $bottomLeft = $radius['left'] ?? $radius['bottom-left'] ?? 0;

                if ($topLeft || $topRight || $bottomRight || $bottomLeft) {
                    $styles[] = "border-radius: {$topLeft}px {$topRight}px {$bottomRight}px {$bottomLeft}px;";
                }
            }
        }

        // Generate shadow CSS
        if (isset($borderShadowValue['shadow'])) {
            $shadow = $borderShadowValue['shadow'];
            $shadowType = $shadow['type'] ?? 'none';

            if ($shadowType !== 'none') {
                $xOffset = $shadow['x_offset'] ?? 0;
                $yOffset = $shadow['y_offset'] ?? 2;
                $blurRadius = $shadow['blur_radius'] ?? 4;
                $spreadRadius = $shadow['spread_radius'] ?? 0;
                $color = $shadow['color'] ?? 'rgba(0,0,0,0.1)';
                $inset = !empty($shadow['inset']) ? 'inset ' : '';

                $shadowValue = "{$inset}{$xOffset}px {$yOffset}px {$blurRadius}px {$spreadRadius}px {$color}";
                $styles[] = "box-shadow: {$shadowValue};";
            }
        }

        return implode(' ', $styles);
    }

    /**
     * Process CSS properties with placeholder replacement
     */
    protected function processFieldProperties(string $properties, $value, string $unit, array $fieldConfig): string
    {
        // Handle dimension fields (top, right, bottom, left)
        if (($fieldConfig['type'] ?? '') === 'dimension' && is_array($value)) {
            // For dimension fields, use the unit from the value or default to px
            $dimensionUnit = $value['unit'] ?? $unit ?? 'px';

            $properties = str_replace('{{VALUE.TOP}}', (string)($value['top'] ?? 0), $properties);
            $properties = str_replace('{{VALUE.RIGHT}}', (string)($value['right'] ?? 0), $properties);
            $properties = str_replace('{{VALUE.BOTTOM}}', (string)($value['bottom'] ?? 0), $properties);
            $properties = str_replace('{{VALUE.LEFT}}', (string)($value['left'] ?? 0), $properties);
            $properties = str_replace('{{UNIT}}', $dimensionUnit, $properties);
        } else {
            // Handle single value fields
            $properties = str_replace('{{VALUE}}', (string)$value, $properties);
            $properties = str_replace('{{UNIT}}', $unit, $properties);
        }

        return $properties;
    }

    /**
     * Get custom CSS from advanced settings
     * 
     * @param string $widgetId Widget instance ID
     * @param array $settings Widget settings
     * @return string Custom CSS
     */
    protected function getCustomCSS(string $widgetId, array $settings): string
    {
        $advanced = $settings['advanced'] ?? [];
        $custom = $advanced['custom'] ?? [];
        
        if (empty($custom['custom_css'])) {
            return '';
        }

        $customCss = $this->sanitizeCSS($custom['custom_css']);
        
        return "
/* Custom CSS for {$widgetId} */
#{$widgetId} {
    {$customCss}
}";
    }

    // Validation method for widget settings
    public function validateSettings(array $settings): array
    {
        $errors = [];
        $allFields = $this->getAllFields();
        
        foreach ($allFields as $tab => $fields) {
            $errors = array_merge($errors, $this->validateFieldGroup($fields, $settings[$tab] ?? [], $tab));
        }
        
        return $errors;
    }

    private function validateFieldGroup(array $fields, array $values, string $prefix): array
    {
        $errors = [];

        foreach ($fields as $fieldKey => $field) {
            // Handle special cases: tabs container
            if ($fieldKey === '_tabs') {
                $tabErrors = $this->validateTabsContainer($field, $values, $prefix);
                $errors = array_merge($errors, $tabErrors);
                continue;
            }

            // Ensure field is an array and has required structure
            if (!is_array($field)) {
                continue;
            }

            // Handle groups
            if (isset($field['type']) && $field['type'] === 'group') {
                $groupErrors = $this->validateFieldGroup(
                    $field['fields'],
                    $values[$fieldKey] ?? [],
                    $prefix . '.' . $fieldKey
                );
                $errors = array_merge($errors, $groupErrors);
                continue;
            }

            // Handle tabs
            if (isset($field['type']) && $field['type'] === 'tab') {
                $tabErrors = $this->validateTabFields($field, $values[$fieldKey] ?? [], $prefix . '.' . $fieldKey);
                $errors = array_merge($errors, $tabErrors);
                continue;
            }

            // Skip if no type is defined (malformed field)
            if (!isset($field['type'])) {
                continue;
            }
            
            $value = $values[$fieldKey] ?? null;
            
            // Check required fields - but skip validation if field has a default value
            // This allows widgets to use defaults for required fields when no value is provided
            $hasDefault = isset($field['default']) && !empty($field['default']);
            if (($field['required'] ?? false) && empty($value) && !$hasDefault) {
                $errors[] = $prefix . '.' . $fieldKey . ' is required';
            }
            
            // Type-specific validation
            if (!empty($value)) {
                switch ($field['type']) {
                    case 'number':
                        if (!is_numeric($value)) {
                            $errors[] = $prefix . '.' . $fieldKey . ' must be a number';
                        } else {
                            if (isset($field['min']) && $value < $field['min']) {
                                $errors[] = $prefix . '.' . $fieldKey . ' must be at least ' . $field['min'];
                            }
                            if (isset($field['max']) && $value > $field['max']) {
                                $errors[] = $prefix . '.' . $fieldKey . ' must be at most ' . $field['max'];
                            }
                        }
                        break;
                    case 'color':
                        if (!preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
                            $errors[] = $prefix . '.' . $fieldKey . ' must be a valid hex color';
                        }
                        break;
                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[] = $prefix . '.' . $fieldKey . ' must be a valid email address';
                        }
                        break;
                }
            }
        }

        return $errors;
    }

    /**
     * Validate tabs container structure
     */
    private function validateTabsContainer(array $tabs, array $values, string $prefix): array
    {
        $errors = [];

        foreach ($tabs as $tabKey => $tab) {
            if (!is_array($tab)) {
                continue;
            }

            $tabValues = $values[$tabKey] ?? [];
            $tabErrors = $this->validateTabFields($tab, $tabValues, $prefix . '.' . $tabKey);
            $errors = array_merge($errors, $tabErrors);
        }

        return $errors;
    }

    /**
     * Validate individual tab fields
     */
    private function validateTabFields(array $tab, array $values, string $prefix): array
    {
        $errors = [];

        // Validate direct fields in tab
        if (isset($tab['fields']) && is_array($tab['fields'])) {
            $fieldErrors = $this->validateFieldGroup($tab['fields'], $values, $prefix);
            $errors = array_merge($errors, $fieldErrors);
        }

        // Validate groups within tab
        if (isset($tab['groups']) && is_array($tab['groups'])) {
            foreach ($tab['groups'] as $groupKey => $group) {
                if (is_array($group) && isset($group['fields'])) {
                    $groupErrors = $this->validateFieldGroup(
                        $group['fields'],
                        $values[$groupKey] ?? [],
                        $prefix . '.' . $groupKey
                    );
                    $errors = array_merge($errors, $groupErrors);
                }
            }
        }

        return $errors;
    }


    /**
     * Get sanitized text content
     * Escapes HTML entities to prevent XSS
     * 
     * @param string $text Raw text content
     * @param bool $preserveLineBreaks Convert line breaks to <br> tags
     * @return string Sanitized text
     */
    protected function sanitizeText(string $text, bool $preserveLineBreaks = false): string
    {
        return XSSProtection::sanitizeText($text, $preserveLineBreaks);
    }
    
    /**
     * Get sanitized HTML content with configurable security level
     * Allows safe HTML tags while removing dangerous elements
     * 
     * @param string $content Raw HTML content
     * @param string $level Security level: 'minimal', 'basic', 'rich', 'widget'
     * @param array $customOptions Custom sanitization options
     * @return string Sanitized HTML content
     */
    protected function sanitizeHTML(string $content, string $level = 'widget', array $customOptions = []): string
    {
        return XSSProtection::sanitizeHTML($content, $level, $customOptions);
    }
    
    /**
     * Get sanitized URL
     * Validates and sanitizes URLs, blocking dangerous protocols
     * 
     * @param string $url Raw URL
     * @param array $allowedSchemes Allowed URL schemes (default: http, https, mailto, tel)
     * @return string|null Sanitized URL or empty string if invalid
     */
    protected function sanitizeURL(string $url, array $allowedSchemes = ['http', 'https', 'mailto', 'tel']): string
    {
        return XSSProtection::sanitizeURL($url, $allowedSchemes) ?? '';
    }
    
    /**
     * Get sanitized CSS properties and values
     * Removes dangerous CSS expressions and imports
     * 
     * @param string $css Raw CSS content
     * @return string Sanitized CSS
     */
    protected function sanitizeCSS(string $css): string
    {
        return XSSProtection::sanitizeCSS($css);
    }
    
    /**
     * Get sanitized HTML attributes for safe output
     * Properly escapes attribute values based on context
     * 
     * @param string $name Attribute name
     * @param string $value Attribute value
     * @return string Escaped attribute value safe for HTML output
     */
    protected function sanitizeAttribute(string $name, string $value): string
    {
        // Special handling for specific attributes
        if ($name === 'href' || $name === 'src') {
            return htmlspecialchars($this->sanitizeURL($value), ENT_QUOTES, 'UTF-8');
        } elseif ($name === 'style') {
            return htmlspecialchars($this->sanitizeCSS($value), ENT_QUOTES, 'UTF-8');
        }
        
        // Default HTML entity encoding
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Check content for security threats
     * Utility method for developers to detect potential XSS patterns
     * 
     * @param string $content Content to check
     * @return array Array of detected threat types
     */
    protected function detectThreats(string $content): array
    {
        return XSSProtection::detectThreats($content);
    }
    
    /**
     * Build HTML attributes string with proper escaping
     * Utility method for developers to safely generate HTML attributes
     * 
     * @param array $attributes Key-value pairs of attributes
     * @param bool $sanitize Whether to sanitize attribute values (default: true)
     * @return string Safe HTML attributes string
     */
    protected function buildAttributes(array $attributes, bool $sanitize = true): string
    {
        $attrs = [];
        
        foreach ($attributes as $name => $value) {
            if ($value === null || $value === false) {
                continue;
            }
            
            // Boolean attributes
            if ($value === true) {
                $attrs[] = $name;
                continue;
            }
            
            // Sanitize if requested
            if ($sanitize) {
                $value = $this->sanitizeAttribute($name, (string)$value);
            } else {
                $value = htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
            }
            
            $attrs[] = $name . '="' . $value . '"';
        }
        
        return implode(' ', $attrs);
    }
}
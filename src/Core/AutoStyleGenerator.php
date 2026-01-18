<?php

namespace Xgenious\PageBuilder\Core;

/**
 * AutoStyleGenerator Trait
 * 
 * Automatically generates inline CSS styles from widget field definitions and settings.
 * This eliminates the need to manually build styles in each widget's render method.
 * 
 * Features:
 * - Automatic style extraction from field definitions
 * - Responsive styles support
 * - CSS class generation based on settings
 * - Inline style generation for immediate preview
 * - Support for all CSS properties and units
 * 
 * @package Plugins\Pagebuilder\Core
 */
trait AutoStyleGenerator
{
    /**
     * Generate inline styles automatically from field definitions and settings
     * 
     * @param array $settings Widget settings
     * @param array $additionalStyles Additional manual styles to merge
     * @return string Generated inline CSS string
     */
    protected function generateInlineStyles(array $settings, array $additionalStyles = []): string
    {
        $styles = [];
        
        // Get all style fields for this widget
        $styleFields = $this->getStyleFields();
        $styleSettings = $settings['style'] ?? [];
        
        // Process each style field group
        foreach ($styleFields as $groupName => $group) {
            if (!isset($group['fields'])) continue;
            
            $groupSettings = $styleSettings[$groupName] ?? [];
            $groupStyles = $this->processStyleGroup($group['fields'], $groupSettings);
            $styles = array_merge($styles, $groupStyles);
        }
        
        // Add any additional manual styles
        if (!empty($additionalStyles)) {
            $styles = array_merge($styles, $additionalStyles);
        }
        
        // Remove empty styles and duplicates
        $styles = array_unique(array_filter($styles, function($value) {
            return !empty($value) && $value !== 'none' && trim($value) !== '';
        }));
        
        return implode('; ', $styles);
    }
    
    /**
     * Process a group of style fields
     * 
     * @param array $fields Field definitions
     * @param array $settings Group settings
     * @return array Generated CSS properties
     */
    private function processStyleGroup(array $fields, array $settings): array
    {
        $styles = [];
        
        foreach ($fields as $fieldName => $field) {
            if (!isset($settings[$fieldName])) continue;
            
            $value = $settings[$fieldName];
            $fieldType = $field['type'] ?? '';
            
            // Skip empty values
            if (empty($value) && $value !== 0) continue;
            
            $cssStyles = $this->convertFieldToCSS($fieldName, $value, $field);
            $styles = array_merge($styles, $cssStyles);
        }
        
        return $styles;
    }
    
    /**
     * Convert a field value to CSS properties
     * 
     * @param string $fieldName Field name
     * @param mixed $value Field value
     * @param array $field Field definition
     * @return array CSS properties
     */
    private function convertFieldToCSS(string $fieldName, $value, array $field): array
    {
        $styles = [];
        $fieldType = $field['type'] ?? '';
        
        // Handle special padding fields
        if ($fieldName === 'padding_horizontal') {
            $unit = $field['unit'] ?? 'px';
            $styles[] = "padding-left: {$value}{$unit}";
            $styles[] = "padding-right: {$value}{$unit}";
            return $styles;
        }
        
        if ($fieldName === 'padding_vertical') {
            $unit = $field['unit'] ?? 'px';
            $styles[] = "padding-top: {$value}{$unit}";
            $styles[] = "padding-bottom: {$value}{$unit}";
            return $styles;
        }
        
        switch ($fieldType) {
            case 'color':
                $styles[] = $this->getColorCSS($fieldName, $value);
                break;
                
            case 'number':
                $styles[] = $this->getNumberCSS($fieldName, $value, $field);
                break;
                
            case 'dimension':
                $dimensionStyles = $this->getDimensionCSS($fieldName, $value, $field);
                $styles = array_merge($styles, $dimensionStyles);
                break;
                
            case 'select':
                $styles[] = $this->getSelectCSS($fieldName, $value);
                break;
                
            case 'text':
                $styles[] = $this->getTextCSS($fieldName, $value);
                break;
                
            case 'toggle':
                if ($value) {
                    $toggleStyles = $this->getToggleCSS($fieldName, $field);
                    $styles = array_merge($styles, $toggleStyles);
                }
                break;
                
            case 'typography_group':
                $typographyStyles = $this->getTypographyGroupCSS($value);
                $styles = array_merge($styles, $typographyStyles);
                break;
                
            case 'background_group':
                $backgroundStyles = $this->getBackgroundGroupCSS($value);
                $styles = array_merge($styles, $backgroundStyles);
                break;
        }
        
        return array_filter($styles);
    }
    
    /**
     * Generate CSS for color fields
     */
    private function getColorCSS(string $fieldName, string $value): string
    {
        $cssProperty = $this->fieldNameToCSS($fieldName);
        return "{$cssProperty}: {$value}";
    }
    
    /**
     * Generate CSS for number fields
     */
    private function getNumberCSS(string $fieldName, $value, array $field): string
    {
        $cssProperty = $this->fieldNameToCSS($fieldName);
        $unit = $field['unit'] ?? '';
        
        return "{$cssProperty}: {$value}{$unit}";
    }
    
    /**
     * Generate CSS for dimension fields (margin, padding, border-radius, etc.)
     */
    private function getDimensionCSS(string $fieldName, array $value, array $field): array
    {
        $styles = [];
        $cssProperty = $this->fieldNameToCSS($fieldName);
        $unit = $field['unit'] ?? 'px';
        
        if (is_array($value)) {
            // Handle dimension objects like {top: 10, right: 20, bottom: 10, left: 20}
            if (isset($value['top']) || isset($value['right']) || isset($value['bottom']) || isset($value['left'])) {
                $top = $value['top'] ?? 0;
                $right = $value['right'] ?? 0;
                $bottom = $value['bottom'] ?? 0;
                $left = $value['left'] ?? 0;
                
                $styles[] = "{$cssProperty}: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}";
            }
        }
        
        return $styles;
    }
    
    /**
     * Generate CSS for select fields
     */
    private function getSelectCSS(string $fieldName, string $value): string
    {
        $cssProperty = $this->fieldNameToCSS($fieldName);
        return "{$cssProperty}: {$value}";
    }
    
    /**
     * Generate CSS for text fields
     */
    private function getTextCSS(string $fieldName, string $value): string
    {
        $cssProperty = $this->fieldNameToCSS($fieldName);
        return "{$cssProperty}: {$value}";
    }
    
    /**
     * Generate CSS for toggle fields
     */
    private function getToggleCSS(string $fieldName, array $field): array
    {
        $styles = [];
        
        // Handle specific toggle behaviors
        switch ($fieldName) {
            case 'full_width':
                $styles[] = 'width: 100%';
                $styles[] = 'display: block';
                break;
                
            case 'disabled':
                $styles[] = 'opacity: 0.5';
                $styles[] = 'cursor: not-allowed';
                $styles[] = 'pointer-events: none';
                break;
                
            case 'bold':
                $styles[] = 'font-weight: bold';
                break;
                
            case 'italic':
                $styles[] = 'font-style: italic';
                break;
                
            case 'underline':
                $styles[] = 'text-decoration: underline';
                break;
        }
        
        return $styles;
    }
    
    /**
     * Convert field name to CSS property name
     */
    private function fieldNameToCSS(string $fieldName): string
    {
        // Common field name to CSS property mappings
        $mappings = [
            'text_color' => 'color',
            'background_color' => 'background-color',
            'font_size' => 'font-size',
            'font_weight' => 'font-weight',
            'font_family' => 'font-family',
            'line_height' => 'line-height',
            'letter_spacing' => 'letter-spacing',
            'text_transform' => 'text-transform',
            'text_decoration' => 'text-decoration',
            'text_align' => 'text-align',
            'border_width' => 'border-width',
            'border_color' => 'border-color',
            'border_radius' => 'border-radius',
            'border_style' => 'border-style',
            'text_shadow' => 'text-shadow',
            'box_shadow' => 'box-shadow',
            'hover_color' => 'color', // For hover states (handled separately)
            'hover_background_color' => 'background-color', // For hover states
        ];
        
        if (isset($mappings[$fieldName])) {
            return $mappings[$fieldName];
        }
        
        // Convert snake_case to kebab-case for CSS
        return str_replace('_', '-', $fieldName);
    }
    
    /**
     * Generate CSS classes automatically from settings
     * 
     * @param array $settings Widget settings
     * @param array $additionalClasses Additional manual classes
     * @return string Generated CSS classes
     */
    protected function generateCssClasses(array $settings, array $additionalClasses = []): string
    {
        $classes = [];
        
        // Add base widget classes with xgp_ prefix
        $classes[] = 'xgp_widget';
        $classes[] = 'xgp_' . $this->getWidgetType();
        
        // Process general settings for classes
        $generalSettings = $settings['general'] ?? [];
        $generalClasses = $this->processGeneralClasses($generalSettings);
        $classes = array_merge($classes, $generalClasses);
        
        // Process style settings for classes
        $styleSettings = $settings['style'] ?? [];
        $styleClasses = $this->processStyleClasses($styleSettings);
        $classes = array_merge($classes, $styleClasses);
        
        // Add any additional manual classes
        $classes = array_merge($classes, $additionalClasses);
        
        // Remove duplicates and empty values
        $classes = array_unique(array_filter($classes));
        
        return implode(' ', $classes);
    }
    
    /**
     * Process general settings to generate CSS classes
     */
    private function processGeneralClasses(array $settings): array
    {
        $classes = [];
        
        foreach ($settings as $groupName => $group) {
            if (!is_array($group)) continue;
            
            foreach ($group as $fieldName => $value) {
                switch ($fieldName) {
                    case 'text_align':
                        if ($value !== 'left') {
                            $classes[] = 'text-' . $value;
                        }
                        break;
                        
                    case 'size':
                        $classes[] = 'size-' . $value;
                        break;
                        
                    case 'button_style':
                        $classes[] = 'style-' . $value;
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
                }
            }
        }
        
        return $classes;
    }
    
    /**
     * Process style settings to generate CSS classes
     */
    private function processStyleClasses(array $settings): array
    {
        $classes = [];
        
        // Add classes based on style settings if needed
        // This can be extended based on specific widget needs
        
        return $classes;
    }
    
    /**
     * Generate complete style attribute string
     * 
     * @param array $settings Widget settings
     * @param array $additionalStyles Additional manual styles
     * @return string Complete style attribute or empty string
     */
    protected function generateStyleAttribute(array $settings, array $additionalStyles = []): string
    {
        $inlineStyles = $this->generateInlineStyles($settings, $additionalStyles);
        
        if (empty($inlineStyles)) {
            return '';
        }
        
        return 'style="' . htmlspecialchars($inlineStyles, ENT_QUOTES) . '"';
    }
    
    /**
     * Generate complete class attribute string
     * 
     * @param array $settings Widget settings
     * @param array $additionalClasses Additional manual classes
     * @return string Complete class attribute
     */
    protected function generateClassAttribute(array $settings, array $additionalClasses = []): string
    {
        $cssClasses = $this->generateCssClasses($settings, $additionalClasses);
        
        return 'class="' . htmlspecialchars($cssClasses, ENT_QUOTES) . '"';
    }
    
    /**
     * Generate CSS for Typography Group fields
     */
    private function getTypographyGroupCSS(array $value): array
    {
        if (empty($value) || !is_array($value)) {
            return [];
        }

        $styles = [];

        // Font family
        if (isset($value['font_family']) && $value['font_family'] !== 'inherit') {
            $styles[] = 'font-family: ' . $value['font_family'];
        }

        // Font size with unit
        if (isset($value['font_size']) && is_array($value['font_size'])) {
            $fontSize = $value['font_size'];
            if (isset($fontSize['value']) && isset($fontSize['unit'])) {
                $styles[] = 'font-size: ' . $fontSize['value'] . $fontSize['unit'];
            }
        }

        // Font weight
        if (isset($value['font_weight'])) {
            $styles[] = 'font-weight: ' . $value['font_weight'];
        }

        // Font style
        if (isset($value['font_style']) && $value['font_style'] !== 'normal') {
            $styles[] = 'font-style: ' . $value['font_style'];
        }

        // Text transform
        if (isset($value['text_transform']) && $value['text_transform'] !== 'none') {
            $styles[] = 'text-transform: ' . $value['text_transform'];
        }

        // Text decoration
        if (isset($value['text_decoration']) && $value['text_decoration'] !== 'none') {
            $styles[] = 'text-decoration: ' . $value['text_decoration'];
        }

        // Line height with unit
        if (isset($value['line_height']) && is_array($value['line_height'])) {
            $lineHeight = $value['line_height'];
            if (isset($lineHeight['value']) && isset($lineHeight['unit'])) {
                $styles[] = 'line-height: ' . $lineHeight['value'] . $lineHeight['unit'];
            }
        }

        // Letter spacing with unit (only if not 0)
        if (isset($value['letter_spacing']) && is_array($value['letter_spacing'])) {
            $letterSpacing = $value['letter_spacing'];
            if (isset($letterSpacing['value']) && isset($letterSpacing['unit']) && $letterSpacing['value'] != 0) {
                $styles[] = 'letter-spacing: ' . $letterSpacing['value'] . $letterSpacing['unit'];
            }
        }

        // Word spacing with unit (only if not 0)
        if (isset($value['word_spacing']) && is_array($value['word_spacing'])) {
            $wordSpacing = $value['word_spacing'];
            if (isset($wordSpacing['value']) && isset($wordSpacing['unit']) && $wordSpacing['value'] != 0) {
                $styles[] = 'word-spacing: ' . $wordSpacing['value'] . $wordSpacing['unit'];
            }
        }

        return $styles;
    }

    /**
     * Generate CSS for Background Group fields
     */
    private function getBackgroundGroupCSS(array $value): array
    {
        if (empty($value) || !is_array($value)) {
            return [];
        }

        $styles = [];
        $backgroundType = $value['type'] ?? 'none';

        switch ($backgroundType) {
            case 'color':
                if (isset($value['color']) && !empty($value['color'])) {
                    $styles[] = 'background-color: ' . $value['color'];
                }
                break;

            case 'gradient':
                if (isset($value['gradient']) && is_array($value['gradient'])) {
                    $gradient = $value['gradient'];
                    $gradientType = $gradient['type'] ?? 'linear';

                    // Handle new colorStops format or legacy startColor/endColor
                    if (isset($gradient['colorStops']) && is_array($gradient['colorStops'])) {
                        $stops = [];
                        foreach ($gradient['colorStops'] as $stop) {
                            $stops[] = ($stop['color'] ?? '#000000') . ' ' . ($stop['position'] ?? 0) . '%';
                        }
                        $stopString = implode(', ', $stops);

                        if ($gradientType === 'linear') {
                            $angle = $gradient['angle'] ?? 135;
                            $styles[] = "background: linear-gradient({$angle}deg, {$stopString})";
                        } else {
                            $styles[] = "background: radial-gradient(circle, {$stopString})";
                        }
                    } else if (isset($gradient['startColor']) && isset($gradient['endColor'])) {
                        // Legacy format within gradient
                        $startColor = $gradient['startColor'];
                        $endColor = $gradient['endColor'];

                        if ($gradientType === 'linear') {
                            $angle = $gradient['angle'] ?? 135;
                            $styles[] = "background: linear-gradient({$angle}deg, {$startColor} 0%, {$endColor} 100%)";
                        } else {
                            $styles[] = "background: radial-gradient(circle, {$startColor} 0%, {$endColor} 100%)";
                        }
                    }
                }
                break;

            case 'image':
                if (isset($value['image']) && is_array($value['image'])) {
                    $image = $value['image'];
                    if (!empty($image['url'])) {
                        $styles[] = 'background-image: url(\'' . $image['url'] . '\')';

                        // Add other background properties
                        if (isset($image['size'])) {
                            $styles[] = 'background-size: ' . $image['size'];
                        }
                        if (isset($image['position'])) {
                            $styles[] = 'background-position: ' . $image['position'];
                        }
                        if (isset($image['repeat'])) {
                            $styles[] = 'background-repeat: ' . $image['repeat'];
                        }
                        if (isset($image['attachment'])) {
                            $styles[] = 'background-attachment: ' . $image['attachment'];
                        }
                    }
                }
                break;
        }

        return $styles;
    }

    /**
     * Abstract methods that implementing classes must provide
     */
    abstract protected function getWidgetType(): string;
    abstract public function getStyleFields(): array;
}
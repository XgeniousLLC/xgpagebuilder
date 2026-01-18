<?php

namespace Xgenious\PageBuilder\Core;

use Xgenious\PageBuilder\Core\Widgets\ColumnWidget;

/**
 * ColumnCSSManager - Manages CSS generation for page builder columns
 * 
 * Integrates column settings from React frontend with PHP CSS generation system.
 * Handles both real-time preview CSS and production CSS generation.
 * 
 * Features:
 * - Real-time CSS generation for column settings
 * - Integration with existing CSSGenerator system
 * - Responsive breakpoint support
 * - CSS optimization and minification
 * - Column-specific selector management
 * 
 * @package Plugins\Pagebuilder\Core
 */
class ColumnCSSManager
{
    /** @var ColumnWidget */
    private static ColumnWidget $columnWidget;
    
    /** @var array<string, string> */
    private static array $generatedCSS = [];
    
    /**
     * Initialize the CSS manager
     */
    public static function init(): void
    {
        self::$columnWidget = new ColumnWidget();
    }
    
    /**
     * Generate CSS for a single column
     *
     * @param string $columnId Unique column identifier
     * @param array<string, mixed> $settings Column settings from React
     * @param array<string> $breakpoints Responsive breakpoints to generate
     * @return string Generated CSS
     */
    public static function generateColumnCSS(
        string $columnId,
        array $settings,
        array $breakpoints = ['desktop', 'tablet', 'mobile']
    ): string {
        self::ensureInitialized();
        
        // Transform React settings to PHP field format
        $transformedSettings = self::transformReactSettings($settings);
        
        // Get column field configuration
        $fieldConfig = self::getColumnFieldConfig();
        
        // Generate CSS using CSSGenerator
        $css = CSSGenerator::generateWidgetCSS(
            "column-{$columnId}",
            $fieldConfig,
            $transformedSettings,
            $breakpoints
        );
        
        // Cache the generated CSS
        self::$generatedCSS[$columnId] = $css;
        
        return $css;
    }
    
    /**
     * Generate CSS for multiple columns
     *
     * @param array<string, array<string, mixed>> $columns Column configurations
     * @return string Combined CSS
     */
    public static function generateMultipleColumnCSS(array $columns): string
    {
        $combinedCSS = '';
        
        foreach ($columns as $columnId => $settings) {
            $columnCSS = self::generateColumnCSS($columnId, $settings);
            $combinedCSS .= $columnCSS . "\n";
        }
        
        return $combinedCSS;
    }
    
    /**
     * Transform React column settings to PHP field format
     *
     * @param array<string, mixed> $reactSettings Settings from React frontend
     * @return array<string, mixed> Transformed settings for PHP
     */
    private static function transformReactSettings(array $reactSettings): array
    {
        $transformed = [];
        
        // Direct mapping for simple fields
        $directMappings = [
            'display' => 'display',
            'flexDirection' => 'flex_direction',
            'justifyContent' => 'justify_content',
            'alignItems' => 'align_items',
            'flexWrap' => 'flex_wrap',
            'gap' => 'gap'
        ];
        
        foreach ($directMappings as $reactKey => $phpKey) {
            if (isset($reactSettings[$reactKey])) {
                $transformed[$phpKey] = $reactSettings[$reactKey];
            }
        }
        
        // Handle gap value transformation (ensure unit is included)
        if (isset($reactSettings['gap'])) {
            $gap = $reactSettings['gap'];
            // If gap is just a number, add px unit
            if (is_numeric($gap)) {
                $transformed['gap'] = $gap . 'px';
            } else {
                $transformed['gap'] = $gap;
            }
        }
        
        // Handle complex fields like padding, margin
        if (isset($reactSettings['padding'])) {
            $transformed['padding'] = self::transformDimensionField($reactSettings['padding']);
        }
        
        if (isset($reactSettings['margin'])) {
            $transformed['margin'] = self::transformDimensionField($reactSettings['margin']);
        }
        
        // Handle background group
        if (isset($reactSettings['background'])) {
            $transformed['column_bg'] = $reactSettings['background'];
        }
        
        // Handle border fields
        if (isset($reactSettings['borderWidth'])) {
            $transformed['border_width'] = $reactSettings['borderWidth'];
        }
        
        if (isset($reactSettings['borderColor'])) {
            $transformed['border_color'] = $reactSettings['borderColor'];
        }
        
        if (isset($reactSettings['borderRadius'])) {
            $transformed['border_radius'] = self::transformDimensionField($reactSettings['borderRadius']);
        }
        
        return $transformed;
    }
    
    /**
     * Transform dimension field values
     *
     * @param mixed $dimensionValue Dimension value from React
     * @return array<string, mixed> Transformed dimension
     */
    private static function transformDimensionField($dimensionValue): array
    {
        if (is_array($dimensionValue)) {
            return $dimensionValue;
        }
        
        if (is_string($dimensionValue) || is_numeric($dimensionValue)) {
            // Convert single value to dimension object
            return [
                'top' => $dimensionValue,
                'right' => $dimensionValue,
                'bottom' => $dimensionValue,
                'left' => $dimensionValue
            ];
        }
        
        return ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0];
    }
    
    /**
     * Get column field configuration for CSS generation
     *
     * @return array<string, array<string, mixed>> Field configuration
     */
    private static function getColumnFieldConfig(): array
    {
        self::ensureInitialized();
        
        $fieldConfig = [];
        
        // Get field definitions from ColumnWidget
        $generalFields = self::$columnWidget->getGeneralFields();
        $styleFields = self::$columnWidget->getStyleFields();
        
        // Extract field configurations with selectors
        foreach ($generalFields as $groupName => $group) {
            if (isset($group['fields'])) {
                foreach ($group['fields'] as $fieldName => $field) {
                    $fieldConfig[$fieldName] = $field;
                }
            }
        }
        
        foreach ($styleFields as $groupName => $group) {
            if (isset($group['fields'])) {
                foreach ($group['fields'] as $fieldName => $field) {
                    $fieldConfig[$fieldName] = $field;
                }
            }
        }
        
        return $fieldConfig;
    }
    
    /**
     * Get CSS for a specific column
     *
     * @param string $columnId Column identifier
     * @return string Generated CSS or empty string
     */
    public static function getColumnCSS(string $columnId): string
    {
        return self::$generatedCSS[$columnId] ?? '';
    }
    
    /**
     * Clear cached CSS for a column
     *
     * @param string $columnId Column identifier
     */
    public static function clearColumnCSS(string $columnId): void
    {
        unset(self::$generatedCSS[$columnId]);
    }
    
    /**
     * Clear all cached CSS
     */
    public static function clearAllCSS(): void
    {
        self::$generatedCSS = [];
    }
    
    /**
     * Generate CSS file for production
     *
     * @param array<string, array<string, mixed>> $columns Column configurations
     * @param string $filePath Output file path
     * @return bool Success status
     */
    public static function generateCSSFile(array $columns, string $filePath): bool
    {
        $css = self::generateMultipleColumnCSS($columns);
        
        // Add CSS header
        $header = "/* Generated Column CSS - " . date('Y-m-d H:i:s') . " */\n\n";
        $css = $header . $css;
        
        return file_put_contents($filePath, $css) !== false;
    }
    
    /**
     * Ensure the CSS manager is initialized
     */
    private static function ensureInitialized(): void
    {
        if (!isset(self::$columnWidget)) {
            self::init();
        }
    }
    
    /**
     * Get CSS selector for a column
     *
     * @param string $columnId Column identifier
     * @return string CSS selector
     */
    public static function getColumnSelector(string $columnId): string
    {
        return "#column-{$columnId}";
    }
    
    /**
     * Get CSS classes for a column based on settings
     *
     * @param array<string, mixed> $settings Column settings
     * @return string Space-separated CSS classes
     */
    public static function getColumnClasses(array $settings): string
    {
        $classes = ['xgp-column'];
        
        // Add display type class
        if (isset($settings['display'])) {
            $classes[] = "xgp-display-{$settings['display']}";
        }
        
        // Add flex-specific classes
        if (isset($settings['display']) && $settings['display'] === 'flex') {
            if (isset($settings['flexDirection'])) {
                $classes[] = "xgp-flex-direction-{$settings['flexDirection']}";
            }
            
            if (isset($settings['justifyContent'])) {
                $classes[] = "xgp-justify-{$settings['justifyContent']}";
            }
            
            if (isset($settings['alignItems'])) {
                $classes[] = "xgp-align-{$settings['alignItems']}";
            }
            
            if (isset($settings['flexWrap'])) {
                $classes[] = "xgp-flex-wrap-{$settings['flexWrap']}";
            }
        }
        
        return implode(' ', $classes);
    }
}
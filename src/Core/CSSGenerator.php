<?php

namespace Xgenious\PageBuilder\Core;

/**
 * CSSGenerator - Advanced CSS generation system for widget styling
 * 
 * Handles CSS generation from field configurations with support for:
 * - Placeholder replacement ({{WRAPPER}}, {{VALUE}}, {{UNIT}})
 * - Responsive breakpoints
 * - CSS optimization and minification
 * - Dimension field value expansion
 * 
 * @package plugins\Pagebuilder\Core
 */
class CSSGenerator
{
    /** @var array<string, string> */
    private static array $breakpoints = [
        'desktop' => '',
        'tablet' => '@media (max-width: 1024px)',
        'mobile' => '@media (max-width: 768px)'
    ];

    /** @var bool */
    private static bool $minify = false;

    /** @var array<string> */
    private static array $generatedCSS = [];

    /**
     * Generate CSS for a widget instance
     *
     * @param string $widgetId Unique widget identifier
     * @param array<string, mixed> $fieldConfig Field configuration with selectors
     * @param array<string, mixed> $fieldValues Current field values
     * @param array<string> $breakpoints Responsive breakpoints to generate
     * @return string Generated CSS
     */
    public static function generateWidgetCSS(
        string $widgetId,
        array $fieldConfig,
        array $fieldValues,
        array $breakpoints = ['desktop', 'tablet', 'mobile']
    ): string {
        $css = '';
        $responsiveCSS = [];

        foreach ($fieldConfig as $fieldId => $field) {
            if (!isset($field['selectors']) || empty($field['selectors'])) {
                continue;
            }

            $fieldValue = $fieldValues[$fieldId] ?? $field['default'] ?? null;

            if ($fieldValue === null) {
                continue;
            }

            // Handle responsive fields
            if ($field['responsive'] ?? false && is_array($fieldValue)) {
                foreach ($breakpoints as $breakpoint) {
                    if (isset($fieldValue[$breakpoint])) {
                        $breakpointCSS = self::generateFieldCSS(
                            $field['selectors'],
                            $fieldValue[$breakpoint],
                            $widgetId,
                            $field
                        );

                        if (!empty($breakpointCSS)) {
                            if (!isset($responsiveCSS[$breakpoint])) {
                                $responsiveCSS[$breakpoint] = '';
                            }
                            $responsiveCSS[$breakpoint] .= $breakpointCSS;
                        }
                    }
                }
            } else {
                // Non-responsive field
                $fieldCSS = self::generateFieldCSS(
                    $field['selectors'],
                    $fieldValue,
                    $widgetId,
                    $field
                );
                $css .= $fieldCSS;
            }
        }

        // Add responsive CSS
        foreach ($responsiveCSS as $breakpoint => $breakpointCSS) {
            if (!empty($breakpointCSS)) {
                $mediaQuery = self::$breakpoints[$breakpoint] ?? '';
                if ($mediaQuery) {
                    $css .= "\n{$mediaQuery} {\n{$breakpointCSS}}\n";
                } else {
                    $css .= $breakpointCSS;
                }
            }
        }

        return self::$minify ? self::minifyCSS($css) : self::formatCSS($css);
    }

    /**
     * Generate CSS for a specific field
     *
     * @param array<string, string> $selectors Field selectors
     * @param mixed $value Field value
     * @param string $widgetId Widget identifier
     * @param array<string, mixed> $fieldConfig Field configuration
     * @return string Generated CSS
     */
    private static function generateFieldCSS(
        array $selectors,
        mixed $value,
        string $widgetId,
        array $fieldConfig
    ): string {
        $css = '';
        $unit = $fieldConfig['unit'] ?? '';
        $fieldType = $fieldConfig['type'] ?? '';

        foreach ($selectors as $selector => $properties) {
            $processedSelector = self::processSelector($selector, $widgetId);
            $processedProperties = self::processProperties(
                $properties,
                $value,
                $unit,
                $fieldType
            );

            if (!empty($processedProperties)) {
                $css .= "{$processedSelector} {\n  {$processedProperties}\n}\n";
            }
        }

        return $css;
    }

    /**
     * Process CSS selector with placeholder replacement
     *
     * @param string $selector CSS selector template
     * @param string $widgetId Widget identifier
     * @return string Processed selector
     */
    private static function processSelector(string $selector, string $widgetId): string
    {
        return str_replace('{{WRAPPER}}', "#{$widgetId}", $selector);
    }

    /**
     * Process CSS properties with placeholder replacement
     *
     * @param string $properties CSS properties template
     * @param mixed $value Field value
     * @param string $unit Field unit
     * @param string $fieldType Field type
     * @return string Processed CSS properties
     */
    private static function processProperties(
        string $properties,
        mixed $value,
        string $unit,
        string $fieldType
    ): string {
        switch ($fieldType) {
            case 'dimension':
                return self::processDimensionProperties($properties, $value, $unit);

            case 'color':
                return self::processColorProperties($properties, $value);

            case 'number':
            case 'range':
                return self::processNumericProperties($properties, $value, $unit);

            default:
                return self::processDefaultProperties($properties, $value, $unit);
        }
    }

    /**
     * Process dimension field properties
     *
     * @param string $properties CSS properties template
     * @param array<string, mixed>|string $value Dimension values
     * @param string $unit Unit string
     * @return string Processed properties
     */
    private static function processDimensionProperties(
        string $properties,
        array|string $value,
        string $unit
    ): string {
        if (is_array($value)) {
            $properties = str_replace('{{VALUE.TOP}}', (string)($value['top'] ?? 0), $properties);
            $properties = str_replace('{{VALUE.RIGHT}}', (string)($value['right'] ?? 0), $properties);
            $properties = str_replace('{{VALUE.BOTTOM}}', (string)($value['bottom'] ?? 0), $properties);
            $properties = str_replace('{{VALUE.LEFT}}', (string)($value['left'] ?? 0), $properties);
            $properties = str_replace('{{UNIT}}', $unit, $properties);

            // Handle shorthand dimension syntax
            if (str_contains($properties, '{{VALUE}}')) {
                $shorthand = implode($unit . ' ', [
                    $value['top'] ?? 0,
                    $value['right'] ?? 0,
                    $value['bottom'] ?? 0,
                    $value['left'] ?? 0
                ]) . $unit;
                $properties = str_replace('{{VALUE}}', $shorthand, $properties);
            }
        } else {
            $properties = str_replace('{{VALUE}}', (string)$value, $properties);
            $properties = str_replace('{{UNIT}}', $unit, $properties);
        }

        return $properties;
    }

    /**
     * Process color field properties
     *
     * @param string $properties CSS properties template
     * @param string $value Color value
     * @return string Processed properties
     */
    private static function processColorProperties(string $properties, string $value): string
    {
        // Ensure color value is properly formatted
        $value = self::sanitizeColorValue($value);
        return str_replace('{{VALUE}}', $value, $properties);
    }

    /**
     * Process numeric field properties
     *
     * @param string $properties CSS properties template
     * @param float|int|string $value Numeric value
     * @param string $unit Unit string
     * @return string Processed properties
     */
    private static function processNumericProperties(
        string $properties,
        float|int|string $value,
        string $unit
    ): string {
        $properties = str_replace('{{VALUE}}', (string)$value, $properties);
        $properties = str_replace('{{UNIT}}', $unit, $properties);
        return $properties;
    }

    /**
     * Process default field properties
     *
     * @param string $properties CSS properties template
     * @param mixed $value Field value
     * @param string $unit Unit string
     * @return string Processed properties
     */
    private static function processDefaultProperties(
        string $properties,
        mixed $value,
        string $unit
    ): string {
        $properties = str_replace('{{VALUE}}', (string)$value, $properties);
        $properties = str_replace('{{UNIT}}', $unit, $properties);
        return $properties;
    }

    /**
     * Sanitize color value
     *
     * @param string $color Color value
     * @return string Sanitized color
     */
    private static function sanitizeColorValue(string $color): string
    {
        $color = trim($color);

        // Handle hex colors
        if (str_starts_with($color, '#')) {
            return $color;
        }

        // Handle rgb/rgba colors
        if (str_starts_with($color, 'rgb')) {
            return $color;
        }

        // Handle hsl/hsla colors
        if (str_starts_with($color, 'hsl')) {
            return $color;
        }

        // Handle named colors
        return $color;
    }

    /**
     * Format CSS with proper indentation
     *
     * @param string $css Raw CSS
     * @return string Formatted CSS
     */
    private static function formatCSS(string $css): string
    {
        // Remove extra whitespace and newlines
        $css = preg_replace('/\s+/', ' ', $css);
        $css = str_replace(' {', ' {', $css);
        $css = str_replace('{ ', "{\n  ", $css);
        $css = str_replace('; ', ";\n  ", $css);
        $css = str_replace(' }', "\n}", $css);
        $css = str_replace('}', "}\n\n", $css);

        return trim($css);
    }

    /**
     * Minify CSS for production
     *
     * @param string $css CSS to minify
     * @return string Minified CSS
     */
    private static function minifyCSS(string $css): string
    {
        // Remove comments
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);

        // Remove extra whitespace
        $css = preg_replace('/\s+/', ' ', $css);

        // Remove space around specific characters
        $css = str_replace([' {', '{ ', ' }', '} ', ': ', ' :', '; ', ' ;'], ['{', '{', '}', '}', ':', ':', ';', ';'], $css);

        return trim($css);
    }

    /**
     * Set minification mode
     *
     * @param bool $minify Whether to minify CSS
     */
    public static function setMinify(bool $minify): void
    {
        self::$minify = $minify;
    }

    /**
     * Set custom breakpoints
     *
     * @param array<string, string> $breakpoints Breakpoint definitions
     */
    public static function setBreakpoints(array $breakpoints): void
    {
        self::$breakpoints = $breakpoints;
    }

    /**
     * Generate CSS for multiple widgets
     *
     * @param array<string, array<string, mixed>> $widgets Widget configurations
     * @return string Combined CSS
     */
    public static function generateMultipleWidgetCSS(array $widgets): string
    {
        $combinedCSS = '';

        foreach ($widgets as $widgetId => $widgetData) {
            $fieldConfig = $widgetData['fields'] ?? [];
            $fieldValues = $widgetData['values'] ?? [];

            $widgetCSS = self::generateWidgetCSS($widgetId, $fieldConfig, $fieldValues);
            $combinedCSS .= $widgetCSS;
        }

        return $combinedCSS;
    }

    /**
     * Generate CSS file for production
     *
     * @param array<string, array<string, mixed>> $widgets Widget configurations
     * @param string $filePath Output file path
     * @return bool Success status
     */
    public static function generateCSSFile(array $widgets, string $filePath): bool
    {
        $css = self::generateMultipleWidgetCSS($widgets);

        // Add CSS header
        $header = "/* Generated Widget CSS - " . date('Y-m-d H:i:s') . " */\n\n";
        $css = $header . $css;

        return file_put_contents($filePath, $css) !== false;
    }
}

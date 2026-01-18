<?php

namespace Xgenious\PageBuilder\Core;

/**
 * WidgetHelper - Utility class for accessing widget settings in blade templates
 * 
 * This helper simplifies access to widget settings data with clean, intuitive methods.
 * 
 * Usage in blade templates:
 * {{ $helper->generalSettings('field_name') }}
 * {{ $helper->styleSettings('group.field_name') }}
 * {{ $helper->advancedSettings('field_name') }}
 */
class WidgetHelper
{
    private array $settings;
    private array $widget;
    private string $cssClasses;
    private string $inlineStyles;

    public function __construct(array $templateData)
    {
        $this->settings = $templateData['settings'] ?? [];
        $this->widget = $templateData['widget'] ?? [];
        $this->cssClasses = $templateData['css_classes'] ?? '';
        $this->inlineStyles = $templateData['inline_styles'] ?? '';
    }

    /**
     * Get value from general settings
     * 
     * @param string $fieldPath Field path (e.g., 'title' or 'group.field')
     * @param mixed $default Default value if field not found
     * @return mixed
     */
    public function generalSettings(string $fieldPath, $default = null)
    {
        return $this->getSettingValue('general', $fieldPath, $default);
    }

    /**
     * Get value from style settings
     * 
     * @param string $fieldPath Field path (e.g., 'typography.font_size' or 'background.color')
     * @param mixed $default Default value if field not found
     * @return mixed
     */
    public function styleSettings(string $fieldPath, $default = null)
    {
        return $this->getSettingValue('style', $fieldPath, $default);
    }

    /**
     * Get value from advanced settings
     * 
     * @param string $fieldPath Field path (e.g., 'css_classes' or 'custom_css')
     * @param mixed $default Default value if field not found
     * @return mixed
     */
    public function advancedSettings(string $fieldPath, $default = null)
    {
        return $this->getSettingValue('advanced', $fieldPath, $default);
    }

    /**
     * Get any setting value using dot notation
     * 
     * @param string $fullPath Full path (e.g., 'general.content.title')
     * @param mixed $default Default value if field not found
     * @return mixed
     */
    public function get(string $fullPath, $default = null)
    {
        return data_get($this->settings, $fullPath, $default);
    }

    /**
     * Check if a setting exists
     * 
     * @param string $tab Settings tab (general, style, advanced)
     * @param string $fieldPath Field path
     * @return bool
     */
    public function has(string $tab, string $fieldPath): bool
    {
        $path = $this->buildPath($tab, $fieldPath);
        return data_get($this->settings, $path) !== null;
    }

    /**
     * Get auto-generated CSS classes
     * 
     * @param string $additional Additional CSS classes to append
     * @return string
     */
    public function cssClasses(string $additional = ''): string
    {
        return trim($this->cssClasses . ' ' . $additional);
    }

    /**
     * Get auto-generated inline styles
     * 
     * @param string $additional Additional inline styles to append
     * @return string
     */
    public function inlineStyles(string $additional = ''): string
    {
        $styles = $this->inlineStyles;
        if ($additional) {
            $styles = rtrim($styles, ';') . '; ' . $additional;
        }
        return $styles;
    }

    /**
     * Get widget metadata
     * 
     * @param string $key Widget property (type, name, icon, etc.)
     * @param mixed $default Default value
     * @return mixed
     */
    public function widget(string $key, $default = null)
    {
        return data_get($this->widget, $key, $default);
    }

    /**
     * Get all settings from a specific tab
     * 
     * @param string $tab Settings tab (general, style, advanced)
     * @return array
     */
    public function allSettings(string $tab): array
    {
        return $this->settings[$tab] ?? [];
    }

    /**
     * Process text with custom markup (e.g., {c}colored text{/c})
     * 
     * @param string $text Text to process
     * @param array $processors Array of processors [pattern => replacement]
     * @return string
     */
    public function processMarkup(string $text, array $processors = []): string
    {
        // Default processors
        $defaultProcessors = [
            '/\{c\}(.*?)\{\/c\}/' => '<span class="text-blue-600">$1</span>',
            '/\{b\}(.*?)\{\/b\}/' => '<strong>$1</strong>',
            '/\{i\}(.*?)\{\/i\}/' => '<em>$1</em>',
        ];

        $allProcessors = array_merge($defaultProcessors, $processors);

        foreach ($allProcessors as $pattern => $replacement) {
            $text = preg_replace($pattern, $replacement, $text);
        }

        return $text;
    }

    /**
     * Get processed text with markup and escaping
     * 
     * @param string $tab Settings tab
     * @param string $fieldPath Field path
     * @param mixed $default Default value
     * @param bool $allowHtml Whether to allow HTML output
     * @return string
     */
    public function getText(string $tab, string $fieldPath, $default = '', bool $allowHtml = true): string
    {
        $text = $this->getSettingValue($tab, $fieldPath, $default);
        $text = $this->processMarkup($text);
        
        return $allowHtml ? $text : strip_tags($text);
    }

    /**
     * Helper for conditional rendering based on setting value
     * 
     * @param string $tab Settings tab
     * @param string $fieldPath Field path
     * @param mixed $expectedValue Value to compare against
     * @return bool
     */
    public function is(string $tab, string $fieldPath, $expectedValue): bool
    {
        return $this->getSettingValue($tab, $fieldPath) === $expectedValue;
    }

    /**
     * Helper for conditional rendering based on boolean setting
     * 
     * @param string $tab Settings tab
     * @param string $fieldPath Field path
     * @param bool $default Default boolean value
     * @return bool
     */
    public function isEnabled(string $tab, string $fieldPath, bool $default = false): bool
    {
        return (bool) $this->getSettingValue($tab, $fieldPath, $default);
    }

    /**
     * Get array of values (useful for loops)
     * 
     * @param string $tab Settings tab
     * @param string $fieldPath Field path
     * @param array $default Default array value
     * @return array
     */
    public function getArray(string $tab, string $fieldPath, array $default = []): array
    {
        $value = $this->getSettingValue($tab, $fieldPath, $default);
        return is_array($value) ? $value : $default;
    }

    /**
     * Debug helper - output all settings as JSON
     * 
     * @param bool $prettyPrint Whether to format JSON
     * @return string
     */
    public function debug(bool $prettyPrint = true): string
    {
        $flags = $prettyPrint ? JSON_PRETTY_PRINT : 0;
        return json_encode($this->settings, $flags);
    }

    // ========================================
    // Private Helper Methods
    // ========================================

    /**
     * Get setting value with intelligent path resolution
     * 
     * @param string $tab Settings tab (general, style, advanced)
     * @param string $fieldPath Field path (supports dot notation)
     * @param mixed $default Default value
     * @return mixed
     */
    private function getSettingValue(string $tab, string $fieldPath, $default = null)
    {
        $path = $this->buildPath($tab, $fieldPath);
        return data_get($this->settings, $path, $default);
    }

    /**
     * Build the full path for accessing settings
     * 
     * @param string $tab Settings tab
     * @param string $fieldPath Field path
     * @return string
     */
    private function buildPath(string $tab, string $fieldPath): string
    {
        // If fieldPath already includes groups, use as-is
        if (str_contains($fieldPath, '.')) {
            return $tab . '.' . $fieldPath;
        }

        // Try to find the field in any group within the tab
        $tabSettings = $this->settings[$tab] ?? [];
        
        foreach ($tabSettings as $groupKey => $groupData) {
            if (is_array($groupData) && array_key_exists($fieldPath, $groupData)) {
                return $tab . '.' . $groupKey . '.' . $fieldPath;
            }
        }

        // If not found in any group, assume it's a direct field
        return $tab . '.' . $fieldPath;
    }

    // ========================================
    // Magic Methods for Dynamic Access
    // ========================================

    /**
     * Magic method for dynamic property access
     * 
     * @param string $name Property name
     * @return mixed
     */
    public function __get(string $name)
    {
        // Try to get from general settings first
        $value = $this->generalSettings($name);
        if ($value !== null) {
            return $value;
        }

        // Try style settings
        $value = $this->styleSettings($name);
        if ($value !== null) {
            return $value;
        }

        // Try advanced settings
        return $this->advancedSettings($name);
    }

    /**
     * Magic method for checking if property exists
     * 
     * @param string $name Property name
     * @return bool
     */
    public function __isset(string $name): bool
    {
        return $this->has('general', $name) || 
               $this->has('style', $name) || 
               $this->has('advanced', $name);
    }
}
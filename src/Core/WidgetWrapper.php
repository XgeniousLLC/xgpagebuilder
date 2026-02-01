<?php

namespace Xgenious\PageBuilder\Core;

use Xgenious\PageBuilder\Core\CSSManager;

/**
 * WidgetWrapper Trait
 * 
 * Automatically wraps widget content with a div container that applies
 * advanced settings like visibility, animations, background, spacing, etc.
 * This eliminates the need for developers to manually handle advanced settings.
 * 
 * Features:
 * - Automatic wrapper div generation
 * - Advanced settings application (visibility, animations, background, etc.)
 * - Responsive spacing and styling
 * - Container ID and class management
 * - Custom CSS and data attributes
 * 
 * @package plugins\Pagebuilder\Core
 */
trait WidgetWrapper
{
    /**
     * Wrap widget content with container div that applies advanced settings
     * 
     * @param string $content Widget's inner content
     * @param array $settings Complete widget settings
     * @param string|null $widgetId Optional widget ID, auto-generated if not provided
     * @return string Complete wrapped widget HTML
     */
    protected function wrapWidget(string $content, array $settings, string $widgetId = null): string
    {
        if (!$widgetId) {
            $widgetId = 'xgp_widget_' . uniqid();
        }

        $advanced = $settings['advanced'] ?? [];

        // Check visibility settings
        if (!$this->isWidgetVisible($advanced)) {
            return '<!-- Widget hidden by visibility settings -->';
        }

        // Register CSS with CSSManager instead of generating inline styles
        $this->registerWidgetCSS($widgetId, $settings);

        // Generate wrapper attributes (without individual style tags)
        $wrapperClasses = $this->generateWrapperClasses($settings, $widgetId);
        $wrapperStyles = $this->generateWrapperStyles($settings);
        $dataAttributes = $this->generateDataAttributes($settings, $widgetId);

        // Build wrapper opening tag
        $wrapperTag = "<div id=\"{$widgetId}\" {$wrapperClasses} {$wrapperStyles} {$dataAttributes}>";

        // Add animation wrapper if needed
        $animationWrapper = $this->getAnimationWrapper($advanced);

        // Build complete wrapper
        $wrappedContent = $wrapperTag;

        if ($animationWrapper) {
            $wrappedContent .= $animationWrapper['open'];
        }

        $wrappedContent .= $content;

        if ($animationWrapper) {
            $wrappedContent .= $animationWrapper['close'];
        }

        $wrappedContent .= "</div>";

        return $wrappedContent;
    }

    /**
     * Check if widget should be visible based on advanced visibility settings
     */
    private function isWidgetVisible(array $advanced): bool
    {
        $visibility = $advanced['visibility'] ?? [];

        // Check general visibility
        if (isset($visibility['visible']) && !$visibility['visible']) {
            return false;
        }

        // Note: Device-specific visibility (hide_on_desktop, hide_on_tablet, hide_on_mobile)
        // is handled via CSS classes rather than server-side logic

        return true;
    }

    /**
     * Generate CSS classes for the wrapper
     */
    private function generateWrapperClasses(array $settings, string $widgetId): string
    {
        $classes = [];

        // Base widget wrapper class
        $classes[] = 'xgp_widget_wrapper';
        $classes[] = 'xgp_widget_' . $this->getWidgetType();

        // Advanced visibility classes
        $advanced = $settings['advanced'] ?? [];
        $visibility = $advanced['visibility'] ?? [];

        if ($visibility['hide_on_desktop'] ?? false) {
            $classes[] = 'xgp_hidden_desktop';
        }

        if ($visibility['hide_on_tablet'] ?? false) {
            $classes[] = 'xgp_hidden_tablet';
        }

        if ($visibility['hide_on_mobile'] ?? false) {
            $classes[] = 'xgp_hidden_mobile';
        }

        // Animation classes
        $animation = $advanced['animation'] ?? [];
        if (isset($animation['animation_type']) && $animation['animation_type'] !== 'none') {
            $classes[] = 'xgp_has_animation';
            $classes[] = 'xgp_animation_' . $animation['animation_type'];
        }

        // Background classes
        $background = $advanced['background'] ?? [];
        if (isset($background['background_type']) && $background['background_type'] !== 'none') {
            $classes[] = 'xgp_has_background';
            $classes[] = 'xgp_background_' . $background['background_type'];
        }

        // Custom CSS classes
        $custom = $advanced['custom'] ?? [];
        if (isset($custom['css_classes']) && !empty($custom['css_classes'])) {
            $customClasses = explode(' ', $custom['css_classes']);
            $classes = array_merge($classes, array_filter($customClasses));
        }

        return 'class="' . implode(' ', array_unique($classes)) . '"';
    }

    /**
     * Generate inline styles for the wrapper
     */
    private function generateWrapperStyles(array $settings): string
    {
        $styles = [];
        $advanced = $settings['advanced'] ?? [];

        // Background styles
        $background = $advanced['background'] ?? [];
        if (isset($background['background_color']) && !empty($background['background_color'])) {
            $styles[] = 'background-color: ' . $background['background_color'];
        }

        // Spacing styles (margin and padding)
        $spacing = $advanced['spacing'] ?? [];

        // Responsive padding
        if (isset($spacing['padding'])) {
            $padding = $spacing['padding'];
            if (is_array($padding)) {
                if (isset($padding['desktop'])) {
                    $styles[] = 'padding: ' . $padding['desktop'];
                }
                // Note: Tablet and mobile padding should be handled via responsive CSS
            } elseif (is_string($padding)) {
                $styles[] = 'padding: ' . $padding;
            }
        }

        // Responsive margin
        if (isset($spacing['margin'])) {
            $margin = $spacing['margin'];
            if (is_array($margin)) {
                if (isset($margin['desktop'])) {
                    $styles[] = 'margin: ' . $margin['desktop'];
                }
            } elseif (is_string($margin)) {
                $styles[] = 'margin: ' . $margin;
            }
        }

        // Border styles
        $border = $advanced['border'] ?? [];
        if (isset($border['border_width']) && $border['border_width'] > 0) {
            $borderColor = $border['border_color'] ?? '#000000';
            $styles[] = "border: {$border['border_width']}px solid {$borderColor}";
        }

        if (isset($border['border_radius']) && $border['border_radius'] > 0) {
            $styles[] = 'border-radius: ' . $border['border_radius'] . 'px';
        }

        // Box shadow
        if (isset($border['box_shadow']) && $border['box_shadow'] !== 'none') {
            $styles[] = 'box-shadow: ' . $border['box_shadow'];
        }

        // Animation styles
        $animation = $advanced['animation'] ?? [];
        if (isset($animation['animation_duration'])) {
            $styles[] = 'animation-duration: ' . $animation['animation_duration'] . 'ms';
        }

        if (isset($animation['animation_delay'])) {
            $styles[] = 'animation-delay: ' . $animation['animation_delay'] . 'ms';
        }

        // Custom styles
        $custom = $advanced['custom'] ?? [];
        if (isset($custom['z_index'])) {
            $styles[] = 'z-index: ' . $custom['z_index'];
        }

        if (isset($custom['custom_css']) && !empty($custom['custom_css'])) {
            $styles[] = $custom['custom_css'];
        }

        if (empty($styles)) {
            return '';
        }

        return 'style="' . implode('; ', $styles) . '"';
    }

    /**
     * Generate data attributes for the wrapper
     */
    private function generateDataAttributes(array $settings, string $widgetId): string
    {
        $attributes = [];
        $advanced = $settings['advanced'] ?? [];

        // Widget type
        $attributes[] = 'data-widget-type="' . $this->getWidgetType() . '"';
        $attributes[] = 'data-widget-id="' . $widgetId . '"';

        // Animation data
        $animation = $advanced['animation'] ?? [];
        if (isset($animation['animation_type']) && $animation['animation_type'] !== 'none') {
            $attributes[] = 'data-animation="' . $animation['animation_type'] . '"';

            if (isset($animation['animation_duration'])) {
                $attributes[] = 'data-animation-duration="' . $animation['animation_duration'] . '"';
            }

            if (isset($animation['animation_delay'])) {
                $attributes[] = 'data-animation-delay="' . $animation['animation_delay'] . '"';
            }
        }

        // Custom data attributes
        $custom = $advanced['custom'] ?? [];
        if (isset($custom['data_attributes']) && !empty($custom['data_attributes'])) {
            // Parse custom data attributes (format: "key1:value1,key2:value2")
            $customData = explode(',', $custom['data_attributes']);
            foreach ($customData as $dataAttr) {
                if (strpos($dataAttr, ':') !== false) {
                    [$key, $value] = explode(':', trim($dataAttr), 2);
                    $attributes[] = 'data-' . trim($key) . '="' . htmlspecialchars(trim($value)) . '"';
                }
            }
        }

        return implode(' ', $attributes);
    }

    /**
     * Get animation wrapper if needed
     */
    private function getAnimationWrapper(array $advanced): ?array
    {
        $animation = $advanced['animation'] ?? [];
        $animationType = $animation['animation_type'] ?? 'none';

        if ($animationType === 'none') {
            return null;
        }

        // For some animations, we might need an inner wrapper
        $needsWrapper = in_array($animationType, ['slideIn', 'fadeIn', 'bounceIn', 'zoomIn']);

        if (!$needsWrapper) {
            return null;
        }

        return [
            'open' => '<div class="animation-inner-wrapper">',
            'close' => '</div>'
        ];
    }

    /**
     * Generate responsive CSS for advanced settings
     * This method generates CSS that should be included in the page head
     * 
     * @param string $widgetId Widget ID
     * @param array $settings Widget settings
     * @return string Generated CSS
     */
    public function generateWrapperCSS(string $widgetId, array $settings): string
    {
        $css = [];
        $advanced = $settings['advanced'] ?? [];

        // Responsive spacing
        $spacing = $advanced['spacing'] ?? [];

        // Tablet styles
        if (isset($spacing['padding']['tablet']) || isset($spacing['margin']['tablet'])) {
            $css[] = "@media (max-width: 768px) {";
            $css[] = "  #{$widgetId} {";

            if (isset($spacing['padding']['tablet'])) {
                $css[] = "    padding: {$spacing['padding']['tablet']};";
            }

            if (isset($spacing['margin']['tablet'])) {
                $css[] = "    margin: {$spacing['margin']['tablet']};";
            }

            $css[] = "  }";
            $css[] = "}";
        }

        // Mobile styles
        if (isset($spacing['padding']['mobile']) || isset($spacing['margin']['mobile'])) {
            $css[] = "@media (max-width: 480px) {";
            $css[] = "  #{$widgetId} {";

            if (isset($spacing['padding']['mobile'])) {
                $css[] = "    padding: {$spacing['padding']['mobile']};";
            }

            if (isset($spacing['margin']['mobile'])) {
                $css[] = "    margin: {$spacing['margin']['mobile']};";
            }

            $css[] = "  }";
            $css[] = "}";
        }

        // Visibility CSS
        $visibility = $advanced['visibility'] ?? [];

        if ($visibility['hide_on_desktop'] ?? false) {
            $css[] = "@media (min-width: 1024px) {";
            $css[] = "  #{$widgetId} { display: none !important; }";
            $css[] = "}";
        }

        if ($visibility['hide_on_tablet'] ?? false) {
            $css[] = "@media (min-width: 481px) and (max-width: 1023px) {";
            $css[] = "  #{$widgetId} { display: none !important; }";
            $css[] = "}";
        }

        if ($visibility['hide_on_mobile'] ?? false) {
            $css[] = "@media (max-width: 480px) {";
            $css[] = "  #{$widgetId} { display: none !important; }";
            $css[] = "}";
        }

        return implode("\n", $css);
    }

    /**
     * Register widget CSS with the CSSManager
     */
    protected function registerWidgetCSS(string $widgetId, array $settings): void
    {
        // Generate CSS for this widget and register with CSSManager
        if (method_exists($this, 'generateCSS')) {
            $css = $this->generateCSS($widgetId, $settings);
            if (!empty($css)) {
                CSSManager::addWidgetCSS($widgetId, $css, $this->getWidgetType());
            }
        }

        // Register responsive wrapper styles
        $wrapperCSS = $this->generateWrapperCSS($widgetId, $settings);
        if (!empty($wrapperCSS)) {
            CSSManager::addWidgetCSS($widgetId . '_wrapper', $wrapperCSS, $this->getWidgetType() . '_wrapper');
        }
    }

    /**
     * Abstract method that implementing classes must provide
     */
    abstract protected function getWidgetType(): string;
}

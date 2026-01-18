<?php

namespace Xgenious\PageBuilder\Core;

/**
 * SectionLayoutCSSGenerator - PHP equivalent of the JavaScript section layout CSS generator
 *
 * Handles CSS generation for different section layout modes on the frontend.
 * This class generates the same CSS as the JavaScript version but excludes
 * editor-specific styles (dashed borders, labels) for clean frontend output.
 *
 * Supported layout modes:
 * - boxed: Constrained width with auto margins
 * - full_width_contained: Full viewport width with contained inner content
 * - full_width: Full viewport width with unconstrained inner content
 *
 * @package Plugins\Pagebuilder\Core
 */
class SectionLayoutCSSGenerator
{
    /**
     * Generate section layout CSS for different layout modes
     *
     * @param string $layoutMode Layout mode (boxed, full_width_contained, full_width)
     * @param int $maxWidth Maximum width for boxed and contained layouts
     * @return string Generated CSS
     */
    public static function generateSectionLayoutCSS(string $layoutMode, int $maxWidth = 1200): string
    {
        $css = [];

        switch ($layoutMode) {
            case 'boxed':
                $css[] = self::generateBoxedCSS($maxWidth);
                break;

            case 'full_width_contained':
                $css[] = self::generateFullWidthContainedCSS($maxWidth);
                break;

            case 'full_width':
                $css[] = self::generateFullWidthCSS();
                break;
        }

        return implode("\n", array_filter($css));
    }

    /**
     * Generate CSS for boxed layout mode
     *
     * @param int $maxWidth Maximum width
     * @return string CSS
     */
    private static function generateBoxedCSS(int $maxWidth): string
    {
        return "
.section-layout-boxed {
  max-width: {$maxWidth}px;
  margin-left: -15px;
  margin-right: -15px;
  padding-left: 15px;
  padding-right: 15px;
}";
    }

    /**
     * Generate CSS for full width contained layout mode
     *
     * @param int $maxWidth Maximum width for inner content
     * @return string CSS
     */
    private static function generateFullWidthContainedCSS(int $maxWidth): string
    {
        return "
.section-layout-full_width_contained {
  width: 100%;
}

.section-layout-full_width_contained .section-inner {
  max-width: {$maxWidth}px;
  margin-left: -15px;
  margin-right: -15px;
  padding-left: 15px;
  padding-right: 15px;
}";
    }

    /**
     * Generate CSS for full width layout mode
     *
     * @return string CSS
     */
    private static function generateFullWidthCSS(): string
    {
        return "
.section-layout-full_width {
  width: 100%;
}

.section-layout-full_width .section-inner {
  width: 100%;
  margin-left: -15px;
  margin-right: -15px;
  padding-left: 15px;
  padding-right: 15px;
}";
    }

    /**
     * Generate section-specific CSS based on section settings
     *
     * @param string $sectionId Section identifier
     * @param array $settings Section settings
     * @param array $responsiveSettings Responsive settings
     * @param string $prefix CSS class prefix (default: 'pb-section')
     * @return string Generated CSS
     */
    public static function generateSectionCSS(string $sectionId, array $settings, array $responsiveSettings = [], string $prefix = 'pb-section'): string
    {
        $css = [];
        $selector = ".{$prefix}-{$sectionId}";

        // Base section styles
        $baseStyles = self::generateBaseSectionStyles($settings);
        if ($baseStyles) {
            $css[] = "{$selector} {\n  {$baseStyles}\n}";
        }

        // Layout-specific styles
        if (isset($settings['contentWidth'])) {
            $layoutCSS = self::generateSectionLayoutCSS(
                $settings['contentWidth'],
                $settings['maxWidth'] ?? 1200
            );
            if ($layoutCSS) {
                $css[] = $layoutCSS;
            }
        }

        // Responsive styles
        if (!empty($responsiveSettings)) {
            $responsiveCSS = self::generateResponsiveCSS($selector, $responsiveSettings);
            if ($responsiveCSS) {
                $css[] = $responsiveCSS;
            }
        }

        return implode("\n", $css);
    }

    /**
     * Generate base section styles from settings
     *
     * @param array $settings Section settings
     * @return string CSS properties
     */
    private static function generateBaseSectionStyles(array $settings): string
    {
        $styles = [];

        // Background styles
        if (isset($settings['sectionBackground']) || isset($settings['background']) || isset($settings['columnBackground'])) {
            $background = $settings['sectionBackground'] ?? $settings['background'] ?? $settings['columnBackground'] ?? null;
            if ($background) {
                $bgCSS = self::generateBackgroundCSS($background);
                if ($bgCSS) $styles[] = $bgCSS;
            }
        }

        // Spacing styles
        if (isset($settings['padding'])) {
            $paddingCSS = self::normalizeSpacing($settings['padding']);
            if ($paddingCSS) $styles[] = "padding: {$paddingCSS}";
        }

        if (isset($settings['margin'])) {
            $marginCSS = self::normalizeSpacing($settings['margin']);
            if ($marginCSS) $styles[] = "margin: {$marginCSS}";
        }

        // Border styles
        if (isset($settings['borderShadow']['border'])) {
            $borderCSS = self::generateBorderCSS($settings['borderShadow']['border']);
            if ($borderCSS) $styles[] = $borderCSS;
        } elseif (isset($settings['border'])) {
            $borderCSS = self::generateBorderCSS($settings['border']);
            if ($borderCSS) $styles[] = $borderCSS;
        }

        // Shadow styles
        if (isset($settings['borderShadow']['shadow'])) {
            $shadowCSS = self::generateShadowCSS($settings['borderShadow']['shadow']);
            if ($shadowCSS) $styles[] = $shadowCSS;
        } elseif (isset($settings['shadow']) && $settings['shadow']['enabled']) {
            $shadowCSS = self::generateShadowCSS($settings['shadow']);
            if ($shadowCSS) $styles[] = $shadowCSS;
        }

        // Visibility styles for device-specific hiding
        if (isset($settings['visibility'])) {
            // These will be handled in responsive CSS generation
        }

        return implode(";\n  ", array_filter($styles));
    }

    /**
     * Generate background CSS from settings
     *
     * @param array $background Background settings
     * @return string CSS
     */
    public static function generateBackgroundCSS(array $background): string
    {
        switch ($background['type'] ?? 'none') {
            case 'color':
                return isset($background['color']) ? "background-color: {$background['color']}" : '';

            case 'gradient':
                if (isset($background['gradient'])) {
                    $gradient = $background['gradient'];
                    $stops = [];

                    if (isset($gradient['colorStops'])) {
                        foreach ($gradient['colorStops'] as $stop) {
                            $stops[] = "{$stop['color']} {$stop['position']}%";
                        }
                    }

                    $stopsCSS = implode(', ', $stops);

                    if ($gradient['type'] === 'linear') {
                        return "background: linear-gradient({$gradient['angle']}deg, {$stopsCSS})";
                    } elseif ($gradient['type'] === 'radial') {
                        return "background: radial-gradient(circle, {$stopsCSS})";
                    }
                }
                return '';

            case 'image':
                if (isset($background['image']['url'])) {
                    $image = $background['image'];
                    $css = ["background-image: url('{$image['url']}')"];
                    $css[] = "background-size: " . ($image['size'] ?? 'cover');
                    $css[] = "background-repeat: " . ($image['repeat'] ?? 'no-repeat');
                    $css[] = "background-position: " . ($image['position'] ?? 'center center');

                    if (isset($image['attachment'])) {
                        $css[] = "background-attachment: {$image['attachment']}";
                    }

                    return implode('; ', $css);
                }
                return '';

            default:
                return '';
        }
    }

    /**
     * Generate border CSS from settings
     *
     * @param array $border Border settings
     * @return string CSS
     */
    public static function generateBorderCSS(array $border): string
    {
        $styles = [];

        if (isset($border['width'])) {
            $width = $border['width'];
            if (($width['top'] ?? 0) || ($width['right'] ?? 0) || ($width['bottom'] ?? 0) || ($width['left'] ?? 0)) {
                $styles[] = "border-width: {$width['top']}px {$width['right']}px {$width['bottom']}px {$width['left']}px";
                $styles[] = "border-style: " . ($border['style'] ?? 'solid');
                $styles[] = "border-color: " . ($border['color'] ?? '#e2e8f0');
            }
        }

        if (isset($border['radius'])) {
            $radius = $border['radius'];
            $unit = $radius['unit'] ?? 'px';
            if (($radius['topLeft'] ?? 0) || ($radius['topRight'] ?? 0) || ($radius['bottomLeft'] ?? 0) || ($radius['bottomRight'] ?? 0)) {
                $styles[] = "border-radius: {$radius['topLeft']}{$unit} {$radius['topRight']}{$unit} {$radius['bottomRight']}{$unit} {$radius['bottomLeft']}{$unit}";
            }
        }

        return implode('; ', $styles);
    }

    /**
     * Generate shadow CSS from settings
     *
     * @param array $shadow Shadow settings
     * @return string CSS
     */
    public static function generateShadowCSS(array $shadow): string
    {
        if (!($shadow['enabled'] ?? false)) {
            return '';
        }

        $horizontal = $shadow['horizontal'] ?? 0;
        $vertical = $shadow['vertical'] ?? 4;
        $blur = $shadow['blur'] ?? 6;
        $spread = $shadow['spread'] ?? 0;
        $color = $shadow['color'] ?? 'rgba(0, 0, 0, 0.1)';
        $inset = ($shadow['inset'] ?? false) ? 'inset ' : '';

        return "box-shadow: {$inset}{$horizontal}px {$vertical}px {$blur}px {$spread}px {$color}";
    }

    /**
     * Normalize spacing value (handle different formats)
     *
     * @param mixed $spacing Spacing value
     * @return string CSS value
     */
    public static function normalizeSpacing($spacing): string
    {
        if (is_string($spacing)) {
            return $spacing;
        }

        if (is_array($spacing)) {
            // Handle responsive spacing object
            if (isset($spacing['desktop'])) {
                return self::normalizeSpacing($spacing['desktop']);
            }

            // Handle new spacing format with unit
            if (isset($spacing['top'])) {
                $unit = $spacing['unit'] ?? 'px';
                return "{$spacing['top']}{$unit} {$spacing['right']}{$unit} {$spacing['bottom']}{$unit} {$spacing['left']}{$unit}";
            }
        }

        return (string)$spacing;
    }

    /**
     * Generate responsive CSS
     *
     * @param string $selector Base selector
     * @param array $responsiveSettings Responsive settings
     * @return string CSS
     */
    private static function generateResponsiveCSS(string $selector, array $responsiveSettings): string
    {
        $css = [];

        // Tablet styles
        if (isset($responsiveSettings['tablet']) && !empty($responsiveSettings['tablet'])) {
            $tabletStyles = self::generateBaseSectionStyles($responsiveSettings['tablet']);
            if ($tabletStyles) {
                $css[] = "@media (max-width: 1024px) {\n{$selector} {\n  {$tabletStyles}\n}\n}";
            }
        }

        // Mobile styles
        if (isset($responsiveSettings['mobile']) && !empty($responsiveSettings['mobile'])) {
            $mobileStyles = self::generateBaseSectionStyles($responsiveSettings['mobile']);
            if ($mobileStyles) {
                $css[] = "@media (max-width: 768px) {\n{$selector} {\n  {$mobileStyles}\n}\n}";
            }
        }

        // Device-specific visibility
        $visibility = $responsiveSettings['visibility'] ?? [];

        if ($visibility['hideOnDesktop'] ?? false) {
            $css[] = "@media (min-width: 1025px) {\n{$selector} { display: none !important; }\n}";
        }

        if ($visibility['hideOnTablet'] ?? false) {
            $css[] = "@media (min-width: 769px) and (max-width: 1024px) {\n{$selector} { display: none !important; }\n}";
        }

        if ($visibility['hideOnMobile'] ?? false) {
            $css[] = "@media (max-width: 768px) {\n{$selector} { display: none !important; }\n}";
        }

        return implode("\n", $css);
    }

    /**
     * Get all supported layout modes
     *
     * @return array Layout modes
     */
    public static function getSupportedLayoutModes(): array
    {
        return ['boxed', 'full_width_contained', 'full_width'];
    }

    /**
     * Validate layout mode
     *
     * @param string $layoutMode Layout mode to validate
     * @return bool Valid or not
     */
    public static function isValidLayoutMode(string $layoutMode): bool
    {
        return in_array($layoutMode, self::getSupportedLayoutModes());
    }
}

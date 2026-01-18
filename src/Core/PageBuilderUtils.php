<?php

namespace Xgenious\PageBuilder\Core;

/**
 * PageBuilderUtils - Utility methods for page builder functionality
 * 
 * Provides helper methods for rendering various page builder elements
 * with proper XSS protection and security measures.
 * 
 * @package Plugins\Pagebuilder\Core
 */
class PageBuilderUtils
{
    /**
     * Render a link with enhanced security and XSS protection
     * 
     * @param array $linkData Link configuration from enhanced link field
     * @param string $content Content to wrap in link (supports HTML markup or plain text)
     * @param array $options Additional rendering options
     * @return string Rendered HTML link
     */
    public static function renderLink(array $linkData, string $content = '', array $options = []): string
    {
        // Default options
        $options = array_merge([
            'escape_content' => false, // Set to true to escape HTML in content
            'allow_empty_url' => false, // Set to true to render span if URL is empty
            'default_target' => '_self',
            'css_classes' => []
        ], $options);

        // Validate and sanitize link data
        $sanitizedLink = self::sanitizeLinkData($linkData);
        
        // If no URL and not allowing empty URLs, return content without link
        if (empty($sanitizedLink['url']) && !$options['allow_empty_url']) {
            return $options['escape_content'] ? htmlspecialchars($content, ENT_QUOTES, 'UTF-8') : $content;
        }

        // If no URL but allowing empty URLs, return content in span
        if (empty($sanitizedLink['url']) && $options['allow_empty_url']) {
            $spanClass = !empty($options['css_classes']) ? ' class="' . implode(' ', $options['css_classes']) . '"' : '';
            return "<span{$spanClass}>" . ($options['escape_content'] ? htmlspecialchars($content, ENT_QUOTES, 'UTF-8') : $content) . "</span>";
        }

        // Use provided content or fallback to link text or URL
        if (empty($content)) {
            $content = !empty($sanitizedLink['text']) ? $sanitizedLink['text'] : $sanitizedLink['url'];
        }

        // Build link attributes
        $attributes = self::buildLinkAttributes($sanitizedLink, $options);

        // Prepare content
        $linkContent = $options['escape_content'] ? htmlspecialchars($content, ENT_QUOTES, 'UTF-8') : $content;

        return "<a{$attributes}>{$linkContent}</a>";
    }

    /**
     * Sanitize link data to prevent XSS attacks
     * 
     * @param array $linkData Raw link data
     * @return array Sanitized link data
     */
    public static function sanitizeLinkData(array $linkData): array
    {
        $sanitized = [
            'url' => '',
            'text' => '',
            'type' => 'external',
            'target' => '_self',
            'rel' => [],
            'title' => '',
            'id' => '',
            'class' => '',
            'custom_attributes' => [],
            'utm_parameters' => []
        ];

        // Sanitize URL with proper validation
        if (isset($linkData['url'])) {
            $sanitized['url'] = self::sanitizeURL($linkData['url']);
        }

        // Sanitize text content
        if (isset($linkData['text'])) {
            $sanitized['text'] = htmlspecialchars(strip_tags($linkData['text']), ENT_QUOTES, 'UTF-8');
        }

        // Validate link type
        $validTypes = ['internal', 'external', 'email', 'phone', 'file', 'anchor'];
        if (isset($linkData['type']) && in_array($linkData['type'], $validTypes)) {
            $sanitized['type'] = $linkData['type'];
        }

        // Validate target
        $validTargets = ['_self', '_blank', '_parent', '_top'];
        if (isset($linkData['target']) && in_array($linkData['target'], $validTargets)) {
            $sanitized['target'] = $linkData['target'];
        }

        // Sanitize rel attributes
        if (isset($linkData['rel']) && is_array($linkData['rel'])) {
            $validRel = ['nofollow', 'noopener', 'noreferrer', 'sponsored', 'ugc'];
            $sanitized['rel'] = array_intersect($linkData['rel'], $validRel);
        }

        // Sanitize title attribute
        if (isset($linkData['title'])) {
            $sanitized['title'] = htmlspecialchars(strip_tags($linkData['title']), ENT_QUOTES, 'UTF-8');
        }

        // Sanitize ID attribute
        if (isset($linkData['id'])) {
            $sanitized['id'] = preg_replace('/[^a-zA-Z0-9_-]/', '', $linkData['id']);
        }

        // Sanitize CSS classes
        if (isset($linkData['class'])) {
            $sanitized['class'] = preg_replace('/[^a-zA-Z0-9\s_-]/', '', $linkData['class']);
        }

        // Sanitize custom attributes
        if (isset($linkData['custom_attributes']) && is_array($linkData['custom_attributes'])) {
            foreach ($linkData['custom_attributes'] as $attr) {
                if (isset($attr['name']) && isset($attr['value']) && !empty($attr['name'])) {
                    // Only allow safe attribute names (data-, aria-, and some standard HTML attributes)
                    if (self::isAllowedAttribute($attr['name'])) {
                        $sanitized['custom_attributes'][] = [
                            'name' => preg_replace('/[^a-zA-Z0-9_-]/', '', $attr['name']),
                            'value' => htmlspecialchars($attr['value'], ENT_QUOTES, 'UTF-8')
                        ];
                    }
                }
            }
        }

        // Sanitize UTM parameters
        if (isset($linkData['utm_parameters']) && is_array($linkData['utm_parameters'])) {
            $utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            foreach ($utmKeys as $key) {
                if (isset($linkData['utm_parameters'][$key])) {
                    $sanitized['utm_parameters'][$key] = htmlspecialchars(
                        strip_tags($linkData['utm_parameters'][$key]), 
                        ENT_QUOTES, 
                        'UTF-8'
                    );
                }
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize URL to prevent XSS and validate format
     * 
     * @param string $url Raw URL
     * @return string Sanitized URL
     */
    public static function sanitizeURL(string $url): string
    {
        if (empty($url)) {
            return '';
        }

        // Trim whitespace
        $url = trim($url);

        // Handle different URL types
        if (str_starts_with(strtolower($url), 'javascript:')) {
            // Block javascript: URLs for security
            return '';
        }

        if (str_starts_with(strtolower($url), 'data:')) {
            // Block data: URLs for security (except safe image types)
            if (!preg_match('/^data:image\/(png|jpg|jpeg|gif|svg\+xml);base64,/', strtolower($url))) {
                return '';
            }
        }

        // Handle mailto: URLs
        if (str_starts_with(strtolower($url), 'mailto:')) {
            $email = substr($url, 7);
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return 'mailto:' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
            }
            return '';
        }

        // Handle tel: URLs
        if (str_starts_with(strtolower($url), 'tel:')) {
            $phone = substr($url, 4);
            // Allow digits, spaces, dashes, parentheses, plus sign
            if (preg_match('/^[\d\s\-\(\)\+]+$/', $phone)) {
                return 'tel:' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
            }
            return '';
        }

        // Handle internal URLs (starting with / or #)
        if (str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
        }

        // Handle external URLs
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            // Only allow http and https protocols
            $parsed = parse_url($url);
            if (isset($parsed['scheme']) && in_array(strtolower($parsed['scheme']), ['http', 'https'])) {
                return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
            }
        }

        // If none of the above, treat as relative URL but sanitize
        return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Check if an attribute name is allowed for security
     * 
     * @param string $attributeName Attribute name to check
     * @return bool True if allowed, false otherwise
     */
    private static function isAllowedAttribute(string $attributeName): bool
    {
        $attributeName = strtolower($attributeName);

        // Allow data- attributes
        if (str_starts_with($attributeName, 'data-')) {
            return true;
        }

        // Allow aria- attributes
        if (str_starts_with($attributeName, 'aria-')) {
            return true;
        }

        // Allow specific safe HTML attributes
        $allowedAttributes = [
            'class', 'id', 'title', 'style', 'role', 'tabindex',
            'lang', 'dir', 'hidden', 'accesskey'
        ];

        return in_array($attributeName, $allowedAttributes);
    }

    /**
     * Build HTML attributes string for link
     * 
     * @param array $linkData Sanitized link data
     * @param array $options Rendering options
     * @return string HTML attributes string
     */
    private static function buildLinkAttributes(array $linkData, array $options): string
    {
        $attributes = [];

        // Add href attribute
        $url = self::addUTMParameters($linkData['url'], $linkData['utm_parameters'] ?? []);
        $attributes['href'] = $url;

        // Add target attribute
        if (!empty($linkData['target']) && $linkData['target'] !== '_self') {
            $attributes['target'] = $linkData['target'];
        }

        // Add rel attribute
        $relValues = $linkData['rel'] ?? [];
        
        // Auto-add security rel attributes for external links
        if ($linkData['target'] === '_blank' && !in_array('noopener', $relValues)) {
            $relValues[] = 'noopener';
        }
        
        if (!empty($relValues)) {
            $attributes['rel'] = implode(' ', array_unique($relValues));
        }

        // Add title attribute
        if (!empty($linkData['title'])) {
            $attributes['title'] = $linkData['title'];
        }

        // Add ID attribute
        if (!empty($linkData['id'])) {
            $attributes['id'] = $linkData['id'];
        }

        // Build CSS classes
        $cssClasses = [];
        if (!empty($linkData['class'])) {
            $cssClasses = array_merge($cssClasses, explode(' ', $linkData['class']));
        }
        if (!empty($options['css_classes'])) {
            $cssClasses = array_merge($cssClasses, $options['css_classes']);
        }
        if (!empty($cssClasses)) {
            $attributes['class'] = implode(' ', array_unique(array_filter($cssClasses)));
        }

        // Add custom attributes
        if (!empty($linkData['custom_attributes'])) {
            foreach ($linkData['custom_attributes'] as $attr) {
                if (!empty($attr['name']) && isset($attr['value'])) {
                    $attributes[$attr['name']] = $attr['value'];
                }
            }
        }

        // Build attributes string
        $attrString = '';
        foreach ($attributes as $name => $value) {
            $attrString .= ' ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '="' . $value . '"';
        }

        return $attrString;
    }

    /**
     * Add UTM parameters to URL
     * 
     * @param string $url Base URL
     * @param array $utmParams UTM parameters
     * @return string URL with UTM parameters
     */
    private static function addUTMParameters(string $url, array $utmParams): string
    {
        if (empty($utmParams) || empty($url)) {
            return $url;
        }

        $params = [];
        foreach ($utmParams as $key => $value) {
            if (!empty($value)) {
                $params[$key] = urlencode($value);
            }
        }

        if (empty($params)) {
            return $url;
        }

        $separator = str_contains($url, '?') ? '&' : '?';
        return $url . $separator . http_build_query($params);
    }

    /**
     * Create a simple link with just URL and content
     * 
     * @param string $url Link URL
     * @param string $content Link content
     * @param array $options Additional options
     * @return string Rendered HTML link
     */
    public static function createLink(string $url, string $content = '', array $options = []): string
    {
        $linkData = [
            'url' => $url,
            'text' => $content,
            'target' => $options['target'] ?? '_self',
            'rel' => $options['rel'] ?? [],
            'title' => $options['title'] ?? '',
            'class' => $options['class'] ?? ''
        ];

        return self::renderLink($linkData, $content, $options);
    }

    /**
     * Create an external link with security defaults
     * 
     * @param string $url External URL
     * @param string $content Link content
     * @param array $options Additional options
     * @return string Rendered HTML link
     */
    public static function createExternalLink(string $url, string $content = '', array $options = []): string
    {
        $defaultOptions = [
            'target' => '_blank',
            'rel' => ['noopener', 'noreferrer']
        ];

        $linkData = array_merge([
            'url' => $url,
            'text' => $content,
            'type' => 'external'
        ], $defaultOptions, $options);

        return self::renderLink($linkData, $content, $options);
    }

    /**
     * Create an email link
     * 
     * @param string $email Email address
     * @param string $content Link content (defaults to email address)
     * @param array $options Additional options
     * @return string Rendered HTML link
     */
    public static function createEmailLink(string $email, string $content = '', array $options = []): string
    {
        $linkData = [
            'url' => 'mailto:' . $email,
            'text' => $content ?: $email,
            'type' => 'email'
        ];

        return self::renderLink($linkData, $content, $options);
    }

    /**
     * Create a phone link
     * 
     * @param string $phone Phone number
     * @param string $content Link content (defaults to phone number)
     * @param array $options Additional options
     * @return string Rendered HTML link
     */
    public static function createPhoneLink(string $phone, string $content = '', array $options = []): string
    {
        $linkData = [
            'url' => 'tel:' . $phone,
            'text' => $content ?: $phone,
            'type' => 'phone'
        ];

        return self::renderLink($linkData, $content, $options);
    }
}
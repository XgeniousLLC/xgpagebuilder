<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

use Xgenious\PageBuilder\Core\FieldTypes\FieldInterface;

/**
 * LinkField - Comprehensive link management field
 * 
 * Provides advanced link configuration with URL, target, attributes,
 * SEO options, tracking parameters, and accessibility features.
 * 
 * Features:
 * - Smart link type detection (internal, external, email, phone, file)
 * - Advanced target and behavior options
 * - SEO and accessibility controls (rel, title, aria attributes)
 * - Custom HTML attributes manager
 * - UTM parameter builder
 * - Link validation and testing
 * - Responsive behavior settings
 * 
 * Usage:
 * FieldManager::LINK_GROUP()
 *     ->enableAdvancedOptions(true)
 *     ->setLinkTypes(['internal', 'external', 'email', 'phone'])
 *     ->setDefaultTarget('_self')
 *     ->enableSEOControls(true)
 *     ->enableUTMTracking(true)
 */
class LinkField implements FieldInterface
{
    protected array $enabledLinkTypes = ['internal', 'external', 'email', 'phone', 'file'];
    protected bool $enableAdvancedOptions = true;
    protected bool $enableSEOControls = true;
    protected bool $enableUTMTracking = false;
    protected bool $enableCustomAttributes = true;
    protected bool $enableLinkTesting = true;
    protected bool $enableResponsiveBehavior = false;
    protected string $defaultTarget = '_self';
    protected array $allowedTargets = ['_self', '_blank', '_parent', '_top'];
    protected array $commonRelValues = ['nofollow', 'noopener', 'noreferrer', 'sponsored'];
    protected string $description = '';
    protected string $label = 'Link';
    protected bool $required = false;
    
    /**
     * Set which link types are available
     */
    public function setLinkTypes(array $types): self
    {
        $validTypes = ['internal', 'external', 'email', 'phone', 'file', 'anchor'];
        $this->enabledLinkTypes = array_intersect($types, $validTypes);
        return $this;
    }
    
    /**
     * Enable/disable advanced options section
     */
    public function enableAdvancedOptions(bool $enable = true): self
    {
        $this->enableAdvancedOptions = $enable;
        return $this;
    }
    
    /**
     * Enable/disable SEO controls (rel attributes, title, etc.)
     */
    public function enableSEOControls(bool $enable = true): self
    {
        $this->enableSEOControls = $enable;
        return $this;
    }
    
    /**
     * Enable/disable UTM parameter builder
     */
    public function enableUTMTracking(bool $enable = true): self
    {
        $this->enableUTMTracking = $enable;
        return $this;
    }
    
    /**
     * Enable/disable custom HTML attributes manager
     */
    public function enableCustomAttributes(bool $enable = true): self
    {
        $this->enableCustomAttributes = $enable;
        return $this;
    }
    
    /**
     * Enable/disable link testing functionality
     */
    public function enableLinkTesting(bool $enable = true): self
    {
        $this->enableLinkTesting = $enable;
        return $this;
    }
    
    /**
     * Enable/disable responsive behavior settings
     */
    public function enableResponsiveBehavior(bool $enable = true): self
    {
        $this->enableResponsiveBehavior = $enable;
        return $this;
    }
    
    /**
     * Set default link target
     */
    public function setDefaultTarget(string $target): self
    {
        if (in_array($target, $this->allowedTargets)) {
            $this->defaultTarget = $target;
        }
        return $this;
    }
    
    /**
     * Set allowed target options
     */
    public function setAllowedTargets(array $targets): self
    {
        $this->allowedTargets = $targets;
        return $this;
    }
    
    /**
     * Set field label
     */
    public function setLabel(string $label): self
    {
        $this->label = $label;
        return $this;
    }
    
    /**
     * Set field description
     */
    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }
    
    /**
     * Set field as required
     */
    public function setRequired(bool $required = true): self
    {
        $this->required = $required;
        return $this;
    }
    
    /**
     * Get description text
     */
    public function getDescription(): string
    {
        return $this->description;
    }
    
    /**
     * Render the field configuration
     */
    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'link_group',
            'label' => $this->label,
            'description' => $this->description,
            'required' => $this->required,
            'enabled_link_types' => $this->enabledLinkTypes,
            'enable_advanced_options' => $this->enableAdvancedOptions,
            'enable_seo_controls' => $this->enableSEOControls,
            'enable_utm_tracking' => $this->enableUTMTracking,
            'enable_custom_attributes' => $this->enableCustomAttributes,
            'enable_link_testing' => $this->enableLinkTesting,
            'enable_responsive_behavior' => $this->enableResponsiveBehavior,
            'default_target' => $this->defaultTarget,
            'allowed_targets' => $this->getAllowedTargetOptions(),
            'common_rel_values' => $this->commonRelValues,
            'value' => $value ?: $this->getDefaultValue()
        ];
    }
    
    /**
     * Get allowed target options with labels
     */
    private function getAllowedTargetOptions(): array
    {
        $labels = [
            '_self' => 'Same Window',
            '_blank' => 'New Window/Tab',
            '_parent' => 'Parent Frame',
            '_top' => 'Top Frame'
        ];
        
        $options = [];
        foreach ($this->allowedTargets as $target) {
            if (isset($labels[$target])) {
                $options[$target] = $labels[$target];
            }
        }
        
        return $options;
    }
    
    /**
     * Get default value structure
     */
    public function getDefaultValue(): array
    {
        return [
            'url' => '',
            'text' => '',
            'type' => 'external',
            'target' => $this->defaultTarget,
            'rel' => [],
            'title' => '',
            'id' => '',
            'class' => '',
            'custom_attributes' => [],
            'utm_parameters' => [
                'utm_source' => '',
                'utm_medium' => '',
                'utm_campaign' => '',
                'utm_term' => '',
                'utm_content' => ''
            ],
            'responsive_behavior' => [
                'desktop_target' => $this->defaultTarget,
                'mobile_target' => $this->defaultTarget
            ]
        ];
    }
    
    /**
     * Validate link field value
     */
    public function validate($value, array $rules = []): array
    {
        $errors = [];
        
        if (!is_array($value)) {
            $errors[] = 'Link value must be an array';
            return $errors;
        }
        
        // Required field validation
        if ($this->required && empty($value['url'])) {
            $errors['url'] = 'URL is required';
        }
        
        // URL format validation
        if (!empty($value['url'])) {
            $url = $value['url'];
            $type = $value['type'] ?? 'external';
            
            switch ($type) {
                case 'email':
                    if (!filter_var($url, FILTER_VALIDATE_EMAIL) && !str_starts_with($url, 'mailto:')) {
                        $errors['url'] = 'Invalid email format';
                    }
                    break;
                    
                case 'phone':
                    if (!preg_match('/^(\+?\d[\d\s\-\(\)]*\d|\d)$/', str_replace(['tel:', ' ', '-', '(', ')'], '', $url))) {
                        $errors['url'] = 'Invalid phone number format';
                    }
                    break;
                    
                case 'external':
                case 'internal':
                    if (!filter_var($url, FILTER_VALIDATE_URL) && !str_starts_with($url, '/') && !str_starts_with($url, '#')) {
                        $errors['url'] = 'Invalid URL format';
                    }
                    break;
            }
        }
        
        // Target validation
        if (isset($value['target']) && !in_array($value['target'], $this->allowedTargets)) {
            $errors['target'] = 'Invalid target value';
        }
        
        return $errors;
    }
    
    /**
     * Sanitize link field value
     */
    public function sanitize($value): array
    {
        if (!is_array($value)) {
            return $this->getDefaultValue();
        }
        
        $sanitized = $this->getDefaultValue();
        
        // Sanitize basic fields
        $sanitized['url'] = filter_var($value['url'] ?? '', FILTER_SANITIZE_URL);
        $sanitized['text'] = strip_tags($value['text'] ?? '');
        $sanitized['type'] = in_array($value['type'] ?? '', $this->enabledLinkTypes) ? $value['type'] : 'external';
        $sanitized['target'] = in_array($value['target'] ?? '', $this->allowedTargets) ? $value['target'] : $this->defaultTarget;
        $sanitized['title'] = strip_tags($value['title'] ?? '');
        $sanitized['id'] = preg_replace('/[^a-zA-Z0-9_-]/', '', $value['id'] ?? '');
        $sanitized['class'] = strip_tags($value['class'] ?? '');
        
        // Sanitize rel attributes
        if (isset($value['rel']) && is_array($value['rel'])) {
            $sanitized['rel'] = array_intersect($value['rel'], $this->commonRelValues);
        }
        
        // Sanitize custom attributes
        if (isset($value['custom_attributes']) && is_array($value['custom_attributes'])) {
            foreach ($value['custom_attributes'] as $attr) {
                if (isset($attr['name']) && isset($attr['value'])) {
                    $sanitized['custom_attributes'][] = [
                        'name' => preg_replace('/[^a-zA-Z0-9_-]/', '', $attr['name']),
                        'value' => htmlspecialchars($attr['value'], ENT_QUOTES, 'UTF-8')
                    ];
                }
            }
        }
        
        // Sanitize UTM parameters
        if (isset($value['utm_parameters']) && is_array($value['utm_parameters'])) {
            foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $param) {
                if (isset($value['utm_parameters'][$param])) {
                    $sanitized['utm_parameters'][$param] = strip_tags($value['utm_parameters'][$param]);
                }
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Get the field type identifier
     */
    public function getType(): string
    {
        return 'link_group';
    }
    
    /**
     * Get field schema for API responses
     */
    public function getSchema(): array
    {
        return [
            'type' => 'link_group',
            'enabled_features' => [
                'advanced_options' => $this->enableAdvancedOptions,
                'seo_controls' => $this->enableSEOControls,
                'utm_tracking' => $this->enableUTMTracking,
                'custom_attributes' => $this->enableCustomAttributes,
                'link_testing' => $this->enableLinkTesting,
                'responsive_behavior' => $this->enableResponsiveBehavior
            ],
            'link_types' => $this->enabledLinkTypes,
            'default_target' => $this->defaultTarget
        ];
    }
    
    /**
     * Convert field to array format for ControlManager compatibility
     */
    public function toArray(): array
    {
        return $this->render([], null);
    }
    
    /**
     * Generate HTML link from field value
     */
    public function generateLinkHTML(array $value): string
    {
        if (empty($value['url'])) {
            return '';
        }
        
        $url = $this->formatURL($value);
        $attributes = $this->buildLinkAttributes($value);
        $text = $value['text'] ?: $value['url'];
        
        return "<a href=\"{$url}\"{$attributes}>{$text}</a>";
    }
    
    /**
     * Format URL based on link type
     */
    private function formatURL(array $value): string
    {
        $url = $value['url'];
        $type = $value['type'] ?? 'external';
        
        switch ($type) {
            case 'email':
                if (!str_starts_with($url, 'mailto:')) {
                    $url = 'mailto:' . $url;
                }
                break;
                
            case 'phone':
                if (!str_starts_with($url, 'tel:')) {
                    $url = 'tel:' . $url;
                }
                break;
        }
        
        // Add UTM parameters if enabled
        if (!empty($value['utm_parameters'])) {
            $url = $this->addUTMParameters($url, $value['utm_parameters']);
        }
        
        return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Build link attributes string
     */
    private function buildLinkAttributes(array $value): string
    {
        $attributes = [];
        
        // Target attribute
        if (!empty($value['target']) && $value['target'] !== '_self') {
            $attributes['target'] = $value['target'];
        }
        
        // Rel attribute
        if (!empty($value['rel'])) {
            $attributes['rel'] = implode(' ', $value['rel']);
        }
        
        // Title attribute
        if (!empty($value['title'])) {
            $attributes['title'] = htmlspecialchars($value['title'], ENT_QUOTES, 'UTF-8');
        }
        
        // ID attribute
        if (!empty($value['id'])) {
            $attributes['id'] = $value['id'];
        }
        
        // Class attribute
        if (!empty($value['class'])) {
            $attributes['class'] = $value['class'];
        }
        
        // Custom attributes
        if (!empty($value['custom_attributes'])) {
            foreach ($value['custom_attributes'] as $attr) {
                if (!empty($attr['name']) && isset($attr['value'])) {
                    $attributes[$attr['name']] = $attr['value'];
                }
            }
        }
        
        // Build attribute string
        $attrString = '';
        foreach ($attributes as $name => $val) {
            $attrString .= ' ' . $name . '="' . htmlspecialchars($val, ENT_QUOTES, 'UTF-8') . '"';
        }
        
        return $attrString;
    }
    
    /**
     * Add UTM parameters to URL
     */
    private function addUTMParameters(string $url, array $utmParams): string
    {
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
}
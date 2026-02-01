<?php

namespace Xgenious\PageBuilder\Core\Fields;

use App\Utils\URLHandler;

/**
 * Enhanced URL Field - Comprehensive URL input with advanced features
 * 
 * This field provides a complete URL input solution with:
 * - URL validation and sanitization
 * - Link behavior configuration (target, rel attributes)
 * - Social media detection
 * - Accessibility enhancements
 * - Download link support
 * - Custom tracking options
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class UrlField extends BaseField
{
    protected string $type = 'enhanced_url';

    /** @var bool Enable URL validation */
    protected bool $validateUrl = true;

    /** @var array Allowed URL schemes */
    protected array $allowedSchemes = ['http', 'https', 'mailto', 'tel'];

    /** @var bool Allow relative URLs */
    protected bool $allowRelative = true;

    /** @var bool Allow anchor links */
    protected bool $allowAnchors = true;

    /** @var bool Show link target options */
    protected bool $showTargetOptions = true;

    /** @var bool Show rel attribute options */
    protected bool $showRelOptions = true;

    /** @var bool Show download options */
    protected bool $showDownloadOptions = false;

    /** @var bool Enable link preview */
    protected bool $enablePreview = true;

    /** @var bool Auto-detect link type */
    protected bool $autoDetectType = true;

    /** @var bool Enable accessibility enhancements */
    protected bool $enableAccessibility = true;

    /** @var bool Enable click tracking */
    protected bool $enableTracking = false;

    /** @var string Default target value */
    protected string $defaultTarget = '_self';

    /** @var array Default rel attributes */
    protected array $defaultRel = [];

    /** @var string URL context for validation */
    protected string $context = 'general';

    /**
     * Set URL validation
     */
    public function setValidateUrl(bool $validate = true): static
    {
        $this->validateUrl = $validate;
        return $this;
    }

    /**
     * Set allowed URL schemes
     */
    public function setAllowedSchemes(array $schemes): static
    {
        $this->allowedSchemes = $schemes;
        return $this;
    }

    /**
     * Set whether to allow relative URLs
     */
    public function setAllowRelative(bool $allow = true): static
    {
        $this->allowRelative = $allow;
        return $this;
    }

    /**
     * Set whether to allow anchor links
     */
    public function setAllowAnchors(bool $allow = true): static
    {
        $this->allowAnchors = $allow;
        return $this;
    }

    /**
     * Show/hide target options
     */
    public function setShowTargetOptions(bool $show = true): static
    {
        $this->showTargetOptions = $show;
        return $this;
    }

    /**
     * Show/hide rel attribute options
     */
    public function setShowRelOptions(bool $show = true): static
    {
        $this->showRelOptions = $show;
        return $this;
    }

    /**
     * Show/hide download options
     */
    public function setShowDownloadOptions(bool $show = true): static
    {
        $this->showDownloadOptions = $show;
        return $this;
    }

    /**
     * Enable/disable link preview
     */
    public function setEnablePreview(bool $enable = true): static
    {
        $this->enablePreview = $enable;
        return $this;
    }

    /**
     * Enable/disable auto type detection
     */
    public function setAutoDetectType(bool $enable = true): static
    {
        $this->autoDetectType = $enable;
        return $this;
    }

    /**
     * Enable/disable accessibility features
     */
    public function setEnableAccessibility(bool $enable = true): static
    {
        $this->enableAccessibility = $enable;
        return $this;
    }

    /**
     * Enable/disable click tracking
     */
    public function setEnableTracking(bool $enable = true): static
    {
        $this->enableTracking = $enable;
        return $this;
    }

    /**
     * Set default target value
     */
    public function setDefaultTarget(string $target): static
    {
        $this->defaultTarget = $target;
        return $this;
    }

    /**
     * Set default rel attributes
     */
    public function setDefaultRel(array $rel): static
    {
        $this->defaultRel = $rel;
        return $this;
    }

    /**
     * Set URL context for validation
     */
    public function setContext(string $context): static
    {
        $this->context = $context;
        return $this;
    }

    /**
     * Preset for web links
     */
    public function asWebLink(): static
    {
        return $this->setAllowedSchemes(['http', 'https'])
            ->setShowTargetOptions(true)
            ->setShowRelOptions(true)
            ->setContext('web');
    }

    /**
     * Preset for email links
     */
    public function asEmailLink(): static
    {
        return $this->setAllowedSchemes(['mailto'])
            ->setShowTargetOptions(false)
            ->setShowRelOptions(false)
            ->setAllowRelative(false)
            ->setContext('email');
    }

    /**
     * Preset for phone links
     */
    public function asPhoneLink(): static
    {
        return $this->setAllowedSchemes(['tel', 'sms'])
            ->setShowTargetOptions(false)
            ->setShowRelOptions(false)
            ->setAllowRelative(false)
            ->setContext('phone');
    }

    /**
     * Preset for download links
     */
    public function asDownloadLink(): static
    {
        return $this->setAllowedSchemes(['http', 'https'])
            ->setShowDownloadOptions(true)
            ->setDefaultTarget('_blank')
            ->setContext('download');
    }

    /**
     * Preset for internal navigation
     */
    public function asInternalLink(): static
    {
        return $this->setAllowRelative(true)
            ->setAllowAnchors(true)
            ->setShowTargetOptions(false)
            ->setDefaultTarget('_self')
            ->setContext('internal');
    }

    /**
     * Validate URL using URLHandler utility
     */
    public function validateValue($value): array
    {
        if (!$this->validateUrl || empty($value)) {
            return ['valid' => true, 'errors' => []];
        }

        $options = [
            'allowed_schemes' => $this->allowedSchemes,
            'allow_relative' => $this->allowRelative,
            'allow_anchors' => $this->allowAnchors,
            'context' => $this->context
        ];

        $result = URLHandler::validateURL($value, $options);

        return [
            'valid' => $result['valid'],
            'errors' => $result['errors'],
            'warnings' => $result['warnings'] ?? [],
            'metadata' => $result['metadata'] ?? []
        ];
    }

    /**
     * Generate link attributes for the URL
     */
    public function generateLinkAttributes(string $url, array $settings = []): array
    {
        $validated = URLHandler::validateURL($url, [
            'allowed_schemes' => $this->allowedSchemes,
            'allow_relative' => $this->allowRelative,
            'allow_anchors' => $this->allowAnchors,
            'context' => $this->context
        ]);

        if (!$validated['valid']) {
            return ['href' => '#'];
        }

        $options = [
            'target' => $settings['target'] ?? $this->defaultTarget,
            'rel' => array_merge($this->defaultRel, $settings['rel'] ?? []),
            'track_clicks' => $this->enableTracking,
            'add_nofollow' => $settings['add_nofollow'] ?? false,
            'add_noopener' => $settings['add_noopener'] ?? true,
            'custom_attributes' => $settings['custom_attributes'] ?? []
        ];

        return URLHandler::generateLinkAttributes($validated, $options);
    }

    /**
     * Get sub-fields for URL configuration
     */
    public function getSubFields(): array
    {
        $fields = [];

        // Main URL field
        $fields['url'] = [
            'type' => 'url',
            'label' => $this->label ?: 'URL',
            'placeholder' => $this->placeholder ?: 'https://example.com',
            'required' => $this->required,
            'description' => $this->description,
            'validation' => array_merge($this->validation, [
                'url' => $this->validateUrl
            ])
        ];

        // Target options
        if ($this->showTargetOptions) {
            $fields['target'] = [
                'type' => 'select',
                'label' => 'Link Target',
                'default' => $this->defaultTarget,
                'options' => [
                    '_self' => 'Same Window',
                    '_blank' => 'New Window/Tab',
                    '_parent' => 'Parent Frame',
                    '_top' => 'Top Frame'
                ],
                'description' => 'Where to open the link'
            ];
        }

        // Rel attribute options
        if ($this->showRelOptions) {
            $fields['rel'] = [
                'type' => 'multiselect',
                'label' => 'Link Relationship',
                'default' => $this->defaultRel,
                'options' => [
                    'nofollow' => 'NoFollow (SEO)',
                    'sponsored' => 'Sponsored Content',
                    'ugc' => 'User Generated Content',
                    'noopener' => 'No Opener (Security)',
                    'noreferrer' => 'No Referrer (Privacy)',
                    'external' => 'External Link'
                ],
                'description' => 'SEO and security attributes'
            ];
        }

        // Download options
        if ($this->showDownloadOptions) {
            $fields['download'] = [
                'type' => 'toggle',
                'label' => 'Download Link',
                'default' => false,
                'description' => 'Force download instead of navigation'
            ];

            $fields['download_filename'] = [
                'type' => 'text',
                'label' => 'Download Filename',
                'placeholder' => 'filename.pdf',
                'condition' => ['download' => true],
                'description' => 'Suggested filename for download'
            ];
        }

        // Accessibility options
        if ($this->enableAccessibility) {
            $fields['aria_label'] = [
                'type' => 'text',
                'label' => 'ARIA Label',
                'placeholder' => 'Descriptive label for screen readers',
                'description' => 'Additional description for accessibility'
            ];

            $fields['title'] = [
                'type' => 'text',
                'label' => 'Link Title',
                'placeholder' => 'Tooltip text',
                'description' => 'Tooltip shown on hover'
            ];
        }

        // Tracking options
        if ($this->enableTracking) {
            $fields['track_clicks'] = [
                'type' => 'toggle',
                'label' => 'Track Clicks',
                'default' => false,
                'description' => 'Enable click tracking for analytics'
            ];

            $fields['tracking_category'] = [
                'type' => 'text',
                'label' => 'Tracking Category',
                'placeholder' => 'outbound-links',
                'condition' => ['track_clicks' => true],
                'description' => 'Category for analytics tracking'
            ];
        }

        // Custom Attributes (Repeater field for multiple attributes)
        $fields['custom_attributes'] = [
            'type' => 'repeater',
            'label' => 'Custom Attributes',
            'description' => 'Add custom HTML attributes to the link',
            'default' => [],
            'fields' => [
                'attribute_name' => [
                    'type' => 'text',
                    'label' => 'Attribute Name',
                    'placeholder' => 'data-custom',
                    'required' => true,
                    'description' => 'HTML attribute name (e.g., data-id, role, etc.)'
                ],
                'attribute_value' => [
                    'type' => 'text',
                    'label' => 'Attribute Value',
                    'placeholder' => 'custom-value',
                    'required' => true,
                    'description' => 'Value for the attribute'
                ]
            ],
            'add_button_text' => 'Add Custom Attribute',
            'item_label' => '{{attribute_name}}="{{attribute_value}}"'
        ];

        return $fields;
    }

    protected function getTypeSpecificConfig(): array
    {
        return [
            'validate_url' => $this->validateUrl,
            'allowed_schemes' => $this->allowedSchemes,
            'allow_relative' => $this->allowRelative,
            'allow_anchors' => $this->allowAnchors,
            'show_target_options' => $this->showTargetOptions,
            'show_rel_options' => $this->showRelOptions,
            'show_download_options' => $this->showDownloadOptions,
            'enable_preview' => $this->enablePreview,
            'auto_detect_type' => $this->autoDetectType,
            'enable_accessibility' => $this->enableAccessibility,
            'enable_tracking' => $this->enableTracking,
            'default_target' => $this->defaultTarget,
            'default_rel' => $this->defaultRel,
            'context' => $this->context,
            'sub_fields' => $this->getSubFields()
        ];
    }
}

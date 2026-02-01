<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * TypographyField - Unified typography control field
 * 
 * Provides a comprehensive typography control that handles:
 * - Font family selection with web-safe fonts and custom fonts
 * - Font size with responsive settings
 * - Font weight options
 * - Line height control
 * - Letter spacing adjustment
 * - Word spacing control
 * - Text transform options
 * - Font style (normal, italic, oblique)
 * - Text decoration options
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class TypographyField extends BaseField
{
    /** @var string */
    protected string $type = 'typography_group';

    /** @var array */
    protected array $defaultTypography = [
        'font_family' => 'inherit',
        'font_size' => [
            'value' => 16,
            'unit' => 'px'
        ],
        'font_weight' => '400',
        'font_style' => 'normal',
        'text_transform' => 'none',
        'text_decoration' => 'none',
        'line_height' => [
            'value' => 1.4,
            'unit' => 'em'
        ],
        'letter_spacing' => [
            'value' => 0,
            'unit' => 'px'
        ],
        'word_spacing' => [
            'value' => 0,
            'unit' => 'px'
        ]
    ];

    /** @var array */
    protected array $fontFamilies = [
        'inherit' => 'Inherit',
        'Arial, sans-serif' => 'Arial',
        'Helvetica, sans-serif' => 'Helvetica',
        '"Helvetica Neue", Helvetica, Arial, sans-serif' => 'Helvetica Neue',
        'Georgia, serif' => 'Georgia',
        '"Times New Roman", serif' => 'Times New Roman',
        '"Courier New", monospace' => 'Courier New',
        'Verdana, sans-serif' => 'Verdana',
        'Tahoma, sans-serif' => 'Tahoma',
        '"Trebuchet MS", sans-serif' => 'Trebuchet MS',
        'Impact, sans-serif' => 'Impact',
        '"Palatino Linotype", "Book Antiqua", Palatino, serif' => 'Palatino',
        '"Lucida Sans Unicode", "Lucida Grande", sans-serif' => 'Lucida Sans',
        '"Arial Black", Gadget, sans-serif' => 'Arial Black',
        '"Comic Sans MS", cursive' => 'Comic Sans MS'
    ];

    /** @var array */
    protected array $fontWeights = [
        '100' => '100 - Thin',
        '200' => '200 - Extra Light',
        '300' => '300 - Light',
        '400' => '400 - Normal',
        '500' => '500 - Medium',
        '600' => '600 - Semi Bold',
        '700' => '700 - Bold',
        '800' => '800 - Extra Bold',
        '900' => '900 - Black'
    ];

    /** @var array */
    protected array $textTransforms = [
        'none' => 'None',
        'uppercase' => 'Uppercase',
        'lowercase' => 'Lowercase',
        'capitalize' => 'Capitalize'
    ];

    /** @var array */
    protected array $fontStyles = [
        'normal' => 'Normal',
        'italic' => 'Italic',
        'oblique' => 'Oblique'
    ];

    /** @var array */
    protected array $textDecorations = [
        'none' => 'None',
        'underline' => 'Underline',
        'overline' => 'Overline',
        'line-through' => 'Line Through'
    ];

    /** @var array */
    protected array $enabledControls = [
        'font_family' => true,
        'font_size' => true,
        'font_weight' => true,
        'font_style' => true,
        'text_transform' => true,
        'text_decoration' => true,
        'line_height' => true,
        'letter_spacing' => true,
        'word_spacing' => true
    ];

    /** @var bool */
    protected bool $enableResponsive = true;

    /** @var array */
    protected array $selectors = [];

    /**
     * Set the default typography configuration
     *
     * @param array $typography Default typography settings
     * @return static
     */
    public function setDefaultTypography(array $typography): static
    {
        $this->defaultTypography = array_merge($this->defaultTypography, $typography);
        $this->default = $this->defaultTypography;
        return $this;
    }

    /**
     * Set custom font families
     *
     * @param array $fontFamilies Font family options
     * @return static
     */
    public function setFontFamilies(array $fontFamilies): static
    {
        $this->fontFamilies = $fontFamilies;
        return $this;
    }

    /**
     * Enable or disable specific typography controls
     *
     * @param array $controls Controls to enable/disable
     * @return static
     */
    public function setEnabledControls(array $controls): static
    {
        $this->enabledControls = array_merge($this->enabledControls, $controls);
        return $this;
    }

    /**
     * Enable or disable responsive settings
     *
     * @param bool $enable Enable responsive settings
     * @return static
     */
    public function setEnableResponsive(bool $enable = true): static
    {
        $this->enableResponsive = $enable;
        return $this;
    }

    /**
     * Disable specific typography controls
     *
     * @param array $controls Controls to disable
     * @return static
     */
    public function disableControls(array $controls): static
    {
        foreach ($controls as $control) {
            $this->enabledControls[$control] = false;
        }
        return $this;
    }

    /**
     * Enable only specified controls
     *
     * @param array $controls Controls to enable (all others will be disabled)
     * @return static
     */
    public function enableOnlyControls(array $controls): static
    {
        // Disable all first
        foreach ($this->enabledControls as $key => $value) {
            $this->enabledControls[$key] = false;
        }

        // Enable specified ones
        foreach ($controls as $control) {
            $this->enabledControls[$control] = true;
        }

        return $this;
    }

    /**
     * Add custom font family
     *
     * @param string $value Font family CSS value
     * @param string $label Display label
     * @return static
     */
    public function addFontFamily(string $value, string $label): static
    {
        $this->fontFamilies[$value] = $label;
        return $this;
    }

    /**
     * Generate CSS from typography value
     *
     * @param array $value Typography settings
     * @return string CSS string
     */
    public static function generateCSS(array $value): string
    {
        if (empty($value) || !is_array($value)) {
            return '';
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

        return implode('; ', $styles);
    }

    /**
     * Set CSS selector for automatic styling
     *
     * @param array $selectors CSS selectors
     * @return static
     */
    public function setSelectors(array $selectors): static
    {
        $this->selectors = $selectors;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'default_typography' => $this->defaultTypography,
            'font_families' => $this->fontFamilies,
            'font_weights' => $this->fontWeights,
            'text_transforms' => $this->textTransforms,
            'font_styles' => $this->fontStyles,
            'text_decorations' => $this->textDecorations,
            'enabled_controls' => $this->enabledControls,
            'enable_responsive' => $this->enableResponsive,
        ];
    }
}

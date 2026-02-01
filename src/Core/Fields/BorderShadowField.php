<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * BorderShadowField - Enhanced border and shadow control field
 * 
 * Provides a comprehensive border and shadow builder that handles:
 * - Visual border controls (width, style, color, radius)
 * - Interactive shadow builder with drag controls
 * - Per-side border controls
 * - Multiple shadow support
 * - Preset library for common styles
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class BorderShadowField extends BaseField
{
    /** @var string */
    protected string $type = 'border_shadow_group';

    /** @var array */
    protected array $defaultBorderShadow = [
        'border' => [
            'style' => 'solid',
            'width' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0],
            'color' => '#000000',
            'radius' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0],
            'linked' => true
        ],
        'shadow' => [
            'type' => 'none', // none, drop, inner, multiple
            'x_offset' => 0,
            'y_offset' => 2,
            'blur_radius' => 4,
            'spread_radius' => 0,
            'color' => 'rgba(0,0,0,0.1)',
            'inset' => false,
            'shadows' => [] // for multiple shadows
        ]
    ];

    /** @var array */
    protected array $borderStyles = [
        'solid' => 'Solid',
        'dashed' => 'Dashed',
        'dotted' => 'Dotted',
        'double' => 'Double',
        'groove' => 'Groove',
        'ridge' => 'Ridge',
        'inset' => 'Inset',
        'outset' => 'Outset'
    ];

    /** @var array */
    protected array $shadowPresets = [
        'none' => ['name' => 'None', 'shadow' => 'none'],
        'subtle' => ['name' => 'Subtle', 'shadow' => '0 1px 3px rgba(0,0,0,0.1)'],
        'medium' => ['name' => 'Medium', 'shadow' => '0 4px 6px rgba(0,0,0,0.1)'],
        'strong' => ['name' => 'Strong', 'shadow' => '0 10px 15px rgba(0,0,0,0.1)'],
        'card' => ['name' => 'Card', 'shadow' => '0 2px 4px rgba(0,0,0,0.1)'],
        'floating' => ['name' => 'Floating', 'shadow' => '0 8px 25px rgba(0,0,0,0.15)']
    ];

    /**
     * Set default border and shadow configuration
     *
     * @param array $borderShadow Default border shadow settings
     * @return static
     */
    public function setDefaultBorderShadow(array $borderShadow): static
    {
        $this->defaultBorderShadow = array_merge($this->defaultBorderShadow, $borderShadow);
        $this->default = $this->defaultBorderShadow;
        return $this;
    }

    /**
     * Add custom shadow preset
     *
     * @param string $key Preset key
     * @param string $name Preset display name
     * @param string $shadow CSS shadow value
     * @return static
     */
    public function addShadowPreset(string $key, string $name, string $shadow): static
    {
        $this->shadowPresets[$key] = [
            'name' => $name,
            'shadow' => $shadow
        ];
        return $this;
    }

    /**
     * Set available border styles
     *
     * @param array $styles Border styles array
     * @return static
     */
    public function setBorderStyles(array $styles): static
    {
        $this->borderStyles = $styles;
        return $this;
    }

    /**
     * Enable/disable per-side border controls
     *
     * @param bool $enable Enable per-side controls
     * @return static
     */
    public function setPerSideControls(bool $enable = true): static
    {
        $this->config['per_side_controls'] = $enable;
        return $this;
    }

    /**
     * Enable/disable multiple shadow support
     *
     * @param bool $enable Enable multiple shadows
     * @return static
     */
    public function setMultipleShadows(bool $enable = true): static
    {
        $this->config['multiple_shadows'] = $enable;
        return $this;
    }

    /**
     * Set maximum number of shadows allowed
     *
     * @param int $max Maximum shadows
     * @return static
     */
    public function setMaxShadows(int $max = 5): static
    {
        $this->config['max_shadows'] = $max;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'default_border_shadow' => $this->defaultBorderShadow,
            'border_styles' => $this->borderStyles,
            'shadow_presets' => $this->shadowPresets,
            'per_side_controls' => $this->config['per_side_controls'] ?? true,
            'multiple_shadows' => $this->config['multiple_shadows'] ?? false,
            'max_shadows' => $this->config['max_shadows'] ?? 5,
        ];
    }
}

<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * BackgroundField - Unified background picker field
 * 
 * Provides a comprehensive background picker that handles:
 * - Solid colors
 * - Gradients (linear/radial) with draggable color stops
 * - Background images with positioning options
 * - Hover states
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class BackgroundField extends BaseField
{
    /** @var string */
    protected string $type = 'background_group';

    /** @var array<string> */
    protected array $allowedTypes = ['none', 'color', 'gradient', 'image'];

    /** @var string */
    protected string $defaultType = 'none';

    /** @var bool */
    protected bool $enableHover = true;

    /** @var bool */
    protected bool $enableImage = true;

    /** @var array */
    protected array $defaultBackground = [
        'type' => 'none',
        'color' => '#000000',
        'gradient' => [
            'type' => 'linear',
            'angle' => 135,
            'colorStops' => [
                ['color' => '#667EEA', 'position' => 0],
                ['color' => '#764BA2', 'position' => 100]
            ]
        ],
        'image' => [
            'url' => '',
            'size' => 'cover',
            'position' => 'center center',
            'repeat' => 'no-repeat',
            'attachment' => 'scroll'
        ],
        'hover' => [
            'color' => ''
        ]
    ];

    /**
     * Set allowed background types
     *
     * @param array<string> $types Allowed types (none, color, gradient, image)
     * @return static
     */
    public function setAllowedTypes(array $types): static
    {
        $this->allowedTypes = $types;
        return $this;
    }

    /**
     * Set default background type
     *
     * @param string $type Default type
     * @return static
     */
    public function setDefaultType(string $type): static
    {
        $this->defaultType = $type;
        $this->defaultBackground['type'] = $type;
        $this->default = $this->defaultBackground;
        return $this;
    }

    /**
     * Enable/disable hover effects
     *
     * @param bool $enable Enable hover effects
     * @return static
     */
    public function setEnableHover(bool $enable = true): static
    {
        $this->enableHover = $enable;
        return $this;
    }

    /**
     * Enable/disable image backgrounds
     *
     * @param bool $enable Enable image backgrounds
     * @return static
     */
    public function setEnableImage(bool $enable = true): static
    {
        $this->enableImage = $enable;
        if (!$enable) {
            $this->allowedTypes = array_diff($this->allowedTypes, ['image']);
        }
        return $this;
    }

    /**
     * Set default background configuration
     *
     * @param array $background Default background settings
     * @return static
     */
    public function setDefaultBackground(array $background): static
    {
        $this->defaultBackground = array_merge($this->defaultBackground, $background);
        $this->default = $this->defaultBackground;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'allowed_types' => $this->allowedTypes,
            'default_type' => $this->defaultType,
            'enable_hover' => $this->enableHover,
            'enable_image' => $this->enableImage,
            'default_background' => $this->defaultBackground,
        ];
    }
}

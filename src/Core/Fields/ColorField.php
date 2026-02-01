<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * ColorField - Color picker field
 * 
 * Provides a color picker with support for hex, rgba, and predefined color swatches.
 * Includes transparency support and color palette management.
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class ColorField extends BaseField
{
    /** @var string */
    protected string $type = 'color';

    /** @var bool */
    protected bool $allowTransparency = true;

    /** @var array<string> */
    protected array $swatches = [];

    /** @var bool */
    protected bool $showInput = true;

    /** @var string */
    protected string $format = 'hex';

    /**
     * Set whether to allow transparency (alpha channel)
     *
     * @param bool $allowTransparency Allow transparency
     * @return static
     */
    public function setAllowTransparency(bool $allowTransparency = true): static
    {
        $this->allowTransparency = $allowTransparency;
        return $this;
    }

    /**
     * Set predefined color swatches
     *
     * @param array<string> $swatches Array of color values
     * @return static
     */
    public function setSwatches(array $swatches): static
    {
        $this->swatches = $swatches;
        return $this;
    }

    /**
     * Set whether to show text input alongside picker
     *
     * @param bool $showInput Show input field
     * @return static
     */
    public function setShowInput(bool $showInput = true): static
    {
        $this->showInput = $showInput;
        return $this;
    }

    /**
     * Set color format (hex, rgb, rgba, hsl, hsla)
     *
     * @param string $format Color format
     * @return static
     */
    public function setFormat(string $format): static
    {
        $this->format = $format;
        return $this;
    }

    /**
     * Add common color swatches
     *
     * @return static
     */
    public function addCommonSwatches(): static
    {
        $this->swatches = array_merge($this->swatches, [
            '#000000',
            '#FFFFFF',
            '#FF0000',
            '#00FF00',
            '#0000FF',
            '#FFFF00',
            '#FF00FF',
            '#00FFFF',
            '#808080',
            '#C0C0C0'
        ]);
        return $this;
    }

    /**
     * Add brand color swatches
     *
     * @param array<string> $brandColors Brand color palette
     * @return static
     */
    public function addBrandSwatches(array $brandColors): static
    {
        $this->swatches = array_merge($this->swatches, $brandColors);
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'allow_transparency' => $this->allowTransparency,
            'swatches' => $this->swatches,
            'show_input' => $this->showInput,
            'format' => $this->format,
        ];
    }
}

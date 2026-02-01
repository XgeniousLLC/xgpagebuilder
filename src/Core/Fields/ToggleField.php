<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * ToggleField - Boolean toggle/switch field
 * 
 * Provides a toggle switch for boolean values with customizable labels
 * and visual styles.
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class ToggleField extends BaseField
{
    /** @var string */
    protected string $type = 'toggle';

    /** @var string */
    protected string $onText = '';

    /** @var string */
    protected string $offText = '';

    /** @var string */
    protected string $size = 'medium';

    /** @var string */
    protected string $color = 'primary';

    /**
     * Set text shown when toggle is on
     *
     * @param string $onText On state text
     * @return static
     */
    public function setOnText(string $onText): static
    {
        $this->onText = $onText;
        return $this;
    }

    /**
     * Set text shown when toggle is off
     *
     * @param string $offText Off state text
     * @return static
     */
    public function setOffText(string $offText): static
    {
        $this->offText = $offText;
        return $this;
    }

    /**
     * Set toggle size
     *
     * @param string $size Size (small, medium, large)
     * @return static
     */
    public function setSize(string $size): static
    {
        $this->size = $size;
        return $this;
    }

    /**
     * Set toggle color theme
     *
     * @param string $color Color theme
     * @return static
     */
    public function setColor(string $color): static
    {
        $this->color = $color;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'on_text' => $this->onText,
            'off_text' => $this->offText,
            'size' => $this->size,
            'color' => $this->color,
        ];
    }
}

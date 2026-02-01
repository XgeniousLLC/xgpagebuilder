<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * DimensionField - Multi-directional dimension field
 * 
 * Provides controls for top, right, bottom, left values with linking support,
 * multiple units, and responsive breakpoints. Perfect for padding, margin,
 * border radius, and other CSS box model properties.
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class DimensionField extends BaseField
{
    /** @var string */
    protected string $type = 'dimension';

    /** @var array<string> */
    protected array $sides = ['top', 'right', 'bottom', 'left'];

    /** @var array<string> */
    protected array $units = ['px', 'em', 'rem', '%', 'vw', 'vh'];

    /** @var bool */
    protected bool $linked = false;

    /** @var bool */
    protected bool $allowNegative = false;

    /** @var float|null */
    protected ?float $min = null;

    /** @var float|null */
    protected ?float $max = null;

    /** @var float */
    protected float $step = 1;

    /** @var bool */
    protected bool $showLabels = true;

    /**
     * Constructor - Set responsive as default for dimension fields
     */
    public function __construct()
    {
        $this->responsive = true;
    }

    /**
     * Set which sides to show
     *
     * @param array<string> $sides Array of sides (top, right, bottom, left)
     * @return static
     */
    public function setSides(array $sides): static
    {
        $this->sides = $sides;
        return $this;
    }

    /**
     * Set available units
     *
     * @param array<string> $units Array of unit strings
     * @return static
     */
    public function setUnits(array $units): static
    {
        $this->units = $units;
        return $this;
    }

    /**
     * Set whether values are linked by default
     *
     * @param bool $linked Link all sides
     * @return static
     */
    public function setLinked(bool $linked = true): static
    {
        $this->linked = $linked;
        return $this;
    }

    /**
     * Set whether to allow negative values
     *
     * @param bool $allowNegative Allow negative values
     * @return static
     */
    public function setAllowNegative(bool $allowNegative = true): static
    {
        $this->allowNegative = $allowNegative;
        return $this;
    }

    /**
     * Set minimum value for all sides
     *
     * @param float $min Minimum value
     * @return static
     */
    public function setMin(float $min): static
    {
        $this->min = $min;
        return $this;
    }

    /**
     * Set maximum value for all sides
     *
     * @param float $max Maximum value
     * @return static
     */
    public function setMax(float $max): static
    {
        $this->max = $max;
        return $this;
    }

    /**
     * Set step increment
     *
     * @param float $step Step value
     * @return static
     */
    public function setStep(float $step): static
    {
        $this->step = $step;
        return $this;
    }

    /**
     * Set value range for all sides
     *
     * @param float $min Minimum value
     * @param float $max Maximum value
     * @return static
     */
    public function setRange(float $min, float $max): static
    {
        $this->min = $min;
        $this->max = $max;
        return $this;
    }

    /**
     * Set whether to show side labels
     *
     * @param bool $showLabels Show labels
     * @return static
     */
    public function setShowLabels(bool $showLabels = true): static
    {
        $this->showLabels = $showLabels;
        return $this;
    }

    /**
     * Configure for padding (common preset)
     *
     * @return static
     */
    public function asPadding(): static
    {
        return $this->setUnits(['px', 'em', 'rem', '%'])
            ->setMin(0)
            ->setMax(200)
            ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0]);
    }

    /**
     * Configure for margin (common preset)
     *
     * @return static
     */
    public function asMargin(): static
    {
        return $this->setUnits(['px', 'em', 'rem', '%'])
            ->setAllowNegative(true)
            ->setMin(-200)
            ->setMax(200)
            ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0]);
    }

    /**
     * Configure for border radius (common preset)
     *
     * @return static
     */
    public function asBorderRadius(): static
    {
        return $this->setUnits(['px', 'em', 'rem', '%'])
            ->setMin(0)
            ->setMax(100)
            ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0]);
    }

    /**
     * Configure for single value (like border width)
     *
     * @return static
     */
    public function asSingleValue(): static
    {
        return $this->setSides(['all'])
            ->setLinked(true);
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        $config = [
            'sides' => $this->sides,
            'units' => $this->units,
            'linked' => $this->linked,
            'allow_negative' => $this->allowNegative,
            'step' => $this->step,
            'show_labels' => $this->showLabels,
        ];

        if ($this->min !== null) {
            $config['min'] = $this->min;
        }

        if ($this->max !== null) {
            $config['max'] = $this->max;
        }

        return $config;
    }
}

<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * NumberField - Numeric input field
 * 
 * Provides a numeric input with min/max validation, step control, and unit support.
 * Perfect for dimensions, font sizes, and other numeric style properties.
 * 
 * @package Plugins\Pagebuilder\Core\Fields
 */
class NumberField extends BaseField
{
    /** @var string */
    protected string $type = 'number';
    
    /** @var float|null */
    protected ?float $min = null;
    
    /** @var float|null */
    protected ?float $max = null;
    
    /** @var float */
    protected float $step = 1;
    
    /** @var bool */
    protected bool $allowDecimals = true;

    /**
     * Set minimum value
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
     * Set maximum value
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
     * Set whether to allow decimal values
     *
     * @param bool $allowDecimals Allow decimals
     * @return static
     */
    public function setAllowDecimals(bool $allowDecimals = true): static
    {
        $this->allowDecimals = $allowDecimals;
        return $this;
    }

    /**
     * Set value range (min and max together)
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
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        $config = [
            'step' => $this->step,
            'allow_decimals' => $this->allowDecimals,
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
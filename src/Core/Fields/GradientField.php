<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * GradientField - Enhanced gradient picker field
 * 
 * Provides an advanced gradient picker with visual preview, color stops,
 * type selection (linear/radial), angle control, and interactive UI.
 * 
 * @package Plugins\Pagebuilder\Core\Fields
 */
class GradientField extends BaseField
{
    /** @var string */
    protected string $type = 'gradient';
    
    /** @var array */
    protected array $defaultGradient = [
        'type' => 'linear',
        'angle' => 135,
        'startColor' => '#667EEA',
        'endColor' => '#764BA2'
    ];
    
    /** @var array<string> */
    protected array $allowedTypes = ['linear', 'radial'];
    
    /** @var bool */
    protected bool $showPreview = true;
    
    /** @var bool */
    protected bool $showAnglePicker = true;

    /**
     * Set the default gradient configuration
     *
     * @param array $gradient Default gradient settings
     * @return static
     */
    public function setDefaultGradient(array $gradient): static
    {
        $this->defaultGradient = array_merge($this->defaultGradient, $gradient);
        $this->default = $this->defaultGradient; // Also set as default value
        return $this;
    }

    /**
     * Set allowed gradient types
     *
     * @param array<string> $types Allowed types (linear, radial)
     * @return static
     */
    public function setAllowedTypes(array $types): static
    {
        $this->allowedTypes = $types;
        return $this;
    }

    /**
     * Set whether to show gradient preview
     *
     * @param bool $showPreview Show preview
     * @return static
     */
    public function setShowPreview(bool $showPreview = true): static
    {
        $this->showPreview = $showPreview;
        return $this;
    }

    /**
     * Set whether to show angle picker for linear gradients
     *
     * @param bool $showAnglePicker Show angle picker
     * @return static
     */
    public function setShowAnglePicker(bool $showAnglePicker = true): static
    {
        $this->showAnglePicker = $showAnglePicker;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'default_gradient' => $this->defaultGradient,
            'allowed_types' => $this->allowedTypes,
            'show_preview' => $this->showPreview,
            'show_angle_picker' => $this->showAnglePicker,
        ];
    }
}
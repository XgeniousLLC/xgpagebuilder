<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * BaseField - Abstract base class for all field types
 * 
 * Provides common functionality and chainable methods for field configuration.
 * Each field type extends this class and implements type-specific behavior.
 * 
 * @package Plugins\Pagebuilder\Core\Fields
 */
abstract class BaseField
{
    /** @var string */
    protected string $type;
    
    /** @var string */
    protected string $label = '';
    
    /** @var mixed */
    protected mixed $default = null;
    
    /** @var bool */
    protected bool $required = false;
    
    /** @var string */
    protected string $placeholder = '';
    
    /** @var string */
    protected string $description = '';
    
    /** @var array<string, mixed> */
    protected array $condition = [];
    
    /** @var array<string, mixed> */
    protected array $validation = [];
    
    /** @var array<string, string> */
    protected array $selectors = [];
    
    /** @var array<string, mixed> */
    protected array $attributes = [];
    
    /** @var string */
    protected string $cssClass = '';
    
    /** @var bool */
    protected bool $responsive = false;
    
    /** @var string|null */
    protected ?string $unit = null;

    /**
     * Set the field label
     *
     * @param string $label Field label
     * @return static
     */
    public function setLabel(string $label): static
    {
        $this->label = $label;
        return $this;
    }

    /**
     * Set the default value
     *
     * @param mixed $default Default value
     * @return static
     */
    public function setDefault(mixed $default): static
    {
        $this->default = $default;
        return $this;
    }

    /**
     * Set field as required
     *
     * @param bool $required Whether field is required
     * @return static
     */
    public function setRequired(bool $required = true): static
    {
        $this->required = $required;
        return $this;
    }

    /**
     * Set placeholder text
     *
     * @param string $placeholder Placeholder text
     * @return static
     */
    public function setPlaceholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;
        return $this;
    }

    /**
     * Set field description/help text
     *
     * @param string $description Description text
     * @return static
     */
    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Set conditional display rules
     *
     * @param array<string, mixed> $condition Condition rules
     * @return static
     */
    public function setCondition(array $condition): static
    {
        $this->condition = $condition;
        return $this;
    }

    /**
     * Set conditional display based on another field's value
     *
     * @param string $field Field name to depend on
     * @param mixed $value Expected value
     * @param string $operator Comparison operator (=, !=, in, not_in, not_empty, empty)
     * @return static
     */
    public function dependsOn(string $field, mixed $value, string $operator = '='): static
    {
        $this->condition = [
            'field' => $field,
            'value' => $value,
            'operator' => $operator
        ];
        return $this;
    }

    /**
     * Get the current condition
     *
     * @return array<string, mixed>
     */
    public function getCondition(): array
    {
        return $this->condition;
    }

    /**
     * Set validation rules
     *
     * @param array<string, mixed> $validation Validation rules
     * @return static
     */
    public function setValidation(array $validation): static
    {
        $this->validation = $validation;
        return $this;
    }

    /**
     * Set CSS selectors for style fields
     *
     * @param array<string, string> $selectors CSS selectors map
     * @return static
     */
    public function setSelectors(array $selectors): static
    {
        $this->selectors = $selectors;
        return $this;
    }

    /**
     * Set HTML attributes
     *
     * @param array<string, mixed> $attributes HTML attributes
     * @return static
     */
    public function setAttributes(array $attributes): static
    {
        $this->attributes = $attributes;
        return $this;
    }

    /**
     * Set CSS class
     *
     * @param string $cssClass CSS class name
     * @return static
     */
    public function setCssClass(string $cssClass): static
    {
        $this->cssClass = $cssClass;
        return $this;
    }

    /**
     * Enable responsive support
     *
     * @param bool $responsive Whether field supports responsive breakpoints
     * @return static
     */
    public function setResponsive(bool $responsive = true): static
    {
        $this->responsive = $responsive;
        return $this;
    }

    /**
     * Set unit for numeric fields
     *
     * @param string $unit Unit string (px, em, %, etc.)
     * @return static
     */
    public function setUnit(string $unit): static
    {
        $this->unit = $unit;
        return $this;
    }

    /**
     * Get the field type
     *
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * Convert field to array representation
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $config = [
            'type' => $this->type,
            'label' => $this->label,
            'default' => $this->default,
            'required' => $this->required,
            'placeholder' => $this->placeholder,
            'description' => $this->description,
        ];

        if (!empty($this->condition)) {
            $config['condition'] = $this->condition;
        }

        if (!empty($this->validation)) {
            $config['validation'] = $this->validation;
        }

        if (!empty($this->selectors)) {
            $config['selectors'] = $this->selectors;
        }

        if (!empty($this->attributes)) {
            $config['attributes'] = $this->attributes;
        }

        if (!empty($this->cssClass)) {
            $config['css_class'] = $this->cssClass;
        }

        if ($this->responsive) {
            $config['responsive'] = $this->responsive;
        }

        if ($this->unit !== null) {
            $config['unit'] = $this->unit;
        }

        return array_merge($config, $this->getTypeSpecificConfig());
    }

    /**
     * Get type-specific configuration
     * Override in child classes to add field-specific options
     *
     * @return array<string, mixed>
     */
    protected function getTypeSpecificConfig(): array
    {
        return [];
    }

    /**
     * Convert to JSON string
     *
     * @return string
     */
    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_PRETTY_PRINT);
    }
}
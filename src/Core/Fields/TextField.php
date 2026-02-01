<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * TextField - Text input field
 * 
 * Provides a single-line text input with validation and placeholder support.
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class TextField extends BaseField
{
    /** @var string */
    protected string $type = 'text';

    /** @var int|null */
    protected ?int $maxLength = null;

    /** @var int|null */
    protected ?int $minLength = null;

    /** @var string|null */
    protected ?string $pattern = null;

    /**
     * Set maximum character length
     *
     * @param int $maxLength Maximum length
     * @return static
     */
    public function setMaxLength(int $maxLength): static
    {
        $this->maxLength = $maxLength;
        return $this;
    }

    /**
     * Set minimum character length
     *
     * @param int $minLength Minimum length
     * @return static
     */
    public function setMinLength(int $minLength): static
    {
        $this->minLength = $minLength;
        return $this;
    }

    /**
     * Set validation pattern (regex)
     *
     * @param string $pattern Regular expression pattern
     * @return static
     */
    public function setPattern(string $pattern): static
    {
        $this->pattern = $pattern;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        $config = [];

        if ($this->maxLength !== null) {
            $config['max_length'] = $this->maxLength;
        }

        if ($this->minLength !== null) {
            $config['min_length'] = $this->minLength;
        }

        if ($this->pattern !== null) {
            $config['pattern'] = $this->pattern;
        }

        return $config;
    }
}

<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * MultiSelectField - Multiple selection field
 * 
 * Allows selection of multiple options from a list with tag-style display
 * and search functionality.
 * 
 * @package Plugins\Pagebuilder\Core\Fields
 */
class MultiSelectField extends SelectField
{
    /** @var string */
    protected string $type = 'multiselect';
    
    /** @var int|null */
    protected ?int $maxSelections = null;
    
    /** @var bool */
    protected bool $showCount = true;

    /**
     * Set maximum number of selections allowed
     *
     * @param int $maxSelections Maximum selections
     * @return static
     */
    public function setMaxSelections(int $maxSelections): static
    {
        $this->maxSelections = $maxSelections;
        return $this;
    }

    /**
     * Set whether to show selection count
     *
     * @param bool $showCount Show count
     * @return static
     */
    public function setShowCount(bool $showCount = true): static
    {
        $this->showCount = $showCount;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        $config = parent::getTypeSpecificConfig();
        
        if ($this->maxSelections !== null) {
            $config['max_selections'] = $this->maxSelections;
        }
        
        $config['show_count'] = $this->showCount;
        
        return $config;
    }
}
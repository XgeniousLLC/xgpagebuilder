<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * AlignmentField - Icon-based alignment control
 * 
 * Provides intuitive alignment controls with visual icons for:
 * - None (no alignment)
 * - Left alignment
 * - Center alignment 
 * - Right alignment
 * - Justify alignment (optional)
 * 
 * Features:
 * - Icon-based interface for better UX
 * - Optional enable/disable functionality
 * - Responsive support
 * - Customizable alignment options
 * 
 * @package Plugins\Pagebuilder\Core\Fields
 */
class AlignmentField extends BaseField
{
    /** @var string */
    protected string $type = 'alignment';
    
    /** @var array<string> */
    protected array $alignments = ['none', 'left', 'center', 'right'];
    
    /** @var bool */
    protected bool $showNone = true;
    
    /** @var bool */
    protected bool $showJustify = false;
    
    /** @var bool */
    protected bool $allowDisable = false;
    
    /** @var string */
    protected string $property = 'text-align';

    /**
     * Set which alignment options to show
     *
     * @param array<string> $alignments Array of alignment values
     * @return static
     */
    public function setAlignments(array $alignments): static
    {
        $this->alignments = $alignments;
        return $this;
    }

    /**
     * Set whether to show the "none" option
     *
     * @param bool $showNone Show none option
     * @return static
     */
    public function setShowNone(bool $showNone = true): static
    {
        $this->showNone = $showNone;
        
        if ($showNone && !in_array('none', $this->alignments)) {
            array_unshift($this->alignments, 'none');
        } elseif (!$showNone) {
            $this->alignments = array_filter($this->alignments, fn($val) => $val !== 'none');
        }
        
        return $this;
    }

    /**
     * Set whether to show the "justify" option
     *
     * @param bool $showJustify Show justify option
     * @return static
     */
    public function setShowJustify(bool $showJustify = true): static
    {
        $this->showJustify = $showJustify;
        
        if ($showJustify && !in_array('justify', $this->alignments)) {
            $this->alignments[] = 'justify';
        } elseif (!$showJustify) {
            $this->alignments = array_filter($this->alignments, fn($val) => $val !== 'justify');
        }
        
        return $this;
    }

    /**
     * Allow the field to be disabled/enabled
     *
     * @param bool $allowDisable Allow disable functionality
     * @return static
     */
    public function setAllowDisable(bool $allowDisable = true): static
    {
        $this->allowDisable = $allowDisable;
        return $this;
    }

    /**
     * Set the CSS property this alignment affects
     *
     * @param string $property CSS property name
     * @return static
     */
    public function setProperty(string $property): static
    {
        $this->property = $property;
        return $this;
    }

    /**
     * Configure for text alignment (common preset)
     *
     * @return static
     */
    public function asTextAlign(): static
    {
        return $this->setProperty('text-align')
                    ->setAlignments(['none', 'left', 'center', 'right'])
                    ->setShowJustify(true)
                    ->setDefault('left');
    }

    /**
     * Configure for flex alignment (common preset)
     *
     * @return static
     */
    public function asFlexAlign(): static
    {
        return $this->setProperty('justify-content')
                    ->setAlignments(['flex-start', 'center', 'flex-end'])
                    ->setShowNone(false)
                    ->setDefault('flex-start');
    }

    /**
     * Configure for element alignment (common preset)
     *
     * @return static
     */
    public function asElementAlign(): static
    {
        return $this->setProperty('align-items')
                    ->setAlignments(['flex-start', 'center', 'flex-end'])
                    ->setShowNone(false)
                    ->setDefault('flex-start');
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'alignments' => $this->alignments,
            'show_none' => $this->showNone,
            'show_justify' => $this->showJustify,
            'allow_disable' => $this->allowDisable,
            'property' => $this->property,
        ];
    }
}
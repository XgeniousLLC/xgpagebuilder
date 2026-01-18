<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

use Xgenious\PageBuilder\Core\FieldTypes\FieldInterface;

/**
 * DividerField - Visual divider/separator for form sections
 * 
 * Creates a visual separator between form sections with customizable styling.
 * Useful for grouping related fields and improving form organization.
 * 
 * Features:
 * - Customizable colors and styles
 * - Optional text labels
 * - Adjustable thickness and spacing
 * - Multiple divider styles (solid, dashed, dotted)
 * 
 * Usage:
 * FieldManager::DIVIDER()
 *     ->setColor('#e2e8f0')
 *     ->setStyle('solid')
 *     ->setThickness(1)
 *     ->setMargin(['top' => 16, 'bottom' => 16])
 *     ->setText('Optional Section Label')
 */
class DividerField implements FieldInterface
{
    protected string $color = '#e2e8f0'; // slate-200 equivalent
    protected string $style = 'solid'; // solid, dashed, dotted, double
    protected int $thickness = 1; // Border thickness in pixels
    protected array $margin = ['top' => 16, 'bottom' => 16]; // Margin in pixels
    protected string $text = ''; // Optional text label
    protected string $textPosition = 'center'; // left, center, right
    protected string $textColor = '#64748b'; // slate-500 equivalent
    protected string $textSize = 'sm'; // xs, sm, base, lg
    protected string $description = '';
    protected string $label = '';
    protected bool $fullWidth = true;
    
    /**
     * Set divider color
     */
    public function setColor(string $color): self
    {
        $this->color = $color;
        return $this;
    }
    
    /**
     * Set divider style
     */
    public function setStyle(string $style): self
    {
        $validStyles = ['solid', 'dashed', 'dotted', 'double'];
        if (in_array($style, $validStyles)) {
            $this->style = $style;
        }
        return $this;
    }
    
    /**
     * Set divider thickness in pixels
     */
    public function setThickness(int $thickness): self
    {
        $this->thickness = max(1, min(10, $thickness)); // 1-10px range
        return $this;
    }
    
    /**
     * Set margin around divider
     */
    public function setMargin(array $margin): self
    {
        $defaults = ['top' => 16, 'bottom' => 16];
        $this->margin = array_merge($defaults, $margin);
        return $this;
    }
    
    /**
     * Set optional text label for divider
     */
    public function setText(string $text): self
    {
        $this->text = $text;
        return $this;
    }
    
    /**
     * Set text position (left, center, right)
     */
    public function setTextPosition(string $position): self
    {
        $validPositions = ['left', 'center', 'right'];
        if (in_array($position, $validPositions)) {
            $this->textPosition = $position;
        }
        return $this;
    }
    
    /**
     * Set text color
     */
    public function setTextColor(string $color): self
    {
        $this->textColor = $color;
        return $this;
    }
    
    /**
     * Set text size
     */
    public function setTextSize(string $size): self
    {
        $validSizes = ['xs', 'sm', 'base', 'lg', 'xl'];
        if (in_array($size, $validSizes)) {
            $this->textSize = $size;
        }
        return $this;
    }
    
    /**
     * Set field label
     */
    public function setLabel(string $label): self
    {
        $this->label = $label;
        return $this;
    }
    
    /**
     * Set field description
     */
    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }
    
    /**
     * Set whether divider takes full width
     */
    public function setFullWidth(bool $fullWidth): self
    {
        $this->fullWidth = $fullWidth;
        return $this;
    }
    
    /**
     * Get description text
     */
    public function getDescription(): string
    {
        return $this->description;
    }
    
    /**
     * Render the field configuration
     */
    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'divider',
            'label' => $this->label,
            'description' => $this->description,
            'color' => $this->color,
            'style' => $this->style,
            'thickness' => $this->thickness,
            'margin' => $this->margin,
            'text' => $this->text,
            'text_position' => $this->textPosition,
            'text_color' => $this->textColor,
            'text_size' => $this->textSize,
            'full_width' => $this->fullWidth,
            'value' => null // Dividers don't store values
        ];
    }
    
    /**
     * Validate divider field (always valid as it's visual only)
     */
    public function validate($value, array $rules = []): array
    {
        return []; // No validation needed for visual divider
    }
    
    /**
     * Sanitize divider field (no sanitization needed)
     */
    public function sanitize($value): mixed
    {
        return null; // Dividers don't store values
    }
    
    /**
     * Get the field type identifier
     */
    public function getType(): string
    {
        return 'divider';
    }
    
    /**
     * Get the default value for divider field
     * Dividers are visual-only and don't store values
     */
    public function getDefaultValue(): mixed
    {
        return null;
    }
    
    /**
     * Get field schema for API responses
     */
    public function getSchema(): array
    {
        return [
            'type' => 'divider',
            'visual_only' => true,
            'configurable' => [
                'color', 'style', 'thickness', 'margin', 
                'text', 'text_position', 'text_color', 'text_size'
            ]
        ];
    }
    
    /**
     * Convert field to array format for ControlManager compatibility
     */
    public function toArray(): array
    {
        return $this->render([], null);
    }
    
    /**
     * Generate inline CSS for the divider
     */
    public function generateCSS(): string
    {
        $css = '';
        
        if (!empty($this->text)) {
            // Divider with text
            $css = "
                border: none;
                margin: {$this->margin['top']}px 0 {$this->margin['bottom']}px 0;
                text-align: {$this->textPosition};
                position: relative;
                color: {$this->textColor};
                font-size: " . $this->getFontSize() . ";
                
                &::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: {$this->thickness}px;
                    background: {$this->color};
                    border-style: {$this->style};
                }
            ";
        } else {
            // Simple divider line
            $css = "
                border: none;
                border-top: {$this->thickness}px {$this->style} {$this->color};
                margin: {$this->margin['top']}px 0 {$this->margin['bottom']}px 0;
                width: " . ($this->fullWidth ? '100%' : 'auto') . ";
            ";
        }
        
        return $css;
    }
    
    /**
     * Get font size in CSS units
     */
    private function getFontSize(): string
    {
        $sizes = [
            'xs' => '0.75rem',   // 12px
            'sm' => '0.875rem',  // 14px
            'base' => '1rem',    // 16px
            'lg' => '1.125rem',  // 18px
            'xl' => '1.25rem'    // 20px
        ];
        
        return $sizes[$this->textSize] ?? $sizes['sm'];
    }
    
    /**
     * Create a simple divider with default settings
     */
    public static function simple(): self
    {
        return new self();
    }
    
    /**
     * Create a thick divider
     */
    public static function thick(): self
    {
        return (new self())->setThickness(3);
    }
    
    /**
     * Create a dashed divider
     */
    public static function dashed(): self
    {
        return (new self())->setStyle('dashed');
    }
    
    /**
     * Create a dotted divider
     */
    public static function dotted(): self
    {
        return (new self())->setStyle('dotted');
    }
    
    /**
     * Create a section divider with text
     */
    public static function section(string $text): self
    {
        return (new self())->setText($text)->setTextSize('base');
    }
    
    /**
     * Create a spacer (invisible divider for spacing)
     */
    public static function spacer(int $height = 24): self
    {
        return (new self())
            ->setColor('transparent')
            ->setMargin(['top' => 0, 'bottom' => $height])
            ->setThickness(0);
    }
}
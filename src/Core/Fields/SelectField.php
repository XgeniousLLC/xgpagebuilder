<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * SelectField - Dropdown selection field
 * 
 * Provides a dropdown menu with customizable options, grouping support,
 * and search functionality for large option sets.
 * 
 * @package Plugins\Pagebuilder\Core\Fields
 */
class SelectField extends BaseField
{
    /** @var string */
    protected string $type = 'select';
    
    /** @var array<string, string> */
    protected array $options = [];
    
    /** @var bool */
    protected bool $searchable = false;
    
    /** @var bool */
    protected bool $clearable = false;
    
    /** @var string|null */
    protected ?string $groupBy = null;

    /**
     * Set field options
     *
     * @param array<string, string> $options Options array (value => label)
     * @return static
     */
    public function setOptions(array $options): static
    {
        $this->options = $options;
        return $this;
    }

    /**
     * Add a single option
     *
     * @param string $value Option value
     * @param string $label Option label
     * @return static
     */
    public function addOption(string $value, string $label): static
    {
        $this->options[$value] = $label;
        return $this;
    }

    /**
     * Set whether field is searchable
     *
     * @param bool $searchable Enable search
     * @return static
     */
    public function setSearchable(bool $searchable = true): static
    {
        $this->searchable = $searchable;
        return $this;
    }

    /**
     * Set whether field is clearable
     *
     * @param bool $clearable Enable clear button
     * @return static
     */
    public function setClearable(bool $clearable = true): static
    {
        $this->clearable = $clearable;
        return $this;
    }

    /**
     * Set option grouping field
     *
     * @param string $groupBy Field to group by
     * @return static
     */
    public function setGroupBy(string $groupBy): static
    {
        $this->groupBy = $groupBy;
        return $this;
    }

    /**
     * Add common font family options
     *
     * @return static
     */
    public function addFontFamilyOptions(): static
    {
        $this->options = array_merge($this->options, [
            'Arial' => 'Arial',
            'Helvetica' => 'Helvetica',
            'Times New Roman' => 'Times New Roman',
            'Georgia' => 'Georgia',
            'Verdana' => 'Verdana',
            'Courier New' => 'Courier New',
        ]);
        return $this;
    }

    /**
     * Add common font weight options
     *
     * @return static
     */
    public function addFontWeightOptions(): static
    {
        $this->options = array_merge($this->options, [
            '100' => 'Thin (100)',
            '200' => 'Extra Light (200)',
            '300' => 'Light (300)',
            '400' => 'Normal (400)',
            '500' => 'Medium (500)',
            '600' => 'Semi Bold (600)',
            '700' => 'Bold (700)',
            '800' => 'Extra Bold (800)',
            '900' => 'Black (900)',
        ]);
        return $this;
    }

    /**
     * Add text alignment options
     *
     * @return static
     */
    public function addTextAlignOptions(): static
    {
        $this->options = array_merge($this->options, [
            'left' => 'Left',
            'center' => 'Center',
            'right' => 'Right',
            'justify' => 'Justify',
        ]);
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        $config = [
            'options' => $this->options,
            'searchable' => $this->searchable,
            'clearable' => $this->clearable,
        ];
        
        if ($this->groupBy !== null) {
            $config['group_by'] = $this->groupBy;
        }
        
        return $config;
    }
}
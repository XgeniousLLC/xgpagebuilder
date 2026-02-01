<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * TextareaField - Multi-line text input field
 * 
 * Provides a multi-line text input with row control, character limits,
 * and optional HTML support.
 * 
 * @package plugins\Pagebuilder\Core\Fields
 */
class TextareaField extends BaseField
{
    /** @var string */
    protected string $type = 'textarea';

    /** @var int */
    protected int $rows = 4;

    /** @var int|null */
    protected ?int $cols = null;

    /** @var string */
    protected string $resize = 'vertical';

    /** @var bool */
    protected bool $allowHtml = false;

    /**
     * Set number of visible rows
     *
     * @param int $rows Number of rows
     * @return static
     */
    public function setRows(int $rows): static
    {
        $this->rows = $rows;
        return $this;
    }

    /**
     * Set number of visible columns
     *
     * @param int $cols Number of columns
     * @return static
     */
    public function setCols(int $cols): static
    {
        $this->cols = $cols;
        return $this;
    }

    /**
     * Set resize behavior
     *
     * @param string $resize Resize behavior (none, both, horizontal, vertical)
     * @return static
     */
    public function setResize(string $resize): static
    {
        $this->resize = $resize;
        return $this;
    }

    /**
     * Set whether to allow HTML content
     *
     * @param bool $allowHtml Allow HTML
     * @return static
     */
    public function setAllowHtml(bool $allowHtml = true): static
    {
        $this->allowHtml = $allowHtml;
        return $this;
    }

    /**
     * {@inheritDoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        $config = [
            'rows' => $this->rows,
            'resize' => $this->resize,
            'allow_html' => $this->allowHtml,
        ];

        if ($this->cols !== null) {
            $config['cols'] = $this->cols;
        }

        return $config;
    }
}

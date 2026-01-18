<?php

namespace Xgenious\PageBuilder\Core\Fields;

class DividerField extends BaseField
{
    protected string $type = 'divider';
    protected string $style = 'solid';
    
    public function setStyle(string $style): static
    {
        $this->style = $style;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return ['style' => $this->style];
    }
}
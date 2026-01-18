<?php

namespace Xgenious\PageBuilder\Core\Fields;

class HeadingField extends BaseField
{
    protected string $type = 'heading';
    protected string $size = 'h3';
    
    public function setSize(string $size): static
    {
        $this->size = $size;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return ['size' => $this->size];
    }
}
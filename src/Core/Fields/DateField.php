<?php

namespace Xgenious\PageBuilder\Core\Fields;

class DateField extends BaseField
{
    protected string $type = 'date';
    protected string $format = 'Y-m-d';
    
    public function setFormat(string $format): static
    {
        $this->format = $format;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return ['format' => $this->format];
    }
}
<?php

namespace Xgenious\PageBuilder\Core\Fields;

class GroupField extends BaseField
{
    protected string $type = 'group';
    protected array $fields = [];
    protected bool $collapsible = false;
    
    public function setFields(array $fields): static
    {
        $this->fields = $fields;
        return $this;
    }
    
    public function setCollapsible(bool $collapsible = true): static
    {
        $this->collapsible = $collapsible;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return [
            'fields' => $this->fields,
            'collapsible' => $this->collapsible,
        ];
    }
}
<?php

namespace Xgenious\PageBuilder\Core\Fields;

class IconField extends BaseField
{
    protected string $type = 'icon';
    
    protected array $iconSet = [];
    protected bool $searchable = true;
    
    public function setIconSet(array $iconSet): static
    {
        $this->iconSet = $iconSet;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return [
            'icon_set' => $this->iconSet,
            'searchable' => $this->searchable,
        ];
    }
}
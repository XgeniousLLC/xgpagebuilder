<?php

namespace Xgenious\PageBuilder\Core\Fields;

class ImageField extends BaseField
{
    protected string $type = 'image';
    
    protected array $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    protected int $maxSize = 5242880; // 5MB
    protected bool $multiple = false;
    
    public function setAllowedTypes(array $types): static
    {
        $this->allowedTypes = $types;
        return $this;
    }
    
    public function setMaxSize(int $size): static
    {
        $this->maxSize = $size;
        return $this;
    }
    
    public function setMultiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return [
            'allowed_types' => $this->allowedTypes,
            'max_size' => $this->maxSize,
            'multiple' => $this->multiple,
        ];
    }
}
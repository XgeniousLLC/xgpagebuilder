<?php

namespace Xgenious\PageBuilder\Core\Fields;

class WysiwygField extends TextareaField
{
    protected string $type = 'wysiwyg';
    protected array $toolbar = ['bold', 'italic', 'underline', 'link'];
    
    public function setToolbar(array $toolbar): static
    {
        $this->toolbar = $toolbar;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return array_merge(parent::getTypeSpecificConfig(), [
            'toolbar' => $this->toolbar,
        ]);
    }
}
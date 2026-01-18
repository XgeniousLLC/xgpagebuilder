<?php

namespace Xgenious\PageBuilder\Core\Fields;

class CodeField extends TextareaField
{
    protected string $type = 'code';
    protected string $language = 'html';
    
    public function setLanguage(string $language): static
    {
        $this->language = $language;
        return $this;
    }
    
    protected function getTypeSpecificConfig(): array
    {
        return array_merge(parent::getTypeSpecificConfig(), [
            'language' => $this->language,
        ]);
    }
}
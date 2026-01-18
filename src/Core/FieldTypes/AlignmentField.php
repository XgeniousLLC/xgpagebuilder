<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class AlignmentField extends AbstractField
{
    protected string $type = 'alignment';
    protected mixed $defaultValue = 'none';

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        // Validate against alignments
        if (isset($rules['alignments']) && $value !== null && $value !== '') {
            $validAlignments = $rules['alignments'];
            if (!in_array($value, $validAlignments)) {
                $errors[] = 'Invalid alignment value';
            }
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        return $this->sanitizeCommon($value);
    }

    public function render(array $config, $value = null): array
    {
        // Extract alignment options from config
        $alignments = $config['alignments'] ?? ['none', 'left', 'center', 'right'];
        
        return [
            'type' => $this->type,
            'value' => $value ?? $config['default'] ?? $this->defaultValue,
            'alignments' => $alignments,
            'config' => $config
        ];
    }

    public function getSchema(): array
    {
        return [
            'type' => $this->type,
            'category' => 'selection',
            'supports' => [
                'default',
                'required',
                'condition',
                'description',
                'alignments',
                'show_none',
                'show_justify',
                'allow_disable',
                'property'
            ]
        ];
    }
}
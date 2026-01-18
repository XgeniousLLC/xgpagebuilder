<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class TextField extends AbstractField
{
    protected string $type = 'text';
    protected mixed $defaultValue = '';

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        // Text-specific validation
        if ($value !== null && !is_string($value)) {
            $errors[] = 'Value must be a string';
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null) {
            return $this->defaultValue;
        }

        $value = $this->sanitizeCommon($value);
        
        // Convert to string
        $value = (string) $value;
        
        // Remove HTML tags if not allowed
        $value = strip_tags($value);
        
        return $value;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'text',
            'value' => $value ?? $this->defaultValue,
            'placeholder' => $config['placeholder'] ?? '',
            'maxLength' => $config['max_length'] ?? null,
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-input',
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'placeholder' => [
                    'type' => 'string',
                    'description' => 'Placeholder text'
                ],
                'max_length' => [
                    'type' => 'integer',
                    'description' => 'Maximum character length'
                ],
                'min_length' => [
                    'type' => 'integer',
                    'description' => 'Minimum character length'
                ],
                'pattern' => [
                    'type' => 'string',
                    'description' => 'Regular expression pattern'
                ]
            ]
        ]);
    }
}
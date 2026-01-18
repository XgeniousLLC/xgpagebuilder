<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class ColorField extends AbstractField
{
    protected string $type = 'color';
    protected mixed $defaultValue = '#000000';

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        if ($value !== null && $value !== '') {
            // Validate hex color format
            if (!preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
                $errors[] = 'Invalid color format. Use hex format like #FF0000';
            }
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null || $value === '') {
            return $this->defaultValue;
        }

        $value = $this->sanitizeCommon($value);
        
        // Ensure # prefix
        if (!str_starts_with($value, '#')) {
            $value = '#' . $value;
        }
        
        // Convert to uppercase
        $value = strtoupper($value);
        
        // Validate and return default if invalid
        if (!preg_match('/^#[A-F0-9]{6}$/', $value)) {
            return $this->defaultValue;
        }
        
        return $value;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'color',
            'value' => $value ?? $this->defaultValue,
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-color-input',
            'showInput' => $config['show_input'] ?? true,
            'swatches' => $config['swatches'] ?? [],
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'show_input' => [
                    'type' => 'boolean',
                    'description' => 'Show text input alongside color picker',
                    'default' => true
                ],
                'swatches' => [
                    'type' => 'array',
                    'description' => 'Predefined color swatches',
                    'items' => [
                        'type' => 'string',
                        'pattern' => '^#[a-fA-F0-9]{6}$'
                    ]
                ]
            ]
        ]);
    }
}
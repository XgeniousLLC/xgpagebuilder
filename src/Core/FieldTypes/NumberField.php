<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class NumberField extends AbstractField
{
    protected string $type = 'number';
    protected mixed $defaultValue = 0;

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        if ($value !== null && $value !== '') {
            if (!is_numeric($value)) {
                $errors[] = 'Value must be a number';
            } else {
                $numValue = (float) $value;
                
                // Min value validation
                if (isset($rules['min']) && $numValue < $rules['min']) {
                    $errors[] = "Value must be at least {$rules['min']}";
                }
                
                // Max value validation
                if (isset($rules['max']) && $numValue > $rules['max']) {
                    $errors[] = "Value must be at most {$rules['max']}";
                }
                
                // Step validation
                if (isset($rules['step']) && $rules['step'] > 0) {
                    $remainder = fmod($numValue, $rules['step']);
                    if ($remainder !== 0.0) {
                        $errors[] = "Value must be a multiple of {$rules['step']}";
                    }
                }
            }
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null || $value === '') {
            return $this->defaultValue;
        }

        // Convert to number
        if (is_numeric($value)) {
            // Check if it's an integer or float
            if (strpos((string) $value, '.') !== false) {
                return (float) $value;
            } else {
                return (int) $value;
            }
        }

        return $this->defaultValue;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'number',
            'value' => $value ?? $this->defaultValue,
            'min' => $config['min'] ?? null,
            'max' => $config['max'] ?? null,
            'step' => $config['step'] ?? 1,
            'unit' => $config['unit'] ?? '',
            'placeholder' => $config['placeholder'] ?? '',
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-number-input',
            'showUnit' => $config['show_unit'] ?? true,
            'allowDecimals' => $config['allow_decimals'] ?? true,
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'min' => [
                    'type' => 'number',
                    'description' => 'Minimum allowed value'
                ],
                'max' => [
                    'type' => 'number',
                    'description' => 'Maximum allowed value'
                ],
                'step' => [
                    'type' => 'number',
                    'description' => 'Step increment',
                    'default' => 1
                ],
                'unit' => [
                    'type' => 'string',
                    'description' => 'Unit label (px, %, em, etc.)'
                ],
                'allow_decimals' => [
                    'type' => 'boolean',
                    'description' => 'Allow decimal values',
                    'default' => true
                ]
            ]
        ]);
    }
}
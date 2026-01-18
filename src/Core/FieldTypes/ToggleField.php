<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class ToggleField extends AbstractField
{
    protected string $type = 'toggle';
    protected mixed $defaultValue = false;

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        if ($value !== null && !is_bool($value) && !in_array($value, [0, 1, '0', '1', 'true', 'false'], true)) {
            $errors[] = 'Value must be a boolean';
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null) {
            return $this->defaultValue;
        }

        // Convert various formats to boolean
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'on'], true);
        }

        if (is_numeric($value)) {
            return (bool) $value;
        }

        return $this->defaultValue;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'toggle',
            'value' => $value ?? $this->defaultValue,
            'label' => $config['label'] ?? '',
            'labelPosition' => $config['label_position'] ?? 'right',
            'size' => $config['size'] ?? 'medium',
            'color' => $config['color'] ?? 'blue',
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-toggle',
            'onText' => $config['on_text'] ?? '',
            'offText' => $config['off_text'] ?? '',
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'label_position' => [
                    'type' => 'string',
                    'enum' => ['left', 'right', 'top', 'bottom'],
                    'description' => 'Position of label relative to toggle',
                    'default' => 'right'
                ],
                'size' => [
                    'type' => 'string',
                    'enum' => ['small', 'medium', 'large'],
                    'description' => 'Toggle size',
                    'default' => 'medium'
                ],
                'color' => [
                    'type' => 'string',
                    'description' => 'Toggle color theme',
                    'default' => 'blue'
                ],
                'on_text' => [
                    'type' => 'string',
                    'description' => 'Text shown when toggle is on'
                ],
                'off_text' => [
                    'type' => 'string',
                    'description' => 'Text shown when toggle is off'
                ]
            ]
        ]);
    }
}
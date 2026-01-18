<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class SelectField extends AbstractField
{
    protected string $type = 'select';
    protected mixed $defaultValue = '';

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        // Validate against options
        if (isset($rules['options']) && $value !== null && $value !== '') {
            $validOptions = array_keys($rules['options']);
            if (!in_array($value, $validOptions, true)) {
                $errors[] = 'Invalid option selected';
            }
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null) {
            return $this->defaultValue;
        }

        return $this->sanitizeCommon($value);
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'select',
            'value' => $value ?? $this->defaultValue,
            'options' => $config['options'] ?? [],
            'placeholder' => $config['placeholder'] ?? 'Select an option...',
            'multiple' => $config['multiple'] ?? false,
            'searchable' => $config['searchable'] ?? false,
            'clearable' => $config['clearable'] ?? false,
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-select',
            'groupBy' => $config['group_by'] ?? null,
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'options' => [
                    'type' => 'object',
                    'description' => 'Available options as key-value pairs',
                    'required' => true
                ],
                'multiple' => [
                    'type' => 'boolean',
                    'description' => 'Allow multiple selections',
                    'default' => false
                ],
                'searchable' => [
                    'type' => 'boolean',
                    'description' => 'Enable search functionality',
                    'default' => false
                ],
                'clearable' => [
                    'type' => 'boolean',
                    'description' => 'Allow clearing selection',
                    'default' => false
                ],
                'group_by' => [
                    'type' => 'string',
                    'description' => 'Group options by this field'
                ]
            ]
        ]);
    }
}
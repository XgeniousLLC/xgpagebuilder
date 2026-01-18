<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class GroupField extends AbstractField
{
    protected string $type = 'group';
    protected mixed $defaultValue = [];

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = [];

        // Group field validation is handled differently
        // It delegates to individual field validation
        if (isset($rules['fields']) && is_array($value)) {
            // Field validation will be handled by FieldTypeRegistry when available
            // For now, just return empty errors
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if (!is_array($value)) {
            return $this->defaultValue;
        }

        return $value; // Individual field sanitization happens in FieldTypeRegistry
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'group',
            'value' => $value ?? $this->defaultValue,
            'fields' => $config['fields'] ?? [],
            'label' => $config['label'] ?? '',
            'collapsible' => $config['collapsible'] ?? false,
            'collapsed' => $config['collapsed'] ?? false,
            'border' => $config['border'] ?? true,
            'spacing' => $config['spacing'] ?? 'normal',
            'columns' => $config['columns'] ?? 1,
            'condition' => $config['condition'] ?? null,
            'className' => $config['class_name'] ?? 'form-group',
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'fields' => [
                    'type' => 'object',
                    'description' => 'Field definitions within the group',
                    'required' => true
                ],
                'collapsible' => [
                    'type' => 'boolean',
                    'description' => 'Make group collapsible',
                    'default' => false
                ],
                'collapsed' => [
                    'type' => 'boolean',
                    'description' => 'Start collapsed (if collapsible)',
                    'default' => false
                ],
                'border' => [
                    'type' => 'boolean',
                    'description' => 'Show border around group',
                    'default' => true
                ],
                'spacing' => [
                    'type' => 'string',
                    'enum' => ['compact', 'normal', 'relaxed'],
                    'description' => 'Spacing between fields',
                    'default' => 'normal'
                ],
                'columns' => [
                    'type' => 'integer',
                    'description' => 'Number of columns for field layout',
                    'default' => 1,
                    'minimum' => 1,
                    'maximum' => 4
                ],
                'condition' => [
                    'type' => 'object',
                    'description' => 'Conditional display rules'
                ]
            ]
        ]);
    }
}
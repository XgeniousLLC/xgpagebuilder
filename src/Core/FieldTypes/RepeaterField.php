<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class RepeaterField extends AbstractField
{
    protected string $type = 'repeater';
    protected mixed $defaultValue = [];

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        if ($value !== null) {
            if (!is_array($value)) {
                $errors[] = 'Value must be an array';
                return $errors;
            }

            // Min items validation
            if (isset($rules['min']) && count($value) < $rules['min']) {
                $errors[] = "Minimum {$rules['min']} items required";
            }

            // Max items validation
            if (isset($rules['max']) && count($value) > $rules['max']) {
                $errors[] = "Maximum {$rules['max']} items allowed";
            }

            // Validate each item if field structure is provided
            if (isset($rules['fields'])) {
                foreach ($value as $index => $item) {
                    if (!is_array($item)) {
                        $errors[] = "Item at index {$index} must be an object";
                        continue;
                    }

                    // Validate item fields - will be handled by FieldTypeRegistry when available
                    // For now, skip item field validation
                }
            }
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null || !is_array($value)) {
            return $this->defaultValue;
        }

        // Sanitize each item
        $sanitized = [];
        foreach ($value as $item) {
            if (is_array($item)) {
                $sanitized[] = $item; // Individual field sanitization would happen in FieldTypeRegistry
            }
        }

        return $sanitized;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'repeater',
            'value' => $value ?? $this->defaultValue,
            'fields' => $config['fields'] ?? [],
            'min' => $config['min'] ?? 0,
            'max' => $config['max'] ?? 100,
            'addButtonText' => $config['add_button_text'] ?? 'Add Item',
            'removeButtonText' => $config['remove_button_text'] ?? 'Remove',
            'collapsible' => $config['collapsible'] ?? true,
            'sortable' => $config['sortable'] ?? true,
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-repeater',
            'itemTemplate' => $config['item_template'] ?? null,
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'fields' => [
                    'type' => 'object',
                    'description' => 'Field definitions for each repeater item',
                    'required' => true
                ],
                'min' => [
                    'type' => 'integer',
                    'description' => 'Minimum number of items',
                    'default' => 0,
                    'minimum' => 0
                ],
                'max' => [
                    'type' => 'integer',
                    'description' => 'Maximum number of items',
                    'default' => 100,
                    'minimum' => 1
                ],
                'collapsible' => [
                    'type' => 'boolean',
                    'description' => 'Allow collapsing items',
                    'default' => true
                ],
                'sortable' => [
                    'type' => 'boolean',
                    'description' => 'Allow reordering items',
                    'default' => true
                ],
                'add_button_text' => [
                    'type' => 'string',
                    'description' => 'Text for add button',
                    'default' => 'Add Item'
                ]
            ]
        ]);
    }
}
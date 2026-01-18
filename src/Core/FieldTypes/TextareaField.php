<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class TextareaField extends AbstractField
{
    protected string $type = 'textarea';
    protected mixed $defaultValue = '';

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

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
        
        // Optionally allow HTML (configurable)
        // For now, strip HTML tags for security
        $value = strip_tags($value);
        
        return $value;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'textarea',
            'value' => $value ?? $this->defaultValue,
            'placeholder' => $config['placeholder'] ?? '',
            'rows' => $config['rows'] ?? 4,
            'cols' => $config['cols'] ?? null,
            'maxLength' => $config['max_length'] ?? null,
            'resize' => $config['resize'] ?? 'vertical',
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-textarea',
            'allowHtml' => $config['allow_html'] ?? false,
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'rows' => [
                    'type' => 'integer',
                    'description' => 'Number of visible text lines',
                    'default' => 4,
                    'minimum' => 1,
                    'maximum' => 20
                ],
                'cols' => [
                    'type' => 'integer',
                    'description' => 'Visible width of text area'
                ],
                'resize' => [
                    'type' => 'string',
                    'enum' => ['none', 'both', 'horizontal', 'vertical'],
                    'description' => 'Resize behavior',
                    'default' => 'vertical'
                ],
                'allow_html' => [
                    'type' => 'boolean',
                    'description' => 'Allow HTML content',
                    'default' => false
                ]
            ]
        ]);
    }
}
<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class CodeField extends AbstractField
{
    protected string $type = 'code';
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

        $value = (string) $value;


        return $value;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'code',
            'value' => $value ?? $this->defaultValue,
            'placeholder' => $config['placeholder'] ?? '',
            'rows' => $config['rows'] ?? 10,
            'resize' => $config['resize'] ?? 'vertical',
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-code',
            'allowHtml' => $config['allow_html'] ?? false,
            'language' => $config['language'] ?? 'javascript',
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
                    'default' => 10,
                    'minimum' => 1,
                    'maximum' => 50
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
                ],
                'language' => [
                    'type' => 'string',
                    'description' => 'Programming language for syntax highlighting',
                    'default' => 'javascript',
                    'enum' => ['html', 'css', 'javascript', 'php', 'python', 'json', 'xml', 'sql']
                ]
            ]
        ]);
    }
}

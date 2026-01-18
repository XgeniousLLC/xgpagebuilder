<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class ImageField extends AbstractField
{
    protected string $type = 'image';
    protected mixed $defaultValue = '';

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        if ($value !== null && $value !== '') {
            // Basic URL validation
            if (!filter_var($value, FILTER_VALIDATE_URL) && !str_starts_with($value, '/')) {
                $errors[] = 'Invalid image URL or path';
            }

            // File extension validation
            if (isset($rules['allowed_extensions'])) {
                $extension = strtolower(pathinfo($value, PATHINFO_EXTENSION));
                if (!in_array($extension, $rules['allowed_extensions'])) {
                    $errors[] = 'Invalid file extension. Allowed: ' . implode(', ', $rules['allowed_extensions']);
                }
            }

            // File size validation would require additional logic to fetch the image
        }

        return $errors;
    }

    public function sanitize($value): mixed
    {
        if ($value === null || $value === '') {
            return $this->defaultValue;
        }

        $value = $this->sanitizeCommon($value);
        
        // Basic URL sanitization
        $value = filter_var($value, FILTER_SANITIZE_URL);
        
        return $value;
    }

    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'image',
            'value' => $value ?? $this->defaultValue,
            'allowedTypes' => $config['allowed_types'] ?? ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'maxSize' => $config['max_size'] ?? 5242880, // 5MB default
            'multiple' => $config['multiple'] ?? false,
            'preview' => $config['preview'] ?? true,
            'uploadUrl' => $config['upload_url'] ?? '/api/upload/image',
            'required' => $config['required'] ?? false,
            'disabled' => $config['disabled'] ?? false,
            'className' => $config['class_name'] ?? 'form-image-input',
            'aspectRatio' => $config['aspect_ratio'] ?? null,
            'cropOptions' => $config['crop_options'] ?? [],
            'attributes' => $config['attributes'] ?? []
        ];
    }

    public function getSchema(): array
    {
        return array_merge($this->getCommonSchema(), [
            'properties' => [
                'allowed_types' => [
                    'type' => 'array',
                    'description' => 'Allowed file extensions',
                    'items' => ['type' => 'string'],
                    'default' => ['jpg', 'jpeg', 'png', 'gif', 'webp']
                ],
                'max_size' => [
                    'type' => 'integer',
                    'description' => 'Maximum file size in bytes',
                    'default' => 5242880
                ],
                'multiple' => [
                    'type' => 'boolean',
                    'description' => 'Allow multiple image selection',
                    'default' => false
                ],
                'preview' => [
                    'type' => 'boolean',
                    'description' => 'Show image preview',
                    'default' => true
                ],
                'aspect_ratio' => [
                    'type' => 'string',
                    'description' => 'Required aspect ratio (e.g., "16:9", "1:1")'
                ],
                'crop_options' => [
                    'type' => 'object',
                    'description' => 'Image cropping options'
                ]
            ]
        ]);
    }
}
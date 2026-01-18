<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

abstract class AbstractField implements FieldInterface
{
    protected string $type;
    protected array $commonRules = [];
    protected mixed $defaultValue = null;

    public function __construct()
    {
        $this->type = $this->getType();
    }

    /**
     * Common validation logic
     */
    protected function validateCommon($value, array $rules): array
    {
        $errors = [];

        // Required validation
        if (($rules['required'] ?? false) && empty($value)) {
            $errors[] = 'This field is required';
        }

        // Min length validation
        if (isset($rules['min_length']) && is_string($value) && strlen($value) < $rules['min_length']) {
            $errors[] = "Minimum length is {$rules['min_length']} characters";
        }

        // Max length validation
        if (isset($rules['max_length']) && is_string($value) && strlen($value) > $rules['max_length']) {
            $errors[] = "Maximum length is {$rules['max_length']} characters";
        }

        // Custom validation regex
        if (isset($rules['pattern']) && is_string($value) && !preg_match($rules['pattern'], $value)) {
            $errors[] = $rules['pattern_message'] ?? 'Invalid format';
        }

        return $errors;
    }

    /**
     * Common sanitization
     */
    protected function sanitizeCommon($value): mixed
    {
        if (is_string($value)) {
            // Trim whitespace
            $value = trim($value);
            
            // Remove null bytes
            $value = str_replace("\0", '', $value);
        }

        return $value;
    }

    /**
     * Get default value
     */
    public function getDefaultValue(): mixed
    {
        return $this->defaultValue;
    }

    /**
     * Get common field schema
     */
    protected function getCommonSchema(): array
    {
        return [
            'type' => $this->type,
            'required' => false,
            'default' => $this->defaultValue,
            'validation' => $this->commonRules
        ];
    }

    /**
     * Get field schema for API responses
     */
    public function getSchema(): array
    {
        return $this->getCommonSchema();
    }
}
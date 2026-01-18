<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

interface FieldInterface
{
    /**
     * Get the field type identifier
     */
    public function getType(): string;

    /**
     * Validate field value
     */
    public function validate($value, array $rules = []): array;

    /**
     * Sanitize field value
     */
    public function sanitize($value): mixed;

    /**
     * Get default value for the field
     */
    public function getDefaultValue(): mixed;

    /**
     * Render field for frontend form
     */
    public function render(array $config, $value = null): array;

    /**
     * Get field schema for API responses
     */
    public function getSchema(): array;
}
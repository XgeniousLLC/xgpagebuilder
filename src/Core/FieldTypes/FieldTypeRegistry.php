<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

use Xgenious\PageBuilder\Core\FieldTypes\FieldInterface;

class FieldTypeRegistry
{
    private static array $fieldTypes = [];
    private static bool $initialized = false;

    /**
     * Initialize default field types
     */
    private static function initialize(): void
    {
        if (self::$initialized) {
            return;
        }

        // Register built-in field types
        self::register(new TextField());
        self::register(new NumberField());
        self::register(new ColorField());
        self::register(new ToggleField());
        self::register(new SelectField());
        self::register(new TextareaField());
        self::register(new CodeField());
        self::register(new ImageField());
        self::register(new RepeaterField());
        self::register(new GroupField());
        self::register(new AlignmentField());
        self::register(new BorderShadowField());

        self::$initialized = true;
    }

    /**
     * Register a field type
     */
    public static function register(FieldInterface $field): void
    {
        self::$fieldTypes[$field->getType()] = $field;
    }

    /**
     * Get field type instance
     */
    public static function get(string $type): ?FieldInterface
    {
        self::initialize();
        return self::$fieldTypes[$type] ?? null;
    }

    /**
     * Check if field type exists
     */
    public static function exists(string $type): bool
    {
        self::initialize();
        return isset(self::$fieldTypes[$type]);
    }

    /**
     * Get all registered field types
     */
    public static function getAll(): array
    {
        self::initialize();
        return self::$fieldTypes;
    }

    /**
     * Get field type names
     */
    public static function getTypes(): array
    {
        self::initialize();
        return array_keys(self::$fieldTypes);
    }

    /**
     * Validate field value by type
     */
    public static function validate(string $type, $value, array $rules = []): array
    {
        $field = self::get($type);
        if (!$field) {
            return ['Unknown field type: ' . $type];
        }

        return $field->validate($value, $rules);
    }

    /**
     * Sanitize field value by type
     */
    public static function sanitize(string $type, $value): mixed
    {
        $field = self::get($type);
        if (!$field) {
            return $value;
        }

        return $field->sanitize($value);
    }

    /**
     * Render field by type
     */
    public static function render(string $type, array $config, $value = null): ?array
    {
        $field = self::get($type);
        if (!$field) {
            return null;
        }

        return $field->render($config, $value);
    }

    /**
     * Get field schema by type
     */
    public static function getSchema(string $type): ?array
    {
        $field = self::get($type);
        if (!$field) {
            return null;
        }

        return $field->getSchema();
    }

    /**
     * Get all field schemas
     */
    public static function getAllSchemas(): array
    {
        self::initialize();
        $schemas = [];

        foreach (self::$fieldTypes as $type => $field) {
            $schemas[$type] = $field->getSchema();
        }

        return $schemas;
    }

    /**
     * Process widget fields configuration
     */
    public static function processFields(array $fields): array
    {
        $processed = [];

        foreach ($fields as $fieldKey => $fieldConfig) {
            if ($fieldConfig['type'] === 'group') {
                // Process group fields recursively
                $processed[$fieldKey] = [
                    'type' => 'group',
                    'label' => $fieldConfig['label'] ?? '',
                    'fields' => self::processFields($fieldConfig['fields'] ?? [])
                ];
            } else {
                // Process individual field
                $fieldType = $fieldConfig['type'];
                $field = self::get($fieldType);

                if ($field) {
                    $processed[$fieldKey] = array_merge(
                        $field->getSchema(),
                        $fieldConfig,
                        [
                            'rendered' => $field->render($fieldConfig, $fieldConfig['default'] ?? null)
                        ]
                    );
                } else {
                    // Unknown field type, keep as-is with warning
                    $processed[$fieldKey] = array_merge($fieldConfig, [
                        'error' => 'Unknown field type: ' . $fieldType
                    ]);
                }
            }
        }

        return $processed;
    }

    /**
     * Validate all fields in a group
     */
    public static function validateFields(array $fields, array $values): array
    {
        $errors = [];

        foreach ($fields as $fieldKey => $fieldConfig) {
            if ($fieldConfig['type'] === 'group') {
                // Validate group fields recursively
                $groupErrors = self::validateFields(
                    $fieldConfig['fields'] ?? [],
                    $values[$fieldKey] ?? []
                );
                
                if (!empty($groupErrors)) {
                    $errors[$fieldKey] = $groupErrors;
                }
            } else {
                // Validate individual field
                $fieldValue = $values[$fieldKey] ?? null;
                $fieldErrors = self::validate($fieldConfig['type'], $fieldValue, $fieldConfig);
                
                if (!empty($fieldErrors)) {
                    $errors[$fieldKey] = $fieldErrors;
                }
            }
        }

        return $errors;
    }

    /**
     * Sanitize all fields in a group
     */
    public static function sanitizeFields(array $fields, array $values): array
    {
        $sanitized = [];

        foreach ($fields as $fieldKey => $fieldConfig) {
            if ($fieldConfig['type'] === 'group') {
                // Sanitize group fields recursively
                $sanitized[$fieldKey] = self::sanitizeFields(
                    $fieldConfig['fields'] ?? [],
                    $values[$fieldKey] ?? []
                );
            } else {
                // Sanitize individual field
                $fieldValue = $values[$fieldKey] ?? null;
                $sanitized[$fieldKey] = self::sanitize($fieldConfig['type'], $fieldValue);
            }
        }

        return $sanitized;
    }

    /**
     * Clear registry (useful for testing)
     */
    public static function clear(): void
    {
        self::$fieldTypes = [];
        self::$initialized = false;
    }
}
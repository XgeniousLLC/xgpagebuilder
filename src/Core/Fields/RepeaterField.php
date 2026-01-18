<?php

namespace Xgenious\PageBuilder\Core\Fields;

use Xgenious\PageBuilder\Core\FieldManager;

class RepeaterField extends BaseField
{
    protected string $type = 'repeater';
    protected array $fields = [];
    protected int $min = 0;
    protected int $max = 100;
    protected string $itemLabel = 'Item';
    protected string $addButtonText = 'Add Item';

    /**
     * Set fields using flexible field definition method
     *
     * Usage:
     * ->setFields([
     *     'fieldId' => FieldManager::ANY_TYPE()->setLabel('User Label'),
     *     // fieldId = data access key: $item['fieldId']
     *     // label = what user sees in interface
     * ])
     *
     * @param array $fields Array of field definitions where key=fieldId, value=FieldManager field object
     * @return static
     * @throws \InvalidArgumentException If field validation fails
     */
    public function setFields(array $fields): static
    {
        $this->validateFields($fields);
        $this->fields = $fields;
        return $this;
    }

    /**
     * Validate field definitions and provide helpful error messages
     *
     * @param array $fields
     * @throws \InvalidArgumentException
     */
    protected function validateFields(array $fields): void
    {
        foreach ($fields as $fieldId => $fieldDefinition) {
            // Check if fieldId is a string
            if (!is_string($fieldId) || empty($fieldId)) {
                throw new \InvalidArgumentException(
                    "Repeater field keys must be non-empty strings. Invalid key found."
                );
            }

            // Check if field definition is an object
            if (!is_object($fieldDefinition)) {
                throw new \InvalidArgumentException(
                    "Field '{$fieldId}' must be a FieldManager field object, " .
                    gettype($fieldDefinition) . " given. Example: FieldManager::TEXT()->setLabel('Label')"
                );
            }

            // Check if field has required methods
            if (!method_exists($fieldDefinition, 'toArray')) {
                $className = get_class($fieldDefinition);
                throw new \InvalidArgumentException(
                    "Field '{$fieldId}' (class: {$className}) must be a valid FieldManager field object with toArray() method. " .
                    "Use FieldManager::TEXT(), FieldManager::IMAGE(), etc."
                );
            }

            // Validate field configuration
            try {
                $fieldConfig = $fieldDefinition->toArray();

                if (!isset($fieldConfig['type']) || empty($fieldConfig['type'])) {
                    throw new \InvalidArgumentException(
                        "Field '{$fieldId}' is missing required 'type' property. " .
                        "Ensure you're using valid FieldManager methods."
                    );
                }

                // Warn about common mistakes
                if (!isset($fieldConfig['label']) || empty($fieldConfig['label'])) {
                    error_log("Warning: Field '{$fieldId}' in repeater has no label. Consider adding ->setLabel('Your Label')");
                }

            } catch (\Exception $e) {
                throw new \InvalidArgumentException(
                    "Field '{$fieldId}' configuration is invalid: " . $e->getMessage()
                );
            }
        }
    }

    /**
     * Add a single field to the repeater with universal field support
     *
     * @param string $fieldId The internal field identifier (e.g., 'image', 'title', 'description')
     * @param BaseField $fieldDefinition Any FieldManager field type
     * @return static
     */
    public function addField(string $fieldId, BaseField $fieldDefinition): static
    {
        // Validate that we have a proper field object
        if (!method_exists($fieldDefinition, 'toArray')) {
            throw new \InvalidArgumentException(
                "Field '{$fieldId}' must be a valid FieldManager field object with toArray() method"
            );
        }

        $this->fields[$fieldId] = $fieldDefinition;
        return $this;
    }

    /**
     * Set minimum number of items
     */
    public function setMin(int $min): static
    {
        $this->min = $min;
        return $this;
    }

    /**
     * Set maximum number of items
     */
    public function setMax(int $max): static
    {
        $this->max = $max;
        return $this;
    }

    /**
     * Set the label for individual items (e.g., "Gallery Item", "Team Member", "Testimonial")
     */
    public function setItemLabel(string $label): static
    {
        $this->itemLabel = $label;
        return $this;
    }

    /**
     * Set the text for the add button
     */
    public function setAddButtonText(string $text): static
    {
        $this->addButtonText = $text;
        return $this;
    }


    /**
     * Check if a field should be visible based on conditional logic
     *
     * @param array $fieldConfig
     * @param array $itemData Current repeater item data
     * @return bool
     */
    protected function shouldShowField(array $fieldConfig, array $itemData): bool
    {
        if (!isset($fieldConfig['condition'])) {
            return true;
        }

        $condition = $fieldConfig['condition'];

        // Simple field dependency check
        if (is_array($condition) && isset($condition['field'], $condition['value'])) {
            $dependentField = $condition['field'];
            $expectedValue = $condition['value'];

            // Check if dependent field exists and has expected value
            if (!isset($itemData[$dependentField])) {
                return false;
            }

            // Handle different comparison types
            $operator = $condition['operator'] ?? '=';
            $actualValue = $itemData[$dependentField];

            switch ($operator) {
                case '=':
                case '==':
                    return $actualValue == $expectedValue;
                case '!=':
                    return $actualValue != $expectedValue;
                case 'in':
                    return is_array($expectedValue) && in_array($actualValue, $expectedValue);
                case 'not_in':
                    return is_array($expectedValue) && !in_array($actualValue, $expectedValue);
                case 'not_empty':
                    return !empty($actualValue);
                case 'empty':
                    return empty($actualValue);
                default:
                    return $actualValue == $expectedValue;
            }
        }

        return true;
    }

    protected function getTypeSpecificConfig(): array
    {
        // Convert field objects to arrays and add conditional logic support
        $processedFields = [];
        foreach ($this->fields as $key => $field) {
            if (is_object($field) && method_exists($field, 'toArray')) {
                $fieldConfig = $field->toArray();

                // Add field dependency information if available
                if (method_exists($field, 'getCondition')) {
                    $condition = $field->getCondition();
                    if ($condition) {
                        $fieldConfig['condition'] = $condition;
                    }
                }

                $processedFields[$key] = $fieldConfig;
            } else {
                $processedFields[$key] = $field;
            }
        }

        return [
            'fields' => $processedFields,
            'min' => $this->min,
            'max' => $this->max,
            'itemLabel' => $this->itemLabel,
            'addButtonText' => $this->addButtonText,
            'hasConditionalFields' => $this->hasConditionalFields(),
        ];
    }

    /**
     * Check if any fields have conditional logic
     *
     * @return bool
     */
    protected function hasConditionalFields(): bool
    {
        foreach ($this->fields as $field) {
            if (is_object($field) && method_exists($field, 'getCondition')) {
                if ($field->getCondition()) {
                    return true;
                }
            }
        }
        return false;
    }
}
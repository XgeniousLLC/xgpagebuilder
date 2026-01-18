<?php

namespace Xgenious\PageBuilder\Core\Fields;

/**
 * IconInputField - Field for selecting icons from Line Awesome library
 *
 * Provides a visual icon picker interface that opens a modal with searchable
 * icon grid. Stores the selected icon's CSS class name.
 *
 * @package Plugins\Pagebuilder\Core\Fields
 */
class IconInputField extends BaseField
{
    protected string $type = 'icon_input';

    /** @var string Default icon class */
    protected string $defaultIcon = '';

    /** @var array<string> Allowed icon categories */
    protected array $allowedCategories = [];

    /** @var string Icon preview size (small, medium, large) */
    protected string $previewSize = 'medium';

    /** @var bool Whether empty value is allowed */
    protected bool $allowEmpty = true;

    /** @var string Modal title */
    protected string $modalTitle = 'Select Icon';

    /**
     * Create a new icon input field
     *
     * @param string $default Default icon class
     * @return static
     */
    public static function create(string $default = ''): static
    {
        $instance = new static();
        $instance->default = $default;
        $instance->defaultIcon = $default;
        return $instance;
    }

    /**
     * Set the default icon
     *
     * @param string $iconClass Default icon class (e.g., 'las la-home')
     * @return static
     */
    public function setDefaultIcon(string $iconClass): static
    {
        $this->defaultIcon = $iconClass;
        $this->default = $iconClass;
        return $this;
    }

    /**
     * Set allowed icon categories
     *
     * @param array<string> $categories Array of category names
     * @return static
     */
    public function setCategories(array $categories): static
    {
        $this->allowedCategories = $categories;
        return $this;
    }

    /**
     * Set icon preview size
     *
     * @param string $size Size: 'small', 'medium', 'large'
     * @return static
     */
    public function setPreviewSize(string $size): static
    {
        $this->previewSize = $size;
        return $this;
    }

    /**
     * Set whether empty value is allowed
     *
     * @param bool $allow Whether to allow empty selection
     * @return static
     */
    public function setAllowEmpty(bool $allow): static
    {
        $this->allowEmpty = $allow;
        return $this;
    }

    /**
     * Set modal title
     *
     * @param string $title Modal title text
     * @return static
     */
    public function setModalTitle(string $title): static
    {
        $this->modalTitle = $title;
        return $this;
    }

    /**
     * Get field configuration array for frontend
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'label' => $this->label,
            'default' => $this->default,
            'required' => $this->required,
            'placeholder' => $this->placeholder,
            'description' => $this->description,
            'condition' => $this->condition,
            'validation' => array_merge($this->validation, [
                'icon_class' => true, // Custom validation rule for icon classes
            ]),
            'attributes' => array_merge($this->attributes, [
                'defaultIcon' => $this->defaultIcon,
                'allowedCategories' => $this->allowedCategories,
                'previewSize' => $this->previewSize,
                'allowEmpty' => $this->allowEmpty,
                'modalTitle' => $this->modalTitle,
            ]),
            'cssClass' => $this->cssClass,
            'responsive' => $this->responsive,
            'selectors' => $this->selectors,
        ];
    }

    /**
     * Validate the field value
     *
     * @param mixed $value Value to validate
     * @return array<string, string> Validation errors
     */
    public function validate(mixed $value): array
    {
        $errors = [];

        // Check if field is required and value is empty
        if ($this->required && empty($value)) {
            $errors['required'] = 'This field is required.';
            return $errors;
        }

        // If value is empty and empty is allowed, skip further validation
        if (empty($value) && $this->allowEmpty) {
            return $errors;
        }

        // Validate icon class format
        if (!empty($value) && !$this->isValidIconClass($value)) {
            $errors['format'] = 'Invalid icon class format. Expected format: "las la-icon-name"';
        }

        // Validate icon exists in Line Awesome library
        if (!empty($value) && !$this->iconExists($value)) {
            $errors['exists'] = 'Selected icon does not exist in the icon library.';
        }

        // Validate category restrictions
        if (!empty($value) && !empty($this->allowedCategories) && !$this->iconInAllowedCategory($value)) {
            $errors['category'] = 'Selected icon is not in allowed categories: ' . implode(', ', $this->allowedCategories);
        }

        return $errors;
    }

    /**
     * Check if value is a valid icon class format
     *
     * @param string $value Icon class to validate
     * @return bool
     */
    private function isValidIconClass(string $value): bool
    {
        // Check for Line Awesome format: "las la-icon-name", "lar la-icon-name", "lab la-icon-name"
        return preg_match('/^la[brs]?\s+la-[a-zA-Z0-9\-]+$/', $value) === 1;
    }

    /**
     * Check if icon exists in Line Awesome library
     *
     * @param string $iconClass Icon class to check
     * @return bool
     */
    private function iconExists(string $iconClass): bool
    {
        try {
            $iconService = app(\Plugins\Pagebuilder\Services\IconService::class);
            return $iconService->validateIcon($iconClass);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check if icon is in allowed categories
     *
     * @param string $iconClass Icon class to check
     * @return bool
     */
    private function iconInAllowedCategory(string $iconClass): bool
    {
        if (empty($this->allowedCategories)) {
            return true;
        }

        try {
            $iconService = app(\Plugins\Pagebuilder\Services\IconService::class);
            $allIcons = $iconService->getAllIcons();

            foreach ($allIcons as $icon) {
                if ($icon['cssClass'] === $iconClass) {
                    $iconCategories = $icon['categories'];
                    return !empty(array_intersect($iconCategories, $this->allowedCategories));
                }
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Sanitize the field value
     *
     * @param mixed $value Value to sanitize
     * @return string
     */
    public function sanitize(mixed $value): string
    {
        if (empty($value)) {
            return '';
        }

        // Remove extra whitespace and ensure proper format
        $value = trim($value);

        // If it's just the icon name without prefix, add 'las' prefix (default to solid)
        if (preg_match('/^la-[a-zA-Z0-9\-]+$/', $value)) {
            $value = 'las ' . $value;
        }

        return $value;
    }

    /**
     * Get CSS for the icon
     *
     * @param mixed $value Icon class value
     * @param string $selector CSS selector
     * @return string CSS rules
     */
    public function generateCSS(mixed $value, string $selector = ''): string
    {
        if (empty($value)) {
            return '';
        }

        $css = '';
        $iconClass = $this->sanitize($value);

        if (!empty($selector)) {
            // Generate CSS for icon display
            $css .= "{$selector}:before {\n";
            $css .= "    font-family: 'Line Awesome Free', 'Line Awesome Solid', sans-serif;\n";
            $css .= "    font-weight: 900;\n";
            $css .= "    display: inline-block;\n";
            $css .= "    font-style: normal;\n";
            $css .= "    font-variant: normal;\n";
            $css .= "    text-rendering: auto;\n";
            $css .= "    line-height: 1;\n";
            $css .= "}\n";

            // Add size-specific styles if preview size is set
            if ($this->previewSize === 'small') {
                $css .= "{$selector} { font-size: 0.875em; }\n";
            } elseif ($this->previewSize === 'large') {
                $css .= "{$selector} { font-size: 1.5em; }\n";
            }
        }

        return $css;
    }

    /**
     * Get the field type
     *
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }
}
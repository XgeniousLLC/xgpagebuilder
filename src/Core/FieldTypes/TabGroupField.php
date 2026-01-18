<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

use Xgenious\PageBuilder\Core\FieldTypes\FieldInterface;
use Xgenious\PageBuilder\Core\Fields\BaseField;

/**
 * TabGroupField - Creates tabbed field groups for dynamic styling states
 * 
 * Enables creation of tabbed interfaces within field groups, perfect for
 * managing different states like normal/hover/active styling.
 * 
 * Usage:
 * FieldManager::TAB_GROUP([
 *     'normal' => [
 *         'label' => 'Normal State',
 *         'icon' => 'MousePointer',
 *         'fields' => [
 *             'border_width' => FieldManager::NUMBER(),
 *             'border_color' => FieldManager::COLOR()
 *         ]
 *     ],
 *     'hover' => [
 *         'label' => 'Hover State', 
 *         'icon' => 'MousePointer2',
 *         'fields' => [
 *             'border_width' => FieldManager::NUMBER(),
 *             'border_color' => FieldManager::COLOR()
 *         ]
 *     ]
 * ])
 * 
 * Simplified usage (auto-generates labels):
 * FieldManager::TAB_GROUP([
 *     'normal' => ['border_width' => FieldManager::NUMBER()],
 *     'hover' => ['border_width' => FieldManager::NUMBER()]
 * ])
 */
class TabGroupField implements FieldInterface
{

    protected array $tabs = [];
    protected string $defaultTab = 'normal';
    protected bool $allowStateCopy = true;
    protected array $tabLabels = [];
    protected array $tabIcons = [];
    protected bool $showTabLabels = true;
    protected string $tabStyle = 'default'; // default, pills, underline
    protected string $description = '';

    /**
     * Initialize with tab configuration
     */
    public function __construct(array $tabs = [])
    {
        $this->tabs = $tabs;
    }

    /**
     * Add a tab to the group
     */
    public function addTab(string $key, array $fields, string $label = null, string $icon = null): self
    {
        $this->tabs[$key] = $fields;
        if ($label) {
            $this->tabLabels[$key] = $label;
        }
        if ($icon) {
            $this->tabIcons[$key] = $icon;
        }
        return $this;
    }

    /**
     * Add a custom tab with detailed configuration
     */
    public function addCustomTab(string $key, string $label, array $fields, string $icon = null): self
    {
        $this->tabs[$key] = [
            'label' => $label,
            'icon' => $icon,
            'fields' => $fields
        ];
        return $this;
    }

    /**
     * Set which tab should be active by default
     */
    public function setDefaultTab(string $tab): self
    {
        $this->defaultTab = $tab;
        return $this;
    }

    /**
     * Enable/disable copying state from one tab to another
     */
    public function allowStateCopy(bool $allow = true): self
    {
        $this->allowStateCopy = $allow;
        return $this;
    }

    /**
     * Set custom labels for tabs
     */
    public function setTabLabels(array $labels): self
    {
        $this->tabLabels = $labels;
        return $this;
    }

    /**
     * Set icons for tabs (Lucide icon names)
     */
    public function setTabIcons(array $icons): self
    {
        $this->tabIcons = $icons;
        return $this;
    }

    /**
     * Set tab display style
     */
    public function setTabStyle(string $style): self
    {
        $this->tabStyle = in_array($style, ['default', 'pills', 'underline']) ? $style : 'default';
        return $this;
    }

    /**
     * Show/hide tab labels
     */
    public function showLabels(bool $show = true): self
    {
        $this->showTabLabels = $show;
        return $this;
    }

    /**
     * Set description text for the field
     */
    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Get description text
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * Render the field configuration
     */
    public function render(array $config, $value = null): array
    {
        return [
            'type' => 'tab_group',
            'tabs' => $this->processTabs(),
            'default_tab' => $this->defaultTab,
            'allow_copy' => $this->allowStateCopy,
            'tab_labels' => $this->tabLabels,
            'tab_icons' => $this->tabIcons,
            'show_labels' => $this->showTabLabels,
            'tab_style' => $this->tabStyle,
            'description' => $this->description,
            'value' => $value
        ];
    }

    /**
     * Process tabs configuration for frontend
     */
    private function processTabs(): array
    {
        $processedTabs = [];
        
        foreach ($this->tabs as $tabKey => $tabConfig) {
            // Handle both simple array format and detailed configuration
            if (isset($tabConfig['fields'])) {
                // Detailed format: ['label' => '...', 'icon' => '...', 'fields' => [...]]
                $processedTabs[$tabKey] = [
                    'label' => $tabConfig['label'] ?? $this->getTabLabel($tabKey),
                    'icon' => $tabConfig['icon'] ?? $this->tabIcons[$tabKey] ?? null,
                    'fields' => $this->processTabFields($tabConfig['fields'])
                ];
            } else {
                // Simple format: ['field1' => FieldManager::TEXT(), ...]
                $processedTabs[$tabKey] = [
                    'label' => $this->getTabLabel($tabKey),
                    'icon' => $this->tabIcons[$tabKey] ?? null,
                    'fields' => $this->processTabFields($tabConfig)
                ];
            }
        }
        
        return $processedTabs;
    }

    /**
     * Get display label for a tab
     */
    private function getTabLabel(string $tabKey): string
    {
        if (isset($this->tabLabels[$tabKey])) {
            return $this->tabLabels[$tabKey];
        }
        
        // Auto-generate label from key
        return ucfirst(str_replace(['_', '-'], ' ', $tabKey));
    }

    /**
     * Process fields within a tab
     */
    private function processTabFields(array $fields): array
    {
        $processedFields = [];
        
        foreach ($fields as $fieldKey => $field) {
            if ($field instanceof FieldInterface) {
                $processedFields[$fieldKey] = $field->render([], null);
            } elseif ($field instanceof BaseField) {
                $processedFields[$fieldKey] = $field->toArray();
            } else {
                // Handle array configuration
                $processedFields[$fieldKey] = $field;
            }
        }
        
        return $processedFields;
    }

    /**
     * Validate tab group value
     */
    public function validate($value, array $rules = []): array
    {
        $errors = [];
        
        if (!is_array($value)) {
            return $errors;
        }
        
        // Basic validation - can be extended as needed
        foreach ($this->tabs as $tabKey => $tabConfig) {
            if (isset($value[$tabKey]) && !is_array($value[$tabKey])) {
                $errors[$tabKey] = ['Invalid tab value format'];
            }
        }
        
        return $errors;
    }

    /**
     * Sanitize tab group value
     */
    public function sanitize($value): array
    {
        if (!is_array($value)) {
            return [];
        }
        
        $sanitized = [];
        
        foreach ($this->tabs as $tabKey => $tabConfig) {
            if (isset($value[$tabKey]) && is_array($value[$tabKey])) {
                $sanitized[$tabKey] = $value[$tabKey];
            }
        }
        
        return $sanitized;
    }

    /**
     * Get default value structure
     */
    public function getDefaultValue(): array
    {
        $defaultValue = [];
        
        foreach ($this->tabs as $tabKey => $tabConfig) {
            $defaultValue[$tabKey] = [];
        }
        
        return $defaultValue;
    }

    /**
     * Get the field type identifier
     */
    public function getType(): string
    {
        return 'tab_group';
    }

    /**
     * Get field schema for API responses
     */
    public function getSchema(): array
    {
        return [
            'type' => 'tab_group',
            'tabs' => array_keys($this->tabs),
            'default_tab' => $this->defaultTab,
            'allow_copy' => $this->allowStateCopy,
            'tab_style' => $this->tabStyle
        ];
    }

    /**
     * Convert field to array format for ControlManager compatibility
     */
    public function toArray(): array
    {
        return $this->render([], null);
    }

    /**
     * Create a style state tab group (normal/hover/active/focus)
     */
    public static function styleStates(array $states = ['normal', 'hover'], array $fields = []): self
    {
        $tabs = [];
        
        foreach ($states as $state) {
            $tabs[$state] = $fields;
        }
        
        return (new self($tabs))
            ->setTabLabels([
                'normal' => 'Normal',
                'hover' => 'Hover',
                'active' => 'Active',
                'focus' => 'Focus',
                'disabled' => 'Disabled'
            ])
            ->setTabIcons([
                'normal' => 'MousePointer',
                'hover' => 'MousePointer2',
                'active' => 'Hand',
                'focus' => 'Target',
                'disabled' => 'Ban'
            ])
            ->setTabStyle('pills')
            ->allowStateCopy(true);
    }

    /**
     * Create a responsive tab group (desktop/tablet/mobile)
     */
    public static function responsive(array $fields = []): self
    {
        return (new self([
            'desktop' => $fields,
            'tablet' => $fields,
            'mobile' => $fields
        ]))
        ->setTabLabels([
            'desktop' => 'Desktop',
            'tablet' => 'Tablet',
            'mobile' => 'Mobile'
        ])
        ->setTabIcons([
            'desktop' => 'Monitor',
            'tablet' => 'Tablet',
            'mobile' => 'Smartphone'
        ])
        ->setTabStyle('underline')
        ->setDefaultTab('desktop')
        ->allowStateCopy(true);
    }
}
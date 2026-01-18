<?php

namespace Xgenious\PageBuilder\Core;

/**
 * Adapter for Legacy PageBuilderBase Addons
 * 
 * This adapter allows old addons (from HelpNest and other projects)
 * to work with the new page builder package without modification.
 * 
 * Old addons extend PageBuilderBase and use admin_render() / frontend_render()
 * This adapter bridges them to work with the new BaseWidget system.
 * 
 * Usage: Legacy addons should extend this class and implement:
 * - getGeneralFields() - Return field definitions using ControlManager
 * - frontend_render() - Return rendered HTML
 * 
 * @package Xgenious\PageBuilder\Core
 */
abstract class LegacyAddonAdapter extends BaseWidget
{
    /**
     * Legacy addon properties
     */
    protected string $addon_name = '';
    protected string $addon_title = '';
    protected string $addon_description = '';
    protected string $category = 'content';
    protected string $icon = 'la-puzzle-piece';
    
    /**
     * Stored settings for rendering
     */
    protected array $settings = [];
    
    /**
     * Legacy methods - only frontend_render is required
     */
    abstract public function frontend_render();
    
    /**
     * Optional admin_render for backward compatibility
     * Not used by new system - override getGeneralFields() instead
     */
    public function admin_render()
    {
        return '';
    }
    
    /**
     * Map legacy properties to new BaseWidget methods
     */
    protected function getWidgetType(): string
    {
        return $this->addon_name ?: $this->toKebabCase(class_basename($this));
    }
    
    protected function getWidgetName(): string
    {
        return $this->addon_title ?: $this->toTitleCase(class_basename($this));
    }
    
    protected function getWidgetDescription(): string
    {
        return $this->addon_description ?: '';
    }
    
    protected function getCategory(): string
    {
        return $this->category;
    }
    
    protected function getWidgetIcon(): string|array
    {
        return $this->icon;
    }
    
    /**
     * Convert class name to kebab-case for widget type
     */
    protected function toKebabCase(string $value): string
    {
        return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $value));
    }
    
    /**
     * Convert class name to title case for display name
     */
    protected function toTitleCase(string $value): string
    {
        return trim(preg_replace('/([A-Z])/', ' $1', $value));
    }
    
    /**
     * Legacy addons should override this method to define their fields
     * Uses the new ControlManager and FieldManager system
     * 
     * Example:
     * public function getGeneralFields(): array
     * {
     *     $control = new ControlManager();
     *     $control->addGroup('content', 'Content')
     *         ->registerField('title', FieldManager::TEXT()->setLabel('Title'))
     *         ->registerField('description', FieldManager::TEXTAREA()->setLabel('Description'))
     *         ->endGroup();
     *     return $control->getFields();
     * }
     */
    public function getGeneralFields(): array
    {
        return [];
    }
    
    /**
     * Style fields - legacy addons can override this
     */
    public function getStyleFields(): array
    {
        // Return basic style fields that work for most legacy addons
        $control = new ControlManager();
        
        $control->addGroup('spacing', 'Spacing')
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
            )
            ->registerField('margin', FieldManager::DIMENSION()
                ->setLabel('Margin')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
            )
            ->endGroup();
        
        $control->addGroup('background', 'Background')
            ->registerField('background', FieldManager::BACKGROUND_GROUP()
                ->setLabel('Background')
                ->setAllowedTypes(['none', 'color', 'gradient', 'image'])
            )
            ->endGroup();
        
        return $control->getFields();
    }
    
    /**
     * Use legacy frontend_render() for rendering
     * Automatically extracts settings from general tab
     */
    public function render(array $settings = []): string
    {
        // Merge settings from all tabs for legacy compatibility
        $this->settings = $this->flattenSettings($settings);
        
        try {
            return $this->frontend_render();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Legacy addon render error: ' . $e->getMessage(), [
                'addon' => get_class($this),
                'settings' => $this->settings
            ]);
            return '<div class="widget-error">Error rendering widget: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
    }
    
    /**
     * Flatten settings from tabs/groups into a single array
     * This allows legacy addons to access settings directly
     */
    protected function flattenSettings(array $settings): array
    {
        $flattened = [];
        
        // Get settings from 'general' tab which contains the main content
        $general = $settings['general'] ?? [];
        foreach ($general as $groupKey => $groupData) {
            if (is_array($groupData)) {
                // If it's a group, merge its fields
                foreach ($groupData as $fieldKey => $value) {
                    $flattened[$fieldKey] = $value;
                }
            } else {
                // Direct field
                $flattened[$groupKey] = $groupData;
            }
        }
        
        // Also check for direct fields in settings root
        foreach ($settings as $key => $value) {
            if (!in_array($key, ['general', 'style', 'advanced']) && !isset($flattened[$key])) {
                $flattened[$key] = $value;
            }
        }
        
        return $flattened;
    }
    
    /**
     * Get settings for legacy render methods
     * Returns flattened settings array
     */
    protected function get_settings(): array
    {
        return $this->settings;
    }
    
    /**
     * Get a single setting value with optional default
     */
    protected function getSetting(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }
    
    /**
     * Legacy helper methods for compatibility
     */
    protected function admin_form_before()
    {
        return '';
    }
    
    protected function admin_form_start()
    {
        return '';
    }
    
    protected function admin_form_end()
    {
        return '';
    }
    
    protected function admin_form_submit_button()
    {
        return '';
    }
    
    protected function admin_form_after()
    {
        return '';
    }
    
    protected function default_fields()
    {
        return '';
    }

    /**
     * Render a blade view with data
     * Used by legacy addons to render their frontend templates
     * 
     * Automatically provides both:
     * - Individual variables (e.g., $title, $description)
     * - The $settings array for backwards compatibility with legacy views
     */
    protected function renderBlade(string $view, array $data = []): string
    {
        try {
            // Convert view path format (e.g., 'home/hero-section' -> 'home.hero-section')
            $viewPath = str_replace('/', '.', $view);
            
            // Prepare view data: include both individual vars AND $settings for legacy compatibility
            // This allows blade views to use either $settings['key'] or $key syntax
            $viewData = $data;
            
            // If 'settings' key doesn't exist, add the entire data array as 'settings'
            // This supports legacy views that use $settings['field_name'] syntax
            if (!isset($viewData['settings'])) {
                $viewData['settings'] = $data;
            }
            
            // Try pagebuilder namespace first (registered in AppServiceProvider)
            $pagebuilderView = 'pagebuilder::' . $viewPath;
            if (view()->exists($pagebuilderView)) {
                return view($pagebuilderView, $viewData)->render();
            }
            
            // Try direct view path (some views might be in main views folder)
            if (view()->exists($viewPath)) {
                return view($viewPath, $viewData)->render();
            }
            
            // Fall back to frontend pages view path
            $frontendView = 'frontend.pages.' . $viewPath;
            if (view()->exists($frontendView)) {
                return view($frontendView, $viewData)->render();
            }
            
            \Illuminate\Support\Facades\Log::warning('View not found: ' . $view, [
                'tried_paths' => [$pagebuilderView, $viewPath, $frontendView]
            ]);
            
            return '<div class="widget-error">View not found: ' . htmlspecialchars($view) . '</div>';
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Blade render error: ' . $e->getMessage(), [
                'view' => $view,
                'data_keys' => array_keys($data),
                'exception' => $e->getTraceAsString()
            ]);
            return '<div class="widget-error">Error rendering view: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
    }
    
    /**
     * Check if this addon is enabled
     */
    public function enable(): bool
    {
        return true;
    }
    
    /**
     * Get addon title for display
     */
    public function addon_title()
    {
        return $this->addon_title ?: $this->getWidgetName();
    }
    
    /**
     * Get addon name
     */
    public function addon_name()
    {
        return $this->addon_name ?: $this->getWidgetType();
    }
    
    /**
     * Get addon namespace
     */
    public function addon_namespace()
    {
        return static::class;
    }
    
    /**
     * Get preview image path
     */
    public function preview_image()
    {
        return '';
    }
    
    /**
     * Get preview image with full path
     */
    public function get_preview_image($image_name): string
    {
        if (empty($image_name)) {
            return '';
        }
        return asset('assets/img/page-builder/' . $image_name);
    }
}

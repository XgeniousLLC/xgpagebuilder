<?php

namespace Xgenious\PageBuilder\Services;

use Xgenious\PageBuilder\Core\CSSManager;
use Xgenious\PageBuilder\Core\SectionLayoutCSSGenerator;

/**
 * PageBuilderRenderService
 * 
 * Handles the rendering of page builder content and manages CSS output
 * for the page header. This service coordinates between individual widget
 * rendering and the consolidated CSS system.
 * 
 * @package App\Services
 */
class PageBuilderRenderService
{
    /**
     * Render page builder content and collect CSS
     * 
     * @param array $pageContent Page builder JSON content
     * @return array Rendered content and CSS
     */
    public function renderPageContent(array $pageContent): array
    {
        // Clear any previous CSS collection
        CSSManager::clearCSS();
        
        $renderedHTML = '';
        
        if (isset($pageContent['containers'])) {
            foreach ($pageContent['containers'] as $container) {
                $renderedHTML .= $this->renderContainer($container);
            }
        }
        
        // Get consolidated CSS
        $consolidatedCSS = CSSManager::getConsolidatedCSS();
        
        return [
            'html' => $renderedHTML,
            'css' => $consolidatedCSS,
            'stats' => CSSManager::getStats()
        ];
    }
    
    /**
     * Render a container with its columns and widgets
     */
    private function renderContainer(array $container): string
    {
        $containerId = $container['id'] ?? 'container-' . uniqid();
        $settings = $container['settings'] ?? [];
        $responsiveSettings = $container['responsiveSettings'] ?? [];

        // Generate and collect section CSS
        CSSManager::addSectionCSS($containerId, $settings, $responsiveSettings);

        // Build CSS classes for section
        $classes = ['pb-section', "pb-section-{$containerId}"];

        // Add layout class if contentWidth is set
        if (isset($settings['contentWidth'])) {
            $classes[] = "section-layout-{$settings['contentWidth']}";
        }

        // Add custom CSS classes
        if (isset($settings['cssClass'])) {
            $customClasses = explode(' ', trim($settings['cssClass']));
            $classes = array_merge($classes, array_filter($customClasses));
        }

        $classString = implode(' ', $classes);

        // Build section attributes
        $attributes = ['class' => $classString];
        if (isset($settings['htmlId'])) {
            $attributes['id'] = $settings['htmlId'];
        }

        $attributeString = $this->buildAttributeString($attributes);

        $html = "<section {$attributeString}>";
        $html .= '<div class="section-inner">';

        if (isset($container['columns'])) {
            $html .= '<div class="xgp_row">';

            foreach ($container['columns'] as $column) {
                $html .= $this->renderColumn($column, $containerId);
            }

            $html .= '</div>';
        }

        $html .= '</div>';
        $html .= '</section>';

        return $html;
    }
    
    /**
     * Render a column with its widgets
     */
    private function renderColumn(array $column, string $containerId = ''): string
    {
        $columnId = $column['id'] ?? 'column-' . uniqid();
        $settings = $column['settings'] ?? [];
        $responsiveSettings = $column['responsiveSettings'] ?? [];
        $colSize = $column['size'] ?? 12;

        // Generate and collect column CSS
        CSSManager::addColumnCSS($columnId, $settings, $responsiveSettings);

        // Build CSS classes for column
        $classes = ['pb-column', "pb-column-{$columnId}", 'xgp_column', "xgp_col_{$colSize}"];

        // Add custom CSS classes
        if (isset($settings['customClasses'])) {
            $customClasses = explode(' ', trim($settings['customClasses']));
            $classes = array_merge($classes, array_filter($customClasses));
        }

        $classString = implode(' ', $classes);

        // Build column attributes
        $attributes = ['class' => $classString];
        if (isset($settings['customId'])) {
            $attributes['id'] = $settings['customId'];
        }

        $attributeString = $this->buildAttributeString($attributes);

        $html = "<div {$attributeString}>";

        if (isset($column['widgets'])) {
            foreach ($column['widgets'] as $widget) {
                $html .= $this->renderWidget($widget);
            }
        }

        $html .= '</div>';

        return $html;
    }
    
    /**
     * Render a single widget
     */
    private function renderWidget(array $widget): string
    {
        $widgetType = $widget['type'] ?? '';
        $widgetId = $widget['id'] ?? 'widget-' . uniqid();
        
        // Prepare complete widget data with all settings
        // Widget data structure from getCompleteContent includes: general, style, advanced
        $widgetData = [
            'general' => $widget['general'] ?? $widget['content'] ?? [],
            'style' => $widget['style'] ?? [],
            'advanced' => $widget['advanced'] ?? [],
            'settings' => $widget['settings'] ?? [], // For backward compatibility
        ];
        
        // Get widget instance and render
        $widgetInstance = $this->getWidgetInstance($widgetType);
        
        if (!$widgetInstance) {
            return "<!-- Widget type '{$widgetType}' not found -->";
        }
        
        try {
            // Generate CSS for the widget and register it with CSSManager
            // This ensures that styles are applied on the frontend
            if (method_exists($widgetInstance, 'generateCSS')) {
                $css = $widgetInstance->generateCSS($widgetId, $widgetData);
                if (!empty($css)) {
                    CSSManager::addWidgetCSS($widgetId, $css, $widgetType);
                }
            }

            // Pass complete widget data to render method
            // LegacyAddonAdapter needs the full structure with general/style/advanced tabs
            // It will flatten them internally in the render() method
            $html = $widgetInstance->render($widgetData);
            
            // Wrap the HTML in a container with the widget ID to ensure CSS selectors match
            return sprintf(
                '<div id="%s" class="%s xgp-widget xgp-widget-%s">%s</div>',
                $widgetId,
                $widgetId,
                $widgetType,
                $html
            );
        } catch (\Exception $e) {
            return "<!-- Widget render error: {$e->getMessage()} -->";
        }
    }
    
    /**
     * Get widget instance by type
     */
    private function getWidgetInstance(string $widgetType)
    {
        // This would use the WidgetRegistry to get the widget instance
        // For now, return null as placeholder
        return \Xgenious\PageBuilder\Core\WidgetRegistry::getWidget($widgetType);
    }
    
    /**
     * Get CSS for page header output
     * 
     * @param bool $includeStyleTags Whether to wrap in <style> tags
     * @return string CSS ready for page header
     */
    public static function getPageCSS(bool $includeStyleTags = true): string
    {
        return CSSManager::outputPageCSS($includeStyleTags);
    }
    
    /**
     * Render page content from JSON string
     * 
     * @param string $jsonContent JSON encoded page content
     * @return array Rendered content and CSS
     */
    public function renderFromJson(string $jsonContent): array
    {
        $pageContent = json_decode($jsonContent, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'html' => '<!-- Invalid JSON content -->',
                'css' => '',
                'error' => 'Invalid JSON: ' . json_last_error_msg()
            ];
        }
        
        return $this->renderPageContent($pageContent);
    }

    /**
     * Render a page using the page builder
     * 
     * @param mixed $page Page model instance
     * @return string Rendered HTML with inline CSS
     */
    public function renderPage($page): string
    {
        // Check if page uses page builder
        if (!$page->use_page_builder) {
            return $page->page_content ?? '';
        }

        // Get page builder content
        $content = $page->pageBuilderContent;
        
        if (!$content) {
            return '<div class="no-content">Page builder content not found</div>';
        }

        return $this->renderPageBuilderContent($content);
    }

    /**
     * Render PageBuilderContent model
     * 
     * @param \Xgenious\PageBuilder\Models\PageBuilderContent $content
     * @return string Rendered HTML with inline CSS
     */
    public function renderPageBuilderContent($content): string
    {
        $completeContent = $content->getCompleteContent();
        
        // Clear previous CSS
        CSSManager::clearCSS();
        
        $html = '';

        // Render each container
        foreach ($completeContent['containers'] ?? [] as $container) {
            $html .= $this->renderContainer($container);
        }

        // Get consolidated CSS
        $css = CSSManager::getConsolidatedCSS();

        // Combine CSS and HTML
        if (!empty($css)) {
            $html = "<style>{$css}</style>\n{$html}";
        }

        return $html;
    }
    
    /**
     * Clear CSS collection (useful for testing)
     */
    public static function clearCSS(): void
    {
        CSSManager::clearCSS();
    }
    
    /**
     * Get CSS statistics
     */
    public static function getCSSStats(): array
    {
        return CSSManager::getStats();
    }

    /**
     * Build HTML attribute string from array
     *
     * @param array $attributes Attributes array
     * @return string HTML attributes string
     */
    private function buildAttributeString(array $attributes): string
    {
        $parts = [];
        foreach ($attributes as $key => $value) {
            if ($value === true || $value === '') {
                $parts[] = $key;
            } else {
                $parts[] = $key . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"';
            }
        }
        return implode(' ', $parts);
    }
}
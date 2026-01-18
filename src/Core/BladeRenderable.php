<?php

namespace Xgenious\PageBuilder\Core;

use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Blade;

/**
 * BladeRenderable Trait
 * 
 * Provides Laravel Blade template rendering capabilities for widgets.
 * This allows widgets to use complex Blade templates for advanced rendering scenarios.
 * 
 * Usage:
 * 1. Use this trait in your widget class
 * 2. Create a Blade template in resources/views/widgets/{widget-type}.blade.php
 * 3. Call renderBladeTemplate() instead of returning HTML directly
 * 
 * @package Plugins\Pagebuilder\Core
 */
trait BladeRenderable
{
    /**
     * Render a Blade template for the widget
     * 
     * @param string $template Template name (without .blade.php extension)
     * @param array $data Data to pass to the template
     * @return string Rendered HTML
     */
    protected function renderBladeTemplate(string $template, array $data = []): string
    {
        try {
            // Check if the template exists
            if (!View::exists($template)) {
                // Try widget-specific template path
                $widgetTemplate = "widgets.{$this->getWidgetType()}";
                if (View::exists($widgetTemplate)) {
                    $template = $widgetTemplate;
                } else {
                    // Fallback to default rendering
                    return $this->renderFallback($data);
                }
            }
            
            return View::make($template, $data)->render();
            
        } catch (\Exception $e) {
            \Log::error("Failed to render Blade template '{$template}' for widget: " . $e->getMessage());
            return $this->renderFallback($data);
        }
    }
    
    /**
     * Render a Blade template from string
     * 
     * @param string $templateString Blade template as string
     * @param array $data Data to pass to the template
     * @return string Rendered HTML
     */
    protected function renderBladeString(string $templateString, array $data = []): string
    {
        try {
            return Blade::render($templateString, $data);
        } catch (\Exception $e) {
            \Log::error("Failed to render Blade string for widget: " . $e->getMessage());
            return $this->renderFallback($data);
        }
    }
    
    /**
     * Check if a Blade template exists for this widget
     * 
     * @param string|null $template Template name, or null to check default widget template
     * @return bool
     */
    protected function hasBladeTemplate(?string $template = null): bool
    {
        $templateName = $template ?? "widgets.{$this->getWidgetType()}";
        return View::exists($templateName);
    }
    
    /**
     * Get the default template path for this widget
     * 
     * @return string
     */
    protected function getDefaultTemplatePath(): string
    {
        return "widgets.{$this->getWidgetType()}";
    }
    
    
    /**
     * Fallback rendering method when Blade templates fail
     * 
     * @param array $data Template data
     * @return string Fallback HTML
     */
    private function renderFallback(array $data): string
    {
        $widgetType = $this->getWidgetType();
        $widgetName = $this->getWidgetName();
        
        return "<div class=\"widget-error\">
            <p><strong>Widget Render Error:</strong> {$widgetName} ({$widgetType})</p>
            <p>Template not found or failed to render. Please check your Blade template.</p>
        </div>";
    }
    
    /**
     * Abstract methods that implementing classes must provide
     */
    abstract protected function getWidgetType(): string;
    abstract protected function getWidgetName(): string;
    abstract protected function getWidgetIcon(): string;
    abstract protected function getWidgetDescription(): string;
}
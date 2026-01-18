<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Xgenious\PageBuilder\Core\WidgetRegistry;

class WidgetController extends Controller
{
    /**
     * Get all widgets
     */
    public function index()
    {
        $widgets = WidgetRegistry::getWidgetsForApi();
        
        return response()->json([
            'success' => true,
            'data' => $widgets
        ]);
    }
    
    /**
     * Get widgets grouped by category
     */
    public function grouped()
    {
        $allWidgets = WidgetRegistry::getAllWidgets();
        $grouped = [];
        
        foreach ($allWidgets as $widgetType => $widgetData) {
            $category = $widgetData['config']['category'] ?? 'other';
            
            if (!isset($grouped[$category])) {
                $grouped[$category] = [
                    'category' => [
                        'key' => $category,
                        'name' => ucfirst($category),
                        'description' => ''
                    ],
                    'widgets' => []
                ];
            }
            
            $grouped[$category]['widgets'][$widgetType] = $widgetData;
        }
        
        return response()->json([
            'success' => true,
            'data' => $grouped
        ]);
    }
    
    /**
     * Search widgets
     */
    public function search(Request $request)
    {
        $query = strtolower($request->input('q', ''));
        $allWidgets = WidgetRegistry::getAllWidgets();
        $results = [];
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => $allWidgets
            ]);
        }
        
        foreach ($allWidgets as $widgetType => $widgetData) {
            $config = $widgetData['config'];
            $searchableText = strtolower(
                ($config['name'] ?? '') . ' ' .
                ($config['description'] ?? '') . ' ' .
                implode(' ', $config['tags'] ?? [])
            );
            
            if (str_contains($searchableText, $query)) {
                $results[$widgetType] = $widgetData;
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }
    
    /**
     * Get specific widget
     */
    public function show($type)
    {
        $widget = WidgetRegistry::getWidget($type);
        
        if (!$widget) {
            return response()->json([
                'success' => false,
                'message' => 'Widget not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $widget
        ]);
    }
    
    /**
     * Render widget preview
     */
    public function preview(Request $request, $type)
    {
        try {
            $widget = WidgetRegistry::getWidget($type);
            
            if (!$widget) {
                return response()->json([
                    'success' => false,
                    'message' => 'Widget not found'
                ], 404);
            }
            
            $settings = $request->input('settings', []);
            
            // Render the widget
            $html = $widget->render($settings);
            
            // Generate CSS for the widget
            $css = ''; // TODO: Implement CSS generation if needed
            
            return response()->json([
                'success' => true,
                'data' => [
                    'html' => $html,
                    'css' => $css
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rendering widget: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get widget fields
     */
    public function getWidgetFields($type, $tab)
    {
        $widget = WidgetRegistry::getWidget($type);
        
        if (!$widget) {
            return response()->json([
                'success' => false,
                'message' => 'Widget not found'
            ], 404);
        }
        
        $instance = $widget;
        $fields = [];
        
        switch ($tab) {
            case 'general':
                $fields = $instance->getGeneralFields();
                break;
            case 'style':
                $fields = $instance->getStyleFields();
                break;
            case 'advanced':
                $fields = $instance->getAdvancedFields();
                break;
        }
        
        return response()->json([
            'success' => true,
            'data' => $fields
        ]);
    }
}

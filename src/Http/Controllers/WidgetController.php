<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Xgenious\PageBuilder\Core\WidgetRegistry;

class WidgetController extends Controller
{
    /**
     * Which editor panel is making the request: the landlord/central panel or
     * a tenant panel. Tenancy is not initialised for these API routes, so the
     * request host is compared against the configured central domains.
     */
    private function currentContext(Request $request): string
    {
        $centralDomains = (array) config('xgpagebuilder.central_domains', []);

        if (empty($centralDomains)) {
            $centralDomains = (array) config('tenancy.central_domains', []);
        }

        return in_array($request->getHost(), $centralDomains, true) ? 'landlord' : 'tenant';
    }

    /**
     * Hide widgets that belong to the other panel's namespace.
     */
    private function filterWidgetsForContext(array $widgets, Request $request): array
    {
        $context = $this->currentContext($request);
        $excludedNamespaces = (array) config(
            "xgpagebuilder.context_excluded_widget_namespaces.{$context}",
            []
        );

        if (empty($excludedNamespaces)) {
            return $widgets;
        }

        return array_filter($widgets, static function ($widget) use ($excludedNamespaces) {
            $class = strtolower($widget['class'] ?? '');

            if ($class === '') {
                return true;
            }

            foreach ($excludedNamespaces as $namespace) {
                if (! $namespace) {
                    continue;
                }

                $prefix = strtolower(rtrim($namespace, '\\')) . '\\';

                if (str_starts_with($class, $prefix)) {
                    return false;
                }
            }

            return true;
        });
    }

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
    public function grouped(Request $request)
    {
        $allWidgets = $this->filterWidgetsForContext(
            WidgetRegistry::getAllWidgets(),
            $request
        );
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
        $allWidgets = $this->filterWidgetsForContext(
            WidgetRegistry::getAllWidgets(),
            $request
        );
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

            // Render through the registry so the HTML is wrapped with the same
            // widget id the generated CSS targets. Without the wrapper every
            // `#widget-id ...` rule is dropped in the editor preview.
            $rendered = WidgetRegistry::renderWidget($type, $settings);

            if (!$rendered) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error rendering widget'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'html' => $rendered['html'],
                    'css' => $rendered['css']
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rendering widget: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Render a scaled-down visual preview of a widget (cached).
     *
     * The editor sidebar uses this to show a thumbnail of what each widget
     * actually looks like instead of a generic icon. Rendering is cached so
     * browsing the panel does not re-run widget queries on every request.
     */
    public function thumbnail($type)
    {
        $widget = WidgetRegistry::getWidget($type);

        if (!$widget) {
            return response()->json([
                'success' => false,
                'message' => 'Widget not found'
            ], 404);
        }

        $cacheKey = 'xgp_widget_thumbnail:' . md5(implode('|', [
            $type,
            app()->getLocale(),
            request()->getHost(),
        ]));

        $data = null;
        try {
            $data = Cache::get($cacheKey);
        } catch (\Throwable $e) {
            // Cache backend unavailable — fall through and render directly.
        }

        if (!is_array($data)) {
            $defaults = WidgetRegistry::getWidgetDefaults($type);
            $rendered = WidgetRegistry::renderWidget($type, $defaults);

            $data = $rendered ?: ['html' => '', 'css' => '', 'failed' => true];

            try {
                Cache::put(
                    $cacheKey,
                    $data,
                    empty($data['failed']) ? now()->addHours(12) : now()->addMinutes(5)
                );
            } catch (\Throwable $e) {
                // Cache backend unavailable — ignore.
            }
        }

        if (empty($data['html']) || !empty($data['failed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Thumbnail unavailable'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'html' => $data['html'],
                'css' => $data['css'] ?? '',
            ]
        ]);
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

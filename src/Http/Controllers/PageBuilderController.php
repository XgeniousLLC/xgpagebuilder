<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Xgenious\PageBuilder\Models\PageBuilderWidget;
use Illuminate\Http\JsonResponse;
use Xgenious\PageBuilder\Models\PageBuilderContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\FacadesLog;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PageBuilderController extends Controller
{
    /**
     * Recursively convert empty arrays to objects in response data
     * This ensures {} is sent instead of [] for empty settings
     */
    private function convertEmptyArraysToObjects($data)
    {
        if (is_array($data)) {
            // Check if it's an empty array or an indexed array
            if (empty($data)) {
                return new \stdClass();
            }
            
            // Check if it's an associative array
            $isAssociative = array_keys($data) !== range(0, count($data) - 1);
            
            if ($isAssociative) {
                // Process each key recursively
                $result = [];
                foreach ($data as $key => $value) {
                    $result[$key] = $this->convertEmptyArraysToObjects($value);
                }
                return $result;
            } else {
                // It's an indexed array
                return array_map([$this, 'convertEmptyArraysToObjects'], $data);
            }
        }
        
        return $data;
    }

    /**
     * Save page builder content for a page
     */
    public function saveContent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id',
            'content' => 'required|array',
            'content.containers' => 'sometimes|array',
            'widgets' => 'sometimes|array',
            'is_published' => 'sometimes|boolean',
            'version' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Find the page by ID from request
            $pageId = $request->input('page_id');
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);

            $content = $request->input('content', ['containers' => []]);
            $widgets = $request->input('widgets', []);
            $isPublished = $request->input('is_published', false);
            $version = $request->input('version', '1.0');

            // Create or update page builder content (layout only)
            $pageBuilderContent = PageBuilderContent::updateOrCreate(
                ['page_id' => $page->id],
                [
                    'content' => $content,
                    'version' => $version,
                    'is_published' => $isPublished,
                    'published_at' => $isPublished ? now() : null,
                    'created_by' => Auth::guard('admin')->id(),
                    'updated_by' => Auth::guard('admin')->id()
                ]
            );

            // Handle widgets separately
            $widgetStats = $this->syncPageWidgets($page->id, $widgets);

            // Sync widget positions with content structure
            $pageBuilderContent->syncWidgetPositions();

            // If page uses page builder, ensure it's marked as such
            if (!$page->use_page_builder) {
                $page->update(['use_page_builder' => true]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Page builder content saved successfully',
                'data' => [
                    'id' => $pageBuilderContent->id,
                    'page_id' => $page->id,
                    'version' => $pageBuilderContent->version,
                    'is_published' => $pageBuilderContent->is_published,
                    'published_at' => $pageBuilderContent->published_at,
                    'updated_at' => $pageBuilderContent->updated_at,
                    'widgets_count' => $widgetStats['total'],
                    'widgets_stats' => $widgetStats
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to save page builder content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get page builder content for a page
     */
    public function getContent(int $pageId): JsonResponse
    {
        try {
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $pageBuilderContent = $page->pageBuilderContent;

            Log::info('[DEBUG] getContent called', [
                'pageId' => $pageId,
                'has_page_builder_content' => !!$pageBuilderContent
            ]);

            // If no PageBuilderContent exists, try to build from widgets
            if (!$pageBuilderContent) {
                $widgets = $page->widgets()->ordered()->get();

                Log::info('[DEBUG] No page builder content, checking widgets', [
                    'widget_count' => $widgets->count()
                ]);

                if ($widgets->isEmpty()) {
                    // Return empty structure if no widgets
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'content' => ['containers' => []],
                            'widgets' => [],
                            'version' => '1.0',
                            'is_published' => false,
                            'published_at' => null
                        ]
                    ]);
                }

                // Build content structure from widgets
                $containersMap = [];

                foreach ($widgets as $widget) {
                    // Use default container/column if null
                    $containerId = $widget->container_id ?? 'default-container';
                    $columnId = $widget->column_id ?? 'default-column';

                    // Initialize container if not exists
                    if (!isset($containersMap[$containerId])) {
                        $containersMap[$containerId] = [
                            'id' => $containerId,
                            'type' => 'section',
                            'columns' => [],
                            'settings' => [
                                'padding' => '40px 20px',
                                'margin' => '0px',
                                'backgroundColor' => '#ffffff'
                            ]
                        ];
                    }

                    // Initialize column if not exists
                    if (!isset($containersMap[$containerId]['columns'][$columnId])) {
                        $containersMap[$containerId]['columns'][$columnId] = [
                            'id' => $columnId,
                            'width' => '100%',
                            'widgets' => [],
                            'settings' => []
                        ];
                    }

                    // Add widget to column
                    $containersMap[$containerId]['columns'][$columnId]['widgets'][] = [
                        'id' => $widget->widget_id,
                        'type' => $widget->widget_type,
                        'settings' => [
                            'general' => $widget->general_settings ?? [],
                            'style' => $widget->style_settings ?? [],
                            'advanced' => $widget->advanced_settings ?? [],
                            'responsive' => $widget->responsive_settings ?? []
                        ],
                        'isVisible' => $widget->is_visible,
                        'isEnabled' => $widget->is_enabled
                    ];
                }

                // Convert associative arrays to indexed arrays
                $containers = array_values(array_map(function ($container) {
                    $container['columns'] = array_values($container['columns']);
                    return $container;
                }, $containersMap));

                Log::info('[DEBUG] Built content from widgets', [
                    'container_count' => count($containers),
                    'total_widgets' => $widgets->count()
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'content' => ['containers' => $containers],
                        'widgets' => $widgets->toArray(),
                        'version' => '1.0',
                        'is_published' => false,
                        'published_at' => null
                    ]
                ]);
            }

            // Get complete content with merged widget data for frontend
            $completeContent = $pageBuilderContent->getCompleteContent();

            Log::info('[DEBUG] getContent - complete content loaded', [
                'pageId' => $pageId,
                'container_count' => count($completeContent['containers'] ?? []),
                'first_container_id' => $completeContent['containers'][0]['id'] ?? 'none',
                'widget_count_in_first' => count($completeContent['containers'][0]['columns'][0]['widgets'] ?? [])
            ]);

            // Convert empty arrays to objects
            $processedContent = $this->convertEmptyArraysToObjects($completeContent);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $pageBuilderContent->id,
                    'content' => $processedContent,  // Send complete merged content with proper object types
                    'version' => $pageBuilderContent->version,
                    'is_published' => $pageBuilderContent->is_published,
                    'published_at' => $pageBuilderContent->published_at,
                    'created_at' => $pageBuilderContent->created_at,
                    'updated_at' => $pageBuilderContent->updated_at,
                    'widget_analytics' => $pageBuilderContent->getWidgetAnalytics()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('[ERROR] getContent failed', [
                'pageId' => $pageId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get page builder content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish page builder content
     */
    public function publish(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pageId = $request->input('page_id');
            $page = Page::findOrFail($pageId);
            $pageBuilderContent = $page->pageBuilderContent;

            if (!$pageBuilderContent) {
                return response()->json([
                    'success' => false,
                    'message' => 'No page builder content found'
                ], 404);
            }

            $pageBuilderContent->publish();

            return response()->json([
                'success' => true,
                'message' => 'Page builder content published successfully',
                'data' => [
                    'is_published' => true,
                    'published_at' => $pageBuilderContent->published_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish page builder content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unpublish page builder content
     */
    public function unpublish(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pageId = $request->input('page_id');
            $page = Page::findOrFail($pageId);
            $pageBuilderContent = $page->pageBuilderContent;

            if (!$pageBuilderContent) {
                return response()->json([
                    'success' => false,
                    'message' => 'No page builder content found'
                ], 404);
            }

            $pageBuilderContent->unpublish();

            return response()->json([
                'success' => true,
                'message' => 'Page builder content unpublished successfully',
                'data' => [
                    'is_published' => false,
                    'published_at' => null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unpublish page builder content',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get page builder content history/versions
     */
    public function getHistory(int $pageId): JsonResponse
    {
        try {
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $history = PageBuilderContent::where('page_id', $page->id)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'version', 'is_published', 'published_at', 'created_at', 'updated_at']);

            return response()->json([
                'success' => true,
                'data' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get page builder content history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get individual widget data
     */
    public function getWidgetData(int $pageId, string $widgetId): JsonResponse
    {
        try {
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $pageBuilderContent = $page->pageBuilderContent;

            if (!$pageBuilderContent) {
                return response()->json([
                    'success' => false,
                    'message' => 'No page builder content found'
                ], 404);
            }

            $widget = PageBuilderWidget::where('page_id', $page->id)
                ->where('widget_id', $widgetId)
                ->first();

            if (!$widget) {
                return response()->json([
                    'success' => false,
                    'message' => 'Widget not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'settings' => $widget->all_settings,
                    'is_visible' => $widget->is_visible,
                    'is_enabled' => $widget->is_enabled,
                    'analytics' => $widget->getAnalytics(),
                    'cache_status' => $widget->isCacheValid() ? 'valid' : 'expired',
                    'created_at' => $widget->created_at,
                    'updated_at' => $widget->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get widget data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to ensure settings are objects, not empty arrays
     */
    private function ensureSettingsObject($value)
    {
        if (empty($value) || (is_array($value) && array_keys($value) === range(0, count($value) - 1) && count($value) === 0)) {
            return new \stdClass();
        }
        return $value;
    }

    /**
     * Sync page widgets with provided widget data
     * Creates, updates, or removes widgets as needed
     */
    private function syncPageWidgets(int $pageId, array $widgets): array
    {
        $stats = [
            'created' => 0,
            'updated' => 0,
            'deleted' => 0,
            'total' => 0
        ];

        $adminId = Auth::guard('admin')->id();
        $providedWidgetIds = array_keys($widgets);

        // Get existing widgets for this page
        $existingWidgets = PageBuilderWidget::where('page_id', $pageId)
            ->get()
            ->keyBy('widget_id');

        // Process provided widgets
        foreach ($widgets as $widgetId => $widgetData) {
            if (!isset($widgetData['type'])) {
                continue; // Skip invalid widget data
            }

            // Ensure settings are objects, not empty arrays
            $generalSettings = $this->ensureSettingsObject($widgetData['settings']['general'] ?? []);
            $styleSettings = $this->ensureSettingsObject($widgetData['settings']['style'] ?? []);
            $advancedSettings = $this->ensureSettingsObject($widgetData['settings']['advanced'] ?? []);

            $widgetAttributes = [
                'page_id' => $pageId,
                'widget_id' => $widgetId,
                'widget_type' => $widgetData['type'],
                'container_id' => $widgetData['container_id'] ?? null,
                'column_id' => $widgetData['column_id'] ?? null,
                'sort_order' => $widgetData['sort_order'] ?? 0,
                'general_settings' => $generalSettings,
                'style_settings' => $styleSettings,
                'advanced_settings' => $advancedSettings,
                'is_visible' => $widgetData['is_visible'] ?? true,
                'is_enabled' => $widgetData['is_enabled'] ?? true,
                'version' => $widgetData['version'] ?? '1.0.0',
                'updated_by' => $adminId
            ];

            if ($existingWidgets->has($widgetId)) {
                // Update existing widget
                $existingWidgets[$widgetId]->update($widgetAttributes);
                $stats['updated']++;
            } else {
                // Create new widget
                $widgetAttributes['created_by'] = $adminId;
                PageBuilderWidget::create($widgetAttributes);
                $stats['created']++;
            }
        }

        // Remove widgets that are no longer present
        $widgetsToDelete = $existingWidgets->whereNotIn('widget_id', $providedWidgetIds);
        $stats['deleted'] = $widgetsToDelete->count();

        foreach ($widgetsToDelete as $widget) {
            $widget->delete();
        }

        $stats['total'] = count($widgets);

        return $stats;
    }

    /**
     * Create a new widget
     */
    public function createWidget(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id',
            'widget_id' => 'required|string',
            'widget_type' => 'required|string',
            'container_id' => 'sometimes|string',
            'column_id' => 'sometimes|string',
            'sort_order' => 'sometimes|integer',
            'settings' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $widget = PageBuilderWidget::create([
                'page_id' => $request->input('page_id'),
                'widget_id' => $request->input('widget_id'),
                'widget_type' => $request->input('widget_type'),
                'container_id' => $request->input('container_id'),
                'column_id' => $request->input('column_id'),
                'sort_order' => $request->input('sort_order', 0),
                'general_settings' => $request->input('settings.general', []),
                'style_settings' => $request->input('settings.style', []),
                'advanced_settings' => $request->input('settings.advanced', []),
                'created_by' => Auth::guard('admin')->id(),
                'updated_by' => Auth::guard('admin')->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Widget created successfully',
                'data' => [
                    'id' => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'settings' => $widget->all_settings
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create widget',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a widget
     */
    public function updateWidget(Request $request, int $pageId, string $widgetId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'sometimes|array',
            'is_visible' => 'sometimes|boolean',
            'is_enabled' => 'sometimes|boolean',
            'container_id' => 'sometimes|string',
            'column_id' => 'sometimes|string',
            'sort_order' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $widget = PageBuilderWidget::where('page_id', $pageId)
                ->where('widget_id', $widgetId)
                ->firstOrFail();

            $updateData = ['updated_by' => Auth::guard('admin')->id()];

            if ($request->has('settings')) {
                $settings = $request->input('settings');
                if (isset($settings['general'])) {
                    $updateData['general_settings'] = $settings['general'];
                }
                if (isset($settings['style'])) {
                    $updateData['style_settings'] = $settings['style'];
                }
                if (isset($settings['advanced'])) {
                    $updateData['advanced_settings'] = $settings['advanced'];
                }
            }

            if ($request->has('is_visible')) {
                $updateData['is_visible'] = $request->boolean('is_visible');
            }

            if ($request->has('is_enabled')) {
                $updateData['is_enabled'] = $request->boolean('is_enabled');
            }

            if ($request->has('container_id')) {
                $updateData['container_id'] = $request->input('container_id');
            }

            if ($request->has('column_id')) {
                $updateData['column_id'] = $request->input('column_id');
            }

            if ($request->has('sort_order')) {
                $updateData['sort_order'] = $request->input('sort_order');
            }

            $widget->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Widget updated successfully',
                'data' => [
                    'id' => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'settings' => $widget->all_settings,
                    'is_visible' => $widget->is_visible,
                    'is_enabled' => $widget->is_enabled
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update widget',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a widget
     */
    public function deleteWidget(int $pageId, string $widgetId): JsonResponse
    {
        try {
            $widget = PageBuilderWidget::where('page_id', $pageId)
                ->where('widget_id', $widgetId)
                ->firstOrFail();

            $widget->delete();

            return response()->json([
                'success' => true,
                'message' => 'Widget deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete widget',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate CSS for page components
     */
    public function generateCSS(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:section,column,widget',
            'id' => 'required|string',
            'settings' => 'sometimes|array',
            'widget_type' => 'required_if:type,widget|string',
            'section_id' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $type = $request->input('type');
            $id = $request->input('id');
            $settings = $request->input('settings', []);
            $widgetType = $request->input('widget_type');
            $sectionId = $request->input('section_id');

            $css = '';

            if ($type === 'widget' && $widgetType) {
                // Use PHP widget classes for CSS generation
                $css = $this->generateWidgetCSS($widgetType, $id, $settings, $sectionId);
            } else {
                // Use existing logic for sections and columns
                $css = $this->generateComponentCSS($type, $id, $settings);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'css' => $css,
                    'selector' => $type === 'widget' ? ".{$sectionId} .{$id}" : ".pb-{$type}-{$id}",
                    'type' => $type,
                    'id' => $id
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate CSS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate CSS for multiple components at once
     */
    public function generateBulkCSS(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'components' => 'required|array',
            'components.*.type' => 'required|string|in:section,column,widget',
            'components.*.id' => 'required|string',
            'components.*.settings' => 'sometimes|array',
            'components.*.widget_type' => 'sometimes|string',
            'components.*.section_id' => 'sometimes|string',
            'components.*.responsiveSettings' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $components = $request->input('components', []);
            $results = [];
            $combinedCSS = [];

            foreach ($components as $component) {
                $type = $component['type'];
                $id = $component['id'];
                $settings = $component['settings'];
                $widgetType = $component['widget_type'] ?? null;
                $sectionId = $component['section_id'] ?? null;

                if ($type === 'widget' && $widgetType) {
                    // Use PHP widget classes for CSS generation
                    $css = $this->generateWidgetCSS($widgetType, $id, $settings, $sectionId);
                    $selector = ".{$sectionId} .{$id}";
                } else {
                    // Use existing logic for sections and columns
                    $responsiveSettings = $component['responsiveSettings'] ?? [];
                    $css = $this->generateComponentCSS($type, $id, $settings, $responsiveSettings);
                    $selector = ".pb-{$type}-{$id}";
                }

                $results[] = [
                    'type' => $type,
                    'id' => $id,
                    'selector' => $selector,
                    'css' => $css
                ];

                if ($css) {
                    $combinedCSS[] = $css;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'components' => $results,
                    'combinedCSS' => implode("\n\n", $combinedCSS)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate bulk CSS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get default settings for a component type
     */
    public function getDefaultSettings(string $type): JsonResponse
    {
        try {
            $defaults = $this->getComponentDefaults($type);

            return response()->json([
                'success' => true,
                'data' => [
                    'type' => $type,
                    'defaults' => $defaults
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get default settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate CSS for component (server-side implementation)
     */
    private function generateComponentCSS(string $type, string $id, array $settings, array $responsiveSettings = []): string
    {
        $baseSelector = ".pb-{$type}-{$id}";
        $css = [];

        // Merge with defaults
        $defaults = $this->getComponentDefaults($type);
        $mergedSettings = array_merge($defaults, $settings);

        // Generate base styles
        $baseStyles = $this->generateBaseStyles($baseSelector, $mergedSettings);
        if ($baseStyles) $css[] = $baseStyles;

        // Generate layout-specific styles for sections
        if ($type === 'section' && isset($mergedSettings['contentWidth'])) {
            $layoutStyles = $this->generateSectionLayoutCSS($mergedSettings['contentWidth'], $mergedSettings['maxWidth'] ?? 1200);
            if ($layoutStyles) $css[] = $layoutStyles;
        }

        // Generate responsive styles
        if (!empty($responsiveSettings)) {
            $responsiveStyles = $this->generateResponsiveStyles($baseSelector, $responsiveSettings);
            if ($responsiveStyles) $css[] = $responsiveStyles;
        }

        return implode("\n", $css);
    }

    /**
     * Get component default settings
     */
    private function getComponentDefaults(string $type): array
    {
        $baseDefaults = [
            'background' => ['type' => 'none', 'color' => '#ffffff'],
            'padding' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0, 'unit' => 'px'],
            'margin' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0, 'unit' => 'px'],
            'border' => [
                'width' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0],
                'style' => 'solid',
                'color' => '#e2e8f0',
                'radius' => ['topLeft' => 0, 'topRight' => 0, 'bottomLeft' => 0, 'bottomRight' => 0, 'unit' => 'px']
            ],
            'visibility' => ['hideOnDesktop' => false, 'hideOnTablet' => false, 'hideOnMobile' => false]
        ];

        switch ($type) {
            case 'section':
                return array_merge($baseDefaults, [
                    'contentWidth' => 'boxed',
                    'maxWidth' => 1200,
                    'padding' => ['top' => 40, 'right' => 20, 'bottom' => 40, 'left' => 20, 'unit' => 'px']
                ]);

            case 'column':
                return array_merge($baseDefaults, [
                    'display' => 'flex',
                    'flexDirection' => 'column',
                    'padding' => ['top' => 15, 'right' => 15, 'bottom' => 15, 'left' => 15, 'unit' => 'px']
                ]);

            case 'widget':
                return array_merge($baseDefaults, [
                    'typography' => ['fontSize' => '16px', 'fontWeight' => '400', 'lineHeight' => '1.6'],
                    'padding' => ['top' => 10, 'right' => 10, 'bottom' => 10, 'left' => 10, 'unit' => 'px']
                ]);

            default:
                return $baseDefaults;
        }
    }

    /**
     * Generate base component styles (server-side implementation)
     */
    private function generateBaseStyles(string $selector, array $settings): string
    {
        $styles = [];

        // Background styles
        if (isset($settings['background']) && $settings['background']['type'] !== 'none') {
            $bgCSS = $this->generateBackgroundCSS($settings['background']);
            if ($bgCSS) $styles[] = $bgCSS;
        }

        // Spacing styles
        if (isset($settings['padding'])) {
            $paddingCSS = $this->normalizeSpacing($settings['padding']);
            if ($paddingCSS !== '0') $styles[] = "padding: {$paddingCSS};";
        }

        if (isset($settings['margin'])) {
            $marginCSS = $this->normalizeSpacing($settings['margin']);
            if ($marginCSS !== '0') $styles[] = "margin: {$marginCSS};";
        }

        // Border styles
        if (isset($settings['border'])) {
            $borderCSS = $this->generateBorderCSS($settings['border']);
            if ($borderCSS) $styles[] = $borderCSS;
        }

        if (empty($styles)) return '';

        return "{$selector} {\n  " . implode("\n  ", $styles) . "\n}";
    }

    /**
     * Generate section layout CSS (server-side implementation)
     */
    private function generateSectionLayoutCSS(string $layoutMode, int $maxWidth = 1200): string
    {
        switch ($layoutMode) {
            case 'boxed':
                return "
.section-layout-boxed {
  max-width: {$maxWidth}px;
  margin: 0 auto;
  padding-left: 15px;
  padding-right: 15px;
}";

            case 'full_width_contained':
                return "
.section-layout-full_width_contained {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.section-layout-full_width_contained .section-inner {
  max-width: {$maxWidth}px;
  margin: 0 auto;
  padding-left: 15px;
  padding-right: 15px;
}";

            case 'full_width':
                return "
.section-layout-full_width {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.section-layout-full_width .section-inner {
  width: 100%;
  max-width: none;
  padding-left: 15px;
  padding-right: 15px;
}";

            default:
                return '';
        }
    }

    /**
     * Generate responsive styles (server-side implementation)
     */
    private function generateResponsiveStyles(string $selector, array $responsiveSettings): string
    {
        $css = [];

        // Tablet styles
        if (isset($responsiveSettings['tablet']) && !empty($responsiveSettings['tablet'])) {
            $tabletStyles = $this->generateBaseStyles($selector, $responsiveSettings['tablet']);
            if ($tabletStyles) {
                $css[] = "@media (max-width: 1024px) {\n{$tabletStyles}\n}";
            }
        }

        // Mobile styles
        if (isset($responsiveSettings['mobile']) && !empty($responsiveSettings['mobile'])) {
            $mobileStyles = $this->generateBaseStyles($selector, $responsiveSettings['mobile']);
            if ($mobileStyles) {
                $css[] = "@media (max-width: 768px) {\n{$mobileStyles}\n}";
            }
        }

        return implode("\n", $css);
    }

    /**
     * Helper methods for CSS generation
     */
    private function generateBackgroundCSS(array $background): string
    {
        switch ($background['type']) {
            case 'color':
                return isset($background['color']) ? "background-color: {$background['color']};" : '';

            case 'gradient':
                if (isset($background['gradient'])) {
                    $gradient = $background['gradient'];
                    $stops = collect($gradient['colorStops'] ?? [])->map(function ($stop) {
                        return "{$stop['color']} {$stop['position']}%";
                    })->implode(', ');

                    if ($gradient['type'] === 'linear') {
                        return "background: linear-gradient({$gradient['angle']}deg, {$stops});";
                    } elseif ($gradient['type'] === 'radial') {
                        return "background: radial-gradient(circle, {$stops});";
                    }
                }
                return '';

            default:
                return '';
        }
    }

    private function generateBorderCSS(array $border): string
    {
        $styles = [];

        if (isset($border['width'])) {
            $width = $border['width'];
            if ($width['top'] || $width['right'] || $width['bottom'] || $width['left']) {
                $styles[] = "border-width: {$width['top']}px {$width['right']}px {$width['bottom']}px {$width['left']}px;";
                $styles[] = "border-style: " . ($border['style'] ?? 'solid') . ";";
                $styles[] = "border-color: " . ($border['color'] ?? '#e2e8f0') . ";";
            }
        }

        if (isset($border['radius'])) {
            $radius = $border['radius'];
            $unit = $radius['unit'] ?? 'px';
            if ($radius['topLeft'] || $radius['topRight'] || $radius['bottomLeft'] || $radius['bottomRight']) {
                $styles[] = "border-radius: {$radius['topLeft']}{$unit} {$radius['topRight']}{$unit} {$radius['bottomRight']}{$unit} {$radius['bottomLeft']}{$unit};";
            }
        }

        return implode(' ', $styles);
    }

    private function normalizeSpacing($spacing): string
    {
        // Handle string input (already formatted CSS value)
        if (is_string($spacing)) {
            return trim($spacing) !== '' ? $spacing : '0';
        }

        // Handle array input (object with top, right, bottom, left properties)
        if (is_array($spacing) && isset($spacing['top'])) {
            $unit = $spacing['unit'] ?? 'px';
            return "{$spacing['top']}{$unit} {$spacing['right']}{$unit} {$spacing['bottom']}{$unit} {$spacing['left']}{$unit}";
        }

        return '0';
    }

    /**
     * Generate CSS for widget using PHP widget classes
     */
    private function generateWidgetCSS(string $widgetType, string $widgetId, array $settings, ?string $sectionId = null): string
    {
        try {
            // Try to get widget from registry first (includes custom/legacy widgets)
            $widget = \Xgenious\PageBuilder\Core\WidgetRegistry::getWidget($widgetType);
            
            if (!$widget) {
                // Fallback to class lookup
                $widgetClassName = $this->getWidgetClassName($widgetType);

                if (empty($widgetClassName) || !class_exists($widgetClassName)) {
                    return '';
                }

                $widget = new $widgetClassName();
            }

            // Generate CSS using the widget's CSS generation system
            if (method_exists($widget, 'generateCSS')) {
                return $widget->generateCSS($widgetId, $settings, $sectionId);
            }
            
            return '';
        } catch (\Exception $e) {
            Log::error("Failed to generate widget CSS for type: {$widgetType}", [
                'error' => $e->getMessage(),
                'widget_id' => $widgetId,
                'settings' => $settings
            ]);
            return '';
        }
    }

    /**
     * Save all settings for a specific widget
     */
    public function saveWidgetAllSettings(Request $request, int $pageId, string $widgetId): JsonResponse
    {
        Log::info('saveWidgetAllSettings called', [
            'pageId'   => $pageId,
            'widgetId' => $widgetId,
            'input'    => $request->all()
        ]);

        // Only require widget_type when creating (not updating)
        $rules = [
            'general'  => 'sometimes|array',
            'style'    => 'sometimes|array',
            'advanced' => 'sometimes|array',
        ];

        $exists = PageBuilderWidget::where('page_id', $pageId)
            ->where('widget_id', $widgetId)
            ->exists();

        if (!$exists) {
            $rules['widget_type'] = 'required|string';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $adminId = Auth::guard('admin')->id();

            // Ensure settings are objects, not empty arrays
            $ensureObject = function($value) {
                if (empty($value) || (is_array($value) && array_keys($value) === range(0, count($value) - 1) && count($value) === 0)) {
                    return new \stdClass(); // Will be encoded as {} in JSON
                }
                return $value;
            };

            // Prepare update data
            $updateData = [
                'general_settings'  => $ensureObject($request->input('general', [])),
                'style_settings'    => $ensureObject($request->input('style', [])),
                'advanced_settings' => $ensureObject($request->input('advanced', [])),
                'updated_by'        => $adminId,
            ];

            // Only set widget_type if provided (for new widgets or explicit updates)
            // This prevents null constraint violations when updating existing widgets
            if ($request->has('widget_type') && $request->input('widget_type') !== null) {
                $updateData['widget_type'] = $request->input('widget_type');
                $updateData['created_by'] = $adminId;
            }

            $widget = PageBuilderWidget::updateOrCreate(
                ['page_id' => $pageId, 'widget_id' => $widgetId],
                $updateData
            );

            $widget->updated_by = $adminId;
            $widget->saveQuietly();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $widget->wasRecentlyCreated ? 'Widget created!' : 'Settings saved!',
                'data' => [
                    'id'   => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'settings' => $widget->all_settings,
                ]
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('saveWidgetAllSettings error', ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'Server error',
                'error'   => app()->environment('local') ? $e->getMessage() : 'Failed'
            ], 500);
        }
    }

    /**
     * Save all settings for a specific section
     */
    public function saveSectionAllSettings(Request $request, int $pageId, string $sectionId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'responsiveSettings' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $pageBuilderContent = $page->pageBuilderContent;

            if (!$pageBuilderContent) {
                return response()->json([
                    'success' => false,
                    'message' => 'No page builder content found'
                ], 404);
            }

            $content = $pageBuilderContent->content;
            $settings = $request->input('settings');
            $responsiveSettings = $request->input('responsiveSettings', []);

            // Find and update the section in the content structure
            $updated = false;
            if (isset($content['containers'])) {
                foreach ($content['containers'] as &$container) {
                    if ($container['id'] === $sectionId) {
                        $container['settings'] = array_merge($container['settings'] ?? [], $settings);
                        if (!empty($responsiveSettings)) {
                            $container['responsiveSettings'] = array_merge($container['responsiveSettings'] ?? [], $responsiveSettings);
                        }
                        $updated = true;
                        break;
                    }
                }
            }

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Section not found'
                ], 404);
            }

            $pageBuilderContent->update([
                'content' => $content,
                'updated_by' => Auth::guard('admin')->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section settings saved successfully',
                'data' => [
                    'section_id' => $sectionId,
                    'settings' => $settings,
                    'updated_at' => $pageBuilderContent->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to save section settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save all settings for a specific column
     */
    public function saveColumnAllSettings(Request $request, int $pageId, string $columnId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'responsiveSettings' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $pageBuilderContent = $page->pageBuilderContent;

            if (!$pageBuilderContent) {
                return response()->json([
                    'success' => false,
                    'message' => 'No page builder content found'
                ], 404);
            }

            $content = $pageBuilderContent->content;
            $settings = $request->input('settings');
            $responsiveSettings = $request->input('responsiveSettings', []);

            // Find and update the column in the content structure
            $updated = false;
            if (isset($content['containers'])) {
                foreach ($content['containers'] as &$container) {
                    if (isset($container['columns'])) {
                        foreach ($container['columns'] as &$column) {
                            if ($column['id'] === $columnId) {
                                $column['settings'] = array_merge($column['settings'] ?? [], $settings);
                                if (!empty($responsiveSettings)) {
                                    $column['responsiveSettings'] = array_merge($column['responsiveSettings'] ?? [], $responsiveSettings);
                                }
                                $updated = true;
                                break 2;
                            }
                        }
                    }
                }
            }

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Column not found'
                ], 404);
            }

            $pageBuilderContent->update([
                'content' => $content,
                'updated_by' => Auth::guard('admin')->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Column settings saved successfully',
                'data' => [
                    'column_id' => $columnId,
                    'settings' => $settings,
                    'updated_at' => $pageBuilderContent->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to save column settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save general settings for a specific widget
     */
    public function saveWidgetGeneralSettings(Request $request, int $pageId, string $widgetId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'general' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $widget = PageBuilderWidget::where('page_id', $pageId)
                ->where('widget_id', $widgetId)
                ->firstOrFail();

            $widget->update([
                'general_settings' => $request->input('general'),
                'updated_by' => Auth::guard('admin')->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Widget general settings saved successfully',
                'data' => [
                    'id' => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'general_settings' => $widget->general_settings,
                    'updated_at' => $widget->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('[DEBUG] saveWidgetGeneralSettings failed', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save widget general settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save style settings for a specific widget
     */
    public function saveWidgetStyleSettings(Request $request, int $pageId, string $widgetId): JsonResponse
    {
        Log::info('[DEBUG] saveWidgetStyleSettings called', [
            'pageId' => $pageId,
            'widgetId' => $widgetId,
            'request_data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'style' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $widget = PageBuilderWidget::where('page_id', $pageId)
                ->where('widget_id', $widgetId)
                ->firstOrFail();

            $widget->update([
                'style_settings' => $request->input('style'),
                'updated_by' => Auth::guard('admin')->id()
            ]);

            DB::commit();

            Log::info('[DEBUG] saveWidgetStyleSettings successful', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'updated_style_settings' => $widget->style_settings,
                'widget_updated_at' => $widget->updated_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Widget style settings saved successfully',
                'data' => [
                    'id' => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'style_settings' => $widget->style_settings,
                    'updated_at' => $widget->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('[DEBUG] saveWidgetStyleSettings failed', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save widget style settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save advanced settings for a specific widget
     */
    public function saveWidgetAdvancedSettings(Request $request, int $pageId, string $widgetId): JsonResponse
    {
        Log::info('[DEBUG] saveWidgetAdvancedSettings called', [
            'pageId' => $pageId,
            'widgetId' => $widgetId,
            'request_data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'advanced' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $widget = PageBuilderWidget::where('page_id', $pageId)
                ->where('widget_id', $widgetId)
                ->firstOrFail();

            $widget->update([
                'advanced_settings' => $request->input('advanced'),
                'updated_by' => Auth::guard('admin')->id()
            ]);

            DB::commit();

            Log::info('[DEBUG] saveWidgetAdvancedSettings successful', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'updated_advanced_settings' => $widget->advanced_settings,
                'widget_updated_at' => $widget->updated_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Widget advanced settings saved successfully',
                'data' => [
                    'id' => $widget->widget_id,
                    'type' => $widget->widget_type,
                    'advanced_settings' => $widget->advanced_settings,
                    'updated_at' => $widget->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('[DEBUG] saveWidgetAdvancedSettings failed', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save widget advanced settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get widget settings with field definitions and saved values merged
     * This is the unified API endpoint that returns both field definitions AND saved values
     *
     * @param int $pageId
     * @param string $widgetId
     * @param string $tab
     * @return JsonResponse
     */
    public function getWidgetSettings(Request $request, int $pageId, string $widgetId, string $tab): JsonResponse
    {
        try {
            Log::info('[PageBuilderController] getWidgetSettings called', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'tab' => $tab,
                'widget_type' => $request->input('widget_type')
            ]);

            // Find the page
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);

            // Find the widget in the database
            $widget = PageBuilderWidget::where('widget_id', $widgetId)
                ->where('page_id', $pageId)
                ->first();

            $widgetType = null;
            $savedValues = [];

            if (!$widget) {
                // Handle new widgets that aren't in DB yet
                $widgetType = $request->input('widget_type');
                
                if (!$widgetType) {
                    Log::warning('[PageBuilderController] Widget not found in database and no type provided', [
                        'widgetId' => $widgetId,
                        'pageId' => $pageId
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Widget not found'
                    ], 404);
                }
                
                Log::info('[PageBuilderController] New widget detected', [
                    'widgetId' => $widgetId,
                    'type' => $widgetType
                ]);
            } else {
                $widgetType = $widget->widget_type;
                
                // Get saved values from database
                $savedValues = match ($tab) {
                    'general' => $widget->general_settings ?? [],
                    'style' => $widget->style_settings ?? [],
                    'advanced' => $widget->advanced_settings ?? [],
                    default => []
                };
            }

            // Get widget class to fetch field definitions
            $widgetClassName = $this->getWidgetClassName($widgetType);

            if (empty($widgetClassName) || !class_exists($widgetClassName)) {
                Log::error('[PageBuilderController] Widget class not found', [
                    'widgetType' => $widgetType,
                    'className' => $widgetClassName
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Widget class not found'
                ], 404);
            }

            // Create widget instance to get field definitions
            // Use WidgetRegistry if available (preferred for registered widgets)
            $widgetInstance = \Xgenious\PageBuilder\Core\WidgetRegistry::getWidget($widgetType);
            if (!$widgetInstance) {
                $widgetInstance = new $widgetClassName();
            }

            // Get field definitions for the specified tab
            $fieldDefinitions = match ($tab) {
                'general' => $widgetInstance->getGeneralFields(),
                'style' => $widgetInstance->getStyleFields(),
                'advanced' => $widgetInstance->getAdvancedFields(),
                default => []
            };

            if (empty($fieldDefinitions)) {
                Log::info('[PageBuilderController] No field definitions found for tab', [
                    'widgetType' => $widgetType,
                    'tab' => $tab
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'fields' => [],
                        'widget_id' => $widgetId,
                        'tab' => $tab,
                        'message' => 'No fields available for this tab'
                    ]
                ]);
            }

            Log::info('[PageBuilderController] Processing field definitions', [
                'fieldCount' => count($fieldDefinitions),
                'savedValuesCount' => count($savedValues),
                'tab' => $tab
            ]);

            // Merge saved values into field definitions
            $populatedFields = $this->mergeFieldsWithValues($fieldDefinitions, $savedValues);

            Log::info('[PageBuilderController] Fields populated successfully', [
                'populatedFieldCount' => count($populatedFields),
                'tab' => $tab
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'fields' => $populatedFields,
                    'widget_id' => $widgetId,
                    'widget_type' => $widgetType,
                    'tab' => $tab,
                    'timestamp' => now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('[PageBuilderController] Error in getWidgetSettings', [
                'pageId' => $pageId,
                'widgetId' => $widgetId,
                'tab' => $tab,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load widget settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Universal field value merging for all 32 field types
     * This handles the complex data structures of dimension, background, typography, etc.
     */
    private function mergeFieldsWithValues(array $fieldDefinitions, array $savedValues): array
    {
        $populatedFields = [];

        foreach ($fieldDefinitions as $groupKey => $groupConfig) {
            if ($groupConfig['type'] === 'group' && isset($groupConfig['fields'])) {
                // Handle group fields
                $populatedFields[$groupKey] = $groupConfig;
                $populatedFields[$groupKey]['fields'] = [];

                foreach ($groupConfig['fields'] as $fieldKey => $fieldConfig) {
                    $savedValue = $savedValues[$groupKey][$fieldKey] ?? null;
                    $populatedFields[$groupKey]['fields'][$fieldKey] = $this->mergeFieldWithValue($fieldConfig, $savedValue);
                }
            } else {
                // Handle non-group fields
                $savedValue = $savedValues[$groupKey] ?? null;
                $populatedFields[$groupKey] = $this->mergeFieldWithValue($groupConfig, $savedValue);
            }
        }

        return $populatedFields;
    }

    /**
     * Merge individual field with its saved value based on field type
     */
    private function mergeFieldWithValue(array $fieldConfig, $savedValue): array
    {
        $fieldType = $fieldConfig['type'] ?? 'text';

        switch ($fieldType) {
            case 'dimension':
                return $this->mergeDimensionField($fieldConfig, $savedValue);

            case 'background_group':
                return $this->mergeBackgroundField($fieldConfig, $savedValue);

            case 'typography_group':
                return $this->mergeTypographyField($fieldConfig, $savedValue);

            case 'repeater':
                return $this->mergeRepeaterField($fieldConfig, $savedValue);

            default:
                // Simple fields: text, number, color, select, etc.
                $fieldConfig['value'] = $savedValue ?? $fieldConfig['default'] ?? null;
                return $fieldConfig;
        }
    }

    /**
     * Handle dimension field complex data structure
     */
    private function mergeDimensionField(array $fieldConfig, $savedValue): array
    {
        $defaultDimension = [
            'top' => '0px',
            'right' => '0px',
            'bottom' => '0px',
            'left' => '0px'
        ];

        if (is_array($savedValue)) {
            // Direct object mapping
            $fieldConfig['value'] = array_merge($defaultDimension, $savedValue);
        } elseif (is_string($savedValue) && !empty($savedValue)) {
            // Parse CSS shorthand: "10px 15px 10px 15px"
            $fieldConfig['value'] = $this->parseCssShorthandToDimension($savedValue, $defaultDimension);
        } else {
            // Use defaults
            $fieldConfig['value'] = $fieldConfig['default'] ?? $defaultDimension;
        }

        return $fieldConfig;
    }

    /**
     * Handle background field complex data structure
     */
    private function mergeBackgroundField(array $fieldConfig, $savedValue): array
    {
        $defaultBackground = [
            'type' => 'none',
            'color' => '#000000',
            'gradient' => [
                'type' => 'linear',
                'angle' => 135,
                'colorStops' => [
                    ['color' => '#667EEA', 'position' => 0],
                    ['color' => '#764BA2', 'position' => 100]
                ]
            ],
            'image' => [
                'url' => '',
                'size' => 'cover',
                'position' => 'center center',
                'repeat' => 'no-repeat',
                'attachment' => 'scroll'
            ]
        ];

        if (is_array($savedValue)) {
            $fieldConfig['value'] = array_merge($defaultBackground, $savedValue);
        } else {
            $fieldConfig['value'] = $fieldConfig['default'] ?? $defaultBackground;
        }

        return $fieldConfig;
    }

    /**
     * Handle typography field complex data structure
     */
    private function mergeTypographyField(array $fieldConfig, $savedValue): array
    {
        $defaultTypography = [
            'font_family' => 'inherit',
            'font_size' => ['value' => 16, 'unit' => 'px'],
            'font_weight' => '400',
            'font_style' => 'normal',
            'text_transform' => 'none',
            'text_decoration' => 'none',
            'line_height' => ['value' => 1.4, 'unit' => 'em'],
            'letter_spacing' => ['value' => 0, 'unit' => 'px'],
            'word_spacing' => ['value' => 0, 'unit' => 'px']
        ];

        if (is_array($savedValue)) {
            $fieldConfig['value'] = array_merge($defaultTypography, $savedValue);
        } else {
            $fieldConfig['value'] = $fieldConfig['default'] ?? $defaultTypography;
        }

        return $fieldConfig;
    }

    /**
     * Handle repeater field array data structure
     */
    private function mergeRepeaterField(array $fieldConfig, $savedValue): array
    {
        if (is_array($savedValue)) {
            $fieldConfig['value'] = $savedValue;
        } else {
            $fieldConfig['value'] = $fieldConfig['default'] ?? [];
        }

        return $fieldConfig;
    }

    /**
     * Parse CSS shorthand notation to dimension object
     */
    private function parseCssShorthandToDimension(string $shorthand, array $default): array
    {
        $parts = array_filter(explode(' ', trim($shorthand)));
        $count = count($parts);

        switch ($count) {
            case 1:
                // "10px" -> all sides
                return [
                    'top' => $parts[0],
                    'right' => $parts[0],
                    'bottom' => $parts[0],
                    'left' => $parts[0]
                ];

            case 2:
                // "10px 15px" -> top/bottom, left/right
                return [
                    'top' => $parts[0],
                    'right' => $parts[1],
                    'bottom' => $parts[0],
                    'left' => $parts[1]
                ];

            case 3:
                // "10px 15px 5px" -> top, left/right, bottom
                return [
                    'top' => $parts[0],
                    'right' => $parts[1],
                    'bottom' => $parts[2],
                    'left' => $parts[1]
                ];

            case 4:
                // "10px 15px 5px 20px" -> top, right, bottom, left
                return [
                    'top' => $parts[0],
                    'right' => $parts[1],
                    'bottom' => $parts[2],
                    'left' => $parts[3]
                ];

            default:
                return $default;
        }
    }

    /**
     * Get widget class name from widget type
     * Uses WidgetRegistry to find registered widgets including custom/legacy ones
     */
    private function getWidgetClassName(string $widgetType): string
    {
        // First, check the WidgetRegistry for registered widgets
        $widget = \Xgenious\PageBuilder\Core\WidgetRegistry::getWidget($widgetType);
        
        if ($widget) {
            // Return the actual class name of the registered widget
            return get_class($widget);
        }
        
        // Fallback: Convert widget type to class name (e.g., 'heading' -> 'HeadingWidget')
        $className = str_replace(' ', '', ucwords(str_replace(['_', '-'], ' ', $widgetType))) . 'Widget';

        // Try various namespaces for built-in widgets
        $namespaces = [
            "Xgenious\\PageBuilder\\Widgets\\Theme\\",
            "Xgenious\\PageBuilder\\Widgets\\Content\\",
            "Xgenious\\PageBuilder\\Widgets\\Media\\",
            "Xgenious\\PageBuilder\\Widgets\\Interactive\\",
            "Xgenious\\PageBuilder\\Widgets\\Advanced\\",
            "Xgenious\\PageBuilder\\Core\\Widgets\\",
        ];

        foreach ($namespaces as $namespace) {
            $fullClass = $namespace . $className;
            if (class_exists($fullClass)) {
                return $fullClass;
            }
        }

        // Return empty string if not found - caller should handle this
        Log::warning('Widget class not found for type: ' . $widgetType);
        return '';
    }
}

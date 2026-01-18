<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Plugins\Pagebuilder\Core\ColumnCSSManager;

/**
 * ColumnCSSController - Handles column CSS generation for the page builder
 * 
 * Provides API endpoints for generating CSS from column settings
 * Integrates React frontend with PHP CSS generation system
 */
class ColumnCSSController extends Controller
{
    /**
     * Generate CSS for a single column
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateCSS(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'columnId' => 'required|string',
                'settings' => 'required|array',
                'breakpoints' => 'sometimes|array'
            ]);

            $columnId = $validated['columnId'];
            $settings = $validated['settings'];
            $breakpoints = $validated['breakpoints'] ?? ['desktop', 'tablet', 'mobile'];

            // Initialize CSS manager
            ColumnCSSManager::init();

            // Generate CSS
            $css = ColumnCSSManager::generateColumnCSS($columnId, $settings, $breakpoints);

            return response()->json([
                'success' => true,
                'css' => $css,
                'selector' => ColumnCSSManager::getColumnSelector($columnId),
                'classes' => ColumnCSSManager::getColumnClasses($settings)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Generate CSS for multiple columns
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateMultipleCSS(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'columns' => 'required|array',
                'columns.*.columnId' => 'required|string',
                'columns.*.settings' => 'required|array'
            ]);

            $columns = [];
            foreach ($validated['columns'] as $column) {
                $columns[$column['columnId']] = $column['settings'];
            }

            // Initialize CSS manager
            ColumnCSSManager::init();

            // Generate CSS for all columns
            $css = ColumnCSSManager::generateMultipleColumnCSS($columns);

            return response()->json([
                'success' => true,
                'css' => $css,
                'columns' => count($columns)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get CSS classes for a column based on settings
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getColumnClasses(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'settings' => 'required|array'
            ]);

            $classes = ColumnCSSManager::getColumnClasses($validated['settings']);

            return response()->json([
                'success' => true,
                'classes' => $classes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Preview column settings - generates CSS and returns preview data
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function previewColumn(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'columnId' => 'required|string',
                'settings' => 'required|array'
            ]);

            $columnId = $validated['columnId'];
            $settings = $validated['settings'];

            // Initialize CSS manager
            ColumnCSSManager::init();

            // Generate preview data
            $css = ColumnCSSManager::generateColumnCSS($columnId, $settings);
            $classes = ColumnCSSManager::getColumnClasses($settings);
            $selector = ColumnCSSManager::getColumnSelector($columnId);

            return response()->json([
                'success' => true,
                'preview' => [
                    'css' => $css,
                    'classes' => $classes,
                    'selector' => $selector,
                    'settings' => $settings
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Clear cached CSS for a column
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            $columnId = $request->input('columnId');

            if ($columnId) {
                ColumnCSSManager::clearColumnCSS($columnId);
                $message = "Cache cleared for column: {$columnId}";
            } else {
                ColumnCSSManager::clearAllCSS();
                $message = "All column CSS cache cleared";
            }

            return response()->json([
                'success' => true,
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
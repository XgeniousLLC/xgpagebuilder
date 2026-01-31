<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Illuminate\Routing\Controller;

class PageBuilderUIController extends Controller
{
    /**
     * Show the page builder editor
     *
     * @param int $pageId
     * @return \Illuminate\View\View
     */
    public function edit(int $pageId)
    {
        // Get the page model class from config
        $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
        
        // Find the page
        $page = $pageModelClass::findOrFail($pageId);
        
        // Get or create page builder content
        $content = $page->pageBuilderContent;
        
        if (!$content) {
            $content = \Xgenious\PageBuilder\Models\PageBuilderContent::create([
                'page_id' => $pageId,
                'content' => ['containers' => []],
                'version' => '1.0.0',
                'is_published' => false,
                'created_by' => auth('admin')->id() ?? null,
            ]);
        }
        
        // Resolve routes dynamically from config to make package reusable
        $routes = [
            'preview' => $this->resolvePreviewRoute($page),
            'backToPages' => $this->resolveBackRoute(),
        ];
        
        // Return page builder view
        return view('page-builder::editor', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status ?? 'draft',
            ],
            'content' => $content->getCompleteContent(),
            'contentId' => $content->id,
            'apiUrl' => url('/api/page-builder'),
            'routes' => $routes,
        ]);
    }
    
    /**
     * Resolve preview route for the page
     * 
     * @param mixed $page
     * @return string
     */
    private function resolvePreviewRoute($page): string
    {
        // Get preview route config
        $previewRouteName = config('xgpagebuilder.routes.preview', 'page.show');
        
        // Try to generate route, fallback to direct URL construction
        try {
            if (\Route::has($previewRouteName)) {
                return route($previewRouteName, $page->slug);
            }
        } catch (\Exception $e) {
            Log::warning("Preview route '{$previewRouteName}' not found", ['page_id' => $page->id]);
        }
        
        // Fallback: construct URL from slug
        return url('/' . $page->slug);
    }
    
    /**
     * Resolve back to pages list route
     * 
     * @return string
     */
    private function resolveBackRoute(): string
    {
        // Get back route config
        $backRouteName = config('xgpagebuilder.routes.back_to_pages', 'admin.pages.index');
        
        // Try to generate route, fallback to referrer or dashboard
        try {
            $route = route($backRouteName);
            return $route;
        } catch (\Exception $e) {
            Log::warning("Back route '{$backRouteName}' not found: " . $e->getMessage());
            
            // Try Route::has as fallback
            if (\Route::has($backRouteName)) {
                $route = route($backRouteName);
                Log::info("Route resolved via Route::has: {$route}");
                return $route;
            }
        }
        
        // Try direct URL from config
        $directUrl = config('xgpagebuilder.routes.back_to_pages_url');
        if ($directUrl) {
            return url($directUrl);
        }
        
        // Fallback: use referrer or admin dashboard
        $fallback = url()->previous() ?: url('/admin');
        return $fallback;
    }
}

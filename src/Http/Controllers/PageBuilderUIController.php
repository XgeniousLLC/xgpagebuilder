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
        
        Log::info("Opening page builder for page: {$pageId}", [
            'page_title' => $page->title,
            'content_id' => $content->id ?? null,
        ]);
        
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
        ]);
    }
}

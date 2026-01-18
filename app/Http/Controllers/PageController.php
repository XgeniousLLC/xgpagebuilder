<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Services\PageContentRenderer;
use Illuminate\Http\Request;

class PageController extends Controller
{
    protected $pageContentRenderer;

    public function __construct(PageContentRenderer $pageContentRenderer)
    {
        $this->pageContentRenderer = $pageContentRenderer;
    }

    public function show(Page $page)
    {
        // Check if page is published
        if ($page->status !== 'published') {
            abort(404);
        }

        // Render page builder content if page builder is enabled
        $renderedContent = '';
        $pageBuilderCss = '';
        
        if ($page->use_page_builder) {
            // Load page builder content from the PageBuilderContent model
            $pageBuilderContent = $page->pageBuilderContent;
            if ($pageBuilderContent && $pageBuilderContent->content) {
                $completeContent = $pageBuilderContent->getCompleteContent();
                $result = $this->pageContentRenderer->renderForFrontendWithCss($completeContent);
                $renderedContent = $result['html'];
                $pageBuilderCss = $result['css'];
            }
        } else if ($page->content) {
            // Fallback to regular page content for non-page-builder pages
            $renderedContent = '<div class="prose prose-lg">' . $page->content . '</div>';
        }

        return view('frontend.page', compact('page', 'renderedContent', 'pageBuilderCss'));
    }
}
{{-- Section Widget Template - Enhanced Layout Container --}}
@php
    // Extract layout settings
    $layout = $helper->generalSettings('layout', []);
    $layoutType = $layout['layout_type'] ?? 'boxed';
    $containerWidth = $layout['container_width'] ?? 'default';
    $customWidth = $layout['custom_width'] ?? 1200;
    $contentAlignment = $layout['content_alignment'] ?? 'center';
    
    // Extract dimensions
    $dimensions = $helper->generalSettings('dimensions', []);
    $minHeight = $dimensions['min_height'] ?? 0;
    $heightUnit = $dimensions['height_unit'] ?? 'auto';
    $customHeight = $dimensions['custom_height'] ?? 600;
    $verticalAlignment = $dimensions['vertical_alignment'] ?? 'flex-start';
    
    // Extract identity
    $identity = $helper->generalSettings('identity', []);
    $sectionId = $identity['section_id'] ?? '';
    $sectionLabel = $identity['section_label'] ?? '';
    
    // Build layout classes
    $layoutClasses = [
        "layout-{$layoutType}",
        "container-{$containerWidth}",
        "content-align-{$contentAlignment}",
        "height-{$heightUnit}",
        "vertical-{$verticalAlignment}"
    ];
    
    // Container width mapping
    $maxWidth = match($containerWidth) {
        'wide' => '1400px',
        'full' => '1600px',
        'custom' => $customWidth . 'px',
        default => '1200px'
    };
    
    // Height styles
    $heightStyles = [];
    if ($heightUnit === 'viewport') {
        $heightStyles[] = 'min-height: 100vh';
    } elseif ($heightUnit === 'custom') {
        $heightStyles[] = "height: {$customHeight}px";
    } elseif ($minHeight > 0) {
        $heightStyles[] = "min-height: {$minHeight}px";
    }
    
    // Layout styles
    $layoutStyles = [];
    if ($layoutType !== 'full_width') {
        $layoutStyles[] = "max-width: {$maxWidth}";
        $layoutStyles[] = "margin-left: auto";
        $layoutStyles[] = "margin-right: auto";
    }
    
    // Content container class
    $containerClass = $layoutType === 'full_width' ? 'section-content-full' : 'section-content-container';
    
    // Combine all styles
    $allStyles = array_merge($heightStyles, $layoutStyles);
    $layoutStyleString = !empty($allStyles) ? implode('; ', $allStyles) : '';
    
    // Final classes
    $finalClasses = trim($cssClasses . ' ' . implode(' ', $layoutClasses));
@endphp

<section 
    class="{{ $finalClasses }}"
    @if($sectionId) id="{{ Str::slug($sectionId) }}" @endif
    @if($sectionLabel) data-section-label="{{ $sectionLabel }}" @endif
    data-widget-type="section"
    data-layout-type="{{ $layoutType }}"
    data-container-width="{{ $containerWidth }}"
    @if($layoutStyleString || $inlineStyles)
        style="{{ $inlineStyles }}{{ $inlineStyles && $layoutStyleString ? '; ' : '' }}{{ $layoutStyleString }}"
    @endif
>
    <div class="{{ $containerClass }} relative w-full">
        {{-- Section content will be dynamically inserted here by the page builder --}}
        <div class="section-widgets-container">
            <!-- Widgets will be rendered here -->
        </div>
    </div>
    
    {{-- Optional section overlay for background images --}}
    @if($helper->styleSettings('section_background.background_overlay', false))
        <div class="absolute inset-0 pointer-events-none section-overlay" 
             style="background-color: {{ $helper->styleSettings('section_background.overlay_color', 'rgba(0,0,0,0.3)') }}">
        </div>
    @endif
</section>

{{-- Add section-specific CSS --}}
@push('styles')
<style>
    /* Section Layout Styles */
    .widget-section {
        position: relative;
        display: flex;
        flex-direction: column;
    }
    
    /* Layout Type Styles */
    .widget-section.layout-boxed .section-content-container,
    .widget-section.layout-full_width_contained .section-content-container {
        width: 100%;
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .widget-section.layout-full_width .section-content-full {
        width: 100%;
    }
    
    /* Content Alignment */
    .widget-section.content-align-left .section-content-container { text-align: left; }
    .widget-section.content-align-center .section-content-container { text-align: center; }
    .widget-section.content-align-right .section-content-container { text-align: right; }
    
    /* Vertical Alignment for Fixed Heights */
    .widget-section.height-viewport,
    .widget-section.height-custom {
        display: flex;
        flex-direction: column;
    }
    
    .widget-section.vertical-flex-start .section-content-container { justify-content: flex-start; align-items: flex-start; }
    .widget-section.vertical-center .section-content-container { justify-content: center; align-items: center; display: flex; }
    .widget-section.vertical-flex-end .section-content-container { justify-content: flex-end; align-items: flex-end; }
    
    /* Responsive Container Widths */
    @media (max-width: 640px) {
        .widget-section:not(.layout-full_width) .section-content-container {
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
    
    @media (min-width: 641px) and (max-width: 1024px) {
        .widget-section:not(.layout-full_width) .section-content-container {
            padding-left: 2rem;
            padding-right: 2rem;
        }
    }
    
    /* Section Widgets Container */
    .section-widgets-container {
        position: relative;
        z-index: 1;
        width: 100%;
    }
    
    /* Section Overlay */
    .section-overlay {
        z-index: 0;
    }
</style>
@endpush
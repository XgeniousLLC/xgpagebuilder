{{-- 
Heading Widget Blade Template

Available variables:
- $settings: All widget settings
- $general: General settings
- $style: Style settings
- $advanced: Advanced settings
- $widget: Widget metadata
- $css_classes: Compiled CSS classes
- $inline_styles: Compiled inline styles
--}}

@php
    // Extract content settings
    $content = $general['content'] ?? [];
    $link = $general['link'] ?? [];
    
    $text = e($content['heading_text'] ?? 'Your Heading Text');
    $level = $content['heading_level'] ?? 'h2';
    $align = $content['text_align'] ?? 'left';
    
    // Extract link settings
    $enableLink = $link['enable_link'] ?? false;
    $linkUrl = e($link['link_url'] ?? '#');
    $linkTarget = $link['link_target'] ?? '_self';
    $linkNofollow = $link['link_nofollow'] ?? false;
    
    // Build classes
    $classes = [
        'heading-element',
        'heading-' . $level,
        'pagebuilder-heading',
        $css_classes
    ];
    
    // Add alignment class
    if ($align !== 'left') {
        $classes[] = 'text-' . $align;
    }
    
    $classString = implode(' ', array_filter($classes));
    
    // Build link attributes
    $linkAttributes = [];
    if ($enableLink) {
        $linkAttributes['href'] = $linkUrl;
        $linkAttributes['target'] = $linkTarget;
        if ($linkNofollow) {
            $linkAttributes['rel'] = 'nofollow';
        }
    }
    
@endphp

@if($enableLink)
    <{{ $level }} class="{{ $classString }}">
        <a @foreach($linkAttributes as $attr => $value) {{ $attr }}="{{ $value }}" @endforeach>
            {{ $text }}
        </a>
    </{{ $level }}>
@else
    <{{ $level }} class="{{ $classString }}">
        {{ $text }}
    </{{ $level }}>
@endif
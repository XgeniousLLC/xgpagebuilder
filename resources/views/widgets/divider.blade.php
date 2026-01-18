{{--
Divider Widget Blade Template

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
    // Extract general settings from style_type group
    $styleType = $general['style_type'] ?? [];
    $dividerType = $styleType['divider_type'] ?? 'simple';
    $lineStyle = $styleType['line_style'] ?? 'solid';

    // Extract from line_appearance group
    $lineAppearance = $general['line_appearance'] ?? [];
    $dividerWidth = $lineAppearance['divider_width'] ?? 100;
    $dividerAlignment = $lineAppearance['divider_alignment'] ?? 'center';
    $thickness = $lineAppearance['thickness'] ?? 1;

    // Text settings from text_content group
    $textContent = $general['text_content'] ?? [];
    $dividerText = e($textContent['divider_text'] ?? 'OR');
    $textPosition = $textContent['text_position'] ?? 'center';

    // Icon settings from icon_content group
    $iconContent = $general['icon_content'] ?? [];
    $dividerIcon = $iconContent['divider_icon'] ?? 'star';
    $iconPosition = $iconContent['icon_position'] ?? 'center';

    // Extract style settings
    $lineColor = $style['line_color'] ?? '#CCCCCC';
    $gradientStart = $style['gradient_start'] ?? '#3B82F6';
    $gradientEnd = $style['gradient_end'] ?? '#EF4444';
    $gradientDirection = $style['gradient_direction'] ?? 'to right';

    // Text style settings
    $textColor = $style['text_color'] ?? '#333333';
    $textBackground = $style['text_background'] ?? '#FFFFFF';
    $textFontSize = $style['text_font_size'] ?? 14;
    $textFontWeight = $style['text_font_weight'] ?? '500';

    // Icon style settings
    $iconColor = $style['icon_color'] ?? '#666666';
    $iconBackground = $style['icon_background'] ?? '#FFFFFF';
    $iconSize = $style['icon_size'] ?? 16;

    // Build container classes
    $containerClasses = [
        'divider-container',
        'divider-' . $dividerType,
        $css_classes
    ];

    if ($dividerAlignment !== 'center') {
        $containerClasses[] = 'align-' . $dividerAlignment;
    }

    $containerClass = implode(' ', array_filter($containerClasses));

    // Build line classes
    $lineClasses = ['divider-line', 'style-' . $lineStyle];
    $lineClass = implode(' ', $lineClasses);

    // Build container styles
    $containerStyles = [];
    if ($dividerAlignment === 'center') {
        $containerStyles[] = 'text-align: center';
    } elseif ($dividerAlignment === 'right') {
        $containerStyles[] = 'text-align: right';
    } else {
        $containerStyles[] = 'text-align: left';
    }

    if ($inline_styles) {
        $containerStyles[] = $inline_styles;
    }

    $containerStyle = implode('; ', $containerStyles);

    // Build line styles
    $lineStyles = [];
    $lineStyles[] = 'width: ' . $dividerWidth . '%';
    $lineStyles[] = 'border-top-width: ' . $thickness . 'px';
    $lineStyles[] = 'border-top-style: ' . $lineStyle;

    if ($dividerType === 'gradient') {
        $lineStyles[] = 'background: linear-gradient(' . $gradientDirection . ', ' . $gradientStart . ', ' . $gradientEnd . ')';
        $lineStyles[] = 'border: none';
        $lineStyles[] = 'height: ' . $thickness . 'px';
    } else {
        $lineStyles[] = 'border-color: ' . $lineColor;
    }

    $lineStyle = implode('; ', $lineStyles);

    // Text styles
    $textStyles = [];
    $textStyles[] = 'color: ' . $textColor;
    $textStyles[] = 'background-color: ' . $textBackground;
    $textStyles[] = 'font-size: ' . $textFontSize . 'px';
    $textStyles[] = 'font-weight: ' . $textFontWeight;
    $textStyles[] = 'padding: 0 15px';
    $textStyle = implode('; ', $textStyles);

    // Icon styles
    $iconStyles = [];
    $iconStyles[] = 'color: ' . $iconColor;
    $iconStyles[] = 'background-color: ' . $iconBackground;
    $iconStyles[] = 'font-size: ' . $iconSize . 'px';
    $iconStyles[] = 'padding: 8px 15px';
    $iconStyle = implode('; ', $iconStyles);
@endphp

<div class="{{ $containerClass }}" style="{{ $containerStyle }}">
    @if($dividerType === 'text')
        @if($textPosition === 'center')
            <div class="divider-wrapper" style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div class="{{ $lineClass }}" style="{{ $lineStyle }}; position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%);"></div>
                <span class="divider-text position-{{ $textPosition }}" style="{{ $textStyle }}; position: relative; z-index: 1;">{{ $dividerText }}</span>
            </div>
        @else
            @php
                $flexDirection = $textPosition === 'left' ? 'row' : 'row-reverse';
            @endphp
            <div class="divider-wrapper" style="display: flex; align-items: center; flex-direction: {{ $flexDirection }};">
                <span class="divider-text position-{{ $textPosition }}" style="{{ $textStyle }}">{{ $dividerText }}</span>
                <div class="{{ $lineClass }}" style="{{ $lineStyle }}; flex: 1; margin: 0 10px;"></div>
            </div>
        @endif
    @elseif($dividerType === 'icon')
        @if($iconPosition === 'center')
            <div class="divider-wrapper" style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div class="{{ $lineClass }}" style="{{ $lineStyle }}; position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%);"></div>
                <i class="divider-icon las la-{{ $dividerIcon }} position-{{ $iconPosition }}" style="{{ $iconStyle }}; position: relative; z-index: 1;"></i>
            </div>
        @else
            @php
                $flexDirection = $iconPosition === 'left' ? 'row' : 'row-reverse';
            @endphp
            <div class="divider-wrapper" style="display: flex; align-items: center; flex-direction: {{ $flexDirection }};">
                <i class="divider-icon las la-{{ $dividerIcon }} position-{{ $iconPosition }}" style="{{ $iconStyle }}"></i>
                <div class="{{ $lineClass }}" style="{{ $lineStyle }}; flex: 1; margin: 0 10px;"></div>
            </div>
        @endif
    @else
        {{-- Simple or gradient divider --}}
        <div class="{{ $lineClass }}" style="{{ $lineStyle }}"></div>
    @endif
</div>
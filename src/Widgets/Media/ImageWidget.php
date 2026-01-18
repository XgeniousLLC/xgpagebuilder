<?php

namespace Xgenious\PageBuilder\Widgets\Media;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * ImageWidget - Provides image display with advanced styling and responsive controls
 * 
 * Features:
 * - Image upload/URL input
 * - Alt text for accessibility
 * - Responsive dimensions
 * - Multiple alignment options
 * - Link functionality
 * - Hover effects
 * - Lazy loading support
 * - Caption support
 * 
 * @package Plugins\Pagebuilder\Widgets\Media
 */
class ImageWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'image';
    }

    protected function getWidgetName(): string
    {
        return 'Image';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-image';
    }

    protected function getWidgetDescription(): string
    {
        return 'Display images with advanced styling, responsive settings, and hover effects';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::MEDIA;
    }

    protected function getWidgetTags(): array
    {
        return ['image', 'media', 'photo', 'picture', 'responsive', 'gallery'];
    }

    /**
     * General settings for image content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        // Image Content Group
        $control->addGroup('content', 'Image Content')
            ->registerField('image_source', FieldManager::IMAGE()
                ->setLabel('Choose Image')
                ->setDefault('')
                ->setRequired(true)
                ->setAllowedTypes(['jpeg', 'png', 'gif', 'webp', 'svg'])
                ->setDescription('Select or upload an image')
            )
            ->registerField('image_alt', FieldManager::TEXT()
                ->setLabel('Alt Text')
                ->setDefault('')
                ->setPlaceholder('Describe the image for accessibility')
                ->setDescription('Alternative text for screen readers and SEO')
            )
            ->registerField('image_title', FieldManager::TEXT()
                ->setLabel('Title Text')
                ->setDefault('')
                ->setPlaceholder('Image title (tooltip)')
                ->setDescription('Title attribute shown on hover')
            )
            ->endGroup();

        // Caption Group
        $control->addGroup('caption', 'Caption Settings')
            ->registerField('show_caption', FieldManager::TOGGLE()
                ->setLabel('Show Caption')
                ->setDefault(false)
                ->setDescription('Display a caption below the image')
            )
            ->registerField('caption_text', FieldManager::TEXTAREA()
                ->setLabel('Caption Text')
                ->setDefault('')
                ->setRows(2)
                ->setPlaceholder('Enter image caption...')
                ->setCondition(['show_caption' => true])
                ->setDescription('Text to display as image caption')
            )
            ->registerField('caption_position', FieldManager::SELECT()
                ->setLabel('Caption Position')
                ->setDefault('bottom')
                ->setOptions([
                    'top' => 'Above Image',
                    'bottom' => 'Below Image',
                    'overlay-bottom' => 'Overlay Bottom',
                    'overlay-top' => 'Overlay Top',
                    'overlay-center' => 'Overlay Center'
                ])
                ->setCondition(['show_caption' => true])
            )
            ->endGroup();

        // Link Group
        $control->addGroup('link', 'Link Settings')
            ->registerField('enable_link', FieldManager::TOGGLE()
                ->setLabel('Enable Link')
                ->setDefault(false)
                ->setDescription('Make the image clickable')
            )
            ->registerField('link_type', FieldManager::SELECT()
                ->setLabel('Link Type')
                ->setDefault('url')
                ->setOptions([
                    'url' => 'Custom URL',
                    'lightbox' => 'Lightbox',
                    'media' => 'Media File'
                ])
                ->setCondition(['enable_link' => true])
            )
            ->registerField('link_url', FieldManager::URL()
                ->setLabel('Link URL')
                ->setDefault('#')
                ->setPlaceholder('https://example.com')
                ->setCondition(['enable_link' => true, 'link_type' => 'url'])
                ->setDescription('The destination URL')
            )
            ->registerField('link_target', FieldManager::SELECT()
                ->setLabel('Link Target')
                ->setDefault('_self')
                ->setOptions([
                    '_self' => 'Same Window',
                    '_blank' => 'New Window',
                    '_parent' => 'Parent Frame',
                    '_top' => 'Top Frame'
                ])
                ->setCondition(['enable_link' => true, 'link_type' => 'url'])
            )
            ->endGroup();

        // Behavior Group
        $control->addGroup('behavior', 'Behavior Settings')
            ->registerField('lazy_loading', FieldManager::TOGGLE()
                ->setLabel('Lazy Loading')
                ->setDefault(true)
                ->setDescription('Load image only when it comes into view')
            )
            ->registerField('image_size', FieldManager::SELECT()
                ->setLabel('Image Size')
                ->setDefault('full')
                ->setOptions([
                    'thumbnail' => 'Thumbnail (150px)',
                    'medium' => 'Medium (300px)',
                    'medium_large' => 'Medium Large (768px)',
                    'large' => 'Large (1024px)',
                    'full' => 'Full Size'
                ])
                ->setDescription('Choose image size variant to load')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings with comprehensive image styling controls
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Image Dimensions Group
        $control->addGroup('dimensions', 'Dimensions')
            ->registerField('width', FieldManager::NUMBER()
                ->setLabel('Width')
                ->setDefault('')
                ->setMin(0)
                ->setMax(2000)
                ->setUnit('px')
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'width: {{VALUE}}{{UNIT}};'
                ])
                ->setDescription('Set image width (leave empty for auto)')
            )
            ->registerField('max_width', FieldManager::NUMBER()
                ->setLabel('Max Width')
                ->setDefault(100)
                ->setMin(0)
                ->setMax(100)
                ->setUnit('%')
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'max-width: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('height', FieldManager::NUMBER()
                ->setLabel('Height')
                ->setDefault('')
                ->setMin(0)
                ->setMax(1000)
                ->setUnit('px')
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'height: {{VALUE}}{{UNIT}};'
                ])
                ->setDescription('Set image height (leave empty for auto)')
            )
            ->registerField('object_fit', FieldManager::SELECT()
                ->setLabel('Object Fit')
                ->setDefault('cover')
                ->setOptions([
                    'fill' => 'Fill',
                    'contain' => 'Contain',
                    'cover' => 'Cover',
                    'none' => 'None',
                    'scale-down' => 'Scale Down'
                ])
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'object-fit: {{VALUE}};'
                ])
            )
            ->registerField('object_position', FieldManager::SELECT()
                ->setLabel('Object Position')
                ->setDefault('center center')
                ->setOptions([
                    'top left' => 'Top Left',
                    'top center' => 'Top Center',
                    'top right' => 'Top Right',
                    'center left' => 'Center Left',
                    'center center' => 'Center Center',
                    'center right' => 'Center Right',
                    'bottom left' => 'Bottom Left',
                    'bottom center' => 'Bottom Center',
                    'bottom right' => 'Bottom Right'
                ])
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'object-position: {{VALUE}};'
                ])
            )
            ->endGroup();

        // Position & Alignment Group
        $control->addGroup('alignment', 'Position & Alignment')
            ->registerField('image_alignment', FieldManager::ALIGNMENT()
                ->setLabel('Image Alignment')
                ->asFlexAlign()
                ->setShowNone(true)
                ->setShowJustify(false)
                ->setDefault('none')
                ->setResponsive(true)
                ->setDescription('Align image within its container')
            )
            ->registerField('display', FieldManager::SELECT()
                ->setLabel('Display')
                ->setDefault('block')
                ->setOptions([
                    'block' => 'Block',
                    'inline-block' => 'Inline Block',
                    'inline' => 'Inline'
                ])
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'display: {{VALUE}};'
                ])
            )
            ->endGroup();

        // Border & Effects Group
        $control->addGroup('border', 'Border & Effects')
            ->registerField('border_width', FieldManager::NUMBER()
                ->setLabel('Border Width')
                ->setDefault(0)
                ->setMin(0)
                ->setMax(20)
                ->setUnit('px')
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'border-width: {{VALUE}}{{UNIT}}; border-style: solid;'
                ])
            )
            ->registerField('border_color', FieldManager::COLOR()
                ->setLabel('Border Color')
                ->setDefault('#000000')
                ->setCondition(['border_width' => ['>', 0]])
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'border-color: {{VALUE}};'
                ])
            )
            ->registerField('border_radius', FieldManager::DIMENSION()
                ->setLabel('Border Radius')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setMin(0)
                ->setMax(100)
                ->setLinked(true)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->registerField('box_shadow', FieldManager::TEXT()
                ->setLabel('Box Shadow')
                ->setDefault('none')
                ->setPlaceholder('0 4px 8px rgba(0,0,0,0.1)')
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'box-shadow: {{VALUE}};'
                ])
                ->setDescription('CSS box-shadow property')
            )
            ->endGroup();

        // Hover Effects Group
        $control->addGroup('hover', 'Hover Effects')
            ->registerField('hover_animation', FieldManager::SELECT()
                ->setLabel('Hover Animation')
                ->setDefault('none')
                ->setOptions([
                    'none' => 'None',
                    'zoom-in' => 'Zoom In',
                    'zoom-out' => 'Zoom Out',
                    'scale-up' => 'Scale Up',
                    'scale-down' => 'Scale Down',
                    'rotate' => 'Rotate',
                    'slide-up' => 'Slide Up',
                    'slide-down' => 'Slide Down',
                    'fade' => 'Fade',
                    'blur' => 'Blur',
                    'grayscale' => 'Grayscale'
                ])
                ->setDescription('Animation effect on hover')
            )
            ->registerField('hover_transition_duration', FieldManager::NUMBER()
                ->setLabel('Transition Duration')
                ->setDefault(300)
                ->setMin(0)
                ->setMax(2000)
                ->setStep(50)
                ->setUnit('ms')
                ->setSelectors([
                    '{{WRAPPER}} .image-element' => 'transition-duration: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('hover_opacity', FieldManager::NUMBER()
                ->setLabel('Hover Opacity')
                ->setDefault(1)
                ->setMin(0)
                ->setMax(1)
                ->setStep(0.1)
                ->setSelectors([
                    '{{WRAPPER}} .image-element:hover' => 'opacity: {{VALUE}};'
                ])
            )
            ->registerField('hover_brightness', FieldManager::NUMBER()
                ->setLabel('Hover Brightness')
                ->setDefault(100)
                ->setMin(0)
                ->setMax(200)
                ->setUnit('%')
                ->setSelectors([
                    '{{WRAPPER}} .image-element:hover' => 'filter: brightness({{VALUE}}{{UNIT}});'
                ])
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField('margin', FieldManager::DIMENSION()
                ->setLabel('Margin')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setAllowNegative(true)
                ->setMin(-100)
                ->setMax(100)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .image-container' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                ->setUnits(['px', 'em', 'rem', '%'])
                ->setMin(0)
                ->setMax(100)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .image-container' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        // Caption Styling Group
        $control->addGroup('caption_style', 'Caption Style')
            ->registerField('caption_font_size', FieldManager::NUMBER()
                ->setLabel('Caption Font Size')
                ->setDefault(14)
                ->setMin(10)
                ->setMax(24)
                ->setUnit('px')
                ->setCondition(['show_caption' => true])
                ->setSelectors([
                    '{{WRAPPER}} .image-caption' => 'font-size: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('caption_color', FieldManager::COLOR()
                ->setLabel('Caption Color')
                ->setDefault('#666666')
                ->setCondition(['show_caption' => true])
                ->setSelectors([
                    '{{WRAPPER}} .image-caption' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('caption_background', FieldManager::COLOR()
                ->setLabel('Caption Background')
                ->setDefault('')
                ->setCondition(['show_caption' => true])
                ->setSelectors([
                    '{{WRAPPER}} .image-caption' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('caption_padding', FieldManager::DIMENSION()
                ->setLabel('Caption Padding')
                ->setDefault(['top' => 8, 'right' => 12, 'bottom' => 8, 'left' => 12])
                ->setUnits(['px', 'em'])
                ->setMin(0)
                ->setMax(50)
                ->setResponsive(true)
                ->setCondition(['show_caption' => true])
                ->setSelectors([
                    '{{WRAPPER}} .image-caption' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the image HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];
        
        // Access nested content structure
        $content = $general['content'] ?? [];
        $caption = $general['caption'] ?? [];
        $link = $general['link'] ?? [];
        $behavior = $general['behavior'] ?? [];
        
        $imageSrc = $content['image_source'] ?? '';
        $imageAlt = htmlspecialchars($content['image_alt'] ?? '', ENT_QUOTES, 'UTF-8');
        $imageTitle = htmlspecialchars($content['image_title'] ?? '', ENT_QUOTES, 'UTF-8');
        
        $showCaption = $caption['show_caption'] ?? false;
        $captionText = htmlspecialchars($caption['caption_text'] ?? '', ENT_QUOTES, 'UTF-8');
        $captionPosition = $caption['caption_position'] ?? 'bottom';
        
        $enableLink = $link['enable_link'] ?? false;
        $linkType = $link['link_type'] ?? 'url';
        $linkUrl = $link['link_url'] ?? '#';
        $linkTarget = $link['link_target'] ?? '_self';
        
        $lazyLoading = $behavior['lazy_loading'] ?? true;
        $imageSize = $behavior['image_size'] ?? 'full';
        
        $imageAlignment = $style['image_alignment'] ?? 'none';
        $hoverAnimation = $style['hover_animation'] ?? 'none';
        
        if (empty($imageSrc)) {
            return '<div class="image-placeholder">No image selected</div>';
        }
        
        $classes = ['image-container'];
        
        // Add alignment class
        if ($imageAlignment !== 'none') {
            $classes[] = 'image-align-' . $imageAlignment;
        }
        
        // Add hover animation class
        if ($hoverAnimation !== 'none') {
            $classes[] = 'hover-' . $hoverAnimation;
        }
        
        // Add caption position class
        if ($showCaption) {
            $classes[] = 'has-caption';
            $classes[] = 'caption-' . $captionPosition;
        }
        
        $containerClass = implode(' ', $classes);
        
        // Build image attributes
        $imageAttributes = [
            'class' => 'image-element',
            'src' => htmlspecialchars($imageSrc, ENT_QUOTES, 'UTF-8'),
            'alt' => $imageAlt
        ];
        
        if (!empty($imageTitle)) {
            $imageAttributes['title'] = $imageTitle;
        }
        
        if ($lazyLoading) {
            $imageAttributes['loading'] = 'lazy';
        }
        
        $imageAttrs = '';
        foreach ($imageAttributes as $attr => $value) {
            $imageAttrs .= ' ' . $attr . '="' . $value . '"';
        }
        
        $imageTag = "<img{$imageAttrs} />";
        
        // Wrap with link if enabled
        if ($enableLink) {
            $linkAttributes = [];
            
            switch ($linkType) {
                case 'url':
                    $linkAttributes['href'] = htmlspecialchars($linkUrl, ENT_QUOTES, 'UTF-8');
                    $linkAttributes['target'] = $linkTarget;
                    break;
                case 'lightbox':
                    $linkAttributes['href'] = htmlspecialchars($imageSrc, ENT_QUOTES, 'UTF-8');
                    $linkAttributes['data-lightbox'] = 'image';
                    break;
                case 'media':
                    $linkAttributes['href'] = htmlspecialchars($imageSrc, ENT_QUOTES, 'UTF-8');
                    $linkAttributes['target'] = '_blank';
                    break;
            }
            
            $linkAttrs = '';
            foreach ($linkAttributes as $attr => $value) {
                $linkAttrs .= ' ' . $attr . '="' . $value . '"';
            }
            
            $imageTag = "<a{$linkAttrs}>{$imageTag}</a>";
        }
        
        // Add caption if enabled
        $captionTag = '';
        if ($showCaption && !empty($captionText)) {
            $captionClasses = ['image-caption'];
            if (strpos($captionPosition, 'overlay') === 0) {
                $captionClasses[] = 'caption-overlay';
                $captionClasses[] = str_replace('overlay-', 'overlay-', $captionPosition);
            }
            
            $captionClass = implode(' ', $captionClasses);
            $captionTag = "<div class=\"{$captionClass}\">{$captionText}</div>";
        }
        
        // Arrange content based on caption position
        $content = '';
        if ($captionPosition === 'top') {
            $content = $captionTag . $imageTag;
        } elseif (strpos($captionPosition, 'overlay') === 0) {
            $content = '<div class="image-wrapper">' . $imageTag . $captionTag . '</div>';
        } else {
            $content = $imageTag . $captionTag;
        }
        
        return "<div class=\"{$containerClass}\">{$content}</div>";
    }

    /**
     * Generate CSS for this widget instance
     */
    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $styleControl = new ControlManager();
        
        // Register style fields for CSS generation
        $this->registerStyleFields($styleControl);
        
        $css = $styleControl->generateCSS($widgetId, $settings['style'] ?? []);
        
        // Add hover animation CSS
        $style = $settings['style'] ?? [];
        $hoverAnimation = $style['hover_animation'] ?? 'none';
        
        if ($hoverAnimation !== 'none') {
            $css .= $this->generateHoverAnimationCSS($widgetId, $hoverAnimation);
        }
        
        // Add alignment CSS
        $imageAlignment = $style['image_alignment'] ?? 'none';
        if ($imageAlignment !== 'none') {
            $css .= $this->generateAlignmentCSS($widgetId, $imageAlignment);
        }
        
        return $css;
    }

    /**
     * Generate hover animation specific CSS
     */
    private function generateHoverAnimationCSS(string $widgetId, string $animation): string
    {
        $css = '';
        
        switch ($animation) {
            case 'zoom-in':
                $css .= "\n#{$widgetId} .image-element:hover { transform: scale(1.1); }";
                break;
            case 'zoom-out':
                $css .= "\n#{$widgetId} .image-element:hover { transform: scale(0.9); }";
                break;
            case 'scale-up':
                $css .= "\n#{$widgetId} .image-element:hover { transform: scale(1.05); }";
                break;
            case 'scale-down':
                $css .= "\n#{$widgetId} .image-element:hover { transform: scale(0.95); }";
                break;
            case 'rotate':
                $css .= "\n#{$widgetId} .image-element:hover { transform: rotate(5deg); }";
                break;
            case 'slide-up':
                $css .= "\n#{$widgetId} .image-element:hover { transform: translateY(-10px); }";
                break;
            case 'slide-down':
                $css .= "\n#{$widgetId} .image-element:hover { transform: translateY(10px); }";
                break;
            case 'blur':
                $css .= "\n#{$widgetId} .image-element:hover { filter: blur(2px); }";
                break;
            case 'grayscale':
                $css .= "\n#{$widgetId} .image-element:hover { filter: grayscale(100%); }";
                break;
        }
        
        return $css;
    }

    /**
     * Generate alignment specific CSS
     */
    private function generateAlignmentCSS(string $widgetId, string $alignment): string
    {
        $css = '';
        
        switch ($alignment) {
            case 'left':
                $css .= "\n#{$widgetId} .image-container { text-align: left; }";
                break;
            case 'center':
                $css .= "\n#{$widgetId} .image-container { text-align: center; }";
                $css .= "\n#{$widgetId} .image-element { margin-left: auto; margin-right: auto; }";
                break;
            case 'right':
                $css .= "\n#{$widgetId} .image-container { text-align: right; }";
                break;
        }
        
        return $css;
    }

    /**
     * Helper method to register style fields for CSS generation
     */
    private function registerStyleFields(ControlManager $control): void
    {
        // Re-register fields from getStyleFields() for CSS generation
        $this->getStyleFields();
    }
}
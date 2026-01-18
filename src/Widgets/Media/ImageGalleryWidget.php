<?php

namespace Xgenious\PageBuilder\Widgets\Media;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

class ImageGalleryWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'image_gallery';
    }

    protected function getWidgetName(): string
    {
        return 'Image Gallery';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-gallery';
    }

    protected function getWidgetDescription(): string
    {
        return 'Display multiple images in a customizable gallery layout';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::MEDIA;
    }

    protected function getWidgetTags(): array
    {
        return ['gallery', 'images', 'photos', 'media', 'lightbox', 'masonry'];
    }

    protected function isPro(): bool
    {
        return true;
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        // Images Group
        $control->addGroup('images', 'Images')
            ->registerField('gallery_images', FieldManager::REPEATER()
                ->setLabel('Gallery Images')
                ->setMin(1)
                ->setMax(50)
                ->setFields([
                    'image' => FieldManager::IMAGE()
                        ->setLabel('Image')
                        ->setRequired(true),
                    'alt_text' => FieldManager::TEXT()
                        ->setLabel('Alt Text')
                        ->setPlaceholder('Describe the image'),
                    'caption' => FieldManager::TEXT()
                        ->setLabel('Caption')
                        ->setPlaceholder('Image caption'),
                    'link' => FieldManager::URL()
                        ->setLabel('Link URL')
                        ->setPlaceholder('https://example.com')
                ])
            )
            ->endGroup();
            
        // Layout Group
        $control->addGroup('layout', 'Layout')
            ->registerField('layout_type', FieldManager::SELECT()
                ->setLabel('Layout Type')
                ->setOptions([
                    'grid' => 'Grid',
                    'masonry' => 'Masonry',
                    'carousel' => 'Carousel',
                    'justified' => 'Justified'
                ])
                ->setDefault('grid')
            )
            ->registerField('columns', FieldManager::NUMBER()
                ->setLabel('Columns')
                ->setResponsive(true)
                ->setMin(1)
                ->setMax(8)
                ->setDefault([
                    'desktop' => 3,
                    'tablet' => 2,
                    'mobile' => 1
                ])
                ->setCondition(['layout_type' => ['grid', 'masonry']])
            )
            ->registerField('gap', FieldManager::NUMBER()
                ->setLabel('Gap Between Images')
                ->setUnit('px')
                ->setMin(0)
                ->setMax(50)
                ->setDefault(15)
            )
            ->endGroup();
            
        // Behavior Group
        $control->addGroup('behavior', 'Behavior')
            ->registerField('enable_lightbox', FieldManager::TOGGLE()
                ->setLabel('Enable Lightbox')
                ->setDefault(true)
            )
            ->registerField('show_captions', FieldManager::TOGGLE()
                ->setLabel('Show Captions')
                ->setDefault(true)
            )
            ->registerField('lazy_loading', FieldManager::TOGGLE()
                ->setLabel('Lazy Loading')
                ->setDefault(true)
            )
            ->registerField('infinite_scroll', FieldManager::TOGGLE()
                ->setLabel('Infinite Scroll')
                ->setDefault(false)
                ->setCondition(['layout_type' => 'grid'])
            )
            ->endGroup();
            
        // Carousel Settings Group
        $control->addGroup('carousel_settings', 'Carousel Settings')
            ->registerField('autoplay', FieldManager::TOGGLE()
                ->setLabel('Autoplay')
                ->setDefault(false)
            )
            ->registerField('autoplay_speed', FieldManager::NUMBER()
                ->setLabel('Autoplay Speed (ms)')
                ->setMin(1000)
                ->setMax(10000)
                ->setStep(500)
                ->setDefault(3000)
                ->setCondition(['autoplay' => true])
            )
            ->registerField('show_arrows', FieldManager::TOGGLE()
                ->setLabel('Show Navigation Arrows')
                ->setDefault(true)
            )
            ->registerField('show_dots', FieldManager::TOGGLE()
                ->setLabel('Show Pagination Dots')
                ->setDefault(true)
            )
            ->endGroup();
            
        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();
        
        // Image Styling Group
        $control->addGroup('image_styling', 'Image Styling')
            ->registerField('aspect_ratio', FieldManager::SELECT()
                ->setLabel('Image Aspect Ratio')
                ->setOptions([
                    'auto' => 'Auto',
                    '1:1' => 'Square (1:1)',
                    '4:3' => 'Standard (4:3)',
                    '16:9' => 'Widescreen (16:9)',
                    '3:2' => 'Classic (3:2)',
                    '21:9' => 'Ultrawide (21:9)'
                ])
                ->setDefault('auto')
            )
            ->registerField('image_fit', FieldManager::SELECT()
                ->setLabel('Image Fit')
                ->setOptions([
                    'cover' => 'Cover',
                    'contain' => 'Contain',
                    'fill' => 'Fill',
                    'scale-down' => 'Scale Down'
                ])
                ->setDefault('cover')
                ->setCondition(['aspect_ratio' => ['!=', 'auto']])
            )
            ->registerField('border_radius', FieldManager::NUMBER()
                ->setLabel('Border Radius')
                ->setUnit('px')
                ->setMin(0)
                ->setMax(50)
                ->setDefault(4)
            )
            ->endGroup();
            
        // Hover Effects Group
        $control->addGroup('hover_effects', 'Hover Effects')
            ->registerField('hover_effect', FieldManager::SELECT()
                ->setLabel('Hover Effect')
                ->setOptions([
                    'none' => 'None',
                    'scale' => 'Scale',
                    'fade' => 'Fade',
                    'blur' => 'Blur',
                    'grayscale' => 'Grayscale',
                    'overlay' => 'Overlay'
                ])
                ->setDefault('scale')
            )
            ->registerField('overlay_color', FieldManager::COLOR()
                ->setLabel('Overlay Color')
                ->setDefault('rgba(0,0,0,0.5)')
                ->setCondition(['hover_effect' => 'overlay'])
            )
            ->endGroup();
            
        // Caption Styling Group
        $control->addGroup('caption_styling', 'Caption Styling')
            ->registerField('caption_position', FieldManager::SELECT()
                ->setLabel('Caption Position')
                ->setOptions([
                    'bottom' => 'Bottom',
                    'overlay-bottom' => 'Overlay Bottom',
                    'overlay-center' => 'Overlay Center',
                    'overlay-top' => 'Overlay Top'
                ])
                ->setDefault('bottom')
            )
            ->registerField('caption_background', FieldManager::COLOR()
                ->setLabel('Caption Background')
                ->setDefault('rgba(0,0,0,0.7)')
                ->setCondition(['caption_position' => ['overlay-bottom', 'overlay-center', 'overlay-top']])
            )
            ->registerField('caption_text_color', FieldManager::COLOR()
                ->setLabel('Caption Text Color')
                ->setDefault('#FFFFFF')
            )
            ->registerField('caption_font_size', FieldManager::NUMBER()
                ->setLabel('Caption Font Size')
                ->setUnit('px')
                ->setMin(10)
                ->setMax(24)
                ->setDefault(14)
            )
            ->endGroup();
            
        // Lightbox Styling Group  
        $control->addGroup('lightbox_styling', 'Lightbox Styling')
            ->registerField('lightbox_background', FieldManager::COLOR()
                ->setLabel('Lightbox Background')
                ->setDefault('rgba(0,0,0,0.9)')
            )
            ->registerField('lightbox_controls_color', FieldManager::COLOR()
                ->setLabel('Controls Color')
                ->setDefault('#FFFFFF')
            )
            ->endGroup();
            
        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];
        
        $images = $general['images']['gallery_images'] ?? [];
        $layoutType = $general['layout']['layout_type'] ?? 'grid';
        $columns = $general['layout']['columns'] ?? ['desktop' => 3, 'tablet' => 2, 'mobile' => 1];
        $gap = $general['layout']['gap'] ?? 15;
        
        if (empty($images)) {
            return '<div class="gallery-placeholder">Add images to display gallery</div>';
        }
        
        $classes = ['widget-image-gallery', "gallery-{$layoutType}"];
        $classString = implode(' ', $classes);
        
        $styles = [
            '--gallery-gap: ' . $gap . 'px',
            '--gallery-columns-desktop: ' . ($columns['desktop'] ?? 3),
            '--gallery-columns-tablet: ' . ($columns['tablet'] ?? 2),
            '--gallery-columns-mobile: ' . ($columns['mobile'] ?? 1)
        ];
        
        if (isset($style['image_styling']['border_radius'])) {
            $styles[] = '--image-border-radius: ' . $style['image_styling']['border_radius'] . 'px';
        }
        
        $styleString = 'style="' . implode('; ', $styles) . '"';
        
        $html = "<div class=\"{$classString}\" {$styleString}>";
        
        foreach ($images as $index => $image) {
            $imgSrc = $image['image'] ?? '';
            $altText = $image['alt_text'] ?? '';
            $caption = $image['caption'] ?? '';
            $link = $image['link'] ?? '';
            
            $itemClasses = ['gallery-item'];
            if ($general['behavior']['enable_lightbox'] ?? true) {
                $itemClasses[] = 'lightbox-item';
            }
            
            $itemClassString = implode(' ', $itemClasses);
            
            $html .= "<div class=\"{$itemClassString}\">";
            
            $imgTag = "<img src=\"{$imgSrc}\" alt=\"{$altText}\" loading=\"" . 
                     (($general['behavior']['lazy_loading'] ?? true) ? 'lazy' : 'eager') . "\">";
            
            if ($link) {
                $html .= "<a href=\"{$link}\">{$imgTag}</a>";
            } else {
                $html .= $imgTag;
            }
            
            if ($caption && ($general['behavior']['show_captions'] ?? true)) {
                $html .= "<div class=\"gallery-caption\">{$caption}</div>";
            }
            
            $html .= "</div>";
        }
        
        $html .= "</div>";
        
        return $html;
    }
}
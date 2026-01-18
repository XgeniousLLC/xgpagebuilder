<?php

namespace Xgenious\PageBuilder\Widgets\Content;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * TestimonialWidget - Display customer testimonials with author info
 */
class TestimonialWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'testimonial';
    }

    protected function getWidgetName(): string
    {
        return 'Testimonial';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-quotation';
    }

    protected function getWidgetDescription(): string
    {
        return 'Display customer testimonials with author information and ratings';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CONTENT;
    }

    protected function getWidgetTags(): array
    {
        return ['testimonial', 'review', 'quote', 'customer'];
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Testimonial Content')
            ->registerField('testimonial_text', FieldManager::TEXTAREA()
                ->setLabel('Testimonial Text')
                ->setDefault('This product exceeded my expectations! The quality is outstanding and the service was excellent.')
                ->setRequired(true)
                ->setRows(4)
                ->setDescription('The testimonial content')
            )
            ->registerField('author_name', FieldManager::TEXT()
                ->setLabel('Author Name')
                ->setDefault('John Doe')
                ->setRequired(true)
            )
            ->registerField('author_position', FieldManager::TEXT()
                ->setLabel('Author Position')
                ->setDefault('CEO, Company Name')
            )
            ->registerField('author_image', FieldManager::IMAGE()
                ->setLabel('Author Image')
                ->setAllowedTypes(['jpeg', 'png', 'webp'])
            )
            ->registerField('rating', FieldManager::NUMBER()
                ->setLabel('Rating')
                ->setDefault(5)
                ->setMin(1)
                ->setMax(5)
                ->setDescription('Star rating (1-5)')
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('testimonial_style', 'Testimonial Style')
            ->registerField('background_color', FieldManager::COLOR()
                ->setLabel('Background Color')
                ->setDefault('#f8f9fa')
                ->setSelectors([
                    '{{WRAPPER}} .testimonial-card' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('text_color', FieldManager::COLOR()
                ->setLabel('Text Color')
                ->setDefault('#333333')
                ->setSelectors([
                    '{{WRAPPER}} .testimonial-text' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('author_color', FieldManager::COLOR()
                ->setLabel('Author Color')
                ->setDefault('#666666')
                ->setSelectors([
                    '{{WRAPPER}} .testimonial-author' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('border_radius', FieldManager::NUMBER()
                ->setLabel('Border Radius')
                ->setDefault(8)
                ->setMin(0)
                ->setMax(50)
                ->setUnit('px')
                ->setSelectors([
                    '{{WRAPPER}} .testimonial-card' => 'border-radius: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 30, 'right' => 30, 'bottom' => 30, 'left' => 30])
                ->setUnits(['px', 'em'])
                ->setResponsive(true)
                ->setMin(0)
                ->setMax(100)
                ->setSelectors([
                    '{{WRAPPER}} .testimonial-card' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        
        $testimonialText = htmlspecialchars($general['testimonial_text'] ?? '', ENT_QUOTES, 'UTF-8');
        $authorName = htmlspecialchars($general['author_name'] ?? '', ENT_QUOTES, 'UTF-8');
        $authorPosition = htmlspecialchars($general['author_position'] ?? '', ENT_QUOTES, 'UTF-8');
        $authorImage = $general['author_image'] ?? '';
        $rating = $general['rating'] ?? 5;
        
        $stars = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
        
        $authorImageHtml = '';
        if (!empty($authorImage)) {
            $authorImageHtml = "<img src=\"{$authorImage}\" alt=\"{$authorName}\" class=\"author-image\" />";
        }
        
        return "<div class=\"testimonial-card\">
            <div class=\"testimonial-rating\">{$stars}</div>
            <div class=\"testimonial-text\">\"{$testimonialText}\"</div>
            <div class=\"testimonial-author\">
                {$authorImageHtml}
                <div class=\"author-info\">
                    <div class=\"author-name\">{$authorName}</div>
                    <div class=\"author-position\">{$authorPosition}</div>
                </div>
            </div>
        </div>";
    }

    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $styleControl = new ControlManager();
        $this->registerStyleFields($styleControl);
        
        $css = $styleControl->generateCSS($widgetId, $settings['style'] ?? []);
        
        $css .= "
        #{$widgetId} .testimonial-card { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        #{$widgetId} .testimonial-rating { color: #ffc107; margin-bottom: 15px; font-size: 18px; }
        #{$widgetId} .testimonial-text { font-style: italic; margin-bottom: 20px; font-size: 16px; line-height: 1.6; }
        #{$widgetId} .testimonial-author { display: flex; align-items: center; gap: 15px; }
        #{$widgetId} .author-image { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
        #{$widgetId} .author-name { font-weight: 600; margin-bottom: 5px; }
        #{$widgetId} .author-position { font-size: 14px; opacity: 0.8; }";
        
        return $css;
    }

    private function registerStyleFields(ControlManager $control): void
    {
        $this->getStyleFields();
    }
}
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

        // Fields live inside the `content` group; fall back to the flat shape
        // used by older saved content.
        $content = $general['content'] ?? [];

        $testimonialText = htmlspecialchars($content['testimonial_text'] ?? $general['testimonial_text'] ?? '', ENT_QUOTES, 'UTF-8');
        $authorName = htmlspecialchars($content['author_name'] ?? $general['author_name'] ?? '', ENT_QUOTES, 'UTF-8');
        $authorPosition = htmlspecialchars($content['author_position'] ?? $general['author_position'] ?? '', ENT_QUOTES, 'UTF-8');

        $authorImage = $content['author_image'] ?? $general['author_image'] ?? '';
        if (is_array($authorImage)) {
            $authorImage = $authorImage['url'] ?? '';
        }

        $rating = max(0, min(5, (int) ($content['rating'] ?? $general['rating'] ?? 5)));

        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            $stars .= '<span class="testimonial-star' . ($i <= $rating ? ' filled' : '') . '">★</span>';
        }

        $initials = '';
        if ($authorName !== '') {
            $parts = preg_split('/\s+/', trim($authorName));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr($parts[1] ?? '', 0, 1));
        }

        if (!empty($authorImage)) {
            $avatar = '<img src="' . htmlspecialchars($authorImage, ENT_QUOTES, 'UTF-8') . '" alt="' . $authorName . '" class="author-image" />';
        } else {
            $avatar = '<div class="author-image author-image-placeholder">' . htmlspecialchars($initials, ENT_QUOTES, 'UTF-8') . '</div>';
        }

        return '<figure class="testimonial-card">'
            . '<div class="testimonial-quote-mark" aria-hidden="true">&ldquo;</div>'
            . '<div class="testimonial-rating" aria-label="Rating: ' . $rating . ' out of 5">' . $stars . '</div>'
            . '<blockquote class="testimonial-text">' . $testimonialText . '</blockquote>'
            . '<figcaption class="testimonial-author">'
            . $avatar
            . '<div class="author-info">'
            . '<div class="author-name">' . $authorName . '</div>'
            . '<div class="author-position">' . $authorPosition . '</div>'
            . '</div>'
            . '</figcaption>'
            . '</figure>';
    }

    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $css = "
#{$widgetId} .testimonial-card { position: relative; max-width: 680px; margin: 0 auto; padding: 32px; background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 12px 30px rgba(15, 23, 42, .06); overflow: hidden; }
#{$widgetId} .testimonial-quote-mark { position: absolute; top: 8px; right: 24px; font-family: Georgia, 'Times New Roman', serif; font-size: 96px; line-height: 1; color: rgba(0, 124, 186, .10); pointer-events: none; }
#{$widgetId} .testimonial-rating { display: flex; gap: 4px; margin-bottom: 18px; }
#{$widgetId} .testimonial-star { color: #d1d5db; font-size: 18px; line-height: 1; }
#{$widgetId} .testimonial-star.filled { color: #f59e0b; }
#{$widgetId} .testimonial-text { margin: 0 0 26px; padding: 0; border: 0; font-size: 18px; line-height: 1.75; color: #1f2937; font-style: normal; }
#{$widgetId} .testimonial-author { display: flex; align-items: center; gap: 14px; }
#{$widgetId} .author-image { width: 56px; height: 56px; border-radius: 999px; object-fit: cover; flex: 0 0 56px; }
#{$widgetId} .author-image-placeholder { display: flex; align-items: center; justify-content: center; background: #007cba; color: #ffffff; font-size: 18px; font-weight: 700; }
#{$widgetId} .author-name { margin-bottom: 2px; font-size: 16px; font-weight: 700; color: inherit; }
#{$widgetId} .author-position { font-size: 14px; color: inherit; opacity: .75; }
";

        // Style-field CSS is appended last so user values override the defaults.
        return $css . parent::generateCSS($widgetId, $settings, $sectionId);
    }
}
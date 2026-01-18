<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use App\Utils\URLHandler;

/**
 * Simple Button Widget
 *
 * A straightforward button widget with essential styling options
 * - Basic button types (Primary, Secondary, Success, Danger)
 * - Simple text and link configuration
 * - Essential styling controls
 */
class ButtonWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'button';
    }

    protected function getWidgetName(): string
    {
        return 'Button';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-hand-point-up';
    }

    protected function getWidgetDescription(): string
    {
        return 'A simple button with text, link, and basic styling options';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['button', 'link', 'action', 'cta'];
    }

    /**
     * Get simple button types
     */
    public static function getButtonTypes(): array
    {
        return [
            'primary' => 'Primary Button',
            'secondary' => 'Secondary Button',
            'success' => 'Success Button',
            'danger' => 'Danger Button'
        ];
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Content Group
        $control->addGroup('content', 'Content')
            ->registerField('text', FieldManager::TEXT()
                ->setLabel('Button Text')
                ->setDefault('Click me')
                ->setRequired(true)
            )
            ->registerField('url', FieldManager::ENHANCED_URL()
                ->setLabel('Button Link')
                ->setPlaceholder('https://example.com')
                ->setDefault('#')
            )
            ->endGroup();

        // Button Type Group
        $control->addGroup('type', 'Button Type')
            ->registerField('button_type', FieldManager::SELECT()
                ->setLabel('Button Style')
                ->setOptions(self::getButtonTypes())
                ->setDefault('primary')
            )
            ->registerField('size', FieldManager::SELECT()
                ->setLabel('Size')
                ->setOptions([
                    'small' => 'Small',
                    'normal' => 'Normal',
                    'large' => 'Large'
                ])
                ->setDefault('normal')
            )
            ->endGroup();

        // Layout Group
        $control->addGroup('layout', 'Layout')
            ->registerField('alignment', FieldManager::ALIGNMENT()
                ->setLabel('Alignment')
                ->asTextAlign()
                ->setShowNone(false)
                ->setShowJustify(false)
                ->setDefault('left')
                ->setDescription('Set button alignment within container')
            )
            ->registerField('width', FieldManager::SELECT()
                ->setLabel('Width')
                ->setOptions([
                    'auto' => 'Auto',
                    'full' => 'Full Width'
                ])
                ->setDefault('auto')
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Example of PROPER structure: Tabs with Groups inside

        $control->addGroup('spacing', 'Spacing')
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 12, 'right' => 24, 'bottom' => 12, 'left' => 24])
                ->setUnits(['px', 'em', '%'])
                ->setSelectors([
                    '{{WRAPPER}} .simple-button' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        // Normal State Tab with organized groups
        $control->addTab('normal', 'Normal State')
            // Text Styling Group within Normal tab
            ->addGroup('text_styling', 'Text Color')
                ->registerField('text_color', FieldManager::COLOR()
                    ->setLabel('Text Color')
                    ->setDefault('#FFFFFF')
                    ->setSelectors([
                        '{{WRAPPER}} .simple-button' => 'color: {{VALUE}};'
                    ])
                )
                ->registerField('background_color', FieldManager::BACKGROUND_GROUP()
                    ->setLabel('Background')
                    ->setDefault('#3B82F6')
                    ->setSelectors(['{{WRAPPER}} .simple-button'])
                )
                ->endGroup()
            ->endTab();

        // Hover State Tab with organized groups
        $control->addTab('hover', 'Hover State')
            // Hover Colors Group
            ->addGroup('hover_colors', 'Hover Colors')
                ->registerField('hover_text_color', FieldManager::COLOR()
                    ->setLabel('Text Color')
                    ->setDefault('#FFFFFF')
                    ->setSelectors([
                        '{{WRAPPER}} .simple-button:hover' => 'color: {{VALUE}};'
                    ])
                )
                ->registerField('hover_background_color', FieldManager::BACKGROUND_GROUP()
                    ->setLabel('Background')
                    ->setDefault('#3B82F6')
                    ->setSelectors(['{{WRAPPER}} .simple-button:hover'])
                )
                ->endGroup()
            ->endTab();

        return $control->getFields();
    }


    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        // Content settings
        $content = $general['content'] ?? [];
        $text = $this->sanitizeText($content['text'] ?? 'Click me');

        // Handle both simple URL strings and enhanced URL objects
        $urlData = $content['url'] ?? '#';
        if (is_array($urlData)) {
            // Enhanced URL field returns an object/array
            $url = $this->sanitizeURL($urlData['url'] ?? '#');
            $target = $urlData['target'] ?? '_self';
        } else {
            // Simple URL field returns a string
            $url = $this->sanitizeURL($urlData);
            $target = $content['target'] ?? '_self';
        }

        // Button type and size settings
        $type = $general['type'] ?? [];
        $buttonType = $type['button_type'] ?? 'primary';
        $size = $type['size'] ?? 'normal';

        // Layout settings
        $layout = $general['layout'] ?? [];
        $alignment = $layout['alignment'] ?? 'left';
        $width = $layout['width'] ?? 'auto';

        // Generate dynamic CSS from style tab settings
        $inlineStyles = $this->generateInlineStyles(['style' => $style]);
        $cssClasses = $this->buildCssClasses($settings);

        // Base button classes (minimal, let CSS handle styling)
        $baseClasses = [
            'simple-button',
            'inline-flex',
            'items-center',
            'justify-center',
            'font-medium',
            'transition-all',
            'duration-200',
            'cursor-pointer',
            'select-none',
            'text-decoration-none'
        ];

        // Add type-specific fallback classes (only if no style settings)
        if (empty($style)) {
            switch ($buttonType) {
                case 'primary':
                    $baseClasses = array_merge($baseClasses, [
                        'bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-md'
                    ]);
                    break;
                case 'secondary':
                    $baseClasses = array_merge($baseClasses, [
                        'bg-gray-100', 'text-gray-900', 'px-4', 'py-2', 'rounded-md', 'border'
                    ]);
                    break;
                case 'success':
                    $baseClasses = array_merge($baseClasses, [
                        'bg-green-600', 'text-white', 'px-4', 'py-2', 'rounded-md'
                    ]);
                    break;
                case 'danger':
                    $baseClasses = array_merge($baseClasses, [
                        'bg-red-600', 'text-white', 'px-4', 'py-2', 'rounded-md'
                    ]);
                    break;
            }

            // Size adjustments for fallback
            if ($size === 'small') {
                $baseClasses = array_merge($baseClasses, ['px-3', 'py-1.5', 'text-sm']);
            } elseif ($size === 'large') {
                $baseClasses = array_merge($baseClasses, ['px-6', 'py-3', 'text-lg']);
            }
        }

        // Add width class
        if ($width === 'full') {
            $baseClasses[] = 'w-full';
        }

        // Add alignment classes for wrapper
        $wrapperClasses = [];
        switch ($alignment) {
            case 'center':
                $wrapperClasses[] = 'text-center';
                break;
            case 'right':
                $wrapperClasses[] = 'text-right';
                break;
            default:
                $wrapperClasses[] = 'text-left';
        }

        $buttonClasses = array_merge($baseClasses, explode(' ', $cssClasses));
        $buttonClassString = implode(' ', array_filter($buttonClasses));
        $wrapperClassString = implode(' ', $wrapperClasses);

        // Build attributes
        $attributes = [
            'class' => $buttonClassString,
            'href' => $url,
            'target' => $target,
            'style' => $inlineStyles
        ];

        // Build the button HTML
        $attributesString = $this->buildAttributes($attributes);

        return "<div class=\"{$wrapperClassString}\"><a {$attributesString}>{$text}</a></div>";
    }

}

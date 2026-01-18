<?php

namespace Xgenious\PageBuilder\Widgets\Media;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * IconWidget - Display icons with advanced styling and hover effects
 */
class IconWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'icon';
    }

    protected function getWidgetName(): string
    {
        return 'Icon';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-star';
    }

    protected function getWidgetDescription(): string
    {
        return 'Display icons with customizable styling, hover effects, and link functionality';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::MEDIA;
    }

    protected function getWidgetTags(): array
    {
        return ['icon', 'symbol', 'graphic', 'decoration'];
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('content', 'Icon Settings')
            ->registerField('icon_name', FieldManager::ICON()
                ->setLabel('Choose Icon')
                ->setDefault('star')
                ->setRequired(true)
                ->setDescription('Select an icon from the library')
            )
            ->registerField('enable_link', FieldManager::TOGGLE()
                ->setLabel('Enable Link')
                ->setDefault(false)
            )
            ->registerField('link_url', FieldManager::URL()
                ->setLabel('Link URL')
                ->setDefault('#')
                ->setCondition(['enable_link' => true])
            )
            ->registerField('link_target', FieldManager::SELECT()
                ->setLabel('Link Target')
                ->setDefault('_self')
                ->setOptions([
                    '_self' => 'Same Window',
                    '_blank' => 'New Window'
                ])
                ->setCondition(['enable_link' => true])
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('icon_style', 'Icon Style')
            ->registerField('icon_size', FieldManager::NUMBER()
                ->setLabel('Icon Size')
                ->setDefault(48)
                ->setMin(16)
                ->setMax(200)
                ->setUnit('px')
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .icon-element' => 'font-size: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('icon_color', FieldManager::COLOR()
                ->setLabel('Icon Color')
                ->setDefault('#333333')
                ->setSelectors([
                    '{{WRAPPER}} .icon-element' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('icon_hover_color', FieldManager::COLOR()
                ->setLabel('Hover Color')
                ->setDefault('#007cba')
                ->setSelectors([
                    '{{WRAPPER}} .icon-element:hover' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('background_color', FieldManager::COLOR()
                ->setLabel('Background Color')
                ->setDefault('')
                ->setSelectors([
                    '{{WRAPPER}} .icon-element' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 20, 'right' => 20, 'bottom' => 20, 'left' => 20])
                ->setUnits(['px', 'em'])
                ->setMin(0)
                ->setMax(100)
                ->setResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .icon-element' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->registerField('border_radius', FieldManager::NUMBER()
                ->setLabel('Border Radius')
                ->setDefault(0)
                ->setMin(0)
                ->setMax(100)
                ->setUnit('px')
                ->setSelectors([
                    '{{WRAPPER}} .icon-element' => 'border-radius: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('alignment', FieldManager::SELECT()
                ->setLabel('Alignment')
                ->setDefault('center')
                ->setOptions([
                    'left' => 'Left',
                    'center' => 'Center',
                    'right' => 'Right'
                ])
                ->setResponsive(true)
            )
            ->endGroup();

        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];
        
        $iconName = $general['icon_name'] ?? 'star';
        $enableLink = $general['enable_link'] ?? false;
        $linkUrl = $general['link_url'] ?? '#';
        $linkTarget = $general['link_target'] ?? '_self';
        $alignment = $style['alignment'] ?? 'center';
        
        $classes = ['icon-element', 'icon-' . $iconName];
        $classString = implode(' ', $classes);
        
        $iconHtml = "<i class=\"{$classString}\"></i>";
        
        if ($enableLink) {
            $iconHtml = "<a href=\"{$linkUrl}\" target=\"{$linkTarget}\">{$iconHtml}</a>";
        }
        
        $containerClass = 'icon-container align-' . $alignment;
        
        return "<div class=\"{$containerClass}\">{$iconHtml}</div>";
    }

    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $styleControl = new ControlManager();
        $this->registerStyleFields($styleControl);
        
        $css = $styleControl->generateCSS($widgetId, $settings['style'] ?? []);
        
        $style = $settings['style'] ?? [];
        $alignment = $style['alignment'] ?? 'center';
        
        $css .= "\n#{$widgetId} .icon-container.align-{$alignment} { text-align: {$alignment}; }";
        $css .= "\n#{$widgetId} .icon-element { display: inline-block; transition: all 0.3s ease; }";
        
        return $css;
    }

    private function registerStyleFields(ControlManager $control): void
    {
        $this->getStyleFields();
    }
}
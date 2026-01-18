<?php

namespace Xgenious\PageBuilder\Widgets\Interactive;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * TabsWidget - Interactive tabs with customizable content
 */
class TabsWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'tabs';
    }

    protected function getWidgetName(): string
    {
        return 'Tabs';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-tab';
    }

    protected function getWidgetDescription(): string
    {
        return 'Create interactive tabs with customizable content and styling';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::INTERACTIVE;
    }

    protected function getWidgetTags(): array
    {
        return ['tabs', 'interactive', 'content', 'toggle'];
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();
        
        $control->addGroup('tabs', 'Tab Configuration')
            ->registerField('tabs_list', FieldManager::REPEATER()
                ->setLabel('Tabs')
                ->setDefault([
                    ['title' => 'Tab 1', 'content' => 'Content for tab 1'],
                    ['title' => 'Tab 2', 'content' => 'Content for tab 2'],
                    ['title' => 'Tab 3', 'content' => 'Content for tab 3']
                ])
                ->setFields([
                    'title' => FieldManager::TEXT()
                        ->setLabel('Tab Title')
                        ->setRequired(true)
                        ->setDefault('Tab Title'),
                    'content' => FieldManager::TEXTAREA()
                        ->setLabel('Tab Content')
                        ->setRows(5)
                        ->setDefault('Tab content goes here...')
                ])
            )
            ->registerField('active_tab', FieldManager::NUMBER()
                ->setLabel('Active Tab')
                ->setDefault(1)
                ->setMin(1)
                ->setMax(10)
                ->setDescription('Which tab should be active by default')
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('tab_style', 'Tab Style')
            ->registerField('tab_background', FieldManager::COLOR()
                ->setLabel('Tab Background')
                ->setDefault('#f8f9fa')
                ->setSelectors([
                    '{{WRAPPER}} .tab-header' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('active_tab_background', FieldManager::COLOR()
                ->setLabel('Active Tab Background')
                ->setDefault('#007cba')
                ->setSelectors([
                    '{{WRAPPER}} .tab-header.active' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('tab_text_color', FieldManager::COLOR()
                ->setLabel('Tab Text Color')
                ->setDefault('#333333')
                ->setSelectors([
                    '{{WRAPPER}} .tab-header' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('content_background', FieldManager::COLOR()
                ->setLabel('Content Background')
                ->setDefault('#ffffff')
                ->setSelectors([
                    '{{WRAPPER}} .tab-content' => 'background-color: {{VALUE}};'
                ])
            )
            ->endGroup();

        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        
        $tabsList = $general['tabs_list'] ?? [];
        $activeTab = $general['active_tab'] ?? 1;
        
        if (empty($tabsList)) {
            return '<div class="tabs-placeholder">No tabs defined</div>';
        }
        
        $tabHeaders = '';
        $tabContents = '';
        
        foreach ($tabsList as $index => $tab) {
            $tabIndex = $index + 1;
            $isActive = $tabIndex === $activeTab;
            $activeClass = $isActive ? ' active' : '';
            
            $title = htmlspecialchars($tab['title'] ?? 'Tab ' . $tabIndex, ENT_QUOTES, 'UTF-8');
            $content = htmlspecialchars($tab['content'] ?? '', ENT_QUOTES, 'UTF-8');
            
            $tabHeaders .= "<div class=\"tab-header{$activeClass}\" data-tab=\"{$tabIndex}\">{$title}</div>";
            
            $contentDisplay = $isActive ? 'block' : 'none';
            $tabContents .= "<div class=\"tab-content\" data-tab=\"{$tabIndex}\" style=\"display: {$contentDisplay};\">{$content}</div>";
        }
        
        return "<div class=\"tabs-widget\">
            <div class=\"tabs-headers\">{$tabHeaders}</div>
            <div class=\"tabs-contents\">{$tabContents}</div>
        </div>";
    }

    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $styleControl = new ControlManager();
        $this->registerStyleFields($styleControl);
        
        $css = $styleControl->generateCSS($widgetId, $settings['style'] ?? []);
        
        $css .= "
        #{$widgetId} .tabs-headers { display: flex; border-bottom: 1px solid #dee2e6; }
        #{$widgetId} .tab-header { padding: 12px 24px; cursor: pointer; border-bottom: 2px solid transparent; }
        #{$widgetId} .tab-header.active { border-bottom-color: #007cba; }
        #{$widgetId} .tabs-contents { padding: 20px; }
        #{$widgetId} .tab-content { display: none; }
        #{$widgetId} .tab-content.active { display: block; }";
        
        return $css;
    }

    private function registerStyleFields(ControlManager $control): void
    {
        $this->getStyleFields();
    }
}
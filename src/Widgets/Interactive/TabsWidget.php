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

        // Fields are registered inside the `tabs` group; support the flat
        // shape too for older saved content.
        $tabsGroup = $general['tabs'] ?? [];
        $tabsList = $tabsGroup['tabs_list'] ?? $general['tabs_list'] ?? [];
        $activeTab = (int) ($tabsGroup['active_tab'] ?? $general['active_tab'] ?? 1);

        if (empty($tabsList)) {
            return '<div class="tabs-placeholder">No tabs defined</div>';
        }

        $uid = 'xgp-tabs-' . substr(md5(uniqid('', true)), 0, 8);

        $tabHeaders = '';
        $tabContents = '';

        foreach ($tabsList as $index => $tab) {
            $tabIndex = $index + 1;
            $isActive = $tabIndex === $activeTab;

            $title = htmlspecialchars($tab['title'] ?? 'Tab ' . $tabIndex, ENT_QUOTES, 'UTF-8');
            $content = nl2br(htmlspecialchars($tab['content'] ?? '', ENT_QUOTES, 'UTF-8'));

            $tabHeaders .= sprintf(
                '<button type="button" class="tab-header%s" data-tab="%d" role="tab" aria-selected="%s" aria-controls="%s-panel-%d">%s</button>',
                $isActive ? ' active' : '',
                $tabIndex,
                $isActive ? 'true' : 'false',
                $uid,
                $tabIndex,
                $title
            );

            $tabContents .= sprintf(
                '<div class="tab-content%s" id="%s-panel-%d" data-tab="%d" role="tabpanel" style="display:%s;">%s</div>',
                $isActive ? ' active' : '',
                $uid,
                $tabIndex,
                $tabIndex,
                $isActive ? 'block' : 'none',
                $content
            );
        }

        return '<div class="tabs-widget">'
            . '<div class="tabs-headers" role="tablist">' . $tabHeaders . '</div>'
            . '<div class="tabs-contents">' . $tabContents . '</div>'
            . '</div>'
            . $this->tabsScript();
    }

    /**
     * Tab switching for the frontend. The editor injects widget HTML through
     * innerHTML, where <script> tags do not run, so PhpWidgetRenderer also
     * binds the same behaviour there.
     */
    private function tabsScript(): string
    {
        return <<<'HTML'
<script>
(function () {
    if (window.__xgpTabsBound) { return; }
    window.__xgpTabsBound = true;

    document.addEventListener('click', function (event) {
        var header = event.target && event.target.closest ? event.target.closest('.tabs-widget .tab-header') : null;
        if (!header) { return; }
        event.preventDefault();

        var widget = header.closest('.tabs-widget');
        if (!widget) { return; }

        var tab = header.getAttribute('data-tab');
        widget.querySelectorAll('.tab-header').forEach(function (item) {
            var active = item.getAttribute('data-tab') === tab;
            item.classList.toggle('active', active);
            item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        widget.querySelectorAll('.tab-content').forEach(function (panel) {
            var active = panel.getAttribute('data-tab') === tab;
            panel.classList.toggle('active', active);
            panel.style.display = active ? 'block' : 'none';
        });
    });
})();
</script>
HTML;
    }

    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $css = "
#{$widgetId} .tabs-widget { width: 100%; }
#{$widgetId} .tabs-headers { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 8px; margin: 0; padding: 0; border-bottom: 1px solid #e5e7eb; }
#{$widgetId} .tab-header { appearance: none; -webkit-appearance: none; margin: 0; padding: 12px 22px; font-size: 15px; font-weight: 600; line-height: 1.2; color: #4b5563; background: #f3f4f6; border: 1px solid #e5e7eb; border-bottom: none; border-radius: 10px 10px 0 0; cursor: pointer; transition: background-color .2s ease, color .2s ease, box-shadow .2s ease; }
#{$widgetId} .tab-header:hover { background: #e5e7eb; color: #111827; }
#{$widgetId} .tab-header.active { color: #ffffff; background: #007cba; box-shadow: 0 -2px 10px rgba(0, 124, 186, .2); }
#{$widgetId} .tab-header:focus-visible { outline: 2px solid #007cba; outline-offset: 2px; }
#{$widgetId} .tabs-contents { border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden; }
#{$widgetId} .tab-content { display: none; padding: 24px; background: #ffffff; color: #374151; font-size: 16px; line-height: 1.7; }
#{$widgetId} .tab-content.active { display: block; }
";

        // Style-field CSS is appended last so user values override the defaults.
        return $css . parent::generateCSS($widgetId, $settings, $sectionId);
    }
}
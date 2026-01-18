<?php

namespace Xgenious\PageBuilder\Widgets\Theme;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\BladeRenderable;

/**
 * Header Widget - Modern heading widget with automatic styling
 *
 */
class FeaturesWidget extends BaseWidget
{
    use BladeRenderable;

    protected function getWidgetType(): string
    {
        return 'features';
    }

    protected function getWidgetName(): string
    {
        return 'Features';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-border-all';
    }

    protected function getWidgetDescription(): string
    {
        return 'this will allow you to use a features section inside the page builder';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::BASIC;
    }

    protected function getWidgetTags(): array
    {
        return ['features','features item' ];
    }

    /**
     * General settings for heading content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('general_content','General Content')
            ->registerField('header_icon', FieldManager::ICON_INPUT()
                ->setLabel('Header Icon')
                ->setDefaultIcon('las la-star')
                ->setPlaceholder('Click to select an icon')
                ->setDescription('Select an icon to display with your header')
                ->setAllowEmpty(true)
            )
            ->registerField('title', FieldManager::TEXTAREA()
                ->setLabel('Title')
                ->setDefault('Turn Raw Data Into {c}Actionable Insights{/c} Instantly')
                ->setRequired(true)
                ->setPlaceholder('Enter title use {c}color{/c} text')
            )
            ->registerField('description', FieldManager::WYSIWYG()
                ->setLabel('Description')
                ->setDefault('CogniAI is an advanced AI-powered data analytics platform designed to transform raw data into actionable insights.')
                ->setPlaceholder('Enter description text')
            )
        ->endGroup();
        $control->addGroup('list_items','list items')
            ->registerField('cta_list_items',FieldManager::REPEATER()
                ->setLabel('LIst Items')
                ->setFields([
                    'list_text' => FieldManager::TEXT()->setLabel('list Text'),
                ])
                ->setMin(1)
                ->setMax(10)
            )
            ->endGroup();

        $control->addGroup('cta_buttons','Call to Action Buttons')
           ->registerField('cta_buttons_repeater',FieldManager::REPEATER()
               ->setLabel('Gallery Items')
               ->setFields([
                   'btn_text' => FieldManager::IMAGE()->setLabel('Btn Text'),
                   'btn_url' => FieldManager::TEXT()->setLabel('Caption')
               ])
               ->setMin(1)
               ->setMax(10)
           )
        ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings - intentionally empty for header widget
     */
    public function getStyleFields(): array
    {
        // Return completely empty array to remove all style fields
        return [];
    }


    /**
     * Render the heading HTML - Simplified using BaseWidget automation
     */
    public function render(array $settings = []): string
    {
        // Try Blade template first if available
        if ($this->hasBladeTemplate()) {
            $templateData = $this->prepareTemplateData($settings);
            return $this->renderBladeTemplate($this->getDefaultTemplatePath(), $templateData);
        }
        return __('no blade template found for widget: Header');
    }


}

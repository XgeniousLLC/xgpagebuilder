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
        $control->addGroup('list_items','Feature Items')
            ->registerField('cta_list_items',FieldManager::REPEATER()
                ->setLabel('Features')
                ->setFields([
                    'list_icon' => FieldManager::ICON_INPUT()
                        ->setLabel('Icon')
                        ->setDefaultIcon('las la-check'),
                    'list_text' => FieldManager::TEXT()
                        ->setLabel('Title')
                        ->setRequired(true),
                    'list_description' => FieldManager::TEXTAREA()
                        ->setLabel('Description'),
                    'list_url' => FieldManager::URL()
                        ->setLabel('Link URL'),
                ])
                ->setDefault([
                    [
                        'list_icon' => 'las la-bolt',
                        'list_text' => 'Real-Time Analytics',
                        'list_description' => 'Get instant insights from your data streams with real-time processing and visualization capabilities that update every second.',
                        'list_url' => '',
                    ],
                    [
                        'list_icon' => 'las la-lightbulb',
                        'list_text' => 'AI-Powered Insights',
                        'list_description' => 'Leverage advanced machine learning algorithms to uncover hidden patterns, predict trends, and generate actionable recommendations.',
                        'list_url' => '',
                    ],
                    [
                        'list_icon' => 'las la-heart',
                        'list_text' => 'Smart Automation',
                        'list_description' => 'Automate repetitive data tasks, set intelligent alerts, and create custom workflows that trigger based on your business rules.',
                        'list_url' => '',
                    ],
                    [
                        'list_icon' => 'las la-chart-bar',
                        'list_text' => 'Interactive Dashboards',
                        'list_description' => 'Create stunning, customizable dashboards with drag-and-drop widgets that provide clear visibility into your key metrics.',
                        'list_url' => '',
                    ],
                    [
                        'list_icon' => 'las la-lock',
                        'list_text' => 'Enterprise Security',
                        'list_description' => 'Bank-level security with end-to-end encryption, SOC 2 compliance, and granular access controls to protect your sensitive data.',
                        'list_url' => '',
                    ],
                    [
                        'list_icon' => 'las la-terminal',
                        'list_text' => 'Easy Integration',
                        'list_description' => 'Connect with 200+ data sources including databases, APIs, cloud services, and popular business tools in just a few clicks.',
                        'list_url' => '',
                    ],
                ])
                ->setMin(1)
                ->setMax(12)
            )
            ->endGroup();

        $control->addGroup('cta_buttons','Call to Action Buttons')
            ->registerField('cta_text', FieldManager::TEXT()
                ->setLabel('CTA Text')
                ->setDefault('Ready to see these features in action?')
            )
           ->registerField('cta_buttons_repeater',FieldManager::REPEATER()
               ->setLabel('Buttons')
               ->setFields([
                   'btn_text' => FieldManager::TEXT()->setLabel('Button Text'),
                   'btn_url' => FieldManager::URL()->setLabel('Button URL')
               ])
               ->setDefault([
                   ['btn_text' => 'Start Free Trial', 'btn_url' => '#'],
                   ['btn_text' => 'Schedule Demo', 'btn_url' => '#'],
               ])
               ->setMin(0)
               ->setMax(4)
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
        return __('no blade template found for widget: :name', ['name' => $this->getWidgetName()]);
    }


}

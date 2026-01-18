<?php

namespace Xgenious\PageBuilder\Core\Widgets;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\BladeRenderable;

/**
 * HeadingWidget - Modern heading widget with automatic styling
 *
 * Features:
 * - Heading levels H1-H6
 * - Unified typography controls via TYPOGRAPHY_GROUP
 * - Unified background controls via BACKGROUND_GROUP
 * - Text alignment and link functionality
 * - Automatic CSS generation via BaseWidget
 *
 * @package Plugins\Pagebuilder\Widgets\Basic
 */
class HeadingWidget extends BaseWidget
{
    use BladeRenderable;

    protected function getWidgetType(): string
    {
        return 'heading';
    }

    protected function getWidgetName(): string
    {
        return 'Heading';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-heading';
    }

    protected function getWidgetDescription(): string
    {
        return 'Add heading elements (H1-H6) with advanced typography and styling controls';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::CORE;
    }

    protected function getWidgetTags(): array
    {
        return ['heading', 'title', 'text', 'typography', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    }

    /**
     * General settings for heading content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Content Group
        $control->addGroup('content', 'Content Settings')
            ->registerField('heading_text', FieldManager::TEXT()
                ->setLabel('Heading Text')
                ->setDefault('Your Heading Text')
                ->setRequired(true)
                ->setPlaceholder('Enter your heading text')
                ->setDescription('The text content of the heading')
            )
            ->registerField('heading_level', FieldManager::SELECT()
                ->setLabel('Heading Level')
                ->setDefault('h2')
                ->setOptions([
                    'h1' => 'H1 - Main Title',
                    'h2' => 'H2 - Section Title',
                    'h3' => 'H3 - Subsection Title',
                    'h4' => 'H4 - Minor Heading',
                    'h5' => 'H5 - Small Heading',
                    'h6' => 'H6 - Smallest Heading'
                ])
                ->setDescription('Choose the semantic heading level')
            )
            ->registerField('text_align', FieldManager::ALIGNMENT()
                ->setLabel('Text Alignment')
                ->asTextAlign()
                ->setShowNone(false)
                ->setShowJustify(true)
                ->setDefault('left')
                ->setSelectors([
                    '{{WRAPPER}} .heading-element' => 'text-align: {{VALUE}};'
                ])
                ->setDescription('Set text alignment')
            )
            ->endGroup();

        // Enhanced Link Group
        $control->addGroup('link', 'Link Settings')
            ->registerField('enhanced_link', FieldManager::LINK_GROUP()
                ->setLabel('Heading Link')
                ->setDescription('Configure advanced link settings for the heading')
                ->enableAdvancedOptions(true)
                ->enableSEOControls(true)
                ->enableUTMTracking(true)
                ->enableCustomAttributes(true)
                ->enableLinkTesting(true)
                ->setLinkTypes(['internal', 'external', 'email', 'phone'])
                ->setDefaultTarget('_self')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Heading-specific style settings
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Typography Group - Unified control
        $control->addGroup('typography', 'Typography')
            ->registerField('heading_typography', FieldManager::TYPOGRAPHY_GROUP()
                ->setLabel('Typography')
                ->setEnableResponsive(true)
                ->setSelectors([
                    '{{WRAPPER}} .heading-element'
                ])
                ->setDescription('Configure all typography settings for the heading')
            )
            ->endGroup();

        // Colors Group
        $control->addGroup('colors', 'Colors')
            ->registerField('text_color', FieldManager::COLOR()
                ->setLabel('Text Color')
                ->setSelectors([
                    '{{WRAPPER}} .heading-element' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('hover_color', FieldManager::COLOR()
                ->setLabel('Hover Color')
                ->setCondition(['enable_link' => true])
                ->setSelectors([
                    '{{WRAPPER}} .heading-element:hover' => 'color: {{VALUE}};'
                ])
                ->setDescription('Color when hovering over linked heading')
            )
            ->endGroup();

        return $control->getFields();
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

        // Fallback to manual HTML generation
        return $this->renderManually($settings);
    }

    /**
     * Manual HTML rendering - Clean and simplified
     */
    private function renderManually(array $settings): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        // Access nested content structure
        $content = $general['content'] ?? [];
        $link = $general['link'] ?? [];

        $text = $this->sanitizeText($content['heading_text'] ?? 'Your Heading Text');
        $level = in_array($content['heading_level'] ?? 'h2', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            ? $content['heading_level']
            : 'h2';

        // Enhanced link data
        $enhancedLink = $link['enhanced_link'] ?? [];
        $enableLink = !empty($enhancedLink['url']);
        $linkUrl = $this->sanitizeURL($enhancedLink['url'] ?? '#');
        $linkTarget = in_array($enhancedLink['target'] ?? '_self', ['_self', '_blank', '_parent', '_top'])
            ? $enhancedLink['target']
            : '_self';
        $linkRel = !empty($enhancedLink['rel']) ? implode(' ', $enhancedLink['rel']) : '';
        $linkTitle = $enhancedLink['title'] ?? '';
        $linkId = $enhancedLink['id'] ?? '';
        $linkClass = $enhancedLink['class'] ?? '';

        // Use BaseWidget's automatic CSS class generation
        $classString = $this->buildCssClasses($settings);

        // Use BaseWidget's automatic CSS generation
        $styleAttr = $this->generateStyleAttribute(['general' => $general, 'style' => $style]);

        if ($enableLink && !empty($linkUrl)) {
            $linkAttributes = [
                'href' => $linkUrl,
                'target' => $linkTarget
            ];

            // Add enhanced link attributes
            if (!empty($linkRel)) {
                $linkAttributes['rel'] = $linkRel;
            }
            if (!empty($linkTitle)) {
                $linkAttributes['title'] = $linkTitle;
            }
            if (!empty($linkId)) {
                $linkAttributes['id'] = $linkId;
            }
            if (!empty($linkClass)) {
                $linkAttributes['class'] = $linkClass;
            }

            // Add custom attributes if present
            if (!empty($enhancedLink['custom_attributes'])) {
                foreach ($enhancedLink['custom_attributes'] as $attr) {
                    if (!empty($attr['name']) && isset($attr['value'])) {
                        $linkAttributes[$attr['name']] = $attr['value'];
                    }
                }
            }

            $linkAttrs = $this->buildAttributes($linkAttributes);

            return "<{$level} class=\"{$classString}\"{$styleAttr}><a {$linkAttrs}>{$text}</a></{$level}>";
        } else {
            return "<{$level} class=\"{$classString}\"{$styleAttr}>{$text}</{$level}>";
        }
    }
}

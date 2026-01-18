<?php

namespace Xgenious\PageBuilder\Widgets\Advanced;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * CodeWidget - Display code with syntax highlighting and copy functionality
 */
class CodeWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'code';
    }

    protected function getWidgetName(): string
    {
        return 'Code Block';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-code';
    }

    protected function getWidgetDescription(): string
    {
        return 'Display code blocks with syntax highlighting and copy functionality';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::ADVANCED;
    }

    protected function getWidgetTags(): array
    {
        return ['code', 'syntax', 'programming', 'snippet'];
    }

    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Code Content')
            ->registerField(
                'code_content',
                FieldManager::CODE()
                    ->setLabel('Code Content')
                    ->setDefault('console.log("Hello World!");')
                    ->setRequired(true)
                    ->setRows(10)
                    ->setLanguage('javascript')
            )
            ->registerField(
                'language',
                FieldManager::SELECT()
                    ->setLabel('Language')
                    ->setDefault('javascript')
                    ->setOptions([
                        'html' => 'HTML',
                        'css' => 'CSS',
                        'javascript' => 'JavaScript',
                        'php' => 'PHP',
                        'python' => 'Python',
                        'json' => 'JSON',
                        'xml' => 'XML',
                        'sql' => 'SQL'
                    ])
            )
            ->registerField(
                'show_line_numbers',
                FieldManager::TOGGLE()
                    ->setLabel('Show Line Numbers')
                    ->setDefault(true)
            )
            ->registerField(
                'show_copy_button',
                FieldManager::TOGGLE()
                    ->setLabel('Show Copy Button')
                    ->setDefault(true)
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('code_style', 'Code Style')
            ->registerField('background_color', FieldManager::COLOR()
                ->setLabel('Background Color')
                ->setDefault('#1e1e1e')
                ->setSelectors([
                    '{{WRAPPER}} .code-widget-container' => 'background-color: {{VALUE}};'
                ])
            )
            ->registerField('text_color', FieldManager::COLOR()
                ->setLabel('Text Color')
                ->setDefault('#d4d4d4')
                ->setSelectors([
                    '{{WRAPPER}} .code-block' => 'color: {{VALUE}};'
                ])
            )
            ->registerField('font_size', FieldManager::NUMBER()
                ->setLabel('Font Size')
                ->setDefault(14)
                ->setMin(10)
                ->setMax(24)
                ->setUnit('px')
                ->setSelectors([
                    '{{WRAPPER}} .code-block' => 'font-size: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('border_radius', FieldManager::NUMBER()
                ->setLabel('Border Radius')
                ->setDefault(8)
                ->setMin(0)
                ->setMax(20)
                ->setUnit('px')
                ->setSelectors([
                    '{{WRAPPER}} .code-widget-container' => 'border-radius: {{VALUE}}{{UNIT}};'
                ])
            )
            ->registerField('padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->setDefault(['top' => 16, 'right' => 16, 'bottom' => 16, 'left' => 16])
                ->setUnits(['px', 'em'])
                ->setResponsive(true)
                ->setMin(0)
                ->setMax(50)
                ->setSelectors([
                    '{{WRAPPER}} .code-block' => 'padding: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                ])
            )
            ->endGroup();

        return $control->getFields();
    }

    public function render(array $settings = []): string
    {
        $content = $settings['general']['content'] ?? [];

        $codeContent     = $content['code_content'] ?? '';
        $language        = $content['language'] ?? 'javascript';
        $showLineNumbers = $content['show_line_numbers'] ?? true;
        $showCopyButton  = $content['show_copy_button'] ?? true;

        if (trim($codeContent) === '') {
            return '';
        }

        $escapedCode = htmlspecialchars($codeContent, ENT_QUOTES, 'UTF-8');
        $lines       = explode("\n", rtrim($codeContent));
        $lineCount   = count($lines);

        $output  = '<div class="code-widget-container relative my-4 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100">';

        // Header
        $output .= '
        <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800">
            <span class="text-xs font-semibold uppercase px-2 py-1 rounded bg-zinc-700 text-zinc-200">'
            . strtoupper($language) .
            '</span>';

        if ($showCopyButton) {
            $output .= '
            <button
                type="button"
                onclick="window.copyCode(this)"
                class="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="copy-text">Copy</span>
            </button>';
        }

        $output .= '</div>';

        // Code area
        $output .= '<pre class="overflow-x-auto text-sm leading-relaxed">';
        $output .= '<div class="grid ' . ($showLineNumbers ? 'grid-cols-[auto_1fr]' : 'grid-cols-1') . '">';

        // Line numbers
        if ($showLineNumbers) {
            $output .= '<div class="select-none px-3 py-4 text-right text-zinc-500 border-r border-zinc-700">';
            for ($i = 1; $i <= $lineCount; $i++) {
                $output .= '<div>' . $i . '</div>';
            }
            $output .= '</div>';
        }

        // Code
        $output .= '<code class="block px-4 py-4 whitespace-pre font-mono">' . $escapedCode . '</code>';

        $output .= '</div></pre></div>';

        // Copy JS
        $output .= "
        <script>
            (function () {

                window.copyCode = function (button) {
                    const container = button.closest('.code-widget-container');
                    if (!container) return;

                    const code = container.querySelector('code');
                    if (!code) return;

                    const text = code.innerText || code.textContent;

                    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                        navigator.clipboard.writeText(text)
                            .then(() => showCopied(button))
                            .catch(() => legacyCopy(text, button));
                    } else {
                        legacyCopy(text, button);
                    }
                };

                function legacyCopy(text, button) {
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.setAttribute('readonly', '');
                    textarea.style.position = 'absolute';
                    textarea.style.left = '-9999px';

                    document.body.appendChild(textarea);
                    textarea.select();

                    try {
                        document.execCommand('copy');
                        showCopied(button);
                    } catch (err) {
                        console.error('Copy failed', err);
                    }

                    document.body.removeChild(textarea);
                }

                function showCopied(button) {
                    const label = button.querySelector('.copy-text');
                    if (!label) return;

                    const original = label.textContent;
                    label.textContent = 'Copied!';
                    button.classList.add('opacity-80');

                    setTimeout(() => {
                        label.textContent = original;
                        button.classList.remove('opacity-80');
                    }, 1500);
                }

            })();
            </script>";

        return $output;
    }
}

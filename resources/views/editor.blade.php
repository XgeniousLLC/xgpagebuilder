<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Page Builder - {{ $page['title'] }}</title>

    @php
        $manifestPath = public_path('vendor/page-builder/.vite/manifest.json');

        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $jsEntry = $manifest['resources/js/page-builder-standalone.jsx'] ?? null;
        } else {
            $jsEntry = null;
        }
    @endphp

    @if ($jsEntry && isset($jsEntry['css']))
        @foreach ($jsEntry['css'] as $cssFile)
            <link rel="stylesheet" href="{{ asset('vendor/page-builder/' . $cssFile) }}">
        @endforeach
    @endif

    {{-- Load Line Awesome icons for widget icons --}}
    <link rel="stylesheet" href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css">

    {{-- Load CSS variables from host app (for var(--primary-color) etc.) --}}
    @if(config('xgpagebuilder.editor_css_variables_view'))
        @include(config('xgpagebuilder.editor_css_variables_view'))
    @endif

    {{-- Load host app's frontend CSS SCOPED to canvas only to avoid conflicts --}}
    <script>
        // Dynamically load host app CSS and scope it to canvas content only
        (function() {
            const cssFiles = [
                @foreach (config('xgpagebuilder.editor_frontend_css', []) as $cssPath)
                    '{{ asset($cssPath) }}',
                @endforeach
            ];

            cssFiles.forEach(function(cssUrl) {
                fetch(cssUrl)
                    .then(response => response.text())
                    .then(cssText => {
                        // Rewrite relative url(...) paths so fonts/images resolve correctly
                        const cssWithAbsoluteUrls = absolutizeCssUrls(cssText, cssUrl);

                        // Scope CSS rules to .page-builder-canvas ONLY (matches Canvas component)
                        const scopedCSS = scopeCSSToSelector(cssWithAbsoluteUrls, '.page-builder-canvas');

                        const style = document.createElement('style');
                        style.setAttribute('data-host-css', cssUrl);
                        style.textContent = scopedCSS;
                        document.head.appendChild(style);
                    })
                    .catch(err => console.error('Failed to load host CSS:', cssUrl, err));
            });

            function absolutizeCssUrls(css, baseUrl) {
                return css.replace(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g, function(match, quote, rawUrl) {
                    const trimmed = (rawUrl || '').trim();
                    if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('http://') || 
                        trimmed.startsWith('https://') || trimmed.startsWith('//') || trimmed.startsWith('#')) {
                        return match;
                    }
                    try {
                        const absolute = new URL(trimmed, baseUrl).href;
                        return `url(${quote || "'"}${absolute}${quote || "'"})`;
                    } catch (e) {
                        return match;
                    }
                });
            }

            function scopeCSSToSelector(css, scope) {
                try {
                    css = css.replace(/@import[^;]+;/g, '');
                    css = css.replace(/@charset[^;]+;/g, '');

                    const tempStyle = document.createElement('style');
                    tempStyle.textContent = css;
                    document.head.appendChild(tempStyle);
                    const sheet = tempStyle.sheet;

                    if (!sheet || !sheet.cssRules) {
                        tempStyle.remove();
                        return '';
                    }

                    const serializeRules = (rules) => {
                        let out = '';
                        for (const rule of rules) {
                            try {
                                if (rule.type === 1) { // STYLE_RULE
                                    const selectors = (rule.selectorText || '').split(',').map(s => s.trim()).filter(Boolean);
                                    const scopedSelectors = selectors.map(selector => {
                                        if (selector === ':root' || selector === 'html' || selector === 'body') {
                                            return scope;
                                        }
                                        if (selector.startsWith(scope)) return selector;
                                        return scope + ' ' + selector;
                                    }).join(', ');
                                    if (scopedSelectors) {
                                        out += scopedSelectors + ' { ' + rule.style.cssText + ' }\n';
                                    }
                                } else if (rule.type === 4) { // MEDIA_RULE
                                    out += '@media ' + rule.conditionText + ' {\n' + serializeRules(rule.cssRules) + '}\n';
                                } else {
                                    out += rule.cssText + '\n';
                                }
                            } catch (e) {}
                        }
                        return out;
                    };

                    const scoped = serializeRules(sheet.cssRules);
                    tempStyle.remove();
                    return scoped;
                } catch (err) {
                    return '';
                }
            }
        })();
    </script>

    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        #page-builder-root {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>

<body>
    <div id="page-builder-root"></div>

    <!-- Pass data to React app -->
    @php
        $mediaConfig = [
            'uploadUrl' => route(config('xgpagebuilder.media.upload_route', 'admin.upload.media.file')),
            'libraryUrl' => route(config('xgpagebuilder.media.library_route', 'admin.upload.media.file.all')),
            'deleteUrl' => route(config('xgpagebuilder.media.delete_route', 'admin.upload.media.file.delete')),
            'basePath' => config('xgpagebuilder.media.base_path', 'assets/uploads'),
            'allowedTypes' => config('xgpagebuilder.media.allowed_types', [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ]),
            'maxSize' => config('xgpagebuilder.media.max_size', 5120) * 1024,
        ];
    @endphp
    <script>
        window.pageBuilderData = {
            page: @json($page ?? []),
            content: @json($content ?? ['containers' => []]),
            contentId: {{ $contentId ?? 'null' }},
            apiUrl: "{{ $apiUrl ?? url('/api/page-builder') }}",
            csrfToken: "{{ csrf_token() }}",
            config: {
                media: @json($mediaConfig)
            }
        };
    </script>

    {{-- Load host app JavaScript files for widget interactivity --}}
    @foreach (config('xgpagebuilder.editor_frontend_js', []) as $jsPath)
        <script src="{{ asset($jsPath) }}"></script>
    @endforeach

    @if ($jsEntry && isset($jsEntry['file']))
        <script type="module" src="{{ asset('vendor/page-builder/' . $jsEntry['file']) }}"></script>
    @else
        <div style="padding: 40px; text-align: center; font-family: sans-serif;">
            <h2>⚠️ Page Builder Assets Not Built</h2>
            <p>Please build the package assets:</p>
            <pre style="background: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block; text-align: left;">
cd packages/xgenious/xgpagebuilder
npm install
npm run build
            </pre>
            <p><strong>Then publish the assets:</strong></p>
            <pre style="background: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block; text-align: left;">
php artisan vendor:publish --tag=page-builder-assets --force
            </pre>
        </div>
    @endif
</body>

</html>

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Page Builder - {{ $page['title'] }}</title>

    {{-- Toastr (matches demo-warning style used across admin pages) --}}
    <link rel="stylesheet" href="{{ asset('assets/common/css/toastr.css') }}">

    @php
        $manifestPaths = [
            public_path('assets/page-builder/.vite/manifest.json'),
        ];

        $manifestPath = null;
        foreach ($manifestPaths as $path) {
            if (file_exists($path)) {
                $manifestPath = $path;
                break;
            }
        }

        if ($manifestPath) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $jsEntry = $manifest['resources/js/page-builder-standalone.jsx'] ?? null;
        } else {
            $jsEntry = null;
        }
    @endphp

    @if ($jsEntry && isset($jsEntry['css']))
        @foreach ($jsEntry['css'] as $cssFile)
            <link rel="stylesheet" href="{{ asset('assets/page-builder/' . $cssFile) }}">
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
        routes: @json($routes ?? ['preview' => '/', 'backToPages' => '/admin']),
        config: {
            media: @json($mediaConfig)
        }
    };
</script>

@if(config('xgpagebuilder.demo_mode', false))
    {{-- Demo mode: persistent ribbon + toastr warning + toolbar cleanup --}}
    <style>
        /* Persistent "Demo Mode" ribbon — hangs from top-center */
        #pb-demo-ribbon {
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99998;
            display: flex;
            align-items: center;
            gap: 5px;
            background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            padding: 6px 20px 6px 16px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 2px 10px rgba(99,102,241,0.35);
            pointer-events: none;
            user-select: none;
        }
        #pb-demo-ribbon svg { width: 11px; height: 11px; flex-shrink: 0; opacity: 0.9; }
    </style>

    {{-- Toastr JS (loaded before page-builder so it's ready when demo fires) --}}
    <script src="{{ asset('assets/common/js/toastr.min.js') }}"></script>

    <script>
        (function () {
            /* 1. Persistent Demo ribbon */
            var ribbon = document.createElement('div');
            ribbon.id = 'pb-demo-ribbon';
            ribbon.innerHTML =
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="3" y="11" width="18" height="11" rx="2"/>' +
                '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
                '</svg>' +
                '<span>Demo Mode — View Only</span>';
            document.body.appendChild(ribbon);

            /* 2. MutationObserver: hide React's "Save failed" / "Unsaved changes" */
            function cleanDemoToolbar() {
                var spans = document.querySelectorAll('span.text-sm');
                for (var i = 0; i < spans.length; i++) {
                    var txt = spans[i].textContent;
                    if (txt === 'Save failed' || txt === 'Unsaved changes') {
                        var row = spans[i].closest('[class*="text-red"], [class*="text-orange"]');
                        if (row) row.style.cssText = 'display:none!important';
                    }
                }
            }
            new MutationObserver(cleanDemoToolbar)
                .observe(document.documentElement, { childList: true, subtree: true });

            /* 3. Toastr options — same as the rest of the admin panel */
            function showDemoWarning(msg) {
                if (typeof toastr === 'undefined') return;
                toastr.options = {
                    closeButton:     true,
                    progressBar:     true,
                    positionClass:   'toast-top-right',
                    timeOut:         4500,
                    extendedTimeOut: 1500,
                    showDuration:    200,
                    hideDuration:    400,
                };
                toastr.warning(msg);
            }

            /* 4. Fetch interceptor: show toastr + return fake success */
            var _fetch = window.fetch;
            window.fetch = function () {
                var args = arguments;
                return _fetch.apply(this, args).then(function (response) {
                    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
                    if (url.indexOf('api/page-builder/') !== -1) {
                        return response.clone().json().then(function (data) {
                            if (data && data.type === 'warning' && data.msg) {
                                showDemoWarning(data.msg);
                                return new Response(
                                    JSON.stringify({ success: true, message: 'demo', data: {} }),
                                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                                );
                            }
                            return response;
                        }).catch(function () { return response; });
                    }
                    return response;
                });
            };
        })();
    </script>
@endif

{{-- Load host app JavaScript files for widget interactivity --}}
@foreach (config('xgpagebuilder.editor_frontend_js', []) as $jsPath)
    <script src="{{ asset($jsPath) }}"></script>
@endforeach

@if ($jsEntry && isset($jsEntry['file']))
    <script type="module" src="{{ asset('assets/page-builder/' . $jsEntry['file']) }}?v={{ time() }}"></script>
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

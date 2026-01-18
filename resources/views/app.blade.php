<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }} - Page Builder</title>

    <!-- Load built CSS from package -->
    @php
        $manifest = json_decode(file_get_contents(base_path('packages/xgenious/xgpagebuilder/public/build/.vite/manifest.json')), true);
        $cssFile = $manifest['resources/js/page-builder-standalone.jsx']['css'][0] ?? null;
    @endphp
    
    @if($cssFile)
        <link rel="stylesheet" href="{{ asset('packages/xgenious/xgpagebuilder/public/build/' . $cssFile) }}">
    @endif

    <!-- Inertia -->
    @routes
    @inertiaHead
</head>
<body>
    @inertia

    <!-- Load built JS from package -->
    @php
        $jsFile = $manifest['resources/js/page-builder-standalone.jsx']['file'] ?? null;
    @endphp
    
    @if($jsFile)
        <script type="module" src="{{ asset('packages/xgenious/xgpagebuilder/public/build/' . $jsFile) }}"></script>
    @endif
</body>
</html>

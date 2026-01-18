<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Response;

class AssetController extends Controller
{
    /**
     * Serve page builder assets with correct MIME types
     */
    public function serve($path)
    {
        $assetPath = public_path('vendor/page-builder/' . $path);
        
        if (!file_exists($assetPath)) {
            abort(404);
        }
        
        $extension = pathinfo($assetPath, PATHINFO_EXTENSION);
        
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'json' => 'application/json',
            'map' => 'application/json',
        ];
        
        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
        
        return response()->file($assetPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}

<?php

namespace Xgenious\PageBuilder\Widgets\Media;

use Xgenious\PageBuilder\Core\BaseWidget;
use Xgenious\PageBuilder\Core\WidgetCategory;
use Xgenious\PageBuilder\Core\ControlManager;
use Xgenious\PageBuilder\Core\FieldManager;

/**
 * VideoWidget - Provides video embedding with support for multiple platforms
 * 
 * Features:
 * - YouTube, Vimeo, and self-hosted video support
 * - Responsive aspect ratios
 * - Auto-play and control options
 * - Custom poster images
 * - Overlay play buttons
 * - Video privacy options
 * - Custom video attributes
 * 
 * @package plugins\Pagebuilder\Widgets\Media
 */
class VideoWidget extends BaseWidget
{
    protected function getWidgetType(): string
    {
        return 'video';
    }

    protected function getWidgetName(): string
    {
        return 'Video';
    }

    protected function getWidgetIcon(): string
    {
        return 'las la-video';
    }

    protected function getWidgetDescription(): string
    {
        return 'Embed videos from YouTube, Vimeo, or self-hosted sources with responsive controls';
    }

    protected function getCategory(): string
    {
        return WidgetCategory::MEDIA;
    }

    protected function getWidgetTags(): array
    {
        return ['video', 'youtube', 'vimeo', 'embed', 'media', 'responsive'];
    }

    /**
     * General settings for video content and behavior
     */
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        // Video Source Group
        $control->addGroup('source', 'Video Source')
            ->registerField(
                'video_type',
                FieldManager::SELECT()
                    ->setLabel('Video Type')
                    ->setDefault('youtube')
                    ->setOptions([
                        'youtube' => 'YouTube',
                        'vimeo' => 'Vimeo',
                        'hosted' => 'Self-Hosted',
                        'embed' => 'Custom Embed'
                    ])
                    ->setDescription('Choose the video platform')
            )
            ->registerField(
                'youtube_url',
                FieldManager::URL()
                    ->setLabel('YouTube URL')
                    ->setDefault('')
                    ->setPlaceholder('https://www.youtube.com/watch?v=VIDEO_ID')
                    ->setCondition(['video_type' => 'youtube'])
                    ->setDescription('Full YouTube video URL')
            )
            ->registerField(
                'vimeo_url',
                FieldManager::URL()
                    ->setLabel('Vimeo URL')
                    ->setDefault('')
                    ->setPlaceholder('https://vimeo.com/VIDEO_ID')
                    ->setCondition(['video_type' => 'vimeo'])
                    ->setDescription('Full Vimeo video URL')
            )
            ->registerField(
                'hosted_url',
                FieldManager::IMAGE()
                    ->setLabel('Video File')
                    ->setDefault('')
                    ->setAllowedTypes(['mp4', 'webm', 'ogg'])
                    ->setCondition(['video_type' => 'hosted'])
                    ->setDescription('Upload or select video file')
            )
            ->registerField(
                'embed_code',
                FieldManager::TEXTAREA()
                    ->setLabel('Embed Code')
                    ->setDefault('')
                    ->setRows(5)
                    ->setPlaceholder('<iframe src="..." ...></iframe>')
                    ->setCondition(['video_type' => 'embed'])
                    ->setDescription('Custom embed code from video platform')
            )
            ->endGroup();

        // Video Settings Group
        $control->addGroup('settings', 'Video Settings')
            ->registerField(
                'aspect_ratio',
                FieldManager::SELECT()
                    ->setLabel('Aspect Ratio')
                    ->setDefault('16:9')
                    ->setOptions([
                        '16:9' => '16:9 (Widescreen)',
                        '4:3' => '4:3 (Standard)',
                        '21:9' => '21:9 (Ultrawide)',
                        '1:1' => '1:1 (Square)',
                        '9:16' => '9:16 (Vertical)',
                        'custom' => 'Custom'
                    ])
                    ->setDescription('Video aspect ratio')
            )
            ->registerField(
                'custom_aspect_ratio',
                FieldManager::TEXT()
                    ->setLabel('Custom Aspect Ratio')
                    ->setDefault('16:9')
                    ->setPlaceholder('16:9 or 1.777')
                    ->setCondition(['aspect_ratio' => 'custom'])
                    ->setDescription('Custom aspect ratio (width:height or decimal)')
            )
            ->registerField(
                'start_time',
                FieldManager::NUMBER()
                    ->setLabel('Start Time (seconds)')
                    ->setDefault(0)
                    ->setMin(0)
                    ->setMax(7200)
                    ->setCondition(['video_type' => ['in', ['youtube', 'vimeo']]])
                    ->setDescription('Time to start playing the video')
            )
            ->registerField(
                'end_time',
                FieldManager::NUMBER()
                    ->setLabel('End Time (seconds)')
                    ->setDefault('')
                    ->setMin(0)
                    ->setMax(7200)
                    ->setCondition(['video_type' => 'youtube'])
                    ->setDescription('Time to stop playing the video (YouTube only)')
            )
            ->endGroup();

        // Playback Options Group
        $control->addGroup('playback', 'Playback Options')
            ->registerField(
                'autoplay',
                FieldManager::TOGGLE()
                    ->setLabel('Auto Play')
                    ->setDefault(false)
                    ->setDescription('Start playing automatically (may not work on mobile)')
            )
            ->registerField(
                'muted',
                FieldManager::TOGGLE()
                    ->setLabel('Muted')
                    ->setDefault(false)
                    ->setDescription('Start with audio muted')
            )
            ->registerField(
                'loop',
                FieldManager::TOGGLE()
                    ->setLabel('Loop')
                    ->setDefault(false)
                    ->setDescription('Replay video when it ends')
            )
            ->registerField(
                'controls',
                FieldManager::TOGGLE()
                    ->setLabel('Show Controls')
                    ->setDefault(true)
                    ->setDescription('Display video player controls')
            )
            ->registerField(
                'privacy_mode',
                FieldManager::TOGGLE()
                    ->setLabel('Privacy Mode')
                    ->setDefault(false)
                    ->setCondition(['video_type' => 'youtube'])
                    ->setDescription('Use YouTube privacy-enhanced mode (no cookies)')
            )
            ->endGroup();

        // Poster & Overlay Group
        $control->addGroup('overlay', 'Poster & Overlay')
            ->registerField(
                'show_poster',
                FieldManager::TOGGLE()
                    ->setLabel('Show Poster Image')
                    ->setDefault(false)
                    ->setDescription('Display custom poster image before playing')
            )
            ->registerField(
                'poster_image',
                FieldManager::IMAGE()
                    ->setLabel('Poster Image')
                    ->setDefault('')
                    ->setAllowedTypes(['jpeg', 'png', 'webp'])
                    ->setCondition(['show_poster' => true])
                    ->setDescription('Custom poster/thumbnail image')
            )
            ->registerField(
                'show_play_button',
                FieldManager::TOGGLE()
                    ->setLabel('Show Play Button Overlay')
                    ->setDefault(true)
                    ->setCondition(['show_poster' => true])
                    ->setDescription('Display play button over poster image')
            )
            ->registerField(
                'lazy_load',
                FieldManager::TOGGLE()
                    ->setLabel('Lazy Load')
                    ->setDefault(true)
                    ->setDescription('Load video only when needed (improves page speed)')
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Style settings for video container and overlay styling
     */
    public function getStyleFields(): array
    {
        $control = new ControlManager();

        // Container Styling Group
        $control->addGroup('container', 'Container Style')
            ->registerField(
                'width',
                FieldManager::NUMBER()
                    ->setLabel('Width')
                    ->setDefault(100)
                    ->setMin(10)
                    ->setMax(100)
                    ->setUnit('%')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .video-container' => 'width: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'max_width',
                FieldManager::NUMBER()
                    ->setLabel('Max Width')
                    ->setDefault('')
                    ->setMin(200)
                    ->setMax(2000)
                    ->setUnit('px')
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .video-container' => 'max-width: {{VALUE}}{{UNIT}};'
                    ])
                    ->setDescription('Maximum width constraint')
            )
            ->registerField(
                'alignment',
                FieldManager::SELECT()
                    ->setLabel('Alignment')
                    ->setDefault('center')
                    ->setOptions([
                        'left' => 'Left',
                        'center' => 'Center',
                        'right' => 'Right'
                    ])
                    ->setResponsive(true)
                    ->setDescription('Video container alignment')
            )
            ->endGroup();

        // Border & Effects Group
        $control->addGroup('border', 'Border & Effects')
            ->registerField(
                'border_width',
                FieldManager::NUMBER()
                    ->setLabel('Border Width')
                    ->setDefault(0)
                    ->setMin(0)
                    ->setMax(20)
                    ->setUnit('px')
                    ->setSelectors([
                        '{{WRAPPER}} .video-wrapper' => 'border-width: {{VALUE}}{{UNIT}}; border-style: solid;'
                    ])
            )
            ->registerField(
                'border_color',
                FieldManager::COLOR()
                    ->setLabel('Border Color')
                    ->setDefault('#E5E7EB')
                    ->setCondition(['border_width' => ['>', 0]])
                    ->setSelectors([
                        '{{WRAPPER}} .video-wrapper' => 'border-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'border_radius',
                FieldManager::DIMENSION()
                    ->setLabel('Border Radius')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setMin(0)
                    ->setMax(50)
                    ->setLinked(true)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .video-wrapper' => 'border-radius: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'box_shadow',
                FieldManager::TEXT()
                    ->setLabel('Box Shadow')
                    ->setDefault('none')
                    ->setPlaceholder('0 4px 8px rgba(0,0,0,0.1)')
                    ->setSelectors([
                        '{{WRAPPER}} .video-wrapper' => 'box-shadow: {{VALUE}};'
                    ])
            )
            ->endGroup();

        // Play Button Styling Group
        $control->addGroup('play_button', 'Play Button Style')
            ->registerField(
                'play_button_size',
                FieldManager::NUMBER()
                    ->setLabel('Play Button Size')
                    ->setDefault(80)
                    ->setMin(40)
                    ->setMax(200)
                    ->setUnit('px')
                    ->setCondition(['show_play_button' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-play-button' => 'width: {{VALUE}}{{UNIT}}; height: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->registerField(
                'play_button_color',
                FieldManager::COLOR()
                    ->setLabel('Play Button Color')
                    ->setDefault('#FFFFFF')
                    ->setCondition(['show_play_button' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-play-button' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'play_button_background',
                FieldManager::COLOR()
                    ->setLabel('Play Button Background')
                    ->setDefault('rgba(0, 0, 0, 0.8)')
                    ->setCondition(['show_play_button' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-play-button' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'play_button_hover_color',
                FieldManager::COLOR()
                    ->setLabel('Hover Color')
                    ->setDefault('#FFFFFF')
                    ->setCondition(['show_play_button' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-play-button:hover' => 'color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'play_button_hover_background',
                FieldManager::COLOR()
                    ->setLabel('Hover Background')
                    ->setDefault('rgba(0, 0, 0, 0.9)')
                    ->setCondition(['show_play_button' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-play-button:hover' => 'background-color: {{VALUE}};'
                    ])
            )
            ->registerField(
                'play_button_border_radius',
                FieldManager::NUMBER()
                    ->setLabel('Play Button Border Radius')
                    ->setDefault(50)
                    ->setMin(0)
                    ->setMax(50)
                    ->setUnit('%')
                    ->setCondition(['show_play_button' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-play-button' => 'border-radius: {{VALUE}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        // Poster Styling Group
        $control->addGroup('poster_style', 'Poster Style')
            ->registerField(
                'poster_object_fit',
                FieldManager::SELECT()
                    ->setLabel('Poster Object Fit')
                    ->setDefault('cover')
                    ->setOptions([
                        'cover' => 'Cover',
                        'contain' => 'Contain',
                        'fill' => 'Fill',
                        'none' => 'None',
                        'scale-down' => 'Scale Down'
                    ])
                    ->setCondition(['show_poster' => true])
                    ->setSelectors([
                        '{{WRAPPER}} .video-poster img' => 'object-fit: {{VALUE}};'
                    ])
            )
            ->registerField(
                'poster_overlay',
                FieldManager::COLOR()
                    ->setLabel('Poster Overlay')
                    ->setDefault('')
                    ->setCondition(['show_poster' => true])
                    ->setDescription('Color overlay on poster image')
            )
            ->registerField(
                'poster_overlay_opacity',
                FieldManager::NUMBER()
                    ->setLabel('Overlay Opacity')
                    ->setDefault(0.3)
                    ->setMin(0)
                    ->setMax(1)
                    ->setStep(0.1)
                    ->setCondition(['show_poster' => true, 'poster_overlay' => ['!=', '']])
                    ->setDescription('Opacity of the color overlay')
            )
            ->endGroup();

        // Spacing Group
        $control->addGroup('spacing', 'Spacing')
            ->registerField(
                'margin',
                FieldManager::DIMENSION()
                    ->setLabel('Margin')
                    ->setDefault(['top' => 0, 'right' => 0, 'bottom' => 20, 'left' => 0])
                    ->setUnits(['px', 'em', 'rem', '%'])
                    ->setAllowNegative(true)
                    ->setMin(-100)
                    ->setMax(100)
                    ->setResponsive(true)
                    ->setSelectors([
                        '{{WRAPPER}} .video-container' => 'margin: {{VALUE.TOP}}{{UNIT}} {{VALUE.RIGHT}}{{UNIT}} {{VALUE.BOTTOM}}{{UNIT}} {{VALUE.LEFT}}{{UNIT}};'
                    ])
            )
            ->endGroup();

        return $control->getFields();
    }

    /**
     * Render the video HTML
     */
    public function render(array $settings = []): string
    {
        $general = $settings['general'] ?? [];
        $style = $settings['style'] ?? [];

        $videoType = $general['video_type'] ?? 'youtube';
        $aspectRatio = $general['aspect_ratio'] ?? '16:9';
        $customAspectRatio = $general['custom_aspect_ratio'] ?? '16:9';

        $autoplay = $general['autoplay'] ?? false;
        $muted = $general['muted'] ?? false;
        $loop = $general['loop'] ?? false;
        $controls = $general['controls'] ?? true;
        $privacyMode = $general['privacy_mode'] ?? false;
        $startTime = $general['start_time'] ?? 0;
        $endTime = $general['end_time'] ?? '';

        $showPoster = $general['show_poster'] ?? false;
        $posterImage = $general['poster_image'] ?? '';
        $showPlayButton = $general['show_play_button'] ?? true;
        $lazyLoad = $general['lazy_load'] ?? true;

        $alignment = $style['alignment'] ?? 'center';

        // Build container classes
        $containerClasses = ['video-container', 'video-' . $videoType];

        if ($alignment !== 'left') {
            $containerClasses[] = 'align-' . $alignment;
        }

        if ($lazyLoad) {
            $containerClasses[] = 'lazy-load';
        }

        $containerClass = implode(' ', $containerClasses);

        // Calculate aspect ratio
        $aspectRatioValue = $this->calculateAspectRatio($aspectRatio, $customAspectRatio);

        // Generate video content based on type
        switch ($videoType) {
            case 'youtube':
                $videoContent = $this->renderYouTubeVideo($general, $aspectRatioValue, $showPoster, $posterImage, $showPlayButton);
                break;
            case 'vimeo':
                $videoContent = $this->renderVimeoVideo($general, $aspectRatioValue, $showPoster, $posterImage, $showPlayButton);
                break;
            case 'hosted':
                $videoContent = $this->renderHostedVideo($general, $aspectRatioValue, $showPoster, $posterImage, $showPlayButton);
                break;
            case 'embed':
                $videoContent = $this->renderEmbedVideo($general, $aspectRatioValue);
                break;
            default:
                return '<div class="video-error">Invalid video type</div>';
        }

        return "<div class=\"{$containerClass}\">{$videoContent}</div>";
    }

    /**
     * Calculate aspect ratio percentage
     */
    private function calculateAspectRatio(string $aspectRatio, string $customAspectRatio): float
    {
        $ratios = [
            '16:9' => 56.25,
            '4:3' => 75,
            '21:9' => 42.86,
            '1:1' => 100,
            '9:16' => 177.78
        ];

        if ($aspectRatio === 'custom') {
            if (strpos($customAspectRatio, ':') !== false) {
                list($width, $height) = explode(':', $customAspectRatio);
                return ($height / $width) * 100;
            } else {
                $ratio = floatval($customAspectRatio);
                return $ratio > 0 ? (1 / $ratio) * 100 : 56.25;
            }
        }

        return $ratios[$aspectRatio] ?? 56.25;
    }

    /**
     * Render YouTube video
     */
    private function renderYouTubeVideo(array $settings, float $aspectRatio, bool $showPoster, string $posterImage, bool $showPlayButton): string
    {
        $youtubeUrl = $settings['youtube_url'] ?? '';

        if (empty($youtubeUrl)) {
            return '<div class="video-error">YouTube URL is required</div>';
        }

        // Extract video ID
        $videoId = $this->extractYouTubeId($youtubeUrl);
        if (!$videoId) {
            return '<div class="video-error">Invalid YouTube URL</div>';
        }

        // Build embed parameters
        $params = [];
        if ($settings['autoplay'] ?? false) $params[] = 'autoplay=1';
        if ($settings['muted'] ?? false) $params[] = 'mute=1';
        if ($settings['loop'] ?? false) $params[] = 'loop=1&playlist=' . $videoId;
        if (!($settings['controls'] ?? true)) $params[] = 'controls=0';
        if ($settings['start_time'] ?? 0) $params[] = 'start=' . $settings['start_time'];
        if ($settings['end_time'] ?? '') $params[] = 'end=' . $settings['end_time'];

        $domain = ($settings['privacy_mode'] ?? false) ? 'youtube-nocookie.com' : 'youtube.com';
        $embedUrl = "https://www.{$domain}/embed/{$videoId}?" . implode('&', $params);

        return $this->renderVideoWrapper($embedUrl, $aspectRatio, $showPoster, $posterImage, $showPlayButton, $videoId, 'youtube');
    }

    /**
     * Render Vimeo video
     */
    private function renderVimeoVideo(array $settings, float $aspectRatio, bool $showPoster, string $posterImage, bool $showPlayButton): string
    {
        $vimeoUrl = $settings['vimeo_url'] ?? '';

        if (empty($vimeoUrl)) {
            return '<div class="video-error">Vimeo URL is required</div>';
        }

        // Extract video ID
        $videoId = $this->extractVimeoId($vimeoUrl);
        if (!$videoId) {
            return '<div class="video-error">Invalid Vimeo URL</div>';
        }

        // Build embed parameters
        $params = [];
        if ($settings['autoplay'] ?? false) $params[] = 'autoplay=1';
        if ($settings['muted'] ?? false) $params[] = 'muted=1';
        if ($settings['loop'] ?? false) $params[] = 'loop=1';
        if (!($settings['controls'] ?? true)) $params[] = 'controls=0';

        $embedUrl = "https://player.vimeo.com/video/{$videoId}?" . implode('&', $params);

        return $this->renderVideoWrapper($embedUrl, $aspectRatio, $showPoster, $posterImage, $showPlayButton, $videoId, 'vimeo');
    }

    /**
     * Render self-hosted video
     */
    private function renderHostedVideo(array $settings, float $aspectRatio, bool $showPoster, string $posterImage, bool $showPlayButton): string
    {
        $hostedUrl = $settings['hosted_url'] ?? '';

        if (empty($hostedUrl)) {
            return '<div class="video-error">Video file is required</div>';
        }

        $wrapperStyle = "position: relative; width: 100%; padding-bottom: {$aspectRatio}%; height: 0; overflow: hidden;";

        $videoAttributes = [
            'style' => 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
            'src' => htmlspecialchars($hostedUrl, ENT_QUOTES, 'UTF-8')
        ];

        if ($settings['autoplay'] ?? false) $videoAttributes['autoplay'] = 'autoplay';
        if ($settings['muted'] ?? false) $videoAttributes['muted'] = 'muted';
        if ($settings['loop'] ?? false) $videoAttributes['loop'] = 'loop';
        if ($settings['controls'] ?? true) $videoAttributes['controls'] = 'controls';
        if ($showPoster && !empty($posterImage)) $videoAttributes['poster'] = htmlspecialchars($posterImage, ENT_QUOTES, 'UTF-8');

        $videoAttrs = '';
        foreach ($videoAttributes as $attr => $value) {
            $videoAttrs .= ' ' . $attr . '="' . $value . '"';
        }

        return "<div class=\"video-wrapper\" style=\"{$wrapperStyle}\">
            <video{$videoAttrs}>
                Your browser does not support the video tag.
            </video>
        </div>";
    }

    /**
     * Render custom embed video
     */
    private function renderEmbedVideo(array $settings, float $aspectRatio): string
    {
        $embedCode = $settings['embed_code'] ?? '';

        if (empty($embedCode)) {
            return '<div class="video-error">Embed code is required</div>';
        }

        $wrapperStyle = "position: relative; width: 100%; padding-bottom: {$aspectRatio}%; height: 0; overflow: hidden;";

        // Basic sanitization of embed code
        $embedCode = strip_tags($embedCode, '<iframe><video><embed><object><param>');

        return "<div class=\"video-wrapper\" style=\"{$wrapperStyle}\">
            <div style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\">
                {$embedCode}
            </div>
        </div>";
    }

    /**
     * Render video wrapper with poster and play button
     */
    private function renderVideoWrapper(string $embedUrl, float $aspectRatio, bool $showPoster, string $posterImage, bool $showPlayButton, string $videoId, string $platform): string
    {
        $wrapperStyle = "position: relative; width: 100%; padding-bottom: {$aspectRatio}%; height: 0; overflow: hidden;";

        $iframe = "<iframe src=\"{$embedUrl}\" style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\" frameborder=\"0\" allowfullscreen></iframe>";

        if ($showPoster && !empty($posterImage)) {
            $posterHtml = "<div class=\"video-poster\" style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('" . htmlspecialchars($posterImage, ENT_QUOTES, 'UTF-8') . "'); background-size: cover; background-position: center; cursor: pointer;\">";

            if ($showPlayButton) {
                $posterHtml .= "<div class=\"video-play-button\" style=\"position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; cursor: pointer;\">
                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"currentColor\">
                        <path d=\"M8 5v14l11-7z\"/>
                    </svg>
                </div>";
            }

            $posterHtml .= "</div>";

            return "<div class=\"video-wrapper\" style=\"{$wrapperStyle}\">
                {$posterHtml}
                <div class=\"video-iframe\" style=\"display: none;\">{$iframe}</div>
            </div>";
        }

        return "<div class=\"video-wrapper\" style=\"{$wrapperStyle}\">{$iframe}</div>";
    }

    /**
     * Extract YouTube video ID from URL
     */
    private function extractYouTubeId(string $url): ?string
    {
        $patterns = [
            '/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/',
            '/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/',
            '/youtu\.be\/([a-zA-Z0-9_-]+)/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Extract Vimeo video ID from URL
     */
    private function extractVimeoId(string $url): ?string
    {
        if (preg_match('/vimeo\.com\/(\d+)/', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Generate CSS for this widget instance
     */
    public function generateCSS(string $widgetId, array $settings, ?string $sectionId = null): string
    {
        $styleControl = new ControlManager();

        // Register style fields for CSS generation
        $this->registerStyleFields($styleControl);

        $css = $styleControl->generateCSS($widgetId, $settings['style'] ?? []);

        // Add video-specific CSS
        $style = $settings['style'] ?? [];
        $alignment = $style['alignment'] ?? 'center';

        // Add alignment CSS
        switch ($alignment) {
            case 'left':
                $css .= "\n#{$widgetId} .video-container { text-align: left; }";
                break;
            case 'center':
                $css .= "\n#{$widgetId} .video-container { text-align: center; margin-left: auto; margin-right: auto; }";
                break;
            case 'right':
                $css .= "\n#{$widgetId} .video-container { text-align: right; margin-left: auto; }";
                break;
        }

        // Add poster overlay CSS
        $general = $settings['general'] ?? [];
        if (($general['show_poster'] ?? false) && !empty($style['poster_overlay'])) {
            $overlayColor = $style['poster_overlay'];
            $overlayOpacity = $style['poster_overlay_opacity'] ?? 0.3;

            $css .= "\n#{$widgetId} .video-poster::before {";
            $css .= "\n    content: '';";
            $css .= "\n    position: absolute;";
            $css .= "\n    top: 0;";
            $css .= "\n    left: 0;";
            $css .= "\n    width: 100%;";
            $css .= "\n    height: 100%;";
            $css .= "\n    background-color: {$overlayColor};";
            $css .= "\n    opacity: {$overlayOpacity};";
            $css .= "\n    pointer-events: none;";
            $css .= "\n}";
        }

        // Add play button click functionality
        $css .= "\n#{$widgetId} .video-play-button {";
        $css .= "\n    transition: all 0.3s ease;";
        $css .= "\n}";

        return $css;
    }

    /**
     * Helper method to register style fields for CSS generation
     */
    private function registerStyleFields(ControlManager $control): void
    {
        // Re-register fields from getStyleFields() for CSS generation
        $this->getStyleFields();
    }
}

<?php

namespace Xgenious\PageBuilder\Core\Fields;

class VideoField extends BaseField
{
    protected string $type = 'video';

    /** @var array<string> Allowed MIME types */
    protected array $allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    /** @var int Maximum file size in bytes (default 100 MB) */
    protected int $maxSize = 104857600;

    /** @var bool Allow multiple file selection */
    protected bool $multiple = false;

    /** @var bool Show native browser video controls */
    protected bool $controls = true;

    /** @var bool Autoplay the video */
    protected bool $autoplay = false;

    /** @var bool Loop the video */
    protected bool $loop = false;

    /** @var bool Mute the video by default */
    protected bool $muted = false;

    /** @var string Preload hint: 'auto', 'metadata', 'none' */
    protected string $preload = 'metadata';

    /** @var bool Allow a poster/thumbnail image to be set */
    protected bool $allowPoster = true;

    /**
     * Restrict which video MIME types are accepted.
     * Accepted values: 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
     *
     * @param array<string> $types
     * @return static
     */
    public function setAllowedTypes(array $types): static
    {
        $this->allowedTypes = $types;
        return $this;
    }

    /**
     * Set the maximum file size in bytes.
     *
     * @param int $size Bytes
     * @return static
     */
    public function setMaxSize(int $size): static
    {
        $this->maxSize = $size;
        return $this;
    }

    /**
     * Allow selecting multiple video files.
     *
     * @param bool $multiple
     * @return static
     */
    public function setMultiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;
        return $this;
    }

    /**
     * Show or hide native video controls in the preview player.
     *
     * @param bool $controls
     * @return static
     */
    public function setControls(bool $controls = true): static
    {
        $this->controls = $controls;
        return $this;
    }

    /**
     * Enable autoplay for the video preview.
     *
     * @param bool $autoplay
     * @return static
     */
    public function setAutoplay(bool $autoplay = true): static
    {
        $this->autoplay = $autoplay;
        return $this;
    }

    /**
     * Enable looping for the video preview.
     *
     * @param bool $loop
     * @return static
     */
    public function setLoop(bool $loop = true): static
    {
        $this->loop = $loop;
        return $this;
    }

    /**
     * Mute the video by default in the preview player.
     *
     * @param bool $muted
     * @return static
     */
    public function setMuted(bool $muted = true): static
    {
        $this->muted = $muted;
        return $this;
    }

    /**
     * Set the HTML preload attribute hint for the video element.
     * Accepted values: 'auto', 'metadata', 'none'
     *
     * @param string $preload
     * @return static
     */
    public function setPreload(string $preload): static
    {
        $this->preload = $preload;
        return $this;
    }

    /**
     * Enable or disable the poster/thumbnail image option.
     *
     * @param bool $allow
     * @return static
     */
    public function setAllowPoster(bool $allow = true): static
    {
        $this->allowPoster = $allow;
        return $this;
    }

    /**
     * {@inheritdoc}
     */
    protected function getTypeSpecificConfig(): array
    {
        return [
            'allowed_types' => $this->allowedTypes,
            'max_size'      => $this->maxSize,
            'multiple'      => $this->multiple,
            'controls'      => $this->controls,
            'autoplay'      => $this->autoplay,
            'loop'          => $this->loop,
            'muted'         => $this->muted,
            'preload'       => $this->preload,
            'allow_poster'  => $this->allowPoster,
        ];
    }
}

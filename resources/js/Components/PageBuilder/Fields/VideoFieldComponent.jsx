import React, { useState, useCallback } from 'react';
import { Upload, X, Video, AlertCircle } from 'lucide-react';

/**
 * VideoFieldComponent - Video upload field with drag-and-drop
 *
 *
 * Supports:
 * - Drag-and-drop + click-to-browse upload
 * - MIME-type restrictions (mp4, webm, quicktime, x-msvideo)
 * - File size limit (configurable, default 100 MB)
 * - In-browser video preview with configurable controls / autoplay / loop / muted
 * - Optional poster / thumbnail URL
 * - Title and caption meta fields
 * - Stores { id, url, poster, title, caption, filename, size, mime_type }
 */
const VideoFieldComponent = ({
    fieldKey,
    fieldConfig,
    value,
    onChange,
    className = '',
}) => {
    const [isDragOver, setIsDragOver]   = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const {
        label,
        description,
        required      = false,
        allowedTypes  = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
        maxSize       = 100 * 1024 * 1024, // 100 MB default
        placeholder   = 'Drop a video here or click to upload',
        controls      = true,
        autoplay      = false,
        loop          = false,
        muted         = false,
        preload       = 'metadata',
        allowPoster   = true,
    } = fieldConfig;

    // Normalise stored value: can be a plain URL string or the full data object
    const videoData =
        typeof value === 'string'
            ? { id: null, url: value, poster: '', title: '', caption: '', filename: '', size: 0, mime_type: '' }
            : value || { id: null, url: '', poster: '', title: '', caption: '', filename: '', size: 0, mime_type: '' };

    // ─── Validation ────────────────────────────────────────────────────────────

    const validateFile = (file) => {
        if (!allowedTypes.includes(file.type)) {
            const friendly = allowedTypes
                .map((t) => t.replace('video/', '').replace('quicktime', 'mov').replace('x-msvideo', 'avi'))
                .join(', ');
            throw new Error(`Invalid file type. Allowed: ${friendly}`);
        }
        if (file.size > maxSize) {
            const mb = Math.round(maxSize / (1024 * 1024));
            throw new Error(`File too large. Maximum size: ${mb} MB`);
        }
    };

    // ─── Upload ────────────────────────────────────────────────────────────────

    const uploadVideo = async (file) => {
        setIsUploading(true);
        setUploadError('');

        try {
            validateFile(file);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);

            const token     = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const uploadUrl = window.pageBuilderData?.config?.media?.uploadUrl || '/api/media/upload';

            const response = await fetch(uploadUrl, {
                method:      'POST',
                headers:     { 'X-CSRF-TOKEN': token, Accept: 'application/json' },
                credentials: 'same-origin',
                body:        formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Upload failed');
            }

            const result = await response.json();

            onChange({
                id:        result.id,
                url:       result.url,
                poster:    result.poster || '',
                title:     result.title  || file.name,
                caption:   result.caption || '',
                filename:  result.filename,
                size:      result.size,
                mime_type: result.mime_type,
            });
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // ─── Drag-and-drop ─────────────────────────────────────────────────────────

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) uploadVideo(files[0]);
    }, []);

    const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragOver(true);  }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);

    // ─── File input ────────────────────────────────────────────────────────────

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) uploadVideo(files[0]);
    };

    // ─── Remove / meta update ─────────────────────────────────────────────────

    const handleRemove = () => {
        onChange({ id: null, url: '', poster: '', title: '', caption: '', filename: '', size: 0, mime_type: '' });
        setUploadError('');
    };

    const handleMetaUpdate = (field, newValue) => {
        onChange({ ...videoData, [field]: newValue });
    };

    // ─── Helpers ───────────────────────────────────────────────────────────────

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const maxSizeFormatted   = formatFileSize(maxSize);
    const allowedExtensions  = allowedTypes
        .map((t) => t.replace('video/', '').replace('quicktime', 'mov').replace('x-msvideo', 'avi'))
        .join(', ');

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className={`video-field ${className}`}>
            {/* Label */}
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>

            {/* Upload zone or preview */}
            {!videoData.url ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver
                            ? 'border-blue-400 bg-blue-50'
                            : isUploading
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-sm text-gray-600">Uploading…</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Video className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
                            <p className="text-xs text-gray-500 mb-3">
                                Allowed: {allowedExtensions} &bull; Max size: {maxSizeFormatted}
                            </p>
                            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Video
                                <input
                                    type="file"
                                    className="sr-only"
                                    accept={allowedTypes.join(',')}
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Video preview */}
                    <div className="relative bg-black">
                        <video
                            src={videoData.url}
                            poster={videoData.poster || undefined}
                            controls={controls}
                            autoPlay={autoplay}
                            loop={loop}
                            muted={muted}
                            preload={preload}
                            className="w-full max-h-60 object-contain"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove video"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Meta fields */}
                    <div className="p-4 space-y-3">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={videoData.title || ''}
                                onChange={(e) => handleMetaUpdate('title', e.target.value)}
                                placeholder="Video title"
                                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Caption */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Caption
                            </label>
                            <input
                                type="text"
                                value={videoData.caption || ''}
                                onChange={(e) => handleMetaUpdate('caption', e.target.value)}
                                placeholder="Optional caption"
                                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Poster URL */}
                        {allowPoster && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Poster / Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    value={videoData.poster || ''}
                                    onChange={(e) => handleMetaUpdate('poster', e.target.value)}
                                    placeholder="https://example.com/poster.jpg"
                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* File info */}
                        {videoData.filename && (
                            <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                                <p><strong>File:</strong> {videoData.filename}</p>
                                {videoData.size  > 0 && <p><strong>Size:</strong> {formatFileSize(videoData.size)}</p>}
                                {videoData.mime_type && <p><strong>Type:</strong> {videoData.mime_type}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload error */}
            {uploadError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={16} />
                    {uploadError}
                </div>
            )}

            {/* Required validation hint */}
            {required && !videoData.url && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={16} />
                    This field is required
                </p>
            )}
        </div>
    );
};

export default VideoFieldComponent;

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';

/**
 * ImageFieldComponent - Image upload field with drag and drop
 *
 * Supports:
 * - Drag and drop image upload
 * - Image type restrictions (jpg, png, gif, webp, svg)
 * - File size limits (configurable)
 * - Image preview
 * - Alt text and title editing
 * - API upload to media_uploader table
 */
const ImageFieldComponent = ({
    fieldKey,
    fieldConfig,
    value,
    onChange,
    className = ''
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const {
        label,
        description,
        required = false,
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        maxSize = 5 * 1024 * 1024, // 5MB default
        placeholder = 'Drop an image here or click to upload'
    } = fieldConfig;

    // Parse current value (can be string URL or object with id, url, alt, title)
    const imageData = typeof value === 'string'
        ? { id: null, url: value, alt: '', title: '' }
        : value || { id: null, url: '', alt: '', title: '' };

    const validateFile = (file) => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            const allowedExts = allowedTypes.map(type => type.split('/')[1]).join(', ');
            throw new Error(`Invalid file type. Allowed types: ${allowedExts}`);
        }

        // Check file size
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
        }
    };

    const uploadImage = async (file) => {
        setIsUploading(true);
        setUploadError('');

        try {
            validateFile(file);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('alt', ''); // Can be updated later
            formData.append('title', file.name);

            // Get CSRF token
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Get media upload URL from package config (passed via window.pageBuilderData)
            const uploadUrl = window.pageBuilderData?.config?.media?.uploadUrl || '/api/media/upload';

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();

            // Update field value with uploaded image data
            const imageData = {
                id: result.id,
                url: result.url,
                alt: result.alt || '',
                title: result.title || file.name,
                filename: result.filename,
                size: result.size,
                mime_type: result.mime_type
            };

            onChange(imageData);

        } catch (error) {
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadImage(files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            uploadImage(files[0]);
        }
    };

    const handleRemoveImage = () => {
        onChange({ id: null, url: '', alt: '', title: '' });
        setUploadError('');
    };

    const handleMetaUpdate = (field, newValue) => {
        const updatedData = {
            ...imageData,
            [field]: newValue
        };
        onChange(updatedData);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const maxSizeFormatted = formatFileSize(maxSize);
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]).join(', ');

    return (
        <div className={`image-field ${className}`}>
            {/* Field Label */}
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>

            {/* Upload Area or Image Preview */}
            {!imageData.url ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
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
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
                            <p className="text-xs text-gray-500 mb-3">
                                Allowed: {allowedExtensions} • Max size: {maxSizeFormatted}
                            </p>
                            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                Choose File
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
                    {/* Image Preview */}
                    <div className="relative bg-gray-50">
                        <img
                            src={imageData.url}
                            alt={imageData.alt || 'Uploaded image'}
                            className="w-full h-48 object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Image Meta Fields */}
                    <div className="p-4 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Alt Text
                            </label>
                            <input
                                type="text"
                                value={imageData.alt || ''}
                                onChange={(e) => handleMetaUpdate('alt', e.target.value)}
                                placeholder="Describe this image for accessibility"
                                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={imageData.title || ''}
                                onChange={(e) => handleMetaUpdate('title', e.target.value)}
                                placeholder="Image title"
                                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Image Info */}
                        {imageData.filename && (
                            <div className="text-xs text-gray-500 space-y-1">
                                <p><strong>File:</strong> {imageData.filename}</p>
                                {imageData.size && <p><strong>Size:</strong> {formatFileSize(imageData.size)}</p>}
                                {imageData.mime_type && <p><strong>Type:</strong> {imageData.mime_type}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Error */}
            {uploadError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={16} />
                    {uploadError}
                </div>
            )}

            {/* Required Field Validation */}
            {required && !imageData.url && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={16} />
                    This field is required
                </p>
            )}
        </div>
    );
};

export default ImageFieldComponent;
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Button Preset Selector Component
 * 
 * Provides a dropdown interface for selecting button presets with categories,
 * live preview, and custom preset management
 */
const ButtonPresetSelector = ({ 
    value = 'primary', 
    onChange, 
    onPresetApply,
    currentSettings = {},
    className = '' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [presets, setPresets] = useState([]);
    const [categories, setCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch presets and categories on mount
    useEffect(() => {
        fetchPresetsAndCategories();
    }, []);

    const fetchPresetsAndCategories = async () => {
        try {
            setLoading(true);
            
            // Fetch both presets and categories in parallel
            const [presetsResponse, categoriesResponse] = await Promise.all([
                fetch('/api/pagebuilder/widgets/button-presets'),
                fetch('/api/pagebuilder/widgets/button-presets/categories')
            ]);

            if (!presetsResponse.ok || !categoriesResponse.ok) {
                throw new Error('Failed to fetch preset data');
            }

            const presetsData = await presetsResponse.json();
            const categoriesData = await categoriesResponse.json();

            if (presetsData.success) {
                setPresets(presetsData.data);
            }

            if (categoriesData.success) {
                setCategories(categoriesData.data);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching presets:', err);
            setError('Failed to load presets');
        } finally {
            setLoading(false);
        }
    };

    // Filter presets by selected category
    const filteredPresets = selectedCategory === 'all' 
        ? presets 
        : presets.filter(preset => preset.category === selectedCategory);

    // Get current preset details
    const currentPreset = presets.find(preset => 
        preset.id === value || preset.slug === value
    );

    // Handle preset selection
    const handlePresetSelect = async (preset) => {
        try {
            // Apply the preset to current settings
            const response = await fetch(`/api/pagebuilder/widgets/button-presets/${preset.id || preset.slug}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    current_settings: currentSettings
                })
            });

            if (!response.ok) {
                throw new Error('Failed to apply preset');
            }

            const data = await response.json();

            if (data.success) {
                // Update the preset selector value
                onChange(preset.id || preset.slug);
                
                // Apply the new settings
                if (onPresetApply && data.data) {
                    onPresetApply(data.data);
                }
                
                setIsOpen(false);
            } else {
                throw new Error(data.message || 'Failed to apply preset');
            }
        } catch (err) {
            console.error('Error applying preset:', err);
            setError('Failed to apply preset');
        }
    };

    // Render preset preview
    const renderPresetPreview = (preset) => {
        const styles = preset.style_settings || {};
        const backgroundColor = styles.background_color || styles.background_gradient || '#3B82F6';
        const textColor = styles.text_color || '#FFFFFF';
        const borderRadius = styles.border_radius || 6;
        const borderWidth = styles.border_width || 0;
        const borderColor = styles.border_color || backgroundColor;

        const previewStyle = {
            backgroundColor: styles.background_gradient ? 'transparent' : backgroundColor,
            background: styles.background_gradient || backgroundColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: styles.font_weight || '600',
            minWidth: '60px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        };

        return (
            <div 
                className="preset-preview"
                style={previewStyle}
                onClick={() => handlePresetSelect(preset)}
            >
                {preset.name}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`relative ${className}`}>
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600">Loading presets...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`relative ${className}`}>
                <div className="w-full p-3 border border-red-300 rounded-md bg-red-50">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-600">{error}</span>
                        <button 
                            onClick={fetchPresetsAndCategories}
                            className="text-xs text-red-700 underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Preset Selector Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <div className="flex items-center space-x-3">
                    {currentPreset && (
                        <div className="flex-shrink-0">
                            {renderPresetPreview(currentPreset)}
                        </div>
                    )}
                    <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                            {currentPreset?.name || 'Select Preset'}
                        </div>
                        {currentPreset?.description && (
                            <div className="text-xs text-gray-500">
                                {currentPreset.description}
                            </div>
                        )}
                    </div>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {/* Category Filter */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                    selectedCategory === 'all'
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {Object.entries(categories).map(([key, category]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                        selectedCategory === key
                                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="max-h-64 overflow-y-auto p-3">
                        {filteredPresets.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No presets found in this category
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredPresets.map((preset) => (
                                    <div
                                        key={preset.id || preset.slug}
                                        className={`p-3 border rounded-md cursor-pointer transition-all hover:shadow-md ${
                                            (preset.id === value || preset.slug === value)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handlePresetSelect(preset)}
                                    >
                                        <div className="mb-2">
                                            {renderPresetPreview(preset)}
                                        </div>
                                        <div className="text-xs">
                                            <div className="font-medium text-gray-900 mb-1">
                                                {preset.name}
                                            </div>
                                            {preset.description && (
                                                <div className="text-gray-500 line-clamp-2">
                                                    {preset.description}
                                                </div>
                                            )}
                                            {preset.is_builtin && (
                                                <div className="mt-1">
                                                    <span className="inline-block px-1 py-0.5 text-xs bg-green-100 text-green-600 rounded">
                                                        Built-in
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-gray-600 hover:text-gray-800"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Open custom preset creation modal
                                    console.log('Create custom preset');
                                }}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                                Create Custom
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ButtonPresetSelector;
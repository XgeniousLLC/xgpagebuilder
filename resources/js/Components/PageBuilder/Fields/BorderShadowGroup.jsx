import React, { useState, useCallback } from 'react';
import { Move, Plus, Trash2, Copy } from 'lucide-react';
import BorderControls from './BorderShadowGroup/BorderControls';
import ShadowBuilder from './BorderShadowGroup/ShadowBuilder';
import PresetGallery from './BorderShadowGroup/PresetGallery';

/**
 * BorderShadowGroup - Enhanced border and shadow control component
 * 
 * Provides comprehensive border and shadow controls with:
 * - Visual border builder (width, style, color, radius)
 * - Interactive shadow controls with drag & drop
 * - Preset library for quick styling
 * - Live preview of effects
 * - Per-side border controls
 * - Multiple shadow support
 */
const BorderShadowGroup = ({ 
  value, 
  onChange, 
  borderStyles = {},
  shadowPresets = {},
  perSideControls = true,
  multipleShadows = false,
  maxShadows = 5,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('border');
  const [showPresets, setShowPresets] = useState(false);
  
  // Default values
  const defaultValue = {
    border: {
      style: 'solid',
      width: { top: 0, right: 0, bottom: 0, left: 0 },
      color: '#000000',
      radius: { top: 0, right: 0, bottom: 0, left: 0 },
      linked: true
    },
    shadow: {
      type: 'none',
      x_offset: 0,
      y_offset: 2,
      blur_radius: 4,
      spread_radius: 0,
      color: 'rgba(0,0,0,0.1)',
      inset: false,
      shadows: []
    }
  };

  const currentValue = value || defaultValue;
  
  // Update handler
  const handleChange = useCallback((newValue) => {
    onChange?.(newValue);
  }, [onChange]);

  // Update border values
  const updateBorder = useCallback((borderUpdates) => {
    const newValue = {
      ...currentValue,
      border: { ...currentValue.border, ...borderUpdates }
    };
    handleChange(newValue);
  }, [currentValue, handleChange]);

  // Update shadow values
  const updateShadow = useCallback((shadowUpdates) => {
    const newValue = {
      ...currentValue,
      shadow: { ...currentValue.shadow, ...shadowUpdates }
    };
    handleChange(newValue);
  }, [currentValue, handleChange]);

  // Apply preset
  const applyPreset = useCallback((preset) => {
    handleChange(preset);
    setShowPresets(false);
  }, [handleChange]);

  // Reset to default
  const reset = useCallback(() => {
    handleChange(defaultValue);
  }, [handleChange]);

  // Check if any effects are active
  const hasEffects = () => {
    const { border, shadow } = currentValue;
    const hasVisibleBorder = Object.values(border.width || {}).some(w => w > 0);
    const hasVisibleShadow = shadow.type !== 'none';
    return hasVisibleBorder || hasVisibleShadow;
  };

  return (
    <div className={`border-shadow-group space-y-4 ${className}`}>
      {/* Header with Presets Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hasEffects() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Reset to default"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Presets Gallery */}
      {showPresets && (
        <PresetGallery
          shadowPresets={shadowPresets}
          onApplyPreset={applyPreset}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab('border')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'border'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Border
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shadow')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'shadow'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Shadow
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'border' && (
          <BorderControls
            value={currentValue.border}
            onChange={updateBorder}
            borderStyles={borderStyles}
            perSideControls={perSideControls}
          />
        )}

        {activeTab === 'shadow' && (
          <ShadowBuilder
            value={currentValue.shadow}
            onChange={updateShadow}
            shadowPresets={shadowPresets}
            multipleShadows={multipleShadows}
            maxShadows={maxShadows}
          />
        )}
      </div>
    </div>
  );
};

export default BorderShadowGroup;
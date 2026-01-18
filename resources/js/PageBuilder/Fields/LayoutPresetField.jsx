import React from 'react';
import { SquareStack, ArrowDown, ArrowRight, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';

/**
 * LayoutPresetField Component
 * 
 * User-friendly layout presets that abstract technical flexbox concepts
 * into intuitive visual choices for non-developers
 */
const LayoutPresetField = ({ 
  value = {}, 
  onChange, 
  className = '' 
}) => {
  // Current effective settings
  const currentDisplay = value.display || 'block';
  const currentDirection = value.flexDirection || 'column';
  const currentJustify = value.justifyContent || 'flex-start';
  const currentAlign = value.alignItems || 'stretch';

  // Layout presets with user-friendly names and descriptions
  const layoutPresets = [
    {
      id: 'simple',
      name: 'Simple Stack',
      description: 'Items stacked normally, one below another',
      icon: SquareStack,
      preview: (
        <div className="flex flex-col gap-0.5">
          <div className="w-full h-1.5 bg-blue-300 rounded-sm"></div>
          <div className="w-full h-1.5 bg-blue-300 rounded-sm"></div>
          <div className="w-full h-1.5 bg-blue-300 rounded-sm"></div>
        </div>
      ),
      settings: {
        display: 'block'
      }
    },
    {
      id: 'vertical_centered',
      name: 'Centered Vertically',
      description: 'Items centered from top to bottom',
      icon: AlignVerticalJustifyCenter,
      preview: (
        <div className="flex flex-col h-8 justify-center gap-0.5">
          <div className="w-full h-1 bg-green-300 rounded-sm"></div>
          <div className="w-full h-1 bg-green-300 rounded-sm"></div>
        </div>
      ),
      settings: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch'
      }
    },
    {
      id: 'vertical_spaced',
      name: 'Evenly Spaced',
      description: 'Items spread out with equal spacing',
      icon: ArrowDown,
      preview: (
        <div className="flex flex-col h-8 justify-between">
          <div className="w-full h-1 bg-purple-300 rounded-sm"></div>
          <div className="w-full h-1 bg-purple-300 rounded-sm"></div>
          <div className="w-full h-1 bg-purple-300 rounded-sm"></div>
        </div>
      ),
      settings: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch'
      }
    },
    {
      id: 'horizontal',
      name: 'Side by Side',
      description: 'Items arranged horizontally',
      icon: ArrowRight,
      preview: (
        <div className="flex flex-row gap-0.5">
          <div className="w-1.5 h-6 bg-orange-300 rounded-sm"></div>
          <div className="w-1.5 h-6 bg-orange-300 rounded-sm"></div>
          <div className="w-1.5 h-6 bg-orange-300 rounded-sm"></div>
        </div>
      ),
      settings: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch'
      }
    },
    {
      id: 'horizontal_centered',
      name: 'Centered Horizontally',
      description: 'Items side by side, centered',
      icon: AlignHorizontalJustifyCenter,
      preview: (
        <div className="flex flex-row justify-center gap-0.5">
          <div className="w-1.5 h-6 bg-red-300 rounded-sm"></div>
          <div className="w-1.5 h-6 bg-red-300 rounded-sm"></div>
        </div>
      ),
      settings: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch'
      }
    },
    {
      id: 'horizontal_spaced',
      name: 'Spread Horizontally',
      description: 'Items spread across the width',
      icon: ArrowRight,
      preview: (
        <div className="flex flex-row justify-between">
          <div className="w-1.5 h-6 bg-indigo-300 rounded-sm"></div>
          <div className="w-1.5 h-6 bg-indigo-300 rounded-sm"></div>
          <div className="w-1.5 h-6 bg-indigo-300 rounded-sm"></div>
        </div>
      ),
      settings: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch'
      }
    }
  ];

  // Find current active preset
  const getActivePreset = () => {
    for (const preset of layoutPresets) {
      const matches = Object.entries(preset.settings).every(([key, expectedValue]) => {
        const currentValue = value[key];
        return currentValue === expectedValue;
      });
      if (matches) return preset.id;
    }
    return 'custom';
  };

  const activePreset = getActivePreset();

  const handlePresetSelect = (preset) => {
    onChange({ ...value, ...preset.settings });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Preset Grid */}
      <div className="grid grid-cols-3 gap-2">
        {layoutPresets.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.id;
          
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`
                group relative p-2 rounded-md border transition-all duration-200 text-center
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              title={preset.description}
            >
              {/* Visual Preview */}
              <div className="flex items-center justify-center h-6 mb-2">
                {preset.preview}
              </div>
              
              {/* Preset Name */}
              <div className="text-xs font-medium text-gray-700 leading-tight">
                {preset.name}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Settings Indicator */}
      {activePreset === 'custom' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span className="text-sm font-medium text-amber-800">Custom Layout</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            You're using custom settings. Choose a preset above to reset.
          </p>
        </div>
      )}
    </div>
  );
};

export default LayoutPresetField;
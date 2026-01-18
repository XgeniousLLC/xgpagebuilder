import React from 'react';
import { Minus, Square, Plus } from 'lucide-react';

/**
 * SpacingPresetField Component
 * 
 * User-friendly spacing control with visual presets
 * Abstracts gap/spacing concepts into simple size choices
 */
const SpacingPresetField = ({ 
  value, 
  onChange, 
  className = '',
  label = 'Spacing Between Items'
}) => {
  // Parse current gap value
  const parseGapValue = (gap) => {
    if (!gap) return { value: 0, unit: 'px' };
    const match = gap.toString().match(/^(\d+(?:\.\d+)?)(px|%|em|rem)?$/);
    if (match) {
      return { 
        value: parseFloat(match[1]), 
        unit: match[2] || 'px' 
      };
    }
    return { value: 0, unit: 'px' };
  };

  const currentGap = parseGapValue(value);

  // Spacing presets with user-friendly names
  const spacingPresets = [
    {
      id: 'none',
      name: 'No Space',
      description: 'Items touch each other',
      value: 0,
      unit: 'px',
      icon: Minus,
      preview: (
        <div className="flex flex-col">
          <div className="w-8 h-2 bg-gray-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-gray-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-gray-300 rounded-sm"></div>
        </div>
      )
    },
    {
      id: 'tight',
      name: 'Tight',
      description: 'Very small space between items',
      value: 4,
      unit: 'px',
      icon: Square,
      preview: (
        <div className="flex flex-col gap-0.5">
          <div className="w-8 h-2 bg-blue-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-blue-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-blue-300 rounded-sm"></div>
        </div>
      )
    },
    {
      id: 'small',
      name: 'Small',
      description: 'Small space between items',
      value: 8,
      unit: 'px',
      icon: Square,
      preview: (
        <div className="flex flex-col gap-1">
          <div className="w-8 h-2 bg-green-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-green-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-green-300 rounded-sm"></div>
        </div>
      )
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Comfortable space between items',
      value: 16,
      unit: 'px',
      icon: Square,
      preview: (
        <div className="flex flex-col gap-2">
          <div className="w-8 h-2 bg-purple-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-purple-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-purple-300 rounded-sm"></div>
        </div>
      )
    },
    {
      id: 'large',
      name: 'Large',
      description: 'Large space between items',
      value: 24,
      unit: 'px',
      icon: Plus,
      preview: (
        <div className="flex flex-col gap-3">
          <div className="w-8 h-2 bg-orange-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-orange-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-orange-300 rounded-sm"></div>
        </div>
      )
    },
    {
      id: 'xl',
      name: 'Extra Large',
      description: 'Very large space between items',
      value: 32,
      unit: 'px',
      icon: Plus,
      preview: (
        <div className="flex flex-col gap-4">
          <div className="w-8 h-2 bg-red-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-red-300 rounded-sm"></div>
          <div className="w-8 h-2 bg-red-300 rounded-sm"></div>
        </div>
      )
    }
  ];

  // Find active preset
  const getActivePreset = () => {
    for (const preset of spacingPresets) {
      if (preset.value === currentGap.value && preset.unit === currentGap.unit) {
        return preset.id;
      }
    }
    return 'custom';
  };

  const activePreset = getActivePreset();

  const handlePresetSelect = (preset) => {
    const newValue = preset.value === 0 ? '0px' : `${preset.value}${preset.unit}`;
    onChange(newValue);
  };

  const handleCustomChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Quick Presets */}
      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {spacingPresets.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.id;
          
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`
                group relative p-2 rounded border transition-all duration-200 text-center
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              title={`${preset.name} (${preset.value}${preset.unit})`}
            >
              {/* Visual Preview */}
              <div className="flex items-center justify-center h-4 mb-1">
                {preset.preview}
              </div>
              
              {/* Value */}
              <div className="text-xs text-gray-600 font-medium">
                {preset.value}{preset.unit}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0.5 right-0.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Value Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Custom Value</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {currentGap.value}
            </span>
            <select
              value={currentGap.unit}
              onChange={(e) => {
                const newUnit = e.target.value;
                const newValue = `${currentGap.value}${newUnit}`;
                handleCustomChange(newValue);
              }}
              className="text-xs px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="px">px</option>
              <option value="%">%</option>
              <option value="em">em</option>
              <option value="rem">rem</option>
            </select>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={currentGap.value}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              const newGapValue = `${newValue}${currentGap.unit}`;
              handleCustomChange(newGapValue);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${currentGap.value}%, #E5E7EB ${currentGap.value}%, #E5E7EB 100%)`
            }}
          />
          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3B82F6;
              cursor: pointer;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            input[type="range"]::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3B82F6;
              cursor: pointer;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
          `}</style>
        </div>
      </div>

      {/* Custom Settings Indicator */}
      {activePreset === 'custom' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span className="text-sm font-medium text-amber-800">Custom Spacing</span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            You're using a custom value. Choose a preset above for quick adjustments.
          </p>
        </div>
      )}
    </div>
  );
};

export default SpacingPresetField;
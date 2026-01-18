import React from 'react';
import { X, Check } from 'lucide-react';

/**
 * PresetGallery - Collection of pre-designed border/shadow combinations
 */
const PresetGallery = ({ shadowPresets, onApplyPreset, onClose }) => {
  const defaultPresets = {
    none: { 
      name: 'None', 
      preview: { border: 'none', shadow: 'none' },
      value: {
        border: { style: 'solid', width: { top: 0, right: 0, bottom: 0, left: 0 }, color: '#000000', radius: { top: 0, right: 0, bottom: 0, left: 0 } },
        shadow: { type: 'none' }
      }
    },
    subtle_card: {
      name: 'Subtle Card',
      preview: { border: '1px solid #e5e7eb', shadow: '0 1px 3px rgba(0,0,0,0.1)' },
      value: {
        border: { style: 'solid', width: { top: 1, right: 1, bottom: 1, left: 1 }, color: '#e5e7eb', radius: { top: 8, right: 8, bottom: 8, left: 8 } },
        shadow: { type: 'drop', x_offset: 0, y_offset: 1, blur_radius: 3, spread_radius: 0, color: 'rgba(0,0,0,0.1)' }
      }
    },
    modern_card: {
      name: 'Modern Card',
      preview: { border: 'none', shadow: '0 4px 6px rgba(0,0,0,0.1)' },
      value: {
        border: { style: 'solid', width: { top: 0, right: 0, bottom: 0, left: 0 }, color: '#000000', radius: { top: 12, right: 12, bottom: 12, left: 12 } },
        shadow: { type: 'drop', x_offset: 0, y_offset: 4, blur_radius: 6, spread_radius: 0, color: 'rgba(0,0,0,0.1)' }
      }
    },
    floating: {
      name: 'Floating',
      preview: { border: 'none', shadow: '0 8px 25px rgba(0,0,0,0.15)' },
      value: {
        border: { style: 'solid', width: { top: 0, right: 0, bottom: 0, left: 0 }, color: '#000000', radius: { top: 16, right: 16, bottom: 16, left: 16 } },
        shadow: { type: 'drop', x_offset: 0, y_offset: 8, blur_radius: 25, spread_radius: 0, color: 'rgba(0,0,0,0.15)' }
      }
    },
    outlined: {
      name: 'Outlined',
      preview: { border: '2px solid #3b82f6', shadow: 'none' },
      value: {
        border: { style: 'solid', width: { top: 2, right: 2, bottom: 2, left: 2 }, color: '#3b82f6', radius: { top: 8, right: 8, bottom: 8, left: 8 } },
        shadow: { type: 'none' }
      }
    },
    button_primary: {
      name: 'Primary Button',
      preview: { border: 'none', shadow: '0 2px 4px rgba(59, 130, 246, 0.3)' },
      value: {
        border: { style: 'solid', width: { top: 0, right: 0, bottom: 0, left: 0 }, color: '#000000', radius: { top: 6, right: 6, bottom: 6, left: 6 } },
        shadow: { type: 'drop', x_offset: 0, y_offset: 2, blur_radius: 4, spread_radius: 0, color: 'rgba(59, 130, 246, 0.3)' }
      }
    },
    inner_glow: {
      name: 'Inner Glow',
      preview: { border: '1px solid #e5e7eb', shadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' },
      value: {
        border: { style: 'solid', width: { top: 1, right: 1, bottom: 1, left: 1 }, color: '#e5e7eb', radius: { top: 4, right: 4, bottom: 4, left: 4 } },
        shadow: { type: 'inner', x_offset: 0, y_offset: 1, blur_radius: 3, spread_radius: 0, color: 'rgba(0,0,0,0.1)', inset: true }
      }
    },
    elevated: {
      name: 'Elevated',
      preview: { border: 'none', shadow: '0 12px 20px rgba(0,0,0,0.1)' },
      value: {
        border: { style: 'solid', width: { top: 0, right: 0, bottom: 0, left: 0 }, color: '#000000', radius: { top: 8, right: 8, bottom: 8, left: 8 } },
        shadow: { type: 'drop', x_offset: 0, y_offset: 12, blur_radius: 20, spread_radius: 0, color: 'rgba(0,0,0,0.1)' }
      }
    }
  };

  const presets = { ...defaultPresets, ...shadowPresets };

  return (
    <div className="preset-gallery">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Border & Shadow Presets</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Grid */}
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => onApplyPreset(preset.value)}
              className="group relative p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-all hover:shadow-sm"
            >
              {/* Preview Box */}
              <div className="relative mb-2">
                <div 
                  className="w-full h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded"
                  style={{ 
                    border: preset.preview.border,
                    boxShadow: preset.preview.shadow
                  }}
                />
                {/* Apply indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 rounded">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              
              {/* Name */}
              <div className="text-xs text-gray-700 text-center font-medium">
                {preset.name}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          Click any preset to apply it instantly
        </div>
      </div>
    </div>
  );
};

export default PresetGallery;
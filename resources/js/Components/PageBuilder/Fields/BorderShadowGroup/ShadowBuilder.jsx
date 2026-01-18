import React, { useState, useCallback, useRef } from 'react';
import { Move, Plus, Trash2, Copy } from 'lucide-react';

/**
 * ShadowBuilder - Interactive shadow creation interface
 * 
 * Features:
 * - Drag-and-drop offset controls
 * - Visual shadow type selection
 * - Real-time blur and spread sliders
 * - Color picker with opacity
 * - Multiple shadow support
 * - Shadow preset quick-select
 */
const ShadowBuilder = ({ 
  value, 
  onChange, 
  shadowPresets = {},
  multipleShadows = false,
  maxShadows = 5 
}) => {
  const dragAreaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const defaultPresets = {
    none: { name: 'None', shadow: 'none' },
    subtle: { name: 'Subtle', shadow: '0 1px 3px rgba(0,0,0,0.1)' },
    medium: { name: 'Medium', shadow: '0 4px 6px rgba(0,0,0,0.1)' },
    strong: { name: 'Strong', shadow: '0 10px 15px rgba(0,0,0,0.1)' },
    card: { name: 'Card', shadow: '0 2px 4px rgba(0,0,0,0.1)' },
    floating: { name: 'Floating', shadow: '0 8px 25px rgba(0,0,0,0.15)' }
  };

  const presets = { ...defaultPresets, ...shadowPresets };

  // Update shadow property
  const updateShadow = useCallback((updates) => {
    onChange?.({ ...value, ...updates });
  }, [value, onChange]);

  // Handle drag for offset control
  const handleMouseDown = useCallback((e) => {
    if (!dragAreaRef.current) return;
    
    setIsDragging(true);
    const rect = dragAreaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const handleMouseMove = (moveE) => {
      const newX = Math.round((moveE.clientX - rect.left - centerX) / 2);
      const newY = Math.round((moveE.clientY - rect.top - centerY) / 2);
      
      // Constrain values within reasonable bounds
      const constrainedX = Math.max(-50, Math.min(50, newX));
      const constrainedY = Math.max(-50, Math.min(50, newY));
      
      updateShadow({
        x_offset: constrainedX,
        y_offset: constrainedY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateShadow]);

  // Apply preset
  const applyPreset = useCallback((presetKey) => {
    const preset = presets[presetKey];
    if (!preset) return;

    if (presetKey === 'none') {
      updateShadow({ type: 'none' });
    } else {
      // Parse CSS shadow string to extract values
      updateShadow({ 
        type: 'drop',
        // Basic preset application - in real implementation, 
        // you'd parse the CSS shadow string
      });
    }
  }, [presets, updateShadow]);

  // Calculate offset position for visual representation
  const getOffsetPosition = () => {
    const x = (value.x_offset || 0) * 2; // Scale for visibility
    const y = (value.y_offset || 0) * 2;
    return {
      transform: `translate(${x}px, ${y}px)`
    };
  };

  return (
    <div className="shadow-builder space-y-4">
      
      {/* Shadow Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Shadow Type</label>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'none', label: 'None' },
            { key: 'drop', label: 'Drop Shadow' },
            { key: 'inner', label: 'Inner Shadow' }
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => updateShadow({ type: key })}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                value.type === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow Presets */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Quick Presets</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="p-3 border border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors"
            >
              <div 
                className="w-full h-8 bg-blue-100 rounded mb-1"
                style={{ 
                  boxShadow: key === 'none' ? 'none' : preset.shadow
                }}
              />
              <div className="text-xs text-gray-600">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {value.type !== 'none' && (
        <>
          {/* Offset Controls */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Shadow Offset</label>
            <div className="space-y-3">
              {/* Visual drag control */}
              <div className="relative">
                <div 
                  ref={dragAreaRef}
                  className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg cursor-move relative bg-gray-50"
                  onMouseDown={handleMouseDown}
                  title="Drag to adjust shadow offset"
                >
                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-full bg-gray-300 opacity-50"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-gray-300 opacity-50"></div>
                  </div>
                  
                  {/* Draggable shadow indicator */}
                  <div 
                    className={`absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 ${
                      isDragging ? 'scale-125 shadow-lg' : 'hover:scale-110'
                    } transition-transform`}
                    style={{
                      left: '50%',
                      top: '50%',
                      ...getOffsetPosition()
                    }}
                  >
                    <Move className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                {/* Offset value display */}
                <div className="flex justify-center mt-2 space-x-4 text-xs text-gray-600">
                  <span>X: {value.x_offset || 0}px</span>
                  <span>Y: {value.y_offset || 0}px</span>
                </div>
              </div>

              {/* Numeric inputs for precise control */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">X Offset</label>
                  <input
                    type="number"
                    min="-50"
                    max="50"
                    step="1"
                    value={value.x_offset || 0}
                    onChange={(e) => updateShadow({ x_offset: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Y Offset</label>
                  <input
                    type="number"
                    min="-50"
                    max="50"
                    step="1"
                    value={value.y_offset || 0}
                    onChange={(e) => updateShadow({ y_offset: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Blur & Spread */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Blur Radius</label>
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={value.blur_radius || 0}
                  onChange={(e) => updateShadow({ blur_radius: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span className="font-medium">{value.blur_radius || 0}px</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Spread Radius</label>
              <div className="space-y-1">
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={value.spread_radius || 0}
                  onChange={(e) => updateShadow({ spread_radius: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>-20</span>
                  <span className="font-medium">{value.spread_radius || 0}px</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shadow Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Shadow Color</label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="color"
                  value={value.color?.split('(')[0] || '#000000'}
                  onChange={(e) => updateShadow({ 
                    color: `rgba(${parseInt(e.target.value.slice(1,3),16)},${parseInt(e.target.value.slice(3,5),16)},${parseInt(e.target.value.slice(5,7),16)},0.1)`
                  })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={value.color || 'rgba(0,0,0,0.1)'}
                onChange={(e) => updateShadow({ color: e.target.value })}
                className="w-32 px-2 py-2 text-sm border border-gray-300 rounded-lg font-mono"
                placeholder="rgba(0,0,0,0.1)"
              />
            </div>
          </div>

          {/* Inset Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Inner Shadow</label>
            <button
              type="button"
              onClick={() => updateShadow({ inset: !value.inset })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                value.inset ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  value.inset ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </>
      )}

      {/* Multiple Shadows (if enabled) */}
      {multipleShadows && value.type !== 'none' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Multiple Shadows</label>
            <button
              type="button"
              onClick={() => {
                const shadows = [...(value.shadows || [])];
                if (shadows.length < maxShadows) {
                  shadows.push({
                    x_offset: 0,
                    y_offset: 4,
                    blur_radius: 8,
                    spread_radius: 0,
                    color: 'rgba(0,0,0,0.05)',
                    inset: false
                  });
                  updateShadow({ shadows });
                }
              }}
              disabled={value.shadows?.length >= maxShadows}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Add Shadow
            </button>
          </div>
          
          {value.shadows?.map((shadow, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Shadow {index + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const shadows = [...(value.shadows || [])];
                    shadows.splice(index, 1);
                    updateShadow({ shadows });
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {/* Additional shadow controls would go here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShadowBuilder;
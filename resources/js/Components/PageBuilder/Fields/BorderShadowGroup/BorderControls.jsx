import React, { useState, useCallback } from 'react';
import { Link, Unlink, Square, Circle, CornerDownRight } from 'lucide-react';

/**
 * BorderControls - Visual border control interface
 * 
 * Features:
 * - Visual border style picker with icons
 * - Interactive width sliders with linking
 * - Color picker integration
 * - Visual border radius selector
 * - Per-side controls toggle
 */
const BorderControls = ({ 
  value, 
  onChange, 
  borderStyles = {},
  perSideControls = true 
}) => {
  const [linkedWidth, setLinkedWidth] = useState(value?.linked ?? true);
  const [linkedRadius, setLinkedRadius] = useState(true);

  const defaultBorderStyles = {
    solid: 'Solid',
    dashed: 'Dashed',
    dotted: 'Dotted',
    double: 'Double',
    groove: 'Groove',
    ridge: 'Ridge',
    inset: 'Inset',
    outset: 'Outset'
  };

  const styles = { ...defaultBorderStyles, ...borderStyles };

  // Update border property
  const updateBorder = useCallback((updates) => {
    onChange?.({ ...value, ...updates });
  }, [value, onChange]);

  // Update width for all sides or individual side
  const updateWidth = useCallback((side, newWidth) => {
    const width = { ...value.width };
    
    if (linkedWidth) {
      // Update all sides
      width.top = width.right = width.bottom = width.left = newWidth;
    } else {
      // Update specific side
      width[side] = newWidth;
    }
    
    updateBorder({ width });
  }, [value.width, linkedWidth, updateBorder]);

  // Update radius for all corners or individual corner
  const updateRadius = useCallback((corner, newRadius) => {
    const radius = { ...value.radius };
    
    if (linkedRadius) {
      // Update all corners
      radius.top = radius.right = radius.bottom = radius.left = newRadius;
    } else {
      // Update specific corner
      radius[corner] = newRadius;
    }
    
    updateBorder({ radius });
  }, [value.radius, linkedRadius, updateBorder]);

  // Toggle width linking
  const toggleWidthLink = useCallback(() => {
    const newLinked = !linkedWidth;
    setLinkedWidth(newLinked);
    updateBorder({ linked: newLinked });
    
    if (newLinked) {
      // When linking, use the top value for all sides
      const topWidth = value.width?.top || 0;
      updateWidth('top', topWidth);
    }
  }, [linkedWidth, value.width?.top, updateBorder, updateWidth]);

  return (
    <div className="border-controls space-y-4">
      
      {/* Border Style */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(styles).map(([styleKey, styleName]) => (
            <button
              key={styleKey}
              type="button"
              onClick={() => updateBorder({ style: styleKey })}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                value.style === styleKey
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={styleName}
            >
              <div 
                className={`w-full h-1 border-t-2 border-gray-800`}
                style={{ 
                  borderTopStyle: styleKey,
                  borderTopWidth: '2px'
                }}
              />
              {/* <div className="text-xs mt-1">{styleName}</div> */}
            </button>
          ))}
        </div>
      </div>

      {/* Border Width */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Border Width</label>
          <button
            type="button"
            onClick={toggleWidthLink}
            className={`p-1 rounded ${
              linkedWidth 
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={linkedWidth ? 'Unlink sides' : 'Link sides'}
          >
            {linkedWidth ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
          </button>
        </div>

        {linkedWidth ? (
          /* Linked width control */
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={value.width?.top || 0}
                onChange={(e) => updateWidth('top', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={value.width?.top || 0}
                  onChange={(e) => updateWidth('top', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>
          </div>
        ) : (
          /* Per-side width controls */
          perSideControls && (
            <div className="space-y-3">
              {[
                { key: 'top', label: 'Top' },
                { key: 'right', label: 'Right' },
                { key: 'bottom', label: 'Bottom' },
                { key: 'left', label: 'Left' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-gray-600">{label}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={value.width?.[key] || 0}
                      onChange={(e) => updateWidth(key, parseInt(e.target.value))}
                      className="flex-1 h-1 bg-gray-200 rounded appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={value.width?.[key] || 0}
                      onChange={(e) => updateWidth(key, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Border Color */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Border Color</label>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="color"
              value={value.color || '#000000'}
              onChange={(e) => updateBorder({ color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <input
            type="text"
            value={value.color || '#000000'}
            onChange={(e) => updateBorder({ color: e.target.value })}
            className="w-24 px-2 py-2 text-sm border border-gray-300 rounded-lg font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Border Radius</label>
          <button
            type="button"
            onClick={() => setLinkedRadius(!linkedRadius)}
            className={`p-1 rounded ${
              linkedRadius 
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={linkedRadius ? 'Unlink corners' : 'Link corners'}
          >
            {linkedRadius ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick radius presets */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => updateRadius('top', 0)}
            className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
            title="No radius"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateRadius('top', 6)}
            className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
            title="Rounded"
          >
            <CornerDownRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateRadius('top', 50)}
            className="flex-1 p-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
            title="Pill/Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
        </div>

        {linkedRadius ? (
          /* Linked radius control */
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={value.radius?.top || 0}
                onChange={(e) => updateRadius('top', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={value.radius?.top || 0}
                  onChange={(e) => updateRadius('top', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>
          </div>
        ) : (
          /* Per-corner radius controls */
          <div className="space-y-3">
            {[
              { key: 'top', label: 'Top' },
              { key: 'right', label: 'Right' },
              { key: 'bottom', label: 'Bottom' },
              { key: 'left', label: 'Left' }
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-gray-600">{label}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={value.radius?.[key] || 0}
                    onChange={(e) => updateRadius(key, parseInt(e.target.value))}
                    className="flex-1 h-1 bg-gray-200 rounded appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={value.radius?.[key] || 0}
                    onChange={(e) => updateRadius(key, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BorderControls;
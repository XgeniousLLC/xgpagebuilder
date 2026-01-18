import React, { useState, useRef } from 'react';

/**
 * EnhancedGradientPicker - Advanced gradient picker with interactive color stops
 * 
 * Features:
 * - Draggable color stops for position adjustment
 * - Interactive angle picker
 * - Live gradient preview
 * - Click-to-edit color functionality
 */
const EnhancedGradientPicker = React.memo(({ value, onChange }) => {
  const [activeColorStop, setActiveColorStop] = useState(null);
  const [isDraggingAngle, setIsDraggingAngle] = useState(false);
  const [isDraggingStop, setIsDraggingStop] = useState(null);
  const [localValue, setLocalValue] = useState(null);
  const gradientRef = useRef(null);
  const anglePickerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Parse gradient value or use defaults
  const parseGradientValue = (val) => {
    if (!val || typeof val !== 'object') {
      return {
        type: 'linear',
        angle: 135,
        colorStops: [
          { color: '#667EEA', position: 0 },
          { color: '#764BA2', position: 100 }
        ]
      };
    }

    // Handle old format (startColor/endColor) and convert to new format
    if (val.startColor && val.endColor && !val.colorStops) {
      return {
        type: val.type || 'linear',
        angle: val.angle || 135,
        colorStops: [
          { color: val.startColor, position: 0 },
          { color: val.endColor, position: 100 }
        ]
      };
    }

    return {
      type: val.type || 'linear',
      angle: val.angle || 135,
      colorStops: val.colorStops || [
        { color: '#667EEA', position: 0 },
        { color: '#764BA2', position: 100 }
      ]
    };
  };

  // Initialize and manage local value
  React.useEffect(() => {
    if (!localValue) {
      setLocalValue(parseGradientValue(value));
    }
  }, [value, localValue]);

  const gradientValue = localValue || parseGradientValue(value);

  // Debounced change handler
  const debouncedOnChange = React.useCallback((newValue) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setLocalValue(newValue);
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 50); // Faster debounce for gradient interactions
  }, [onChange]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Generate CSS gradient string
  const generateGradientCSS = (config) => {
    const { type, angle, colorStops } = config;
    const stopStrings = colorStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopStrings})`;
    } else {
      return `radial-gradient(circle, ${stopStrings})`;
    }
  };

  // Handle value changes
  const handleChange = React.useCallback((updates) => {
    const newValue = { ...gradientValue, ...updates };
    debouncedOnChange(newValue);
  }, [gradientValue, debouncedOnChange]);

  // Handle color stop clicks
  const handleColorStopClick = (stopIndex, e) => {
    e.stopPropagation();
    setActiveColorStop(stopIndex);
  };

  // Handle color stop dragging
  const handleStopMouseDown = (stopIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingStop(stopIndex);
    setActiveColorStop(null); // Close color picker while dragging
  };

  const handleStopMove = React.useCallback((e) => {
    if (isDraggingStop === null) return;

    const rect = gradientRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const roundedPercentage = Math.round(percentage);
    
    // Only update if position actually changed
    const currentPosition = gradientValue.colorStops[isDraggingStop]?.position;
    if (currentPosition === roundedPercentage) return;
    
    const newColorStops = [...gradientValue.colorStops];
    newColorStops[isDraggingStop] = {
      ...newColorStops[isDraggingStop],
      position: roundedPercentage
    };

    // Update local state immediately for smooth dragging
    setLocalValue({ ...gradientValue, colorStops: newColorStops });
    
    // Debounce the parent update
    debouncedOnChange({ ...gradientValue, colorStops: newColorStops });
  }, [isDraggingStop, gradientValue, debouncedOnChange]);

  // Handle angle picker mouse events
  const handleAngleMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingAngle(true);
    handleAngleMove(e);
  };

  const handleAngleMove = React.useCallback((e) => {
    if (!isDraggingAngle && e.type === 'mousemove') return;
    
    const rect = anglePickerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = Math.round(angle * 180 / Math.PI + 90);
    const normalizedAngle = degrees < 0 ? degrees + 360 : degrees;
    
    // Only update if angle actually changed
    if (gradientValue.angle === normalizedAngle) return;
    
    // Update local state immediately for smooth dragging
    setLocalValue({ ...gradientValue, angle: normalizedAngle });
    
    // Debounce the parent update
    debouncedOnChange({ ...gradientValue, angle: normalizedAngle });
  }, [isDraggingAngle, gradientValue, debouncedOnChange]);

  // Mouse event cleanup
  React.useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingAngle(false);
      setIsDraggingStop(null);
    };
    
    const handleMouseMove = (e) => {
      if (isDraggingAngle) handleAngleMove(e);
      if (isDraggingStop !== null) handleStopMove(e);
    };

    if (isDraggingAngle || isDraggingStop !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingAngle, isDraggingStop]);

  // Close active color stop when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.gradient-color-stop') && !e.target.closest('.enhanced-color-picker')) {
        setActiveColorStop(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Gradient Preview with Draggable Color Stops */}
      <div className="relative" ref={gradientRef}>
        <div 
          className="w-full h-16 rounded-lg border-2 border-gray-200 relative overflow-hidden cursor-pointer"
          style={{ background: generateGradientCSS(gradientValue) }}
        >
          {/* Draggable color stop indicators */}
          {gradientValue.colorStops.map((stop, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => handleColorStopClick(index, e)}
              onMouseDown={(e) => handleStopMouseDown(index, e)}
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 border-2 rounded-full shadow-sm transition-all hover:scale-110 gradient-color-stop ${
                activeColorStop === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white'
              } ${isDraggingStop === index ? 'scale-110 cursor-grabbing' : 'cursor-grab'}`}
              style={{ 
                left: `${stop.position}%`,
                backgroundColor: stop.color
              }}
              title={`${stop.color} at ${stop.position}%`}
            />
          ))}
          
          {/* Active color picker popup */}
          {activeColorStop !== null && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
              <div className="enhanced-color-picker">
                {/* We'll import the EnhancedColorPicker here */}
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                  <input
                    type="color"
                    value={gradientValue.colorStops[activeColorStop]?.color}
                    onChange={(e) => {
                      const newColorStops = [...gradientValue.colorStops];
                      newColorStops[activeColorStop] = {
                        ...newColorStops[activeColorStop],
                        color: e.target.value.toUpperCase()
                      };
                      handleChange({ colorStops: newColorStops });
                    }}
                    className="w-full h-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="mt-2 text-center">
                    <div className="text-sm font-mono text-gray-600">
                      {gradientValue.colorStops[activeColorStop]?.color}
                    </div>
                    <div className="text-xs text-gray-500">
                      Position: {gradientValue.colorStops[activeColorStop]?.position}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TYPE</label>
          <select
            value={gradientValue.type}
            onChange={(e) => handleChange({ type: e.target.value })}
            className="w-full w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        {/* Angle Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ANGLE</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={gradientValue.angle}
              onChange={(e) => handleChange({ angle: parseInt(e.target.value) || 0 })}
              className="flex-1 w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="360"
              disabled={gradientValue.type === 'radial'}
            />
            
            {/* Interactive Circular Angle Picker */}
            {gradientValue.type === 'linear' && (
              <div 
                ref={anglePickerRef}
                className="relative w-[30px] h-[30px] border-2 border-gray-300 rounded-full bg-white cursor-pointer"
                onMouseDown={handleAngleMouseDown}
              >
                <div
                  className="absolute w-2 h-2 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${gradientValue.angle - 90}deg) translateX(12px)`
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Button */}
      <button
        type="button"
        onClick={() => handleChange({ 
          type: 'linear', 
          angle: 135, 
          colorStops: [
            { color: '#667EEA', position: 0 },
            { color: '#764BA2', position: 100 }
          ]
        })}
        className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-md transition-colors"
      >
        Clear
      </button>
    </div>
  );
});

export default EnhancedGradientPicker;
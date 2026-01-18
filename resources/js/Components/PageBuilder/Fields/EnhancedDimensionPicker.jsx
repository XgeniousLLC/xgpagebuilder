import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, Unlink, Monitor, Tablet, Smartphone, ChevronDown } from 'lucide-react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

/**
 * Enhanced Dimension Picker Component
 * 
 * A comprehensive dimension/spacing control with:
 * - Visual box model interface
 * - Individual side controls (top, right, bottom, left)
 * - Link/unlink functionality for uniform values
 * - Multiple unit support (px, em, rem, %, vh, vw)
 * - Responsive controls
 * - Support for both dimension objects and CSS shorthand strings
 */
const EnhancedDimensionPicker = ({ 
  value, 
  onChange, 
  sides = ['top', 'right', 'bottom', 'left'],
  units = ['px', 'em', 'rem', '%'],
  allowNegative = false,
  min = 0,
  max = 200,
  step = 1,
  linked = false,
  showLabels = true,
  responsive = false,
  label = 'Dimension'
}) => {
  const [isLinked, setIsLinked] = useState(linked);
  const [isBreakpointDropdownOpen, setIsBreakpointDropdownOpen] = useState(false);

  // Use global device state instead of local state
  const { currentDevice, setCurrentDevice } = usePageBuilderStore();
  const activeBreakpoint = currentDevice;
  
  // Parse value based on format (object vs CSS shorthand string)
  const parseValue = useCallback((val) => {
    if (!val) {
      return { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' };
    }
    
    // Handle responsive values
    if (responsive && typeof val === 'object' && !Array.isArray(val) && val[activeBreakpoint]) {
      val = val[activeBreakpoint];
    }
    
    // Handle CSS shorthand string (e.g., "10px 15px 10px 15px")
    if (typeof val === 'string') {
      const parts = val.trim().split(/\s+/);
      const numbers = [];
      let unit = 'px';
      
      // Extract numbers and unit from string
      parts.forEach(part => {
        const match = part.match(/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/);
        if (match) {
          numbers.push(parseFloat(match[1]) || 0);
          if (match[2]) unit = match[2];
        }
      });
      
      // CSS shorthand to object conversion
      const [top = 0, right = numbers[0] || 0, bottom = numbers[0] || 0, left = right] = numbers;
      return {
        top: numbers.length >= 1 ? numbers[0] : 0,
        right: numbers.length >= 2 ? numbers[1] : (numbers[0] || 0),
        bottom: numbers.length >= 3 ? numbers[2] : (numbers[0] || 0),
        left: numbers.length >= 4 ? numbers[3] : (numbers[1] || numbers[0] || 0),
        unit
      };
    }
    
    // Handle object format
    if (typeof val === 'object' && val !== null) {
      return {
        top: val.top || 0,
        right: val.right || 0, 
        bottom: val.bottom || 0,
        left: val.left || 0,
        unit: val.unit || 'px'
      };
    }
    
    // Default fallback
    return { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' };
  }, [activeBreakpoint, responsive]);

  const dimensionValue = useMemo(() => parseValue(value), [value, parseValue]);

  // Update dimension value
  const updateDimension = useCallback((side, newValue) => {
    const updatedValue = { ...dimensionValue };
    
    if (isLinked) {
      // Update all sides when linked
      sides.forEach(s => {
        updatedValue[s] = newValue;
      });
    } else {
      // Update specific side
      updatedValue[side] = newValue;
    }
    
    // Handle responsive values
    if (responsive) {
      const responsiveValue = typeof value === 'object' && value !== null ? { ...value } : {};
      
      // Convert object back to CSS string format for consistency
      const cssString = `${updatedValue.top}${updatedValue.unit} ${updatedValue.right}${updatedValue.unit} ${updatedValue.bottom}${updatedValue.unit} ${updatedValue.left}${updatedValue.unit}`;
      responsiveValue[activeBreakpoint] = cssString;
      
      onChange(responsiveValue);
    } else {
      onChange(updatedValue);
    }
  }, [dimensionValue, isLinked, sides, responsive, activeBreakpoint, value, onChange]);

  // Update unit for all sides
  const updateUnit = useCallback((newUnit) => {
    const updatedValue = { ...dimensionValue, unit: newUnit };
    
    if (responsive) {
      const responsiveValue = typeof value === 'object' && value !== null ? { ...value } : {};
      const cssString = `${updatedValue.top}${newUnit} ${updatedValue.right}${newUnit} ${updatedValue.bottom}${newUnit} ${updatedValue.left}${newUnit}`;
      responsiveValue[activeBreakpoint] = cssString;
      onChange(responsiveValue);
    } else {
      onChange(updatedValue);
    }
  }, [dimensionValue, responsive, activeBreakpoint, value, onChange]);

  // Side configurations for visual layout
  const sideConfig = {
    top: { label: 'T', position: 'top', className: 'col-span-1 justify-self-center' },
    right: { label: 'R', position: 'right', className: 'col-start-3 row-start-2 justify-self-center' },
    bottom: { label: 'B', position: 'bottom', className: 'col-span-1 row-start-3 justify-self-center' },
    left: { label: 'L', position: 'left', className: 'col-start-1 row-start-2 justify-self-center' }
  };

  // Responsive breakpoint icons
  const breakpointIcons = {
    desktop: Monitor,
    tablet: Tablet, 
    mobile: Smartphone
  };

  return (
    <div className="dimension-picker space-y-1">
      {/* Row 1: Controls [🔗] [px▼] [🖥️▼] */}
      <div className="flex items-center gap-2">
        {/* Link/Unlink Toggle - Icon Only */}
        <button
          type="button"
          onClick={() => setIsLinked(!isLinked)}
          className={`p-1 rounded transition-colors ${
            isLinked 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isLinked ? 'Unlink sides' : 'Link all sides'}
        >
          {isLinked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
        </button>

        {/* Unit Selector */}
        <select
          value={dimensionValue.unit}
          onChange={(e) => updateUnit(e.target.value)}
          className="text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>

        {/* Responsive Dropdown */}
        {responsive && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBreakpointDropdownOpen(!isBreakpointDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {React.createElement(breakpointIcons[activeBreakpoint], { className: "w-3 h-3" })}
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {isBreakpointDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {['desktop', 'tablet', 'mobile'].map((breakpoint) => {
                  const Icon = breakpointIcons[breakpoint];
                  return (
                    <button
                      key={breakpoint}
                      type="button"
                      onClick={() => {
                        setCurrentDevice(breakpoint);
                        setIsBreakpointDropdownOpen(false);
                      }}
                      className={`flex items-center justify-center w-10 h-8 hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                        activeBreakpoint === breakpoint ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2: Input Fields [T] [R] [B] [L] */}
      <div className="flex items-center gap-1">
        {/* Top */}
        <input
          type="number"
          value={dimensionValue.top}
          onChange={(e) => updateDimension('top', parseFloat(e.target.value) || 0)}
          className="w-12 px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          min={allowNegative ? min : 0}
          max={max}
          step={step}
          title="Top"
          placeholder="T"
        />
        
        {/* Right */}
        <input
          type="number"
          value={dimensionValue.right}
          onChange={(e) => updateDimension('right', parseFloat(e.target.value) || 0)}
          className="w-12 px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          min={allowNegative ? min : 0}
          max={max}
          step={step}
          title="Right"
          placeholder="R"
        />
        
        {/* Bottom */}
        <input
          type="number"
          value={dimensionValue.bottom}
          onChange={(e) => updateDimension('bottom', parseFloat(e.target.value) || 0)}
          className="w-12 px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          min={allowNegative ? min : 0}
          max={max}
          step={step}
          title="Bottom"
          placeholder="B"
        />
        
        {/* Left */}
        <input
          type="number"
          value={dimensionValue.left}
          onChange={(e) => updateDimension('left', parseFloat(e.target.value) || 0)}
          className="w-12 px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          min={allowNegative ? min : 0}
          max={max}
          step={step}
          title="Left"
          placeholder="L"
        />
      </div>
    </div>
  );
};

export default EnhancedDimensionPicker;
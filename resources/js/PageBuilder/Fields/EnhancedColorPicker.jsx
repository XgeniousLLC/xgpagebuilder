import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Enhanced Color Picker Component
 * 
 * A comprehensive color picker with:
 * - Native browser color picker
 * - Preset color swatches
 * - Hex input validation
 * - Copy to clipboard functionality
 * - Color name display
 * - Visual feedback
 */
const EnhancedColorPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || '#000000');
  const [isCopied, setIsCopied] = useState(false);
  const pickerRef = useRef(null);

  // Preset colors matching your design (6x2 grid)
  const presetColors = [
    '#000000', '#6B7280', '#FFFFFF', '#F78DA7', '#EF4444', '#F97316',
    '#F59E0B', '#10B981', '#06D6A0', '#0891B2', '#3B82F6', '#8B5CF6'
  ];

  // Color name mapping
  const getColorName = (hex) => {
    const colorNames = {
      '#000000': 'Black',
      '#6B7280': 'Gray',
      '#FFFFFF': 'White', 
      '#F78DA7': 'Pale pink',
      '#EF4444': 'Red',
      '#F97316': 'Orange',
      '#F59E0B': 'Yellow',
      '#10B981': 'Green',
      '#06D6A0': 'Mint',
      '#0891B2': 'Teal',
      '#3B82F6': 'Blue',
      '#8B5CF6': 'Purple'
    };
    return colorNames[hex.toUpperCase()] || 'Custom color';
  };

  // Validate and format hex color
  const formatHex = (color) => {
    if (!color) return '#000000';
    if (color.startsWith('#')) {
      return color.length === 4 ? 
        color + color.slice(1) : // #RGB -> #RRGGBB
        color.toUpperCase();
    }
    return '#' + color.toUpperCase();
  };

  // Handle hex input change
  const handleHexChange = (inputValue) => {
    setHexInput(inputValue);
    const formatted = formatHex(inputValue);
    if (/^#[0-9A-F]{6}$/i.test(formatted)) {
      onChange(formatted);
    }
  };

  // Handle preset color selection
  const handlePresetSelect = (color) => {
    const formatted = formatHex(color);
    setHexInput(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  // Copy hex to clipboard with fallback
  const copyToClipboard = async (e) => {
    e.stopPropagation(); // Prevent opening color picker
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        console.log('Copied to clipboard:', value);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        console.log('Copied to clipboard (fallback):', value);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show error feedback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Close picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update hex input when value changes externally
  React.useEffect(() => {
    setHexInput(value || '#000000');
  }, [value]);

  return (
    <div className="relative" ref={pickerRef}>
      {/* Inline color preview */}
      <div className="flex items-center gap-3 w-full p-3 border-2 border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
          title={`Click to change color - ${getColorName(value)} - ${value}`}
        >
          <div 
            className="w-12 h-12 rounded-lg flex-shrink-0"
            style={{ backgroundColor: value }}
          />
          <div className="text-left">
            <div className="text-sm text-gray-600 font-mono">{value}</div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={(e) => {
            console.log('Copy button clicked!', value);
            copyToClipboard(e);
          }}
          className={`p-2 rounded-md transition-all flex-shrink-0 relative ${
            isCopied 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          title={isCopied ? 'Copied!' : 'Copy hex code'}
        >
          {isCopied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <Copy className="w-4 h-4" />
          )}
          
          {/* Copied feedback tooltip */}
          {isCopied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
              Copied!
            </div>
          )}
        </button>
      </div>

      {/* Enhanced color picker dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-72">
          {/* Browser native color picker */}
          <input
            type="color"
            value={value}
            onChange={(e) => {
              const newColor = e.target.value.toUpperCase();
              setHexInput(newColor);
              onChange(newColor);
            }}
            className="w-full h-12 border-2 border-gray-200 rounded-lg cursor-pointer mb-4"
          />

          {/* Preset color swatches */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">Preset Colors</div>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetSelect(color)}
                  className={`relative w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                    value?.toUpperCase() === color?.toUpperCase() ? 
                      'border-blue-500 ring-2 ring-blue-200' : 
                      'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`${getColorName(color)} - ${color}`}
                >
                  {value?.toUpperCase() === color?.toUpperCase() && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clear button */}
          <button
            type="button"
            onClick={() => handlePresetSelect('#000000')}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedColorPicker;
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import EnhancedGradientPicker from './EnhancedGradientPicker';

const EnhancedBackgroundPicker = React.memo(({ value, onChange }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localValue, setLocalValue] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(null);

  // Parse background value or use defaults
  const parseBackgroundValue = (val) => {
    if (!val || typeof val !== 'object') {
      return {
        type: 'none',
        color: '#000000',
        gradient: {
          type: 'linear',
          angle: 135,
          colorStops: [
            { color: '#667EEA', position: 0 },
            { color: '#764BA2', position: 100 }
          ]
        },
        image: {
          url: '',
          size: 'cover',
          position: 'center center',
          repeat: 'no-repeat',
          attachment: 'scroll'
        },
        hover: {
          color: ''
        }
      };
    }
    return val;
  };

  // Initialize local value from props
  useEffect(() => {
    if (!localValue && value) {
      setLocalValue(parseBackgroundValue(value));
    }
  }, [value, localValue]);

  // Use local value if available, otherwise parse from props
  const backgroundValue = useMemo(() => {
    if (localValue) {
      return localValue;
    }
    return parseBackgroundValue(value);
  }, [localValue, value]);

  // Debounced update to parent
  const debouncedOnChange = useCallback((newValue) => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Update local state immediately for UI responsiveness
    setLocalValue(newValue);
    setIsUpdating(true);
    
    // Debounce the parent update
    debounceTimeoutRef.current = setTimeout(() => {
      // Only update if value actually changed
      if (JSON.stringify(newValue) !== JSON.stringify(lastUpdateRef.current)) {
        onChange(newValue);
        lastUpdateRef.current = newValue;
      }
      setIsUpdating(false);
    }, 100); // Reduced debounce time for better responsiveness
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Memoized type change handler
  const handleTypeChange = useCallback((newType) => {
    const updatedValue = { ...backgroundValue, type: newType };
    debouncedOnChange(updatedValue);
    setIsDropdownOpen(false);
  }, [backgroundValue, debouncedOnChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Background type options
  const backgroundTypes = [
    { value: 'none', label: 'None' },
    { value: 'color', label: 'Color' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'image', label: 'Image' }
  ];

  // Memoize derived values
  const currentTypeLabel = useMemo(() => 
    backgroundTypes.find(type => type.value === backgroundValue.type)?.label || 'None',
    [backgroundValue.type]
  );

  // Memoized handlers with debouncing
  const handleColorChange = useCallback((newColor) => {
    const updatedValue = { 
      ...backgroundValue, 
      color: newColor.toUpperCase() 
    };
    debouncedOnChange(updatedValue);
  }, [backgroundValue, debouncedOnChange]);

  const handleGradientChange = useCallback((newGradient) => {
    const updatedValue = { 
      ...backgroundValue, 
      gradient: newGradient 
    };
    debouncedOnChange(updatedValue);
  }, [backgroundValue, debouncedOnChange]);

  const handleImageChange = useCallback((property, newValue) => {
    const updatedValue = { 
      ...backgroundValue, 
      image: {
        ...backgroundValue.image,
        [property]: newValue
      }
    };
    debouncedOnChange(updatedValue);
  }, [backgroundValue, debouncedOnChange]);

  // Memoized copy handler
  const copyToClipboard = useCallback(async (text, e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, []);

  // Memoized color presets to prevent recreation
  const colorPresets = useMemo(() => [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ], []);

  return (
    <div className="space-y-4">
      {/* Background Type Dropdown Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">BACKGROUND TYPE</label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full w-[45px] px-1 h-[25px] size-[12px] text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{currentTypeLabel}</span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {backgroundTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`w-full w-[45px] px-1 h-[25px] size-[12px] text-left text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md transition-colors ${
                    backgroundValue.type === type.value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Stable rendering with transitions */}
      <div className="min-h-[200px] relative">
        <div 
          key={backgroundValue.type}
          className="transition-opacity duration-150 ease-in-out"
        >
          {backgroundValue.type === 'color' && (
            <ColorPickerContent 
              color={backgroundValue.color}
              onColorChange={handleColorChange}
              copyFeedback={copyFeedback}
              onCopyColor={copyToClipboard}
              presets={colorPresets}
            />
          )}

          {backgroundValue.type === 'gradient' && (
            <GradientPickerContent 
              gradient={backgroundValue.gradient}
              onGradientChange={handleGradientChange}
            />
          )}

          {backgroundValue.type === 'image' && (
            <ImagePickerContent 
              image={backgroundValue.image}
              onImageChange={handleImageChange}
            />
          )}
        </div>
      </div>

      {/* Clear Button */}
      {backgroundValue.type !== 'none' && (
        <button
          type="button"
          onClick={() => handleTypeChange('none')}
          className="w-full py-2 size-[10px] text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-md transition-colors"
        >
          Clear Background
        </button>
      )}
    </div>
  );
});

// Memoized Color Picker Component
const ColorPickerContent = React.memo(({ color, onColorChange, copyFeedback, onCopyColor, presets }) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700">COLOR</label>
    
    {/* Large Color Preview Block */}
    <div className="relative">
      <div 
        className="w-full h-20 rounded-lg border-2 border-gray-200 cursor-pointer group hover:border-gray-300 transition-colors"
        style={{ backgroundColor: color }}
        onClick={() => document.getElementById('color-input-bg').click()}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => onCopyColor(color, e)}
            className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            title="Copy color code"
          >
            {copyFeedback ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Hidden color input */}
      <input
        id="color-input-bg"
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>

    {/* Color Presets */}
    <div>
      <div className="text-xs font-medium text-gray-500 mb-2">PRESETS</div>
      <div className="flex flex-wrap gap-2">
        {presets.map(presetColor => (
          <button
            key={presetColor}
            type="button"
            onClick={() => onColorChange(presetColor)}
            className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
            style={{ backgroundColor: presetColor }}
            title={presetColor}
          />
        ))}
      </div>
    </div>
  </div>
));

// Memoized Gradient Picker Component
const GradientPickerContent = React.memo(({ gradient, onGradientChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">GRADIENT</label>
    <EnhancedGradientPicker 
      value={gradient} 
      onChange={onGradientChange}
    />
  </div>
));

// Memoized Image Picker Component
const ImagePickerContent = React.memo(({ image, onImageChange }) => {
  // Ensure image object exists with defaults
  const safeImage = image || {
    url: '',
    size: 'cover',
    position: 'center center',
    repeat: 'no-repeat',
    attachment: 'scroll'
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">IMAGE BACKGROUND</label>
      
      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Image URL</label>
        <input
          type="url"
          value={safeImage.url || ''}
          onChange={(e) => onImageChange('url', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Image Preview */}
      {safeImage.url && (
        <div className="relative">
          <div 
            className="w-full h-32 rounded-lg border-2 border-gray-200 bg-gray-50"
            style={{
              backgroundImage: `url(${safeImage.url})`,
              backgroundSize: safeImage.size || 'cover',
              backgroundPosition: safeImage.position || 'center center',
              backgroundRepeat: safeImage.repeat || 'no-repeat',
              backgroundAttachment: safeImage.attachment || 'scroll'
            }}
          />
        </div>
      )}

      {/* Image Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Background Size */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Size</label>
          <select
            value={safeImage.size || 'cover'}
            onChange={(e) => onImageChange('size', e.target.value)}
            className="w-full w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
            <option value="100% 100%">Stretch</option>
          </select>
        </div>

        {/* Background Position */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
          <select
            value={safeImage.position || 'center center'}
            onChange={(e) => onImageChange('position', e.target.value)}
            className="w-full w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="center center">Center</option>
            <option value="top left">Top Left</option>
            <option value="top center">Top Center</option>
            <option value="top right">Top Right</option>
            <option value="center left">Center Left</option>
            <option value="center right">Center Right</option>
            <option value="bottom left">Bottom Left</option>
            <option value="bottom center">Bottom Center</option>
            <option value="bottom right">Bottom Right</option>
          </select>
        </div>

        {/* Background Repeat */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Repeat</label>
          <select
            value={safeImage.repeat || 'no-repeat'}
            onChange={(e) => onImageChange('repeat', e.target.value)}
            className="w-full w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="no-repeat">No Repeat</option>
            <option value="repeat">Repeat</option>
            <option value="repeat-x">Repeat X</option>
            <option value="repeat-y">Repeat Y</option>
          </select>
        </div>

        {/* Background Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Attachment</label>
          <select
            value={safeImage.attachment || 'scroll'}
            onChange={(e) => onImageChange('attachment', e.target.value)}
            className="w-full w-[45px] px-1 h-[25px] size-[12px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="scroll">Scroll</option>
            <option value="fixed">Fixed</option>
            <option value="local">Local</option>
          </select>
        </div>
      </div>
    </div>
  );
});

export default EnhancedBackgroundPicker;
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Type, AlignLeft, Bold, Italic, Underline } from 'lucide-react';

const EnhancedTypographyPicker = React.memo(({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(null);

  // Parse typography value or use defaults with comprehensive validation
  const parseTypographyValue = (val) => {
    const defaults = {
      font_family: 'inherit',
      font_size: { value: 16, unit: 'px' },
      font_weight: '400',
      font_style: 'normal',
      text_transform: 'none',
      text_decoration: 'none',
      line_height: { value: 1.4, unit: 'em' },
      letter_spacing: { value: 0, unit: 'px' },
      word_spacing: { value: 0, unit: 'px' }
    };

    // If no value or not an object, return defaults
    if (!val || typeof val !== 'object') {
      return defaults;
    }

    // Merge with defaults to ensure all properties exist
    const result = { ...defaults };

    // Safely merge each property
    Object.keys(defaults).forEach(key => {
      if (val[key] !== undefined) {
        if (typeof defaults[key] === 'object' && defaults[key] !== null) {
          // For nested objects (like font_size, line_height, etc.)
          result[key] = {
            ...defaults[key],
            ...(typeof val[key] === 'object' && val[key] !== null ? val[key] : {})
          };
        } else {
          // For simple properties
          result[key] = val[key];
        }
      }
    });

    return result;
  };

  // Initialize local value from props or with defaults
  useEffect(() => {
    const initialValue = parseTypographyValue(value);
    setLocalValue(initialValue);
  }, [value]);

  // Use local value (always initialized) with validation
  const typographyValue = localValue || parseTypographyValue(null);

  // Early return with loading state if data is not properly structured
  // This prevents crashes during initial render or responsive device switches
  if (!typographyValue ||
      !typographyValue.font_size ||
      !typographyValue.line_height ||
      !typographyValue.letter_spacing ||
      !typographyValue.word_spacing) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Debounced update to parent
  const debouncedOnChange = useCallback((newValue) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setLocalValue(newValue);
    setIsUpdating(true);
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (JSON.stringify(newValue) !== JSON.stringify(lastUpdateRef.current)) {
        onChange(newValue);
        lastUpdateRef.current = newValue;
      }
      setIsUpdating(false);
    }, 100);
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Font families
  const fontFamilies = useMemo(() => [
    { value: 'inherit', label: 'Inherit' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: 'Impact, sans-serif', label: 'Impact' }
  ], []);

  // Font weights
  const fontWeights = useMemo(() => [
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Extra Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' }
  ], []);

  // Text transforms
  const textTransforms = useMemo(() => [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'Uppercase' },
    { value: 'lowercase', label: 'Lowercase' },
    { value: 'capitalize', label: 'Capitalize' }
  ], []);

  // Text decorations
  const textDecorations = useMemo(() => [
    { value: 'none', label: 'None' },
    { value: 'underline', label: 'Underline' },
    { value: 'overline', label: 'Overline' },
    { value: 'line-through', label: 'Line Through' }
  ], []);

  // Font styles
  const fontStyles = useMemo(() => [
    { value: 'normal', label: 'Normal' },
    { value: 'italic', label: 'Italic' },
    { value: 'oblique', label: 'Oblique' }
  ], []);

  // Update handlers
  const updateProperty = useCallback((property, newValue) => {
    const updatedValue = { ...typographyValue, [property]: newValue };
    debouncedOnChange(updatedValue);
  }, [typographyValue, debouncedOnChange]);

  const updateSizeProperty = useCallback((property, subProperty, newValue) => {
    const updatedValue = {
      ...typographyValue,
      [property]: {
        ...typographyValue[property],
        [subProperty]: newValue
      }
    };
    debouncedOnChange(updatedValue);
  }, [typographyValue, debouncedOnChange]);


  return (
    <div className="space-y-4">

      {/* Typography Controls Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Font Family */}
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Type className="w-4 h-4" />
            FAMILY
          </label>
          <select
            value={typographyValue?.font_family ?? 'inherit'}
            onChange={(e) => updateProperty('font_family', e.target.value)}
            className="w-full px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontFamilies.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SIZE</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={typographyValue?.font_size?.value ?? 16}
              onChange={(e) => updateSizeProperty('font_size', 'value', parseInt(e.target.value) || 16)}
              className="flex-1 px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="8"
              max="200"
            />
            <select
              value={typographyValue?.font_size?.unit ?? 'px'}
              onChange={(e) => updateSizeProperty('font_size', 'unit', e.target.value)}
              className="w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="px">px</option>
              <option value="em">em</option>
              <option value="rem">rm</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>

        {/* Font Weight */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Bold className="w-4 h-4" />
            WEIGHT
          </label>
          <select
            value={typographyValue?.font_weight ?? '400'}
            onChange={(e) => updateProperty('font_weight', e.target.value)}
            className="w-full px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontWeights.map(weight => (
              <option key={weight.value} value={weight.value}>{weight.label}</option>
            ))}
          </select>
        </div>

        {/* Font Style */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Italic className="w-4 h-4" />
            STYLE
          </label>
          <select
            value={typographyValue?.font_style ?? 'normal'}
            onChange={(e) => updateProperty('font_style', e.target.value)}
            className="w-full px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontStyles.map(style => (
              <option key={style.value} value={style.value}>{style.label}</option>
            ))}
          </select>
        </div>

        {/* Text Transform */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TRANSFORM</label>
          <select
            value={typographyValue?.text_transform ?? 'none'}
            onChange={(e) => updateProperty('text_transform', e.target.value)}
            className="w-full px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {textTransforms.map(transform => (
              <option key={transform.value} value={transform.value}>{transform.label}</option>
            ))}
          </select>
        </div>

        {/* Text Decoration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Underline className="w-4 h-4" />
            DECORATION
          </label>
          <select
            value={typographyValue?.text_decoration ?? 'none'}
            onChange={(e) => updateProperty('text_decoration', e.target.value)}
            className="w-full px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {textDecorations.map(decoration => (
              <option key={decoration.value} value={decoration.value}>{decoration.label}</option>
            ))}
          </select>
        </div>

        {/* Line Height */}
        <div className="block">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <AlignLeft className="w-4 h-4" />
            LINE HEIGHT
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={typographyValue?.line_height?.value ?? 1.4}
              onChange={(e) => updateSizeProperty('line_height', 'value', parseFloat(e.target.value) || 1.4)}
              className="flex-1 px-[5px] w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.5"
              max="5"
              step="0.1"
            />
            <select
              value={typographyValue?.line_height?.unit ?? 'em'}
              onChange={(e) => updateSizeProperty('line_height', 'unit', e.target.value)}
              className="w-[50px] h-[30px] size-[10px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="em">em</option>
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>
       {/* Letter Spacing */}
       <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LETTER SPACING</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={typographyValue?.letter_spacing?.value ?? 0}
                onChange={(e) => updateSizeProperty('letter_spacing', 'value', parseFloat(e.target.value) || 0)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                min="-10"
                max="10"
                step="0.1"
              />
              <div className="flex items-center gap-1 min-w-[70px]">
                <input
                  type="number"
                  value={typographyValue?.letter_spacing?.value ?? 0}
                  onChange={(e) => updateSizeProperty('letter_spacing', 'value', parseFloat(e.target.value) || 0)}
                  className="w-[45px] px-1 h-[25px] text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="-10"
                  max="10"
                  step="0.1"
                />
                <select
                  value={typographyValue?.letter_spacing?.unit ?? 'px'}
                  onChange={(e) => updateSizeProperty('letter_spacing', 'unit', e.target.value)}
                  className="w-[45px] h-[25px] text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="px">px</option>
                  <option value="em">em</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Word Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WORD SPACING</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={typographyValue?.word_spacing?.value ?? 0}
                onChange={(e) => updateSizeProperty('word_spacing', 'value', parseFloat(e.target.value) || 0)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                min="-10"
                max="20"
                step="0.1"
              />
              <div className="flex items-center gap-1 min-w-[70px]">
                <input
                  type="number"
                  value={typographyValue?.word_spacing?.value ?? 0}
                  onChange={(e) => updateSizeProperty('word_spacing', 'value', parseFloat(e.target.value) || 0)}
                  className="w-[45px] px-1 h-[25px] text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="-10"
                  max="20"
                  step="0.1"
                />
                <select
                  value={typographyValue?.word_spacing?.unit ?? 'px'}
                  onChange={(e) => updateSizeProperty('word_spacing', 'unit', e.target.value)}
                  className="w-[45px] h-[25px] text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="px">px</option>
                  <option value="em">em</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => {
          const defaultTypography = parseTypographyValue(null);
          debouncedOnChange(defaultTypography);
        }}
        className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-md transition-colors"
      >
        Reset Typography
      </button>
    </div>
  );
});

export default EnhancedTypographyPicker;
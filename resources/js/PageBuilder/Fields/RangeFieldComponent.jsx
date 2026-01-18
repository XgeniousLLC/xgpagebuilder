import React from 'react';

/**
 * RangeFieldComponent - Renders range slider fields
 */
const RangeFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    default: defaultValue,
    min = 0,
    max = 100,
    step = 1,
    unit = ''
  } = fieldConfig;

  const currentValue = value !== undefined ? value : (defaultValue || min);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{currentValue}{unit}</span>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default RangeFieldComponent;
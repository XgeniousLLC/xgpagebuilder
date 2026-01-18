import React from 'react';

/**
 * NumberFieldComponent - Renders number input fields
 */
const NumberFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    placeholder,
    default: defaultValue,
    required,
    min,
    max,
    step
  } = fieldConfig;

  return (
    <input
      type="number"
      value={value ?? defaultValue ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? '' : (parseInt(val) || 0));
      }}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder || label}
      required={required}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default NumberFieldComponent;
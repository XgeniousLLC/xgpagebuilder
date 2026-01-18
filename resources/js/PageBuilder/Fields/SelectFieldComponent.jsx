import React from 'react';

/**
 * SelectFieldComponent - Renders select dropdown fields
 */
const SelectFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    default: defaultValue,
    required,
    options
  } = fieldConfig;

  return (
    <select
      value={value || defaultValue || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      required={required}
    >
      {options && Object.entries(options).map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  );
};

export default SelectFieldComponent;
import React from 'react';

/**
 * CheckboxFieldComponent - Renders checkbox input fields
 */
const CheckboxFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    default: defaultValue
  } = fieldConfig;

  return (
    <div className="flex items-center">
      <input
        id={fieldKey}
        type="checkbox"
        checked={value !== undefined ? value : (defaultValue || false)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={fieldKey} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

export default CheckboxFieldComponent;
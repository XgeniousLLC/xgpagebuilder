import React from 'react';

/**
 * TextFieldComponent - Renders text input fields
 */
const TextFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    placeholder,
    default: defaultValue,
    required
  } = fieldConfig;

  return (
    <input
      type="text"
      value={value ?? fieldConfig.default ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder || label}
      required={required}
    />
  );
};

export default TextFieldComponent;
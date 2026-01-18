import React from 'react';

/**
 * TextareaFieldComponent - Renders textarea input fields
 */
const TextareaFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    placeholder,
    default: defaultValue,
    required,
    rows
  } = fieldConfig;

  return (
    <textarea
      value={value ?? defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows || 4}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder || label}
      required={required}
    />
  );
};

export default TextareaFieldComponent;
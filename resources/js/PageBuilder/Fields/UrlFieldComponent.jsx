import React from 'react';

/**
 * UrlFieldComponent - Renders URL input fields
 */
const UrlFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    placeholder,
    default: defaultValue,
    required
  } = fieldConfig;

  return (
    <input
      type="url"
      value={value ?? defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder || 'https://example.com'}
      required={required}
    />
  );
};

export default UrlFieldComponent;
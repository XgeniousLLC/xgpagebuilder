import React from 'react';

/**
 * ToggleFieldComponent - Renders toggle switch fields
 */
const ToggleFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    default: defaultValue
  } = fieldConfig;

  const isToggled = value !== undefined ? value : (defaultValue || false);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!isToggled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isToggled ? 'bg-blue-600' : 'bg-gray-200'}
        `}
        role="switch"
        aria-checked={isToggled}
        aria-labelledby={`${fieldKey}-label`}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${isToggled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

export default ToggleFieldComponent;
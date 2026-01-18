import React from 'react';
import { Square, Rows4 } from 'lucide-react';

/**
 * DisplayModeField Component
 * 
 * Primary display mode selector for block vs flex
 * Should be shown at the top before other layout controls
 */
const DisplayModeField = ({ 
  value = 'block', 
  onChange, 
  className = '',
  label = 'Display Mode'
}) => {
  const displayModes = [
    {
      value: 'block',
      icon: Square,
      title: 'Block',
      description: 'Normal document flow'
    },
    {
      value: 'flex',
      icon: Rows4,
      title: 'Flex',
      description: 'Flexible layout with advanced controls'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>

      {/* Display Mode Toggle */}
      <div className="flex gap-1">
        {displayModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = value === mode.value;
          
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onChange(mode.value)}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded border transition-all duration-200 flex-1
                ${isActive 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
              title={mode.description}
              aria-label={mode.title}
              aria-pressed={isActive}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{mode.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayModeField;
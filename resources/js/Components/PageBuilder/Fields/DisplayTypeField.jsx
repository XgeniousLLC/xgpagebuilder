import React from 'react';
import { Square, Rows4, SquareStack } from 'lucide-react';

/**
 * DisplayTypeField Component
 * 
 * Icon-based display type selector for layout controls
 * Supports block, flex, and inline-block display options
 */
const DisplayTypeField = ({ 
  value, 
  onChange, 
  displayTypes = ['block', 'flex', 'inline-block'],
  defaultValue = 'block',
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const displayTypeIcons = {
    block: Square,
    flex: Rows4,
    'inline-block': SquareStack
  };

  const displayTypeLabels = {
    block: 'Block',
    flex: 'Flex',
    'inline-block': 'Inline Block'
  };

  const currentDisplayType = value || defaultValue || 'block';

  // Ensure displayTypes is always an array
  const validDisplayTypes = Array.isArray(displayTypes) ? displayTypes : ['block', 'flex', 'inline-block'];

  // Size variants
  const sizeClasses = {
    small: {
      button: 'w-8 h-8',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    default: {
      button: 'w-12 h-12',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    large: {
      button: 'w-14 h-14',
      icon: 'w-5 h-5',
      text: 'text-sm'
    }
  };

  const sizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {validDisplayTypes.map((displayType) => {
          const Icon = displayTypeIcons[displayType] || Square;
          const label = displayTypeLabels[displayType] || displayType;
          const isActive = currentDisplayType === displayType;
          
          return (
            <div key={displayType} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(displayType)}
                className={`
                  flex items-center justify-center ${sizeClass.button} rounded-lg border transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
                title={`Set display to ${label}`}
                aria-label={`Set display type to ${label}`}
                aria-pressed={isActive}
              >
                <Icon className={sizeClass.icon} />
              </button>
              <span className={`${sizeClass.text} font-medium text-gray-600`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayTypeField;
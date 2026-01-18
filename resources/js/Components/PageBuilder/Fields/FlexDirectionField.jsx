import React from 'react';
import { ArrowRight, ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react';

/**
 * FlexDirectionField Component
 * 
 * Visual flex-direction control with directional arrows
 * Matches the design pattern from Figma/design system
 */
const FlexDirectionField = ({ 
  value = 'column', 
  onChange, 
  className = '',
  label = 'Direction'
}) => {
  const directions = [
    {
      value: 'row',
      icon: ArrowRight,
      title: 'Horizontal (Row)'
    },
    {
      value: 'column',
      icon: ArrowDown,
      title: 'Vertical (Column)'
    },
    {
      value: 'row-reverse',
      icon: ArrowLeft,
      title: 'Horizontal Reverse'
    },
    {
      value: 'column-reverse',
      icon: ArrowUp,
      title: 'Vertical Reverse'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label - Only show if not wrapped in ResponsiveFieldWrapper */}
      {!value && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
      )}

      {/* Direction Controls */}
      <div className="flex gap-1">
        {directions.map((direction) => {
          const Icon = direction.icon;
          const isActive = value === direction.value;
          
          return (
            <button
              key={direction.value}
              type="button"
              onClick={() => onChange(direction.value)}
              className={`
                flex items-center justify-center w-10 h-8 rounded border transition-all duration-200
                ${isActive 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
              title={direction.title}
              aria-label={direction.title}
              aria-pressed={isActive}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FlexDirectionField;
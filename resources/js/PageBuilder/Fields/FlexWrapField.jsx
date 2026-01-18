import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';

/**
 * FlexWrapField Component
 * 
 * Visual flex-wrap control with wrap icons
 * Shows whether items stay in single line or wrap to multiple lines
 */
const FlexWrapField = ({ 
  value = 'nowrap', 
  onChange, 
  className = '',
  label = 'Wrap'
}) => {
  const wrapOptions = [
    {
      value: 'nowrap',
      icon: <ArrowRight className="w-4 h-4" />,
      title: 'No Wrap (Single Line)'
    },
    {
      value: 'wrap',
      icon: <RotateCcw className="w-4 h-4" />,
      title: 'Wrap (Multiple Lines)'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>

      {/* Wrap Controls */}
      <div className="flex gap-1">
        {wrapOptions.map((option) => {
          const isActive = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex items-center justify-center w-10 h-8 rounded border transition-all duration-200
                ${isActive 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
              title={option.title}
              aria-label={option.title}
              aria-pressed={isActive}
            >
              {option.icon}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 italic leading-tight">
        Items within the container can stay in a single line (No wrap), or break into multiple lines (Wrap).
      </p>
    </div>
  );
};

export default FlexWrapField;
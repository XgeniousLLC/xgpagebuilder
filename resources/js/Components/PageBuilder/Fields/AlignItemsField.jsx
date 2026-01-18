import React from 'react';
import { Type, Minus, AlignCenter, Square } from 'lucide-react';

/**
 * AlignItemsField Component
 * 
 * Visual align-items control with alignment icons
 * Shows how items are aligned along the cross axis
 */
const AlignItemsField = ({ 
  value = 'stretch', 
  onChange, 
  className = '',
  label = 'Align Items'
}) => {
  const alignOptions = [
    {
      value: 'stretch',
      icon: <Type className="w-4 h-4" />,
      title: 'Stretch'
    },
    {
      value: 'flex-start',
      icon: <Minus className="w-4 h-4" />,
      title: 'Start'
    },
    {
      value: 'center',
      icon: <AlignCenter className="w-4 h-4" />,
      title: 'Center'
    },
    {
      value: 'flex-end',
      icon: <Square className="w-4 h-4" />,
      title: 'End'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>

      {/* Align Controls */}
      <div className="flex gap-1">
        {alignOptions.map((option) => {
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
    </div>
  );
};

export default AlignItemsField;
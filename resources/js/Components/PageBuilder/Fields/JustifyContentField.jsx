import React from 'react';

/**
 * JustifyContentField Component
 * 
 * Visual justify-content control with alignment icons
 * Shows how items are distributed along the main axis
 */
const JustifyContentField = ({ 
  value = 'flex-start', 
  onChange, 
  className = '',
  label = 'Justify Content'
}) => {
  const justifyOptions = [
    {
      value: 'flex-start',
      icon: (
        <div className="flex items-center h-4 w-6 gap-0.5">
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
        </div>
      ),
      title: 'Start'
    },
    {
      value: 'center',
      icon: (
        <div className="flex items-center justify-center h-4 w-6 gap-0.5">
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
        </div>
      ),
      title: 'Center'
    },
    {
      value: 'flex-end',
      icon: (
        <div className="flex items-center justify-end h-4 w-6 gap-0.5">
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
        </div>
      ),
      title: 'End'
    },
    {
      value: 'space-between',
      icon: (
        <div className="flex items-center justify-between h-4 w-6">
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
        </div>
      ),
      title: 'Space Between'
    },
    {
      value: 'space-around',
      icon: (
        <div className="flex items-center h-4 w-6 px-0.5 justify-between">
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
          <div className="w-1 h-3 bg-current"></div>
        </div>
      ),
      title: 'Space Around'
    },
    {
      value: 'space-evenly',
      icon: (
        <div className="flex items-center h-4 w-6">
          <div className="flex-1 flex justify-center">
            <div className="w-1 h-3 bg-current"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-1 h-3 bg-current"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-1 h-3 bg-current"></div>
          </div>
        </div>
      ),
      title: 'Space Evenly'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>

      {/* Justify Controls */}
      <div className="grid grid-cols-3 gap-1">
        {justifyOptions.map((option) => {
          const isActive = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex items-center justify-center w-full h-8 rounded border transition-all duration-200
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

export default JustifyContentField;
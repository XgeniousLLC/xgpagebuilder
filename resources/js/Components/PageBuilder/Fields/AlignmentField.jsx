import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, X } from 'lucide-react';

/**
 * AlignmentField Component
 * 
 * A reusable alignment field component with icon-based controls
 * Supports various alignment types and configurations
 */
const AlignmentField = ({ 
  value, 
  onChange, 
  alignments = ['none', 'left', 'center', 'right'],
  defaultValue = 'none',
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const alignmentIcons = {
    none: X,
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
    justify: AlignJustify,
    'flex-start': AlignLeft,
    'flex-end': AlignRight
  };

  const currentAlignment = value || defaultValue || 'none';

  // Ensure alignments is always an array
  const validAlignments = Array.isArray(alignments) ? alignments : ['none', 'left', 'center', 'right'];

  // Size variants
  const sizeClasses = {
    small: {
      button: 'w-6 h-6',
      icon: 'w-3 h-3'
    },
    default: {
      button: 'w-8 h-8',
      icon: 'w-4 h-4'
    },
    large: {
      button: 'w-10 h-10',
      icon: 'w-5 h-5'
    }
  };

  const sizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {validAlignments.map((alignment) => {
        const Icon = alignmentIcons[alignment] || AlignLeft;
        const isActive = currentAlignment === alignment;
        
        return (
          <button
            key={alignment}
            type="button"
            onClick={() => onChange(alignment)}
            className={`
              flex items-center justify-center ${sizeClass.button} rounded border transition-all duration-200
              ${isActive 
                ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
            title={alignment.charAt(0).toUpperCase() + alignment.slice(1)}
            aria-label={`Set alignment to ${alignment}`}
            aria-pressed={isActive}
          >
            <Icon className={sizeClass.icon} />
          </button>
        );
      })}
    </div>
  );
};

export default AlignmentField;
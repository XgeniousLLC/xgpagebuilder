import React from 'react';

const ButtonWidget = ({ 
  text = 'Click Me', 
  url = '#', 
  openInNewTab = false,
  variant = 'primary',
  size = 'medium'
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600',
      outline: 'bg-transparent text-blue-600 hover:bg-blue-50 border-blue-600',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent'
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-6 py-2 text-base',
      large: 'px-8 py-3 text-lg'
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <a 
      href={url}
      target={openInNewTab ? '_blank' : '_self'}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className={`inline-block font-medium rounded-md border transition-colors duration-200 ${getVariantClasses()} ${getSizeClasses()}`}
    >
      {text}
    </a>
  );
};

export default ButtonWidget;
import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

/**
 * ResponsiveFieldWrapper Component
 * 
 * Wraps any field component to add responsive device controls
 * Allows different values for desktop, tablet, and mobile
 */
const ResponsiveFieldWrapper = ({
  children,
  value,
  onChange,
  defaultValue = '',
  className = '',
  label = ''
}) => {
  const { currentDevice, setCurrentDevice } = usePageBuilderStore();

  // Use global device state instead of local state
  const activeDevice = currentDevice;

  const devices = [
    {
      key: 'desktop',
      icon: Monitor,
      title: 'Desktop',
      breakpoint: '1024px+'
    },
    {
      key: 'tablet',
      icon: Tablet,
      title: 'Tablet',
      breakpoint: '768px - 1023px'
    },
    {
      key: 'mobile',
      icon: Smartphone,
      title: 'Mobile',
      breakpoint: '0px - 767px'
    }
  ];

  // Parse responsive value - can be string or object
  const getResponsiveValue = () => {
    if (!value) return { desktop: defaultValue, tablet: defaultValue, mobile: defaultValue };
    
    if (typeof value === 'string') {
      // Convert simple value to responsive object
      return { desktop: value, tablet: value, mobile: value };
    }
    
    if (typeof value === 'object') {
      return {
        desktop: value.desktop || defaultValue,
        tablet: value.tablet || value.desktop || defaultValue,
        mobile: value.mobile || value.tablet || value.desktop || defaultValue
      };
    }
    
    return { desktop: defaultValue, tablet: defaultValue, mobile: defaultValue };
  };

  const responsiveValue = getResponsiveValue();
  const currentValue = responsiveValue[activeDevice];

  const handleValueChange = (newValue) => {
    const updatedResponsiveValue = {
      ...responsiveValue,
      [activeDevice]: newValue
    };
    
    // If all values are the same, return simple string
    if (updatedResponsiveValue.desktop === updatedResponsiveValue.tablet && 
        updatedResponsiveValue.tablet === updatedResponsiveValue.mobile) {
      onChange(updatedResponsiveValue.desktop);
    } else {
      onChange(updatedResponsiveValue);
    }
  };

  // Check if responsive values are different
  const isResponsive = responsiveValue.desktop !== responsiveValue.tablet || 
                      responsiveValue.tablet !== responsiveValue.mobile;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with Responsive Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {isResponsive && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium">
              Responsive
            </span>
          )}
        </div>

        {/* Device Selector */}
        <div className="flex bg-gray-100 rounded-md p-0.5">
          {devices.map((device) => {
            const Icon = device.icon;
            const isActive = activeDevice === device.key;
            const hasCustomValue = responsiveValue[device.key] !== responsiveValue.desktop;
            
            return (
              <button
                key={device.key}
                type="button"
                onClick={() => setCurrentDevice(device.key)}
                className={`
                  relative p-1.5 rounded transition-all duration-200
                  ${isActive
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                title={`${device.title} (${device.breakpoint})`}
                aria-label={device.title}
              >
                <Icon className="w-3.5 h-3.5" />
                {hasCustomValue && device.key !== 'desktop' && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Field Content */}
      <div>
        {React.cloneElement(children, {
          value: currentValue,
          onChange: handleValueChange,
          'data-device': activeDevice
        })}
      </div>

      {/* Device Info */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>
          Editing: {devices.find(d => d.key === activeDevice)?.title} 
          ({devices.find(d => d.key === activeDevice)?.breakpoint})
        </span>
        {isResponsive && (
          <button
            type="button"
            onClick={() => {
              // Reset to single value (desktop value)
              onChange(responsiveValue.desktop);
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset to Single Value
          </button>
        )}
      </div>
    </div>
  );
};

export default ResponsiveFieldWrapper;
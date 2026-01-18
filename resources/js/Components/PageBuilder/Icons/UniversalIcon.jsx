import React from 'react';
import { WidgetIcon as SVGWidgetIcon } from './WidgetIcons';

/**
 * Universal Icon Component
 * Handles multiple icon formats:
 * - Lineicons (lni-*)
 * - Line Awesome (la-*)
 * - SVG content
 * - Legacy SVG widget icons
 */
const UniversalIcon = ({ icon, type, className = "w-5 h-5" }) => {
  // Handle new icon format from PHP
  if (icon && typeof icon === 'object') {
    switch (icon.type) {
      case 'svg':
        // Render inline SVG
        return (
          <div 
            className={className}
            dangerouslySetInnerHTML={{ __html: icon.content }}
          />
        );
        
      case 'line-awesome':
        // Render Line Awesome icon
        return <i className={`${icon.icon} ${className}`} />;
        
      case 'lineicons':
        // Render Lineicons
        return <i className={`${icon.icon} ${className}`} />;
        
      default:
        // Unknown type, try to render as is
        if (icon.icon) {
          return <i className={`${icon.icon} ${className}`} />;
        }
    }
  }
  
  // Handle legacy string format
  if (icon && typeof icon === 'string') {
    // Line Awesome - needs 'las' (solid) or 'lar' (regular) prefix
    if (icon.startsWith('la-')) {
      // Add 'las' prefix if not already present (las = line awesome solid)
      return <i className={`las ${icon} ${className}`} />;
    }
    
    // Line Awesome with full prefix (las la-icon or lar la-icon)
    if (icon.startsWith('las ') || icon.startsWith('lar ') || icon.startsWith('lab ')) {
      return <i className={`${icon} ${className}`} />;
    }
    
    // Lineicons
    if (icon.startsWith('lni-') || icon.startsWith('lni ')) {
      return <i className={`lni ${icon} ${className}`} />;
    }
    
    // Font Awesome
    if (icon.startsWith('fa-') || icon.startsWith('fas ') || icon.startsWith('far ') || icon.startsWith('fab ')) {
      return <i className={`${icon} ${className}`} />;
    }
    
    // SVG content
    if (icon.includes('<svg')) {
      return (
        <div 
          className={className}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }
    
    // Generic icon class (just render as-is)
    if (icon.includes('-') || icon.includes(' ')) {
      return <i className={`${icon} ${className}`} />;
    }
  }
  
  // Use SVG icons based on widget type (legacy support)
  if (type) {
    return <SVGWidgetIcon type={type} className={className} />;
  }
  
  // Fallback
  return (
    <div className={`${className} flex items-center justify-center text-xs font-bold`}>
      {icon && typeof icon === 'string' ? icon.charAt(0).toUpperCase() : 'W'}
    </div>
  );
};

export default UniversalIcon;
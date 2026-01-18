import React from 'react';
import PhpWidgetRenderer from './PhpWidgetRenderer';
import TextWidget from './Types/TextWidget';
import CollapseWidget from './Types/CollapseWidget';
import CarouselWidget from './Types/CarouselWidget';
import ContainerWidget from './Types/ContainerWidget';

// Legacy React Widget Registry (for specific widgets that require React components)
const legacyWidgetRegistry = {
  // Only keeping React widgets that don't have PHP equivalents yet
  text: TextWidget, // Keep for backward compatibility, but PHP 'paragraph' is preferred
  container: ContainerWidget, // Special layout widget for sections
  collapse: CollapseWidget, // Not yet implemented in PHP
  carousel: CarouselWidget // Not yet implemented in PHP
};

const WidgetRenderer = ({ widget }) => {
  // Check if this is a legacy React widget that should use React rendering
  const WidgetComponent = legacyWidgetRegistry[widget.type];
  
  if (WidgetComponent) {
    // Use React component for legacy widgets
    return (
      <div 
        className={widget.advanced?.cssClasses || ''}
        style={widget.advanced?.customCSS ? { 
          ...widget.style,
          ...(widget.advanced.customCSS ? parseCSSString(widget.advanced.customCSS) : {})
        } : widget.style}
      >
        <WidgetComponent {...widget.content} />
      </div>
    );
  }

  // Default to PHP rendering for all other widgets
  // This includes all PHP widgets and any new custom widgets
  return (
    <PhpWidgetRenderer 
      widget={widget}
      className={widget.advanced?.cssClasses || ''}
      style={widget.advanced?.customCSS ? { 
        ...widget.style,
        ...(widget.advanced.customCSS ? parseCSSString(widget.advanced.customCSS) : {})
      } : widget.style}
    />
  );
};

// Helper function to parse CSS string into object
const parseCSSString = (cssString) => {
  const styles = {};
  if (!cssString) return styles;
  
  cssString.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styles[camelProperty] = value;
    }
  });
  
  return styles;
};

export default WidgetRenderer;
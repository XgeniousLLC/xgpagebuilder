import React from 'react';

/**
 * DividerField - Visual divider/separator component
 * 
 * Renders a visual separator between form sections with customizable styling.
 * Supports text labels, different styles, colors, and positioning.
 */
const DividerField = ({
  color = '#e2e8f0', // slate-200 equivalent
  style = 'solid',
  thickness = 1,
  margin = { top: 16, bottom: 16 },
  text = '',
  textPosition = 'center',
  textColor = '#64748b', // slate-500 equivalent
  textSize = 'sm',
  fullWidth = true,
  className = ''
}) => {
  // Font size mapping
  const fontSizes = {
    xs: 'text-xs',     // 12px
    sm: 'text-sm',     // 14px
    base: 'text-base', // 16px
    lg: 'text-lg',     // 18px
    xl: 'text-xl'      // 20px
  };

  // Text position mapping
  const textPositions = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Border style mapping
  const borderStyles = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    double: 'border-double'
  };

  // Create inline styles for custom colors and dimensions
  const dividerStyle = {
    marginTop: `${margin.top}px`,
    marginBottom: `${margin.bottom}px`,
    borderTopWidth: `${thickness}px`,
    borderTopColor: color,
    width: fullWidth ? '100%' : 'auto'
  };

  const textStyle = {
    color: textColor
  };

  // If divider has text, render with text overlay
  if (text) {
    return (
      <div 
        className={`relative flex items-center ${className}`}
        style={{
          marginTop: `${margin.top}px`,
          marginBottom: `${margin.bottom}px`
        }}
      >
        {/* Left line (for center/right text) */}
        {(textPosition === 'center' || textPosition === 'right') && (
          <div 
            className={`flex-1 border-t ${borderStyles[style]}`}
            style={{
              borderTopWidth: `${thickness}px`,
              borderTopColor: color
            }}
          />
        )}
        
        {/* Right line (for center/left text) */}
        {(textPosition === 'center' || textPosition === 'left') && (
          <div 
            className={`flex-1 border-t ${borderStyles[style]}`}
            style={{
              borderTopWidth: `${thickness}px`,
              borderTopColor: color
            }}
          />
        )}
      </div>
    );
  }

  // Simple divider without text
  return (
    <hr 
      className={`border-0 border-t ${borderStyles[style]} ${className}`}
      style={dividerStyle}
    />
  );
};

// Pre-configured divider variants
export const SimpleDivider = (props) => (
  <DividerField {...props} />
);

export const ThickDivider = (props) => (
  <DividerField thickness={3} {...props} />
);

export const DashedDivider = (props) => (
  <DividerField style="dashed" {...props} />
);

export const DottedDivider = (props) => (
  <DividerField style="dotted" {...props} />
);

export const SectionDivider = ({ text, ...props }) => (
  <DividerField 
    text={text} 
    textSize="base" 
    textPosition="center"
    {...props} 
  />
);

export const SpacerDivider = ({ height = 24, ...props }) => (
  <DividerField 
    color="transparent" 
    thickness={0}
    margin={{ top: 0, bottom: height }}
    {...props} 
  />
);

export default DividerField;
import React from 'react';

/**
 * LivePreview - Real-time preview of border and shadow effects
 */
const LivePreview = ({ borderValue, shadowValue }) => {
  // Generate CSS for border
  const generateBorderCSS = (border) => {
    const { style, width, color, radius } = border || {};
    
    return {
      borderStyle: style || 'solid',
      borderWidth: `${width?.top || 0}px ${width?.right || 0}px ${width?.bottom || 0}px ${width?.left || 0}px`,
      borderColor: color || '#000000',
      borderRadius: `${radius?.top || 0}px ${radius?.right || 0}px ${radius?.bottom || 0}px ${radius?.left || 0}px`
    };
  };

  // Generate CSS for shadow
  const generateShadowCSS = (shadow) => {
    if (!shadow || shadow.type === 'none') {
      return { boxShadow: 'none' };
    }

    const { x_offset, y_offset, blur_radius, spread_radius, color, inset } = shadow;
    const shadowParts = [];
    
    // Main shadow
    const mainShadow = `${inset ? 'inset ' : ''}${x_offset || 0}px ${y_offset || 0}px ${blur_radius || 0}px ${spread_radius || 0}px ${color || 'rgba(0,0,0,0.1)'}`;
    shadowParts.push(mainShadow);
    
    // Additional shadows if they exist
    if (shadow.shadows && shadow.shadows.length > 0) {
      shadow.shadows.forEach(additionalShadow => {
        const addShadow = `${additionalShadow.inset ? 'inset ' : ''}${additionalShadow.x_offset || 0}px ${additionalShadow.y_offset || 0}px ${additionalShadow.blur_radius || 0}px ${additionalShadow.spread_radius || 0}px ${additionalShadow.color || 'rgba(0,0,0,0.1)'}`;
        shadowParts.push(addShadow);
      });
    }

    return { boxShadow: shadowParts.join(', ') };
  };

  // Combine styles
  const previewStyle = {
    ...generateBorderCSS(borderValue),
    ...generateShadowCSS(shadowValue),
    // Base styles for preview
    width: '100%',
    height: '120px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out'
  };

  // Get descriptive text for current settings
  const getEffectsDescription = () => {
    const effects = [];
    
    // Border description
    const border = borderValue || {};
    const maxBorderWidth = Math.max(
      border.width?.top || 0,
      border.width?.right || 0,
      border.width?.bottom || 0,
      border.width?.left || 0
    );
    
    if (maxBorderWidth > 0) {
      effects.push(`${maxBorderWidth}px ${border.style || 'solid'} border`);
    }

    const maxRadius = Math.max(
      border.radius?.top || 0,
      border.radius?.right || 0,
      border.radius?.bottom || 0,
      border.radius?.left || 0
    );

    if (maxRadius > 0) {
      effects.push(`${maxRadius}px radius`);
    }
    
    // Shadow description
    const shadow = shadowValue || {};
    if (shadow.type !== 'none') {
      const shadowDesc = shadow.inset ? 'Inner shadow' : 'Drop shadow';
      effects.push(`${shadowDesc} (${shadow.blur_radius || 0}px blur)`);
    }
    
    return effects.length > 0 ? effects.join(' • ') : 'No effects applied';
  };

  // CSS code display
  const getCSSCode = () => {
    const borderCSS = generateBorderCSS(borderValue);
    const shadowCSS = generateShadowCSS(shadowValue);
    
    const cssLines = [];
    
    // Border properties
    if (borderCSS.borderWidth !== '0px 0px 0px 0px') {
      cssLines.push(`border: ${borderCSS.borderWidth} ${borderCSS.borderStyle} ${borderCSS.borderColor};`);
    }
    if (borderCSS.borderRadius !== '0px 0px 0px 0px') {
      cssLines.push(`border-radius: ${borderCSS.borderRadius};`);
    }
    
    // Shadow properties
    if (shadowCSS.boxShadow !== 'none') {
      cssLines.push(`box-shadow: ${shadowCSS.boxShadow};`);
    }
    
    return cssLines.join('\n') || '/* No styles applied */';
  };

  return (
    <div className="live-preview space-y-4">
      {/* Preview Area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Live Preview</label>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div style={previewStyle}>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">Preview Element</div>
              <div className="text-xs text-gray-500 mt-1">Your border & shadow effects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Effects Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Current Effects</label>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">{getEffectsDescription()}</p>
        </div>
      </div>

      {/* CSS Code */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Generated CSS</label>
        <div className="relative">
          <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto font-mono">
            {getCSSCode()}
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(getCSSCode())}
            className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
            title="Copy CSS"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Multiple Preview Examples */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Different Contexts</label>
        <div className="grid grid-cols-3 gap-3">
          {/* Card context */}
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Card</div>
            <div className="p-2 bg-gray-50 rounded">
              <div
                style={{
                  ...previewStyle,
                  height: '60px',
                  fontSize: '11px'
                }}
              >
                Card
              </div>
            </div>
          </div>

          {/* Button context */}
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Button</div>
            <div className="p-2 bg-gray-50 rounded">
              <div
                style={{
                  ...previewStyle,
                  height: '36px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Button
              </div>
            </div>
          </div>

          {/* Input context */}
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Input</div>
            <div className="p-2 bg-gray-50 rounded">
              <div
                style={{
                  ...previewStyle,
                  height: '36px',
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  justifyContent: 'flex-start',
                  paddingLeft: '8px'
                }}
              >
                Input field
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
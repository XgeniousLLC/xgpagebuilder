/**
 * ColumnStyleGenerator Utility
 * 
 * Generates dynamic CSS styles for page builder columns based on their settings.
 * This utility converts column settings into proper CSS properties for rendering.
 * Integrates with PHP CSSGenerator system for production CSS generation.
 * 
 * Features:
 * - Display type handling (block, flex, inline-block)
 * - Flexbox property generation
 * - Gap handling with unit support
 * - CSS class generation
 * - Inline style generation
 * - PHP CSS generation integration
 * - Real-time preview support
 */

/**
 * Generate inline styles for a column based on its settings
 * @param {Object} settings - Column settings object
 * @param {Object} additionalStyles - Additional manual styles to merge
 * @returns {Object} CSS style object for React inline styles
 */
export const generateColumnInlineStyles = (settings = {}, additionalStyles = {}) => {
  const styles = {};

  // Display type
  if (settings.display) {
    styles.display = settings.display;
  }

  // Flexbox properties (only when display is flex)
  if (settings.display === 'flex') {
    if (settings.flexDirection) {
      styles.flexDirection = settings.flexDirection;
    }

    if (settings.justifyContent) {
      styles.justifyContent = settings.justifyContent;
    }

    if (settings.alignItems) {
      styles.alignItems = settings.alignItems;
    }

    if (settings.flexWrap) {
      styles.flexWrap = settings.flexWrap;
    }

    // Gap handling with unit support
    if (settings.gap) {
      styles.gap = settings.gap;
    }
  }

  // Background styles
  if (settings.columnBackground) {
    const bg = settings.columnBackground;
    if (bg.type === 'color' && bg.color) {
      styles.backgroundColor = bg.color;
    } else if (bg.type === 'gradient' && bg.gradient) {
      const { type, angle, colorStops } = bg.gradient;
      const stops = colorStops?.map(stop => `${stop.color} ${stop.position}%`).join(', ');
      if (type === 'linear' && stops) {
        styles.background = `linear-gradient(${angle}deg, ${stops})`;
      } else if (type === 'radial' && stops) {
        styles.background = `radial-gradient(circle, ${stops})`;
      }
    } else if (bg.type === 'image' && bg.image?.url) {
      const { url, size, position, repeat, attachment } = bg.image;
      styles.backgroundImage = `url(${url})`;
      styles.backgroundSize = size || 'cover';
      styles.backgroundPosition = position || 'center center';
      styles.backgroundRepeat = repeat || 'no-repeat';
      styles.backgroundAttachment = attachment || 'scroll';
    }
  }

  // Padding styles
  if (settings.padding) {
    const padding = settings.padding;
    if (typeof padding === 'object' && padding.top !== undefined) {
      const { top, right, bottom, left, unit = 'px' } = padding;
      styles.paddingTop = `${top}${unit}`;
      styles.paddingRight = `${right}${unit}`;
      styles.paddingBottom = `${bottom}${unit}`;
      styles.paddingLeft = `${left}${unit}`;
    } else if (typeof padding === 'string') {
      styles.padding = padding;
    }
  }

  // Margin styles
  if (settings.margin) {
    const margin = settings.margin;
    if (typeof margin === 'object' && margin.top !== undefined) {
      const { top, right, bottom, left, unit = 'px' } = margin;
      styles.marginTop = `${top}${unit}`;
      styles.marginRight = `${right}${unit}`;
      styles.marginBottom = `${bottom}${unit}`;
      styles.marginLeft = `${left}${unit}`;
    } else if (typeof margin === 'string') {
      styles.margin = margin;
    }
  }

  // Border styles
  if (settings.borderWidth && settings.borderWidth > 0) {
    styles.borderWidth = `${settings.borderWidth}px`;
    styles.borderStyle = 'solid';

    if (settings.borderColor) {
      styles.borderColor = settings.borderColor;
    }
  }

  // Border radius styles
  if (settings.borderRadius) {
    const radius = settings.borderRadius;
    if (typeof radius === 'object' && radius.top !== undefined) {
      const { top, right, bottom, left, unit = 'px' } = radius;
      styles.borderTopLeftRadius = `${top}${unit}`;
      styles.borderTopRightRadius = `${right}${unit}`;
      styles.borderBottomRightRadius = `${bottom}${unit}`;
      styles.borderBottomLeftRadius = `${left}${unit}`;
    } else if (typeof radius === 'string') {
      styles.borderRadius = radius;
    }
  }

  // Custom CSS classes (handled separately)

  // Z-index
  if (settings.zIndex !== undefined && settings.zIndex !== 0) {
    styles.zIndex = settings.zIndex;
  }

  // Box shadow styles
  if (settings.shadowEnabled) {
    const shadowValues = [
      settings.shadowInset ? 'inset' : '',
      `${settings.shadowX || 0}px`,
      `${settings.shadowY || 0}px`,
      `${settings.shadowBlur || 0}px`,
      `${settings.shadowSpread || 0}px`,
      settings.shadowColor || 'rgba(0, 0, 0, 0.1)'
    ].filter(Boolean).join(' ');

    if (shadowValues) {
      styles.boxShadow = shadowValues;
    }
  }

  // Animation styles (CSS classes will handle the actual animations)
  if (settings.animation && settings.animation !== 'none') {
    styles.animation = `${settings.animation} ${settings.animationDuration || 300}ms ease-out ${settings.animationDelay || 0}ms`;
  }

  // Merge with additional styles
  return { ...styles, ...additionalStyles };
};

/**
 * Generate CSS classes for a column based on its settings
 * @param {Object} settings - Column settings object
 * @param {Array} additionalClasses - Additional manual classes
 * @returns {string} Space-separated CSS classes
 */
export const generateColumnCssClasses = (settings = {}, additionalClasses = []) => {
  const classes = ['xgp-column'];

  // Add display type class
  if (settings.display) {
    classes.push(`xgp-display-${settings.display}`);
  }

  // Add flex-specific classes
  if (settings.display === 'flex') {
    if (settings.flexDirection) {
      classes.push(`xgp-flex-direction-${settings.flexDirection}`);
    }

    if (settings.justifyContent) {
      classes.push(`xgp-justify-${settings.justifyContent}`);
    }

    if (settings.alignItems) {
      classes.push(`xgp-align-${settings.alignItems}`);
    }

    if (settings.flexWrap) {
      classes.push(`xgp-flex-wrap-${settings.flexWrap}`);
    }
  }

  // Add animation classes
  if (settings.animation && settings.animation !== 'none') {
    classes.push(`xgp-animate-${settings.animation}`);
  }

  // Add visibility classes for responsive hiding
  if (settings.hideOnDevice) {
    if (settings.hideOnDevice.desktop) {
      classes.push('xgp-hide-desktop');
    }
    if (settings.hideOnDevice.tablet) {
      classes.push('xgp-hide-tablet');
    }
    if (settings.hideOnDevice.mobile) {
      classes.push('xgp-hide-mobile');
    }
  }

  // Add custom classes from user input
  if (settings.customClasses) {
    const customClasses = settings.customClasses
      .split(' ')
      .map(cls => cls.trim())
      .filter(cls => cls.length > 0);
    classes.push(...customClasses);
  }

  // Add additional classes
  classes.push(...additionalClasses);

  // Remove duplicates and empty values
  return [...new Set(classes.filter(Boolean))].join(' ');
};

/**
 * Generate complete style attribute string for HTML
 * @param {Object} settings - Column settings object
 * @param {Object} additionalStyles - Additional manual styles
 * @returns {string} Complete style attribute or empty string
 */
export const generateColumnStyleAttribute = (settings = {}, additionalStyles = {}) => {
  const styles = generateColumnInlineStyles(settings, additionalStyles);
  
  if (Object.keys(styles).length === 0) {
    return '';
  }
  
  const styleString = Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');
    
  return `style="${styleString}"`;
};

/**
 * Generate complete class attribute string for HTML
 * @param {Object} settings - Column settings object
 * @param {Array} additionalClasses - Additional manual classes
 * @returns {string} Complete class attribute
 */
export const generateColumnClassAttribute = (settings = {}, additionalClasses = []) => {
  const cssClasses = generateColumnCssClasses(settings, additionalClasses);
  return `class="${cssClasses}"`;
};

/**
 * Convert camelCase to kebab-case for CSS properties
 * @param {string} str - camelCase string
 * @returns {string} kebab-case string
 */
const camelToKebab = (str) => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Merge column settings with existing style object
 * This is useful for preserving existing styles while adding column-specific ones
 * @param {Object} existingStyles - Existing React style object
 * @param {Object} columnSettings - Column settings
 * @returns {Object} Merged style object
 */
export const mergeColumnStyles = (existingStyles = {}, columnSettings = {}) => {
  const columnStyles = generateColumnInlineStyles(columnSettings);
  return { ...existingStyles, ...columnStyles };
};

/**
 * Check if column has flex display and return flex-specific settings
 * @param {Object} settings - Column settings object
 * @returns {Object} Flex-specific settings object
 */
export const getFlexSettings = (settings = {}) => {
  if (settings.display !== 'flex') {
    return {};
  }
  
  return {
    flexDirection: settings.flexDirection || 'column',
    justifyContent: settings.justifyContent || 'flex-start', 
    alignItems: settings.alignItems || 'stretch',
    flexWrap: settings.flexWrap || 'nowrap',
    gap: settings.gap || '0px'
  };
};

/**
 * Generate CSS output for server-side rendering or CSS file generation
 * @param {string} columnId - Unique column identifier
 * @param {Object} settings - Column settings
 * @returns {string} CSS rules as string
 */
export const generateColumnCSS = (columnId, settings = {}) => {
  const selector = `.xgp-column-${columnId}`;
  const styles = generateColumnInlineStyles(settings);
  
  if (Object.keys(styles).length === 0) {
    return '';
  }
  
  const cssRules = Object.entries(styles)
    .map(([key, value]) => `  ${camelToKebab(key)}: ${value};`)
    .join('\n');
    
  return `${selector} {\n${cssRules}\n}`;
};

/**
 * Generate CSS via PHP backend system
 * @param {string} columnId - Unique column identifier
 * @param {Object} settings - Column settings
 * @returns {Promise<Object>} Generated CSS response
 */
export const generateColumnCSSViaAPI = async (columnId, settings = {}) => {
  try {
    const response = await fetch('/api/page-builder/columns/css/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        columnId,
        settings
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating column CSS via API:', error);
    // Fallback to JavaScript generation
    return {
      success: true,
      css: generateColumnCSS(columnId, settings),
      classes: generateColumnCssClasses(settings),
      selector: `#column-${columnId}`,
      fallback: true
    };
  }
};

/**
 * Generate CSS for multiple columns via PHP backend
 * @param {Array} columns - Array of column objects with columnId and settings
 * @returns {Promise<Object>} Generated CSS response
 */
export const generateMultipleColumnCSSViaAPI = async (columns = []) => {
  try {
    const response = await fetch('/api/page-builder/columns/css/generate-multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        columns
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating multiple column CSS via API:', error);
    // Fallback to JavaScript generation
    const css = columns.map(column => 
      generateColumnCSS(column.columnId, column.settings)
    ).join('\n');
    
    return {
      success: true,
      css,
      columns: columns.length,
      fallback: true
    };
  }
};

/**
 * Preview column settings via PHP backend
 * @param {string} columnId - Unique column identifier
 * @param {Object} settings - Column settings
 * @returns {Promise<Object>} Preview data response
 */
export const previewColumnViaAPI = async (columnId, settings = {}) => {
  try {
    const response = await fetch('/api/page-builder/columns/css/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        columnId,
        settings
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error previewing column via API:', error);
    // Fallback to JavaScript generation
    return {
      success: true,
      preview: {
        css: generateColumnCSS(columnId, settings),
        classes: generateColumnCssClasses(settings),
        selector: `#column-${columnId}`,
        settings
      },
      fallback: true
    };
  }
};

/**
 * Generate CSS and apply it to the document
 * @param {string} columnId - Unique column identifier
 * @param {Object} settings - Column settings
 * @param {boolean} useAPI - Whether to use PHP API or JavaScript fallback
 */
export const applyColumnCSS = async (columnId, settings = {}, useAPI = true) => {
  try {
    let cssData;
    
    if (useAPI) {
      cssData = await generateColumnCSSViaAPI(columnId, settings);
    } else {
      cssData = {
        success: true,
        css: generateColumnCSS(columnId, settings),
        classes: generateColumnCssClasses(settings),
        selector: `#column-${columnId}`
      };
    }

    if (cssData.success && cssData.css) {
      // Find or create style element for this column
      let styleElement = document.getElementById(`column-css-${columnId}`);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = `column-css-${columnId}`;
        document.head.appendChild(styleElement);
      }
      
      // Update the CSS content
      styleElement.textContent = cssData.css;
      
      // Apply classes to the column element
      const columnElement = document.getElementById(`column-${columnId}`);
      if (columnElement && cssData.classes) {
        columnElement.className = cssData.classes;
      }
    }

    return cssData;
  } catch (error) {
    console.error('Error applying column CSS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear cached CSS for a column
 * @param {string} columnId - Column identifier
 */
export const clearColumnCSSCache = async (columnId) => {
  try {
    const response = await fetch('/api/page-builder/columns/css/clear-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        columnId
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error clearing column CSS cache:', error);
    return { success: false, error: error.message };
  }
};
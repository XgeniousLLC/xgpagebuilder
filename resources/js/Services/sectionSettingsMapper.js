/**
 * Section Settings Mapper
 *
 * Transforms section field values from frontend components into the format
 * expected by pageBuilderCSSService for proper CSS generation.
 *
 * Handles the conversion between frontend field formats and CSS service object structures.
 */

class SectionSettingsMapper {
  /**
   * Transform section settings to CSS service compatible format
   */
  transformToCSS(sectionSettings = {}) {
    const transformed = {
      // Transform background settings
      background: this.transformBackground(sectionSettings),

      // Transform spacing settings
      padding: this.transformSpacing(sectionSettings.padding),
      margin: this.transformSpacing(sectionSettings.margin),

      // Transform border settings
      border: this.transformBorder(sectionSettings),

      // Transform typography settings
      typography: this.transformTypography(sectionSettings),

      // Transform dimension settings
      dimensions: this.transformDimensions(sectionSettings),

      // Transform visibility settings
      visibility: this.transformVisibility(sectionSettings),

      // Transform animation settings
      animation: this.transformAnimation(sectionSettings),

      // Transform position settings
      position: this.transformPosition(sectionSettings),

      // Layout-specific settings for sections
      contentWidth: sectionSettings.contentWidth || 'boxed',
      maxWidth: sectionSettings.maxWidth || 1200,
      gap: sectionSettings.gap || '20px',
      gridTemplate: sectionSettings.gridTemplate,
      columnCount: sectionSettings.columnCount || 1,

      // Custom attributes
      attributes: {
        customId: sectionSettings.htmlId || sectionSettings.customId || '',
        cssClasses: sectionSettings.cssClass || sectionSettings.customClasses || '',
        customCSS: sectionSettings.customCSS || '',
        htmlAttributes: sectionSettings.htmlAttributes || ''
      }
    };

    // Remove undefined/null values to keep the object clean
    return this.cleanObject(transformed);
  }

  /**
   * Transform background settings from various frontend formats
   */
  transformBackground(settings) {
    // Handle sectionBackground field from SectionStyleSettings
    if (settings.sectionBackground) {
      return this.normalizeBackground(settings.sectionBackground);
    }

    // Handle legacy background fields
    if (settings.backgroundColor) {
      return {
        type: 'color',
        color: settings.backgroundColor
      };
    }

    // Handle background group
    if (settings.background) {
      return this.normalizeBackground(settings.background);
    }

    return {
      type: 'none',
      color: '#ffffff'
    };
  }

  /**
   * Normalize background object to consistent format
   */
  normalizeBackground(background) {
    if (!background || typeof background !== 'object') {
      return { type: 'none', color: '#ffffff' };
    }

    const normalized = {
      type: background.type || 'none',
      color: background.color || '#ffffff'
    };

    if (background.gradient) {
      normalized.gradient = {
        type: background.gradient.type || 'linear',
        angle: background.gradient.angle || 135,
        colorStops: background.gradient.colorStops || [
          { color: '#667EEA', position: 0 },
          { color: '#764BA2', position: 100 }
        ]
      };
    }

    if (background.image) {
      normalized.image = {
        url: background.image.url || '',
        size: background.image.size || 'cover',
        position: background.image.position || 'center center',
        repeat: background.image.repeat || 'no-repeat',
        attachment: background.image.attachment || 'scroll'
      };
    }

    if (background.hover) {
      normalized.hover = {
        color: background.hover.color || ''
      };
    }

    return normalized;
  }

  /**
   * Transform spacing values from various formats
   */
  transformSpacing(spacing) {
    if (!spacing) return null;

    // Handle string format like "20px 20px 20px 20px"
    if (typeof spacing === 'string') {
      const parts = spacing.split(' ').map(v => v.trim());
      if (parts.length === 4) {
        return {
          top: parseInt(parts[0]) || 0,
          right: parseInt(parts[1]) || 0,
          bottom: parseInt(parts[2]) || 0,
          left: parseInt(parts[3]) || 0,
          unit: this.extractUnit(parts[0]) || 'px'
        };
      }
      return spacing;
    }

    // Handle object format
    if (typeof spacing === 'object') {
      // Handle responsive spacing object
      if (spacing.desktop || spacing.tablet || spacing.mobile) {
        return spacing;
      }

      // Handle dimension object format
      if (spacing.top !== undefined) {
        return {
          top: spacing.top || 0,
          right: spacing.right || 0,
          bottom: spacing.bottom || 0,
          left: spacing.left || 0,
          unit: spacing.unit || 'px'
        };
      }
    }

    return spacing;
  }

  /**
   * Transform border settings
   */
  transformBorder(settings) {
    const border = {
      width: { top: 0, right: 0, bottom: 0, left: 0 },
      style: 'solid',
      color: '#e2e8f0',
      radius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, unit: 'px' }
    };

    // Handle border width
    if (settings.borderWidth) {
      if (typeof settings.borderWidth === 'number') {
        border.width = {
          top: settings.borderWidth,
          right: settings.borderWidth,
          bottom: settings.borderWidth,
          left: settings.borderWidth
        };
      } else if (typeof settings.borderWidth === 'object') {
        border.width = { ...border.width, ...settings.borderWidth };
      }
    }

    // Handle border style
    if (settings.borderStyle) {
      border.style = settings.borderStyle;
    }

    // Handle border color
    if (settings.borderColor) {
      border.color = settings.borderColor;
    }

    // Handle border radius
    if (settings.borderRadius) {
      if (typeof settings.borderRadius === 'string') {
        const value = parseInt(settings.borderRadius) || 0;
        border.radius = {
          topLeft: value,
          topRight: value,
          bottomLeft: value,
          bottomRight: value,
          unit: this.extractUnit(settings.borderRadius) || 'px'
        };
      } else if (typeof settings.borderRadius === 'object') {
        border.radius = { ...border.radius, ...settings.borderRadius };
      }
    }

    return border;
  }

  /**
   * Transform typography settings
   */
  transformTypography(settings) {
    if (!settings.fontSize && !settings.fontWeight && !settings.textColor && !settings.textAlign) {
      return null;
    }

    return {
      fontSize: settings.fontSize || '16px',
      fontWeight: settings.fontWeight || '400',
      fontFamily: settings.fontFamily || 'inherit',
      lineHeight: settings.lineHeight || '1.5',
      letterSpacing: settings.letterSpacing || '0',
      textTransform: settings.textTransform || 'none',
      textDecoration: settings.textDecoration || 'none',
      color: settings.textColor || '#333333',
      textAlign: settings.textAlign || 'left'
    };
  }

  /**
   * Transform dimension settings
   */
  transformDimensions(settings) {
    const dimensions = {};

    if (settings.width) dimensions.width = settings.width;
    if (settings.height) dimensions.height = settings.height;
    if (settings.minWidth) dimensions.minWidth = settings.minWidth;
    if (settings.maxWidth && !settings.contentWidth) dimensions.maxWidth = settings.maxWidth;
    if (settings.minHeight) dimensions.minHeight = settings.minHeight;
    if (settings.maxHeight) dimensions.maxHeight = settings.maxHeight;

    return Object.keys(dimensions).length > 0 ? dimensions : null;
  }

  /**
   * Transform visibility settings
   */
  transformVisibility(settings) {
    return {
      hideOnDesktop: settings.hideOnDesktop || false,
      hideOnTablet: settings.hideOnTablet || false,
      hideOnMobile: settings.hideOnMobile || false,
      conditionalVisibility: {
        enabled: false,
        conditions: []
      }
    };
  }

  /**
   * Transform animation settings
   */
  transformAnimation(settings) {
    const animation = {
      entrance: {
        type: settings.animation || 'none',
        duration: settings.animationDuration || 500,
        delay: settings.animationDelay || 0,
        easing: settings.animationEasing || 'ease-out'
      },
      hover: {
        enabled: false,
        type: 'none',
        duration: 300
      },
      scroll: {
        enabled: false,
        type: 'parallax',
        speed: 0.5
      }
    };

    return animation;
  }

  /**
   * Transform position settings
   */
  transformPosition(settings) {
    return {
      type: settings.position || 'static',
      zIndex: settings.zIndex || 'auto',
      sticky: {
        enabled: false,
        offset: '0px',
        position: 'top'
      }
    };
  }

  /**
   * Transform responsive settings
   */
  transformResponsive(sectionSettings, responsiveSettings = {}) {
    const responsive = {
      desktop: {},
      tablet: {},
      mobile: {}
    };

    // Transform each breakpoint if it exists
    if (responsiveSettings.desktop) {
      responsive.desktop = this.transformToCSS(responsiveSettings.desktop);
    }
    if (responsiveSettings.tablet) {
      responsive.tablet = this.transformToCSS(responsiveSettings.tablet);
    }
    if (responsiveSettings.mobile) {
      responsive.mobile = this.transformToCSS(responsiveSettings.mobile);
    }

    // Handle visibility settings in responsive
    responsive.visibility = this.transformVisibility(sectionSettings);
    if (sectionSettings.hideOnDesktop) responsive.hideOnDesktop = true;
    if (sectionSettings.hideOnTablet) responsive.hideOnTablet = true;
    if (sectionSettings.hideOnMobile) responsive.hideOnMobile = true;

    return responsive;
  }

  /**
   * Extract unit from a CSS value string
   */
  extractUnit(value) {
    if (typeof value !== 'string') return 'px';
    const match = value.match(/[a-zA-Z%]+$/);
    return match ? match[0] : 'px';
  }

  /**
   * Remove null, undefined, and empty values from an object
   */
  cleanObject(obj) {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.filter(item => item !== null && item !== undefined);
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedValue = this.cleanObject(value);
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else if (value !== '' || key === 'color' || key === 'background') {
          // Keep empty strings for color values and background
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  /**
   * Get default section settings structure
   */
  getDefaultSettings() {
    return {
      // General settings
      contentWidth: 'boxed',
      maxWidth: 1200,
      columnCount: 1,
      gap: '20px',
      gridTemplate: null,

      // Style settings
      padding: '40px 20px 40px 20px',
      margin: '0px 0px 0px 0px',
      sectionBackground: {
        type: 'none',
        color: '#ffffff'
      },

      // Advanced settings
      htmlId: `section-${Date.now()}`,
      cssClass: '',
      customCSS: '',
      animation: 'none',
      animationDuration: 500,
      hideOnDesktop: false,
      hideOnTablet: false,
      hideOnMobile: false
    };
  }

  /**
   * Merge user settings with defaults
   */
  mergeWithDefaults(userSettings = {}) {
    const defaults = this.getDefaultSettings();
    return { ...defaults, ...userSettings };
  }
}

// Create and export singleton instance
const sectionSettingsMapper = new SectionSettingsMapper();
export default sectionSettingsMapper;
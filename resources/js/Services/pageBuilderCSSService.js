/**
 * Page Builder CSS Generation Service
 *
 * Handles dynamic CSS generation for sections, columns, and widgets
 * with wrapper class management and responsive support
 */

class PageBuilderCSSService {
  constructor() {
    this.injectedStyles = new Map();
    this.styleSheet = null;
    this.init();
  }

  /**
   * Initialize the CSS service
   */
  init() {
    // Create or get the dedicated stylesheet for page builder
    let sheet = document.getElementById('page-builder-dynamic-styles');
    if (!sheet) {
      sheet = document.createElement('style');
      sheet.id = 'page-builder-dynamic-styles';
      sheet.type = 'text/css';
      document.head.appendChild(sheet);
    }
    this.styleSheet = sheet;
  }

  /**
   * Ensure wrapper class exists on element and return class names
   */
  ensureWrapperClass(element, type, id, layoutMode = null) {
    if (!element) return null;

    const baseClass = `pb-${type}-${id}`;
    const layoutClass = layoutMode ? `${type}-layout-${layoutMode}` : null;

    // Add base wrapper class if not present
    if (!element.classList.contains(baseClass)) {
      element.classList.add(baseClass);
    }

    // Handle layout classes for sections
    if (type === 'section' && layoutClass) {
      // Remove existing layout classes
      const existingLayoutClasses = Array.from(element.classList).filter(
        cls => cls.startsWith('section-layout-')
      );
      existingLayoutClasses.forEach(cls => element.classList.remove(cls));

      // Add new layout class
      element.classList.add(layoutClass);
    }

    return { baseClass, layoutClass };
  }

  /**
   * Generate CSS for a component with its settings
   */
  generateComponentCSS(type, id, settings = {}, responsiveSettings = {}) {
    const baseSelector = `.pb-${type}-${id}`;
    const css = [];

    // Generate base styles
    const baseStyles = this.generateBaseStyles(baseSelector, settings);
    if (baseStyles) css.push(baseStyles);

    // Generate layout-specific styles for sections
    if (type === 'section' && settings.contentWidth) {
      const layoutStyles = this.generateSectionLayoutCSS(settings.contentWidth, settings.maxWidth);
      if (layoutStyles) css.push(layoutStyles);
    }

    // Generate responsive styles
    const responsiveStyles = this.generateResponsiveStyles(baseSelector, responsiveSettings);
    if (responsiveStyles) css.push(responsiveStyles);

    return css.join('\n');
  }

  /**
   * Generate base component styles
   */
  generateBaseStyles(selector, settings) {
    const styles = [];

    // Background styles - handle multiple background format sources
    if (settings.background) {
      const bgStyles = this.generateBackgroundCSS(settings.background);
      if (bgStyles) styles.push(bgStyles);
    }
    // Handle sectionBackground from section settings (direct field name)
    if (settings.sectionBackground) {
      const bgStyles = this.generateBackgroundCSS(settings.sectionBackground);
      if (bgStyles) styles.push(bgStyles);
    }
    // Handle widget_background from default style fields
    if (settings.widget_background) {
      const bgStyles = this.generateBackgroundCSS(settings.widget_background);
      if (bgStyles) styles.push(bgStyles);
    }

    // Spacing styles - handle both old and new format with enhanced support
    if (settings.padding) {
      const paddingCSS = this.normalizeSpacing(settings.padding);
      if (paddingCSS) styles.push(`padding: ${paddingCSS};`);
    }
    if (settings.margin) {
      const marginCSS = this.normalizeSpacing(settings.margin);
      if (marginCSS) styles.push(`margin: ${marginCSS};`);
    }

    // Border styles - handle both old and new format, including borderShadow group
    if (settings.borderShadow) {
      // Handle borderShadow group from section settings
      if (settings.borderShadow.border) {
        const borderStyles = this.generateBorderCSS(settings.borderShadow.border);
        if (borderStyles) styles.push(borderStyles);
      }
      if (settings.borderShadow.shadow) {
        const shadowStyles = this.generateShadowCSS(settings.borderShadow.shadow);
        if (shadowStyles) styles.push(shadowStyles);
      }
    } else if (settings.border) {
      const borderStyles = this.generateBorderCSS(settings.border);
      if (borderStyles) styles.push(borderStyles);
    } else {
      // Legacy border support
      if (settings.borderWidth && settings.borderWidth > 0) {
        styles.push(`border-width: ${settings.borderWidth}px;`);
        styles.push(`border-style: ${settings.borderStyle || 'solid'};`);
        if (settings.borderColor) {
          styles.push(`border-color: ${settings.borderColor};`);
        }
      }
      if (settings.borderRadius) {
        styles.push(`border-radius: ${settings.borderRadius};`);
      }
    }

    // Shadow styles
    if (settings.shadow && settings.shadow.enabled) {
      const shadowStyles = this.generateShadowCSS(settings.shadow);
      if (shadowStyles) styles.push(shadowStyles);
    }

    // Typography styles - handle both old and new format, including sectionTypography
    if (settings.sectionTypography) {
      // Handle sectionTypography from section settings
      const typographyStyles = this.generateTypographyCSS(settings.sectionTypography);
      if (typographyStyles) styles.push(typographyStyles);
    } else if (settings.typography) {
      const typographyStyles = this.generateTypographyCSS(settings.typography);
      if (typographyStyles) styles.push(typographyStyles);
    } else {
      // Legacy typography support
      if (settings.fontSize) styles.push(`font-size: ${settings.fontSize};`);
      if (settings.fontWeight) styles.push(`font-weight: ${settings.fontWeight};`);
      if (settings.textColor) styles.push(`color: ${settings.textColor};`);
      if (settings.textAlign) styles.push(`text-align: ${settings.textAlign};`);
      if (settings.lineHeight) styles.push(`line-height: ${settings.lineHeight};`);
    }

    // Color styles
    if (settings.colors) {
      if (settings.colors.text) styles.push(`color: ${settings.colors.text};`);
    }

    // Dimension styles - handle both old and new format
    if (settings.dimensions) {
      const dimensionStyles = this.generateDimensionCSS(settings.dimensions, settings.contentWidth);
      if (dimensionStyles) styles.push(dimensionStyles);
    } else {
      // Legacy dimension support
      if (settings.width) styles.push(`width: ${settings.width};`);
      if (settings.height) styles.push(`height: ${settings.height};`);
      if (settings.minWidth) styles.push(`min-width: ${settings.minWidth};`);
      if (settings.maxWidth && !settings.contentWidth) {
        styles.push(`max-width: ${settings.maxWidth}px;`);
      }
    }

    // Visibility styles - handle both old and new format
    if (settings.visibility) {
      // New format handled in responsive styles
    } else {
      // Legacy visibility support
      if (settings.display === false) styles.push(`display: none;`);
    }

    // Position and z-index
    if (settings.position) {
      if (settings.position.zIndex !== 'auto') {
        styles.push(`z-index: ${settings.position.zIndex};`);
      }
      if (settings.position.type !== 'static') {
        styles.push(`position: ${settings.position.type};`);
      }
    } else if (settings.zIndex) {
      styles.push(`z-index: ${settings.zIndex};`);
    }

    // Animation styles - handle both old and new format
    if (settings.animation) {
      if (settings.animation.entrance && settings.animation.entrance.type !== 'none') {
        const animationCSS = this.generateAnimationCSS(
          settings.animation.entrance.type,
          settings.animation.entrance.duration,
          settings.animation.entrance.delay
        );
        if (animationCSS) styles.push(animationCSS);
      }
    } else {
      // Legacy animation support
      if (settings.animation && settings.animation !== 'none') {
        styles.push(this.generateAnimationCSS(settings.animation, settings.animationDuration, settings.animationDelay));
      }
    }

    if (styles.length === 0) return '';

    return `${selector} {\n  ${styles.join('\n  ')}\n}`;
  }

  /**
   * Generate border CSS from settings
   */
  generateBorderCSS(border) {
    const styles = [];

    if (border.width) {
      const { top, right, bottom, left } = border.width;
      if (top || right || bottom || left) {
        styles.push(`border-width: ${top}px ${right}px ${bottom}px ${left}px;`);
        styles.push(`border-style: ${border.style || 'solid'};`);
        styles.push(`border-color: ${border.color || '#e2e8f0'};`);
      }
    }

    if (border.radius) {
      const { topLeft, topRight, bottomLeft, bottomRight, unit } = border.radius;
      if (topLeft || topRight || bottomLeft || bottomRight) {
        styles.push(`border-radius: ${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit};`);
      }
    }

    return styles.join(' ');
  }

  /**
   * Generate shadow CSS from settings
   */
  generateShadowCSS(shadow) {
    if (!shadow.enabled) return '';

    const { horizontal, vertical, blur, spread, color, inset } = shadow;
    const insetPrefix = inset ? 'inset ' : '';
    return `box-shadow: ${insetPrefix}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
  }

  /**
   * Generate typography CSS from settings
   */
  generateTypographyCSS(typography) {
    const styles = [];

    if (typography.fontSize) styles.push(`font-size: ${typography.fontSize};`);
    if (typography.fontWeight) styles.push(`font-weight: ${typography.fontWeight};`);
    if (typography.fontFamily && typography.fontFamily !== 'inherit') {
      styles.push(`font-family: ${typography.fontFamily};`);
    }
    if (typography.lineHeight) styles.push(`line-height: ${typography.lineHeight};`);
    if (typography.letterSpacing && typography.letterSpacing !== '0') {
      styles.push(`letter-spacing: ${typography.letterSpacing};`);
    }
    if (typography.textTransform && typography.textTransform !== 'none') {
      styles.push(`text-transform: ${typography.textTransform};`);
    }
    if (typography.textDecoration && typography.textDecoration !== 'none') {
      styles.push(`text-decoration: ${typography.textDecoration};`);
    }
    if (typography.color) styles.push(`color: ${typography.color};`);
    if (typography.textAlign && typography.textAlign !== 'left') {
      styles.push(`text-align: ${typography.textAlign};`);
    }

    return styles.join(' ');
  }

  /**
   * Generate dimension CSS from settings
   */
  generateDimensionCSS(dimensions, contentWidth = null) {
    const styles = [];

    if (dimensions.width && dimensions.width !== 'auto') {
      styles.push(`width: ${dimensions.width};`);
    }
    if (dimensions.height && dimensions.height !== 'auto') {
      styles.push(`height: ${dimensions.height};`);
    }
    if (dimensions.minWidth && dimensions.minWidth !== 'auto') {
      styles.push(`min-width: ${dimensions.minWidth};`);
    }
    if (dimensions.maxWidth && dimensions.maxWidth !== 'none' && !contentWidth) {
      styles.push(`max-width: ${dimensions.maxWidth};`);
    }
    if (dimensions.minHeight && dimensions.minHeight !== 'auto') {
      styles.push(`min-height: ${dimensions.minHeight};`);
    }
    if (dimensions.maxHeight && dimensions.maxHeight !== 'none') {
      styles.push(`max-height: ${dimensions.maxHeight};`);
    }

    return styles.join(' ');
  }

  /**
   * Generate section layout CSS for different layout modes
   * Detects editor mode and applies constrained styles for better UX
   */
  generateSectionLayoutCSS(layoutMode, maxWidth = 1200) {
    const css = [];
    const isEditorMode = document.querySelector('.page-builder-editor') !== null;

    switch (layoutMode) {
      case 'boxed':
        css.push(`
.section-layout-boxed {
  max-width: ${maxWidth}px;
  margin: 0 auto;
  padding-left: 15px;
  padding-right: 15px;
}
        `);
        break;

      case 'full_width_contained':
        if (isEditorMode) {
          // Editor mode: constrain to editor viewport
          css.push(`
.page-builder-editor .section-layout-full_width_contained {
  width: 100%;
  position: relative;
  left: auto;
  right: auto;
  margin-left: 0;
  margin-right: 0;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 4px;
}

.page-builder-editor .section-layout-full_width_contained::before {
  content: "Full Width Contained (Editor View)";
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 3px;
  z-index: 10;
}

.page-builder-editor .section-layout-full_width_contained .section-inner {
  max-width: ${maxWidth}px;
  margin: 0 auto;
  padding: 15px;
}
          `);
        }

        // Frontend mode: full viewport width
        css.push(`
.section-layout-full_width_contained {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.section-layout-full_width_contained .section-inner {
  max-width: ${maxWidth}px;
  margin: 0 auto;
  padding-left: 15px;
  padding-right: 15px;
}
        `);
        break;

      case 'full_width':
        if (isEditorMode) {
          // Editor mode: constrain to editor viewport
          css.push(`
.page-builder-editor .section-layout-full_width {
  width: 100%;
  position: relative;
  left: auto;
  right: auto;
  margin-left: 0;
  margin-right: 0;
  background-color: #fef3c7;
  border: 2px dashed #f59e0b;
  border-radius: 4px;
}

.page-builder-editor .section-layout-full_width::before {
  content: "Full Width (Editor View)";
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 11px;
  color: #92400e;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 3px;
  z-index: 10;
}

.page-builder-editor .section-layout-full_width .section-inner {
  width: 100%;
  max-width: none;
  padding: 15px;
}
          `);
        }

        // Frontend mode: full viewport width
        css.push(`
.section-layout-full_width {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.section-layout-full_width .section-inner {
  width: 100%;
  max-width: none;
  padding-left: 15px;
  padding-right: 15px;
}
        `);
        break;
    }

    return css.join('\n');
  }

  /**
   * Generate responsive styles
   */
  generateResponsiveStyles(selector, responsiveSettings) {
    if (!responsiveSettings || Object.keys(responsiveSettings).length === 0) {
      return '';
    }

    const css = [];

    // Tablet styles
    if (responsiveSettings.tablet && Object.keys(responsiveSettings.tablet).length > 0) {
      const tabletStyles = this.generateBaseStyles(selector, responsiveSettings.tablet);
      if (tabletStyles) {
        css.push(`@media (max-width: 1024px) {\n${tabletStyles}\n}`);
      }
    }

    // Mobile styles
    if (responsiveSettings.mobile && Object.keys(responsiveSettings.mobile).length > 0) {
      const mobileStyles = this.generateBaseStyles(selector, responsiveSettings.mobile);
      if (mobileStyles) {
        css.push(`@media (max-width: 768px) {\n${mobileStyles}\n}`);
      }
    }

    // Device-specific visibility - check both new and legacy formats
    const visibility = responsiveSettings.visibility || {};

    if (visibility.hideOnDesktop || responsiveSettings.hideOnDesktop) {
      css.push(`@media (min-width: 1025px) {\n${selector} { display: none !important; }\n}`);
    }
    if (visibility.hideOnTablet || responsiveSettings.hideOnTablet) {
      css.push(`@media (min-width: 769px) and (max-width: 1024px) {\n${selector} { display: none !important; }\n}`);
    }
    if (visibility.hideOnMobile || responsiveSettings.hideOnMobile) {
      css.push(`@media (max-width: 768px) {\n${selector} { display: none !important; }\n}`);
    }

    return css.join('\n');
  }

  /**
   * Generate background CSS
   */
  generateBackgroundCSS(background) {
    const styles = [];

    switch (background.type) {
      case 'color':
        if (background.color) {
          styles.push(`background-color: ${background.color};`);
        }
        break;

      case 'gradient':
        if (background.gradient) {
          const { type, angle, colorStops } = background.gradient;
          const stopsCSS = colorStops.map(stop =>
            `${stop.color} ${stop.position}%`
          ).join(', ');

          if (type === 'linear') {
            styles.push(`background: linear-gradient(${angle}deg, ${stopsCSS});`);
          } else if (type === 'radial') {
            styles.push(`background: radial-gradient(circle, ${stopsCSS});`);
          }
        }
        break;

      case 'image':
        if (background.image && background.image.url) {
          styles.push(`background-image: url('${background.image.url}');`);
          styles.push(`background-size: ${background.image.size || 'cover'};`);
          styles.push(`background-repeat: ${background.image.repeat || 'no-repeat'};`);
          styles.push(`background-position: ${background.image.position || 'center center'};`);
          if (background.image.attachment) {
            styles.push(`background-attachment: ${background.image.attachment};`);
          }
        }
        break;
    }

    return styles.join(' ');
  }

  /**
   * Generate animation CSS
   */
  generateAnimationCSS(animationType, duration = 500, delay = 0) {
    const animations = {
      'fade-in': 'fadeIn',
      'slide-up': 'slideInUp',
      'slide-down': 'slideInDown',
      'slide-left': 'slideInLeft',
      'slide-right': 'slideInRight',
      'zoom-in': 'zoomIn',
      'bounce': 'bounceIn'
    };

    const animationName = animations[animationType];
    if (!animationName) return '';

    return `animation: ${animationName} ${duration}ms ease-out ${delay}ms both;`;
  }

  /**
   * Normalize spacing value (handle different formats)
   */
  normalizeSpacing(spacing) {
    if (typeof spacing === 'string') {
      return spacing;
    }

    if (typeof spacing === 'object') {
      // Handle responsive spacing object
      if (spacing.desktop) {
        return spacing.desktop;
      }

      // Handle new spacing format with unit
      if (spacing.top !== undefined) {
        const { top, right, bottom, left, unit = 'px' } = spacing;
        return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
      }

      // Handle old dimension object format
      if (spacing.top !== undefined && spacing.unit === undefined) {
        const { top, right, bottom, left } = spacing;
        return `${top}px ${right}px ${bottom}px ${left}px`;
      }
    }

    return spacing || '0';
  }

  /**
   * Inject CSS into the stylesheet
   */
  injectCSS(id, css) {
    if (!css || css.trim() === '') return;

    // Store the CSS
    this.injectedStyles.set(id, css);

    // Rebuild the complete stylesheet
    this.rebuildStylesheet();
  }

  /**
   * Remove CSS by ID
   */
  removeCSS(id) {
    this.injectedStyles.delete(id);
    this.rebuildStylesheet();
  }

  /**
   * Rebuild the complete stylesheet
   */
  rebuildStylesheet() {
    const allCSS = Array.from(this.injectedStyles.values()).join('\n\n');
    if (this.styleSheet) {
      this.styleSheet.textContent = allCSS;
    }
  }

  /**
   * Apply settings to an element with dynamic CSS generation
   */
  applySettings(element, type, id, settings, responsiveSettings = {}) {
    if (!element) return;

    // Ensure wrapper classes
    const classInfo = this.ensureWrapperClass(element, type, id, settings.contentWidth);

    // Generate and inject CSS
    const css = this.generateComponentCSS(type, id, settings, responsiveSettings);
    if (css) {
      this.injectCSS(`${classInfo.baseClass}-styles`, css);
    }

    return classInfo;
  }

  /**
   * Clear all injected styles
   */
  clearAll() {
    this.injectedStyles.clear();
    if (this.styleSheet) {
      this.styleSheet.textContent = '';
    }
  }

  /**
   * Get default settings structure for a component type
   */
  getDefaultSettings(type) {
    const baseStyleSettings = {
      // Background settings
      background: {
        type: 'none',
        color: '#ffffff',
        gradient: {
          type: 'linear',
          angle: 45,
          colorStops: [
            { color: '#ffffff', position: 0 },
            { color: '#f0f0f0', position: 100 }
          ]
        },
        image: {
          url: '',
          size: 'cover',
          repeat: 'no-repeat',
          position: 'center center',
          attachment: 'scroll'
        }
      },

      // Spacing settings
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        unit: 'px'
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        unit: 'px'
      },

      // Border settings
      border: {
        width: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        style: 'solid',
        color: '#e2e8f0',
        radius: {
          topLeft: 0,
          topRight: 0,
          bottomLeft: 0,
          bottomRight: 0,
          unit: 'px'
        }
      },

      // Shadow settings
      shadow: {
        enabled: false,
        type: 'drop',
        horizontal: 0,
        vertical: 4,
        blur: 6,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.1)',
        inset: false
      },

      // Typography settings (for applicable components)
      typography: {
        fontSize: '16px',
        fontWeight: '400',
        fontFamily: 'inherit',
        lineHeight: '1.5',
        letterSpacing: '0',
        textTransform: 'none',
        textDecoration: 'none'
      },

      // Color settings
      colors: {
        text: '#333333',
        link: '#3b82f6',
        linkHover: '#1d4ed8'
      },

      // Dimension settings
      dimensions: {
        width: 'auto',
        height: 'auto',
        minWidth: 'auto',
        maxWidth: 'none',
        minHeight: 'auto',
        maxHeight: 'none'
      }
    };

    const baseAdvancedSettings = {
      // Visibility settings
      visibility: {
        hideOnDesktop: false,
        hideOnTablet: false,
        hideOnMobile: false,
        conditionalVisibility: {
          enabled: false,
          conditions: []
        }
      },

      // Custom attributes
      attributes: {
        customId: '',
        cssClasses: '',
        customCSS: '',
        htmlAttributes: ''
      },

      // Position and z-index
      position: {
        type: 'static',
        zIndex: 'auto',
        sticky: {
          enabled: false,
          offset: '0px',
          position: 'top'
        }
      },

      // Animation settings
      animation: {
        entrance: {
          type: 'none',
          duration: 500,
          delay: 0,
          easing: 'ease-out'
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
      },

      // SEO and accessibility
      seo: {
        schema: {
          enabled: false,
          type: '',
          properties: {}
        },
        accessibility: {
          ariaLabel: '',
          ariaDescribedby: '',
          role: '',
          tabIndex: ''
        }
      },

      // Performance settings
      performance: {
        lazyLoad: false,
        preload: false,
        optimizeImages: true,
        cacheSettings: {
          enabled: false,
          duration: 3600
        }
      }
    };

    // Add type-specific defaults
    switch (type) {
      case 'section':
        return {
          // General/layout settings
          contentWidth: 'boxed',
          maxWidth: 1200,
          columnCount: 1,
          gridTemplate: null,
          gap: '20px',

          // Style defaults
          ...baseStyleSettings,
          padding: {
            top: 40,
            right: 20,
            bottom: 40,
            left: 20,
            unit: 'px'
          },

          // Advanced defaults
          ...baseAdvancedSettings,
          attributes: {
            ...baseAdvancedSettings.attributes,
            customId: `section-${Date.now()}`
          }
        };

      case 'column':
        return {
          // General/layout settings
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          flexWrap: 'nowrap',
          gap: '10px',

          // Style defaults
          ...baseStyleSettings,
          padding: {
            top: 15,
            right: 15,
            bottom: 15,
            left: 15,
            unit: 'px'
          },

          // Advanced defaults
          ...baseAdvancedSettings,
          attributes: {
            ...baseAdvancedSettings.attributes,
            customId: `column-${Date.now()}`
          }
        };

      case 'widget':
        return {
          // Style defaults
          ...baseStyleSettings,
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
            unit: 'px'
          },
          typography: {
            ...baseStyleSettings.typography,
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.6'
          },

          // Advanced defaults
          ...baseAdvancedSettings,
          attributes: {
            ...baseAdvancedSettings.attributes,
            customId: `widget-${Date.now()}`
          }
        };

      default:
        return {
          ...baseStyleSettings,
          ...baseAdvancedSettings
        };
    }
  }

  /**
   * Get responsive default settings
   */
  getResponsiveDefaults() {
    return {
      desktop: {},
      tablet: {},
      mobile: {}
    };
  }
}

// Create and export singleton instance
const pageBuilderCSSService = new PageBuilderCSSService();
export default pageBuilderCSSService;
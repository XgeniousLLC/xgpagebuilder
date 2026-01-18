/**
 * Widget Service - API client for PHP-based widgets
 * 
 * This service handles all API calls to the PHP widget system,
 * providing a clean interface for the React components.
 */

class WidgetService {
  constructor() {
    this.baseUrl = '/api/page-builder';
  }

  /**
   * Get all widgets for the sidebar
   */
  async getAllWidgets() {
    try {
      const response = await fetch(`${this.baseUrl}/widgets`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching widgets:', error);
      return [];
    }
  }

  /**
   * Get widgets grouped by category
   */
  async getWidgetsGrouped() {
    try {
      const response = await fetch(`${this.baseUrl}/widgets/grouped`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : {};
    } catch (error) {
      console.error('Error fetching grouped widgets:', error);
      return {};
    }
  }

  /**
   * Get widget categories with counts
   */
  async getCategories() {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Search widgets
   */
  async searchWidgets(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/widgets/search?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error searching widgets:', error);
      return [];
    }
  }

  /**
   * Get specific widget configuration
   */
  async getWidget(type) {
    try {
      const response = await fetch(`${this.baseUrl}/widgets/${type}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching widget:', error);
      return null;
    }
  }

  /**
   * Get widget fields by tab
   */
  async getWidgetFields(type, tab) {
    try {
      const url = `${this.baseUrl}/widgets/${type}/fields/${tab}`;
      console.log(`[DEBUG] widgetService.getWidgetFields: Making request to ${url}`);

      const response = await fetch(url);

      console.log(`[DEBUG] widgetService.getWidgetFields: Response status: ${response.status}`);

      if (!response.ok) {
        console.log(`[DEBUG] widgetService.getWidgetFields: HTTP error details:`, {
          status: response.status,
          statusText: response.statusText,
          url: url
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[DEBUG] widgetService.getWidgetFields: Response data:`, data);

      return data.success ? data.data : null;
    } catch (error) {
      console.error(`[DEBUG] widgetService.getWidgetFields: Error fetching widget fields for ${type}/${tab}:`, error);
      return null;
    }
  }

  /**
   * Get widget settings with field definitions and saved values merged (NEW UNIFIED API)
   * This replaces the separate getWidgetFields + data mapping approach
   *
   * @param {number} pageId - The page ID
   * @param {string} widgetId - The widget ID
   * @param {string} tab - The settings tab (general, style, advanced)
   * @returns {Promise<Object|null>} Pre-populated fields ready for rendering
   */
  async getWidgetSettings(pageId, widgetId, tab, type = null) {
    try {
      let url = `/api/page-builder/pages/${pageId}/widgets/${widgetId}/settings/${tab}`;

      // Append widget_type if provided (for new widgets that aren't in DB yet)
      if (type) {
        url += `?widget_type=${encodeURIComponent(type)}`;
      }

      console.log(`[DEBUG] widgetService.getWidgetSettings: Making request to ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log(`[DEBUG] widgetService.getWidgetSettings: Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[DEBUG] widgetService.getWidgetSettings: HTTP error details:`, {
          status: response.status,
          statusText: response.statusText,
          url: url
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[DEBUG] widgetService.getWidgetSettings: Response data:`, data);

      return data.success ? data.data : null;
    } catch (error) {
      console.error(`[DEBUG] widgetService.getWidgetSettings: Error fetching settings for ${widgetId}/${tab}:`, error);
      return null;
    }
  }

  /**
   * Render widget preview
   */
  async renderWidget(type, settings) {
    try {
      // Enhanced debugging for all widgets
      console.log(`[DEBUG] widgetService.renderWidget called for ${type}:`, {
        type: type,
        settings: settings,
        url: `${this.baseUrl}/widgets/${type}/preview`,
        csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      });

      const response = await fetch(`${this.baseUrl}/widgets/${type}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        console.log(`[DEBUG] ${type} widget HTTP error:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: `${this.baseUrl}/widgets/${type}/preview`
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Enhanced debugging for all widgets
      console.log(`[DEBUG] ${type} widget API response:`, data);

      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error rendering ${type} widget:`, error);
      console.log(`[DEBUG] ${type} widget error details:`, {
        error: error,
        type: type,
        settings: settings
      });
      return null;
    }
  }

  /**
   * Get popular widgets
   */
  async getPopularWidgets(limit = 6) {
    try {
      const response = await fetch(`${this.baseUrl}/widgets/popular?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching popular widgets:', error);
      return [];
    }
  }

  /**
   * Get recent widgets
   */
  async getRecentWidgets(limit = 6) {
    try {
      const response = await fetch(`${this.baseUrl}/widgets/recent?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching recent widgets:', error);
      return [];
    }
  }

  /**
   * Get widget statistics
   */
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : {};
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }

  /**
   * Get widget default values from field definitions
   */
  async getWidgetDefaults(type) {
    try {
      const [generalFields, styleFields, advancedFields] = await Promise.all([
        this.getWidgetFields(type, 'general'),
        this.getWidgetFields(type, 'style'),
        this.getWidgetFields(type, 'advanced')
      ]);

      const extractDefaults = (fieldsData) => {
        const defaults = {};
        if (fieldsData && fieldsData.fields && typeof fieldsData.fields === 'object') {
          // Preserve the nested group structure that PHP widgets expect
          Object.entries(fieldsData.fields).forEach(([groupKey, groupData]) => {
            if (groupData && groupData.fields && typeof groupData.fields === 'object') {
              defaults[groupKey] = {};
              Object.entries(groupData.fields).forEach(([fieldKey, fieldConfig]) => {
                if (fieldConfig && fieldConfig.default !== undefined) {
                  defaults[groupKey][fieldKey] = fieldConfig.default;
                }
              });
            }
          });
        }
        return defaults;
      };

      return {
        general: extractDefaults(generalFields),
        style: extractDefaults(styleFields),
        advanced: extractDefaults(advancedFields)
      };
    } catch (error) {
      console.error('Error fetching widget defaults:', error);
      return {
        general: {},
        style: {},
        advanced: {}
      };
    }
  }

  /**
   * Convert PHP widget to React-compatible format with defaults
   */
  async formatWidgetForReact(phpWidget) {
    // Get default values from PHP widget fields
    const defaults = await this.getWidgetDefaults(phpWidget.type);

    return {
      type: phpWidget.type,
      name: phpWidget.name,
      label: phpWidget.name,
      icon: phpWidget.icon,
      category: phpWidget.category,
      category_name: phpWidget.category_name,
      description: phpWidget.description,
      tags: phpWidget.tags || [],
      is_pro: phpWidget.is_pro || false,
      defaultContent: defaults.general || {}, // Populate with actual PHP defaults
      defaultStyle: defaults.style || {},     // Populate with actual PHP defaults
      defaultAdvanced: {
        cssClasses: '',
        customCSS: '',
        ...defaults.advanced
      }
    };
  }

  /**
   * Convert PHP widget to React format WITHOUT fetching defaults
   * Use this for search results and sidebar display where defaults aren't needed yet
   * Defaults will be fetched when the widget is actually added to the page
   */
  formatWidgetForReactLite(phpWidget) {
    return {
      type: phpWidget.type,
      name: phpWidget.name,
      label: phpWidget.name,
      icon: phpWidget.icon,
      category: phpWidget.category,
      category_name: phpWidget.category_name,
      description: phpWidget.description,
      tags: phpWidget.tags || [],
      is_pro: phpWidget.is_pro || false,
      defaultContent: {},
      defaultStyle: {
        margin: '0 0 16px 0',
        padding: '0'
      },
      defaultAdvanced: {
        cssClasses: '',
        customCSS: ''
      }
    };
  }

  /**
   * Convert multiple PHP widgets to React format WITHOUT fetching defaults
   * Use this for search results and sidebar display
   */
  formatWidgetsForReactLite(phpWidgets) {
    return phpWidgets.map(widget => this.formatWidgetForReactLite(widget));
  }

  /**
   * Convert multiple PHP widgets to React format (with defaults)
   */
  async formatWidgetsForReact(phpWidgets) {
    const formattedWidgets = await Promise.all(
      phpWidgets.map(widget => this.formatWidgetForReact(widget))
    );
    return formattedWidgets;
  }

  /**
   * Convert grouped PHP widgets to React format WITHOUT fetching defaults
   * Use this for initial sidebar load and when clearing search
   */
  formatGroupedWidgetsForReactLite(groupedWidgets) {
    const result = {};

    for (const [categoryKey, categoryData] of Object.entries(groupedWidgets)) {
      const formattedWidgets = Object.values(categoryData.widgets).map(widgetData =>
        this.formatWidgetForReactLite(widgetData.config)
      );

      result[categoryKey] = {
        ...categoryData.category,
        widgets: formattedWidgets
      };
    }

    return result;
  }

  /**
   * Convert grouped PHP widgets to React format (with defaults)
   */
  async formatGroupedWidgetsForReact(groupedWidgets) {
    const result = {};

    for (const [categoryKey, categoryData] of Object.entries(groupedWidgets)) {
      const formattedWidgets = await Promise.all(
        Object.values(categoryData.widgets).map(widgetData =>
          this.formatWidgetForReact(widgetData.config)
        )
      );

      result[categoryKey] = {
        ...categoryData.category,
        widgets: formattedWidgets
      };
    }

    return result;
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/test`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error testing API connection:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const widgetService = new WidgetService();
export default widgetService;
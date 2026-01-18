/**
 * Settings Service
 *
 * Handles API calls for saving individual widget, section, and column settings
 */
class SettingsService {
    constructor() {
        this.baseUrl = '/api/page-builder';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    /**
     * Get default headers for API requests
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': this.csrfToken,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    }

    /**
     * Save general settings for a widget
     */
    async saveWidgetGeneralSettings(pageId, widgetId, generalSettings) {
        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}/widgets/${widgetId}/save-general-settings`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    general: generalSettings || {}
                })
            });

            const result = await this.handleResponse(response);

            console.log(`[SettingsService] Widget ${widgetId} general settings saved successfully:`, result);
            return result;

        } catch (error) {
            console.error(`[SettingsService] Failed to save widget ${widgetId} general settings:`, error);
            throw error;
        }
    }

    /**
     * Save style settings for a widget
     */
    async saveWidgetStyleSettings(pageId, widgetId, styleSettings) {
        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}/widgets/${widgetId}/save-style-settings`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    style: styleSettings || {}
                })
            });

            const result = await this.handleResponse(response);

            console.log(`[SettingsService] Widget ${widgetId} style settings saved successfully:`, result);
            return result;

        } catch (error) {
            console.error(`[SettingsService] Failed to save widget ${widgetId} style settings:`, error);
            throw error;
        }
    }

    /**
     * Save advanced settings for a widget
     */
    async saveWidgetAdvancedSettings(pageId, widgetId, advancedSettings) {
        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}/widgets/${widgetId}/save-advanced-settings`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    advanced: advancedSettings || {}
                })
            });

            const result = await this.handleResponse(response);

            console.log(`[SettingsService] Widget ${widgetId} advanced settings saved successfully:`, result);
            return result;

        } catch (error) {
            console.error(`[SettingsService] Failed to save widget ${widgetId} advanced settings:`, error);
            throw error;
        }
    }

    /**
     * Helper to ensure we always send objects, not arrays
     */
    ensureObject(val) {
        if (!val || (Array.isArray(val) && val.length === 0)) return {};
        if (typeof val !== 'object') return {};
        return val;
    }

    /**
     * Save all settings for a widget (general + style + advanced)
     */
    async saveWidgetAllSettings(pageId, widgetId, allSettings) {
        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}/widgets/${widgetId}/save-all-settings`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    widget_type: allSettings.widget_type,
                    general: this.ensureObject(allSettings.general),
                    style: this.ensureObject(allSettings.style),
                    advanced: this.ensureObject(allSettings.advanced)
                })
            });

            const result = await this.handleResponse(response);

            console.log(`[SettingsService] Widget ${widgetId} settings saved successfully:`, result);
            return result;

        } catch (error) {
            console.error(`[SettingsService] Failed to save widget ${widgetId} settings:`, error);
            throw error;
        }
    }

    /**
     * Save all settings for a section
     */
    async saveSectionAllSettings(pageId, sectionId, settings, responsiveSettings = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}/sections/${sectionId}/save-all-settings`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    settings: settings || {},
                    responsiveSettings: responsiveSettings || {}
                })
            });

            const result = await this.handleResponse(response);

            console.log(`[SettingsService] Section ${sectionId} settings saved successfully:`, result);
            return result;

        } catch (error) {
            console.error(`[SettingsService] Failed to save section ${sectionId} settings:`, error);
            throw error;
        }
    }

    /**
     * Save all settings for a column
     */
    async saveColumnAllSettings(pageId, columnId, settings, responsiveSettings = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/pages/${pageId}/columns/${columnId}/save-all-settings`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'same-origin',
                body: JSON.stringify({
                    settings: settings || {},
                    responsiveSettings: responsiveSettings || {}
                })
            });

            const result = await this.handleResponse(response);

            console.log(`[SettingsService] Column ${columnId} settings saved successfully:`, result);
            return result;

        } catch (error) {
            console.error(`[SettingsService] Failed to save column ${columnId} settings:`, error);
            throw error;
        }
    }

    /**
     * Generic save method that determines entity type and calls appropriate method
     */
    async saveAllSettings(pageId, entity) {
        if (!entity || !entity.id || !entity.type) {
            throw new Error('Invalid entity: missing id or type');
        }

        const entityType = entity.type;
        const entityId = entity.id;

        switch (entityType) {
            case 'section':
                return await this.saveSectionAllSettings(
                    pageId,
                    entityId,
                    entity.settings || {},
                    entity.responsiveSettings || {}
                );

            case 'column':
                return await this.saveColumnAllSettings(
                    pageId,
                    entityId,
                    entity.settings || {},
                    entity.responsiveSettings || {}
                );

            default:
                // Treat everything else as a widget
                const allSettings = {
                    general: entity.general || entity.content || {},
                    style: entity.style || {},
                    advanced: entity.advanced || {}
                };
                return await this.saveWidgetAllSettings(pageId, entityId, allSettings);
        }
    }

    /**
     * Validate entity before saving
     */
    validateEntity(entity) {
        if (!entity) {
            throw new Error('Entity is required');
        }

        if (!entity.id) {
            throw new Error('Entity ID is required');
        }

        if (!entity.type) {
            throw new Error('Entity type is required');
        }

        return true;
    }

    /**
     * Get entity type display name
     */
    getEntityTypeDisplayName(entityType) {
        switch (entityType) {
            case 'section':
                return 'Section';
            case 'column':
                return 'Column';
            default:
                return 'Widget';
        }
    }
}

// Export singleton instance
const settingsService = new SettingsService();

export default settingsService;
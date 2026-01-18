import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import widgetService from '@/Services/widgetService';
import settingsService from '@/Services/settingsService';
import { Loader, ChevronDown, ChevronRight, Save } from 'lucide-react';
import PhpFieldRenderer from '@/Components/PageBuilder/Fields/PhpFieldRenderer';

const AdvancedSettings = ({ widget, onUpdate, onWidgetUpdate }) => {
  const { updateWidget } = usePageBuilderStore();
  const [phpFields, setPhpFields] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [localWidget, setLocalWidget] = useState(widget);
  const debounceTimeoutRef = useRef(null);

  // Global save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  console.log('[AdvancedSettings] Component mounted with widget:', { id: widget.id, type: widget.type, advanced: widget.advanced });

  // Dynamic PHP widget detection - no hardcoded list needed
  const [isPhpWidget, setIsPhpWidget] = useState(false);

  // Sync local widget when prop changes
  useEffect(() => {
    console.log('[AdvancedSettings] Widget prop changed:', { id: widget.id, type: widget.type, advanced: widget.advanced });
    setLocalWidget(widget);
  }, [widget]);

  // Always try to fetch PHP widget fields for universal detection
  useEffect(() => {
    fetchPhpWidgetFields();
  }, [widget.type]);

  const fetchPhpWidgetFields = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load PHP advanced fields for any widget type
      const fieldsData = await widgetService.getWidgetFields(widget.type, 'advanced');
      
      if (fieldsData && fieldsData.fields && Object.keys(fieldsData.fields).length > 0) {
        // Successfully loaded PHP fields - this is a PHP widget
        setPhpFields(fieldsData);
        setIsPhpWidget(true);
      } else {
        // No PHP fields available - fallback to legacy rendering
        setPhpFields(null);
        setIsPhpWidget(false);
      }
    } catch (err) {
      // Error loading PHP fields - fallback to legacy rendering
      console.log(`No PHP advanced fields for widget type '${widget.type}', using legacy rendering`);
      setPhpFields(null);
      setIsPhpWidget(false);
      setError(null); // Don't show error for widgets without PHP fields
    } finally {
      setIsLoading(false);
    }
  };

  // Sync local widget with prop changes
  useEffect(() => {
    setLocalWidget(widget);
  }, [widget]);

  // Debounced store update function
  const debouncedStoreUpdate = useCallback((updatedWidget) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for 500ms delay
    debounceTimeoutRef.current = setTimeout(() => {
      // Update the widget in the store
      updateWidget(widget.id, updatedWidget);
      
      // Update the selected widget
      onWidgetUpdate(updatedWidget);
    }, 500);
  }, [widget.id, updateWidget, onWidgetUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const updateAdvanced = (property, value) => {
    console.log('[AdvancedSettings] updateAdvanced:', { property, value, currentAdvanced: localWidget.advanced });

    const updatedWidget = {
      ...localWidget,
      advanced: {
        ...localWidget.advanced,
        [property]: value
      }
    };

    console.log('[AdvancedSettings] Updated widget advanced:', updatedWidget.advanced);

    // Update local state immediately for visual feedback
    setLocalWidget(updatedWidget);

    // Debounce the store update
    debouncedStoreUpdate(updatedWidget);
  };

  const updateAdvancedPath = (path, value) => {
    const pathArray = path.split('.');
    const updatedWidget = { ...localWidget };
    
    // Ensure advanced object exists
    if (!updatedWidget.advanced) {
      updatedWidget.advanced = {};
    }
    
    // Navigate to the nested property
    let current = updatedWidget.advanced;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the value
    current[pathArray[pathArray.length - 1]] = value;
    
    // Update local state immediately for visual feedback
    setLocalWidget(updatedWidget);
    
    // Debounce the store update
    debouncedStoreUpdate(updatedWidget);
  };

  const toggleGroupCollapse = (groupKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // For PHP widgets, render dynamic fields from API
  const renderPhpWidgetFields = () => {
    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p className="text-sm mb-2">{error}</p>
          <button 
            onClick={fetchPhpWidgetFields}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!phpFields || !phpFields.fields) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No PHP advanced settings available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(phpFields.fields).map(([groupKey, groupConfig]) => {
          // Check if this is a group field
          if (groupConfig.type === 'group' && groupConfig.fields) {
            const isCollapsed = collapsedGroups[groupKey];
            return (
              <div key={groupKey} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleGroupCollapse(groupKey)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <h3 className="text-sm font-semibold text-gray-900">
                    {groupConfig.label}
                  </h3>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {!isCollapsed && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="space-y-4 pt-3">
                      {Object.entries(groupConfig.fields).map(([fieldKey, fieldConfig]) => (
                        <PhpFieldRenderer
                          key={`${groupKey}.${fieldKey}`}
                          fieldKey={fieldKey}
                          fieldConfig={fieldConfig}
                          value={localWidget.advanced?.[groupKey]?.[fieldKey]}
                          onChange={(value) => updateAdvancedPath(`${groupKey}.${fieldKey}`, value)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            // Handle non-group fields (fallback)
            return (
              <div key={groupKey} className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <PhpFieldRenderer
                    fieldKey={groupKey}
                    fieldConfig={groupConfig}
                    value={localWidget.advanced?.[groupKey]}
                    onChange={(value) => updateAdvanced(groupKey, value)}
                  />
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Legacy hardcoded fields for non-PHP widgets
  const renderLegacyFields = () => {
    return (
      <div className="space-y-6">
        {/* CSS Classes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSS Classes
          </label>
          <input
            type="text"
            value={widget.advanced?.cssClasses || ''}
            onChange={(e) => updateAdvanced('cssClasses', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="class1 class2 class3"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple classes with spaces
          </p>
        </div>

        {/* Custom CSS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom CSS
          </label>
          <textarea
            value={widget.advanced?.customCSS || ''}
            onChange={(e) => updateAdvanced('customCSS', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="color: red;&#10;font-size: 16px;&#10;background: #f0f0f0;"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add custom CSS properties. Use CSS syntax without selectors.
          </p>
        </div>

        {/* Widget ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Widget ID
          </label>
          <input
            type="text"
            value={widget.advanced?.id || ''}
            onChange={(e) => updateAdvanced('id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="unique-widget-id"
          />
          <p className="text-xs text-gray-500 mt-1">
            Unique identifier for this widget (optional)
          </p>
        </div>


        {/* Visibility Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Visibility</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="hideOnDesktop"
                type="checkbox"
                checked={widget.advanced?.hideOnDesktop || false}
                onChange={(e) => updateAdvanced('hideOnDesktop', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hideOnDesktop" className="ml-2 block text-sm text-gray-700">
                Hide on Desktop
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="hideOnTablet"
                type="checkbox"
                checked={widget.advanced?.hideOnTablet || false}
                onChange={(e) => updateAdvanced('hideOnTablet', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hideOnTablet" className="ml-2 block text-sm text-gray-700">
                Hide on Tablet
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="hideOnMobile"
                type="checkbox"
                checked={widget.advanced?.hideOnMobile || false}
                onChange={(e) => updateAdvanced('hideOnMobile', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hideOnMobile" className="ml-2 block text-sm text-gray-700">
                Hide on Mobile
              </label>
            </div>
          </div>
        </div>

        {/* Widget Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Widget Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Type:</strong> {widget.type}</p>
            <p><strong>ID:</strong> {widget.id}</p>
            <p><strong>Created:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Loading advanced settings...</span>
        </div>
      );
    }

    // First priority: PHP fields if available
    if (isPhpWidget && phpFields && phpFields.fields && Object.keys(phpFields.fields).length > 0) {
      return renderPhpWidgetFields();
    }
    
    // Second priority: Legacy hardcoded advanced settings
    return renderLegacyFields();
  };

  const handleSaveSuccess = (result) => {
    console.log('[AdvancedSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[AdvancedSettings] Save failed:', error);
  };

  const getPageId = () => {
    const match = window.location.pathname.match(/\/admin\/page-builder\/(.+)$/);
    if (match) {
      const slug = match[1];
      if (/^\d+$/.test(slug)) {
        return parseInt(slug);
      }
    }
    return window.currentPageId || widget?.pageId || 1;
  };

  const handleGlobalSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const pageId = getPageId();

      let widgetType = localWidget.type;

      if (!widgetType && localWidget.widget_type) widgetType = localWidget.widget_type;
      if (!widgetType && localWidget.id) {
        const match = localWidget.id.match(/^([^-\d]+)-/);
        if (match) widgetType = match[1];
      }
      if (!widgetType) widgetType = 'text';

      // Prepare all settings data
      const allSettings = {
        widget_type: widgetType,
        general: localWidget.general || localWidget.content || {},
        style: localWidget.style || {},
        advanced: localWidget.advanced || {}
      };

      console.log('[AdvancedSettings] Saving all settings:', allSettings);

      // Call the global save service
      const result = await settingsService.saveWidgetAllSettings(pageId, localWidget.id, allSettings);

      console.log('[AdvancedSettings] Save successful:', result);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

      // Update parent components
      onWidgetUpdate(localWidget);

      // Update page dirty state
      const { autoSave, currentPageId } = usePageBuilderStore.getState();
      if (currentPageId || pageId) {
        await autoSave(currentPageId || pageId);
      }

    } catch (error) {
      console.error('[AdvancedSettings] Save failed:', error);
      setSaveError(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderSettings()}
      </div>

      {/* Sticky bottom save button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {saveSuccess && (
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Settings saved successfully!</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center text-red-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{saveError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleGlobalSave}
            disabled={isSaving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default AdvancedSettings;
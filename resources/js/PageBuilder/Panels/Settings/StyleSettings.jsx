import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import widgetService from '@/Services/widgetService';
import settingsService from '@/Services/settingsService';
import { Loader, ChevronDown, ChevronRight, Save } from 'lucide-react';
import PhpFieldRenderer from '@/Components/PageBuilder/Fields/PhpFieldRenderer';
import DynamicTabGroup from '@/Components/PageBuilder/Fields/DynamicTabGroup';

const StyleSettings = ({ widget, onUpdate, onWidgetUpdate }) => {
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

  // Dynamic PHP widget detection - no hardcoded list needed
  const [isPhpWidget, setIsPhpWidget] = useState(false);

  // Always try to fetch PHP widget fields for universal detection
  useEffect(() => {
    fetchPhpWidgetFields();
  }, [widget.type]);

  const fetchPhpWidgetFields = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`[DEBUG] StyleSettings: Fetching PHP style fields for widget type '${widget.type}'`);

      // Try to load PHP style fields for any widget type
      const fieldsData = await widgetService.getWidgetFields(widget.type, 'style');

      console.log(`[DEBUG] StyleSettings: Fields response for '${widget.type}':`, fieldsData);

      if (fieldsData && fieldsData.fields && Object.keys(fieldsData.fields).length > 0) {
        // Successfully loaded PHP fields - this is a PHP widget
        console.log(`[DEBUG] StyleSettings: Found ${Object.keys(fieldsData.fields).length} field groups for '${widget.type}'`);
        setPhpFields(fieldsData);
        setIsPhpWidget(true);
      } else {
        // No PHP fields available - fallback to legacy rendering
        console.log(`[DEBUG] StyleSettings: No PHP fields found for '${widget.type}', using legacy rendering`);
        setPhpFields(null);
        setIsPhpWidget(false);
      }
    } catch (err) {
      // Error loading PHP fields - fallback to legacy rendering
      console.error(`[DEBUG] StyleSettings: Error loading PHP style fields for widget type '${widget.type}':`, err);
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

  const updateStyle = (property, value) => {
    const updatedWidget = {
      ...localWidget,
      style: {
        ...localWidget.style,
        [property]: value
      }
    };
    
    // Update local state immediately for visual feedback
    setLocalWidget(updatedWidget);
    
    // Debounce the store update
    debouncedStoreUpdate(updatedWidget);
  };

  const updateStylePath = (path, value) => {
    const pathArray = path.split('.');
    const updatedWidget = { ...localWidget };
    
    // Ensure style object exists
    if (!updatedWidget.style) {
      updatedWidget.style = {};
    } else {
      // Deep clone to make all nested objects extensible
      updatedWidget.style = JSON.parse(JSON.stringify(updatedWidget.style));
    }
    
    // Navigate to the nested property
    let current = updatedWidget.style;
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
          <p className="text-sm">No PHP style settings available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(phpFields.fields).map(([groupKey, groupConfig]) => {
          // Check if this is the _tabs structure
          if (groupKey === '_tabs' && typeof groupConfig === 'object') {
            return (
              <div key={groupKey} className="tabs-container">
                <DynamicTabGroup
                  tabs={groupConfig}
                  value={localWidget.style || {}}
                  onChange={(tabValues) => {
                    // Update the widget style with tab values
                    const updatedWidget = {
                      ...localWidget,
                      style: {
                        ...localWidget.style,
                        ...tabValues
                      }
                    };
                    setLocalWidget(updatedWidget);
                    debouncedStoreUpdate(updatedWidget);
                  }}
                  defaultTab={Object.keys(groupConfig)[0] || 'normal'}
                  tabStyle="default"
                />
              </div>
            );
          }
          // Check if this is a group field
          else if (groupConfig.type === 'group' && groupConfig.fields) {
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
                          value={localWidget.style?.[groupKey]?.[fieldKey]}
                          onChange={(value) => updateStylePath(`${groupKey}.${fieldKey}`, value)}
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
                    value={localWidget.style?.[groupKey]}
                    onChange={(value) => updateStyle(groupKey, value)}
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
        {/* Spacing */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Spacing</h4>
          <div className="space-y-4">
            <PhpFieldRenderer
              fieldKey="padding"
              fieldConfig={{
                type: 'spacing',
                label: 'Padding',
                responsive: true,
                default: '0px 0px 0px 0px',
                units: ['px', 'em', 'rem', '%'],
                linked: false,
                sides: ['top', 'right', 'bottom', 'left'],
                min: 0,
                max: 1000,
                step: 1
              }}
              value={widget.style?.padding || '0px 0px 0px 0px'}
              onChange={(value) => updateStyle('padding', value)}
            />
            
            <PhpFieldRenderer
              fieldKey="margin"
              fieldConfig={{
                type: 'spacing',
                label: 'Margin',
                responsive: true,
                default: '0px 0px 0px 0px',
                units: ['px', 'em', 'rem', '%'],
                linked: false,
                sides: ['top', 'right', 'bottom', 'left'],
                min: 0,
                max: 1000,
                step: 1
              }}
              value={widget.style?.margin || '0px 0px 0px 0px'}
              onChange={(value) => updateStyle('margin', value)}
            />
          </div>
        </div>

        {/* Typography */}
        {['heading', 'text', 'button'].includes(widget.type) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Typography</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <input
                  type="text"
                  value={widget.style?.fontSize || ''}
                  onChange={(e) => updateStyle('fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="16px"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Weight
                </label>
                <select
                  value={widget.style?.fontWeight || ''}
                  onChange={(e) => updateStyle('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default</option>
                  <option value="300">Light</option>
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={widget.style?.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Align
                </label>
                <select
                  value={widget.style?.textAlign || ''}
                  onChange={(e) => updateStyle('textAlign', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default</option>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Background */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Background</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={widget.style?.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Border */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Border</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Width
              </label>
              <input
                type="text"
                value={widget.style?.borderWidth || ''}
                onChange={(e) => updateStyle('borderWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Style
              </label>
              <select
                value={widget.style?.borderStyle || ''}
                onChange={(e) => updateStyle('borderStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Color
              </label>
              <input
                type="color"
                value={widget.style?.borderColor || '#e5e7eb'}
                onChange={(e) => updateStyle('borderColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <input
                type="text"
                value={widget.style?.borderRadius || ''}
                onChange={(e) => updateStyle('borderRadius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0px"
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Dimensions</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <input
                type="text"
                value={widget.style?.width || ''}
                onChange={(e) => updateStyle('width', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="auto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <input
                type="text"
                value={widget.style?.height || ''}
                onChange={(e) => updateStyle('height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="auto"
              />
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Shadow</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Box Shadow
            </label>
            <select
              value={widget.style?.boxShadow || ''}
              onChange={(e) => updateStyle('boxShadow', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1)">Small</option>
              <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium</option>
              <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large</option>
              <option value="0 25px 50px -12px rgba(0, 0, 0, 0.25)">Extra Large</option>
            </select>
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
          <span className="ml-2 text-sm text-gray-600">Loading style settings...</span>
        </div>
      );
    }

    // First priority: PHP fields if available
    if (isPhpWidget && phpFields && phpFields.fields && Object.keys(phpFields.fields).length > 0) {
      return renderPhpWidgetFields();
    }
    
    // Second priority: Legacy hardcoded style settings
    return renderLegacyFields();
  };

  const handleSaveSuccess = (result) => {
    console.log('[StyleSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[StyleSettings] Save failed:', error);
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

    // CRITICAL: Extract widget type correctly
    let widgetType = localWidget.type;
    console.log("widget type", widgetType);
    

    // Fallback logic for different possible structures
    if (!widgetType && localWidget.widget_type) widgetType = localWidget.widget_type;
    if (!widgetType && localWidget.id) {
      // Try to extract from widget ID: heading-abc123 → "heading"
      const match = localWidget.id.match(/^([^-\d]+)-/);
      if (match) widgetType = match[1];
    }
    if (!widgetType) widgetType = 'text'; // final fallback

    const allSettings = {
      widget_type: widgetType,                    // ← ALWAYS sent now
      general: localWidget.general || localWidget.content || {},
      style: localWidget.style || {},
      advanced: localWidget.advanced || {}
    };

    console.log('[SAVE] Sending widget_type:', widgetType);
    console.log('[SAVE] Full payload:', allSettings);

    const result = await settingsService.saveWidgetAllSettings(pageId, localWidget.id, allSettings);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onWidgetUpdate(localWidget);

    // Update page dirty state
    const { autoSave, currentPageId } = usePageBuilderStore.getState();
    if (currentPageId || pageId) {
      await autoSave(currentPageId || pageId);
    }

  } catch (error) {
    console.error('[SAVE] Failed:', error);
    const msg = error?.response?.data?.message || error.message || 'Save failed';
    setSaveError(msg);
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


export default StyleSettings;
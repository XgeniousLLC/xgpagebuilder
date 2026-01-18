import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import widgetService from '@/Services/widgetService';
import settingsService from '@/Services/settingsService';
import { Loader, ChevronDown, ChevronRight, Save } from 'lucide-react';
import PhpFieldRenderer from '@/Components/PageBuilder/Fields/PhpFieldRenderer';

const GeneralSettings = ({ widget, onUpdate, onWidgetUpdate }) => {
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

  // NEW: Tab-based lazy loading - only fetch when component becomes active
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only load if component is mounted and we haven't loaded yet
    if (!hasLoaded) {
      fetchWidgetSettings();
    }
  }, [widget.id, hasLoaded]); // Depend on widget.id to reload when widget changes

  const fetchWidgetSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[GeneralSettings] Fetching unified widget settings:', {
        widgetId: widget.id,
        widgetType: widget.type,
        pageId: getPageId()
      });

      // NEW: Use unified API that returns pre-populated fields
      const settingsData = await widgetService.getWidgetSettings(getPageId(), widget.id, 'general');

      if (settingsData && settingsData.fields && Object.keys(settingsData.fields).length > 0) {
        // Successfully loaded pre-populated fields
        setPhpFields(settingsData);
        setIsPhpWidget(true);
        setHasLoaded(true);

        console.log('[GeneralSettings] Loaded pre-populated fields:', {
          fieldCount: Object.keys(settingsData.fields).length,
          widgetType: settingsData.widget_type,
          timestamp: settingsData.timestamp
        });
      } else {
        // No PHP fields available - fallback to legacy rendering
        setPhpFields(null);
        setIsPhpWidget(false);
        setHasLoaded(true);

        console.log('[GeneralSettings] No PHP fields, using legacy rendering for:', widget.type);
      }
    } catch (err) {
      if (err.message.includes('404')) {
        try {
          const defaults = await widgetService.getWidgetDefaults(widget.type);
          if (defaults && defaults.fields) {
            setPhpFields(defaults);
            setIsPhpWidget(true);

            // OPTIONAL: Update the global store immediately with these defaults
            const newWidgetData = { ...widget, general: defaults.values.general };
            updateWidget(widget.id, newWidgetData);
            setLocalWidget(newWidgetData);

          }
        } catch (defaultsErr) {
          setError(`Failed to load default settings: ${defaultsErr.message}`);
        }
      } else {
        // For other errors, display them.
        console.error('[GeneralSettings] Error loading widget settings:', err);
        setError(`Failed to load settings: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
      setHasLoaded(true); // Mark as loaded even if we only got defaults
    }
  };

  // Sync local widget with prop changes ONLY when widget ID changes
  // This prevents resetting localWidget while user is typing
  const prevWidgetIdRef = useRef(widget.id);

  useEffect(() => {
    // Only update localWidget if the widget ID has actually changed
    // This prevents overwriting user input during typing
    if (prevWidgetIdRef.current !== widget.id) {
      console.log('[DEBUG] GeneralSettings widget ID changed:', {
        oldId: prevWidgetIdRef.current,
        newId: widget.id,
        type: widget.type
      });
      setLocalWidget(widget);
      prevWidgetIdRef.current = widget.id;
    }
  }, [widget.id, widget]); // Monitor widget.id for changes

  // Debounced store update function - Use ref to avoid dependency issues
  const onWidgetUpdateRef = useRef(onWidgetUpdate);
  const updateWidgetRef = useRef(updateWidget);

  // Update refs when props change
  useEffect(() => {
    onWidgetUpdateRef.current = onWidgetUpdate;
    updateWidgetRef.current = updateWidget;
  }, [onWidgetUpdate, updateWidget]);

  const debouncedStoreUpdate = useCallback((updatedWidget) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for 500ms delay
    debounceTimeoutRef.current = setTimeout(() => {
      // Update the widget in the store
      updateWidgetRef.current(widget.id, updatedWidget);

      // Update the selected widget
      onWidgetUpdateRef.current(updatedWidget);
    }, 500);
  }, [widget.id]); // Only depend on widget.id

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const updateContent = (path, value) => {
    const pathArray = path.split('.');
    const updatedWidget = { ...localWidget };

    // Navigate to the nested property
    let current = updatedWidget;
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

  const updateGeneral = (property, value) => {
    const updatedWidget = {
      ...localWidget,
      general: {
        ...localWidget.general,
        [property]: value
      }
    };

    // Update local state immediately for visual feedback
    setLocalWidget(updatedWidget);

    // Debounce the store update
    debouncedStoreUpdate(updatedWidget);
  };

  const updateGeneralPath = (path, value) => {
    const pathArray = path.split('.');
    const updatedWidget = { ...localWidget };

    // Ensure general object exists
    if (!updatedWidget.general) {
      updatedWidget.general = {};
    }

    // Navigate to the nested property within general
    let current = updatedWidget.general;
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

  const renderLegacyWidgetSettings = () => {
    switch (localWidget.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={localWidget.content?.html || ''}
                onChange={(e) => updateContent('content.html', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HTML content"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use HTML tags for formatting
              </p>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={localWidget.content?.text || ''}
                onChange={(e) => updateContent('content.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={localWidget.content?.url || ''}
                onChange={(e) => updateContent('content.url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={localWidget.content?.variant || 'primary'}
                onChange={(e) => updateContent('content.variant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={localWidget.content?.size || 'medium'}
                onChange={(e) => updateContent('content.size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="openInNewTab"
                type="checkbox"
                checked={localWidget.content?.openInNewTab || false}
                onChange={(e) => updateContent('content.openInNewTab', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="openInNewTab" className="ml-2 block text-sm text-gray-700">
                Open in new tab
              </label>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={localWidget.content?.src || ''}
                onChange={(e) => updateContent('content.src', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={localWidget.content?.alt || ''}
                onChange={(e) => updateContent('content.alt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <input
                type="text"
                value={localWidget.content?.caption || ''}
                onChange={(e) => updateContent('content.caption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image caption (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alignment
              </label>
              <select
                value={localWidget.content?.alignment || 'left'}
                onChange={(e) => updateContent('content.alignment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={localWidget.content?.style || 'solid'}
                onChange={(e) => updateContent('content.style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={localWidget.content?.color || '#e5e7eb'}
                onChange={(e) => updateContent('content.color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <input
                type="text"
                value={localWidget.content?.height || '20px'}
                onChange={(e) => updateContent('content.height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20px"
              />
            </div>
          </div>
        );

      case 'container':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Column Structure
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* 1 Column */}
                <button
                  onClick={() => updateContent('content.columns', 1)}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center ${(localWidget.content?.columns || 1) === 1
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <svg className="w-6 h-4 mb-1" viewBox="0 0 24 16" fill="currentColor">
                    <rect width="24" height="16" rx="2" className="fill-current opacity-30" />
                  </svg>
                  <span className="text-xs font-medium">1 Column</span>
                </button>

                {/* 2 Columns */}
                <button
                  onClick={() => updateContent('content.columns', 2)}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center ${(localWidget.content?.columns || 1) === 2
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <svg className="w-6 h-4 mb-1" viewBox="0 0 24 16" fill="currentColor">
                    <rect width="11" height="16" rx="2" className="fill-current opacity-30" />
                    <rect x="13" width="11" height="16" rx="2" className="fill-current opacity-30" />
                  </svg>
                  <span className="text-xs font-medium">2 Columns</span>
                </button>

                {/* 3 Columns */}
                <button
                  onClick={() => updateContent('content.columns', 3)}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center ${(localWidget.content?.columns || 1) === 3
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <svg className="w-6 h-4 mb-1" viewBox="0 0 24 16" fill="currentColor">
                    <rect width="7" height="16" rx="2" className="fill-current opacity-30" />
                    <rect x="8.5" width="7" height="16" rx="2" className="fill-current opacity-30" />
                    <rect x="17" width="7" height="16" rx="2" className="fill-current opacity-30" />
                  </svg>
                  <span className="text-xs font-medium">3 Columns</span>
                </button>

                {/* 4 Columns */}
                <button
                  onClick={() => updateContent('content.columns', 4)}
                  className={`p-3 border-2 rounded-lg transition-colors flex flex-col items-center ${(localWidget.content?.columns || 1) === 4
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <svg className="w-6 h-4 mb-1" viewBox="0 0 24 16" fill="currentColor">
                    <rect width="5" height="16" rx="2" className="fill-current opacity-30" />
                    <rect x="6.33" width="5" height="16" rx="2" className="fill-current opacity-30" />
                    <rect x="12.67" width="5" height="16" rx="2" className="fill-current opacity-30" />
                    <rect x="19" width="5" height="16" rx="2" className="fill-current opacity-30" />
                  </svg>
                  <span className="text-xs font-medium">4 Columns</span>
                </button>
              </div>

              {/* Advanced Layout Options */}
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Custom Column Layouts
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {/* 30-70 Split */}
                  <button
                    onClick={() => updateContent('content.gridTemplate', '30% 70%')}
                    className={`p-2 border-2 rounded-lg transition-colors flex items-center ${localWidget.content?.gridTemplate === '30% 70%'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <svg className="w-8 h-3 mr-2" viewBox="0 0 32 12" fill="currentColor">
                      <rect width="9" height="12" rx="1" className="fill-current opacity-30" />
                      <rect x="11" width="21" height="12" rx="1" className="fill-current opacity-30" />
                    </svg>
                    <span className="text-xs font-medium">30% - 70%</span>
                  </button>

                  {/* 70-30 Split */}
                  <button
                    onClick={() => updateContent('content.gridTemplate', '70% 30%')}
                    className={`p-2 border-2 rounded-lg transition-colors flex items-center ${localWidget.content?.gridTemplate === '70% 30%'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <svg className="w-8 h-3 mr-2" viewBox="0 0 32 12" fill="currentColor">
                      <rect width="21" height="12" rx="1" className="fill-current opacity-30" />
                      <rect x="23" width="9" height="12" rx="1" className="fill-current opacity-30" />
                    </svg>
                    <span className="text-xs font-medium">70% - 30%</span>
                  </button>

                  {/* 25-50-25 Split */}
                  <button
                    onClick={() => updateContent('content.gridTemplate', '25% 50% 25%')}
                    className={`p-2 border-2 rounded-lg transition-colors flex items-center ${localWidget.content?.gridTemplate === '25% 50% 25%'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <svg className="w-8 h-3 mr-2" viewBox="0 0 32 12" fill="currentColor">
                      <rect width="7" height="12" rx="1" className="fill-current opacity-30" />
                      <rect x="8.5" width="15" height="12" rx="1" className="fill-current opacity-30" />
                      <rect x="25" width="7" height="12" rx="1" className="fill-current opacity-30" />
                    </svg>
                    <span className="text-xs font-medium">25% - 50% - 25%</span>
                  </button>
                </div>
              </div>

              {/* Manual Grid Template Input */}
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manual Grid Template
                </label>
                <input
                  type="text"
                  value={localWidget.content?.gridTemplate || ''}
                  onChange={(e) => updateContent('content.gridTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1fr 2fr 1fr or 200px auto 100px"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Advanced: Use CSS Grid template columns syntax. This overrides the column structure above.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gap Between Columns
              </label>
              <input
                type="text"
                value={localWidget.content?.gap || '20px'}
                onChange={(e) => updateContent('content.gap', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20px"
              />
            </div>

            <div>
              <PhpFieldRenderer
                fieldKey="padding"
                fieldConfig={{
                  type: 'spacing',
                  label: 'Container Padding',
                  responsive: true,
                  default: '20px 20px 20px 20px',
                  units: ['px', 'em', 'rem', '%'],
                  linked: false,
                  sides: ['top', 'right', 'bottom', 'left'],
                  min: 0,
                  max: 1000,
                  step: 1
                }}
                value={localWidget.content?.padding || '20px 20px 20px 20px'}
                onChange={(value) => updateContent('content.padding', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={localWidget.content?.backgroundColor || '#ffffff'}
                onChange={(e) => updateContent('content.backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <input
                type="text"
                value={localWidget.content?.borderRadius || '0px'}
                onChange={(e) => updateContent('content.borderRadius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0px"
              />
            </div>
          </div>
        );

      case 'collapse':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={localWidget.content?.title || ''}
                onChange={(e) => updateContent('content.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Collapsible section title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={localWidget.content?.content || ''}
                onChange={(e) => updateContent('content.content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Content inside the collapsible section"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isOpenByDefault"
                type="checkbox"
                checked={localWidget.content?.isOpenByDefault || false}
                onChange={(e) => updateContent('content.isOpenByDefault', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isOpenByDefault" className="ml-2 block text-sm text-gray-700">
                Open by default
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No settings available for this widget type</p>
          </div>
        );
    }
  };

  // Helper function to get nested value from localWidget.general
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    const pathArray = path.split('.');
    let current = obj;
    for (const key of pathArray) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    return current;
  };

  // Render PHP widget fields
  const renderPhpWidgetFields = () => {
    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-2 text-sm">{error}</div>
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
          <p className="text-sm">No PHP general settings available</p>
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
                      {Object.entries(groupConfig.fields).map(([fieldKey, fieldConfig]) => {
                        // FIXED: Use localWidget.general value first, fallback to fieldConfig.value, then default
                        const localValue = getNestedValue(localWidget.general, `${groupKey}.${fieldKey}`);
                        const fieldValue = localValue !== undefined ? localValue : (fieldConfig.value ?? fieldConfig.default);

                        return (
                          <PhpFieldRenderer
                            key={`${groupKey}.${fieldKey}`}
                            fieldKey={fieldKey}
                            fieldConfig={fieldConfig}
                            value={fieldValue}
                            onChange={(value) => updateGeneralPath(`${groupKey}.${fieldKey}`, value)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            // Handle non-group fields
            const localValue = localWidget.general?.[groupKey];
            const fieldValue = localValue !== undefined ? localValue : (groupConfig.value ?? groupConfig.default);

            return (
              <div key={groupKey} className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <PhpFieldRenderer
                    fieldKey={groupKey}
                    fieldConfig={groupConfig}
                    value={fieldValue}
                    onChange={(value) => updateGeneral(groupKey, value)}
                  />
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderSettings = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Loading settings...</span>
        </div>
      );
    }

    // First priority: PHP fields if available
    if (isPhpWidget && phpFields && phpFields.fields) {
      return renderPhpWidgetFields();
    }

    // Second priority: Legacy hardcoded settings for specific widget types
    const legacyWidgetTypes = ['text', 'button', 'image', 'divider', 'spacer', 'container', 'collapse'];
    if (legacyWidgetTypes.includes(widget.type)) {
      return renderLegacyWidgetSettings();
    }

    // Final fallback: No settings message
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No general settings available for this widget type</p>
        <p className="text-xs text-gray-400 mt-2">
          Widget type: {widget.type}
        </p>
      </div>
    );
  };

  const handleSaveSuccess = (result) => {
    console.log('[GeneralSettings] Save successful:', result);
    // Optional: Show success notification, update UI state, etc.
  };

  const handleSaveError = (error) => {
    console.error('[GeneralSettings] Save failed:', error);
    // Optional: Show error notification, handle error state, etc.
  };

  // Extract page ID from current URL or widget data
  const getPageId = () => {
    // Try to get page ID from URL path (e.g., /admin/page-builder/123)
    const match = window.location.pathname.match(/\/admin\/page-builder\/(.+)$/);
    if (match) {
      // If the slug is numeric, it's likely a page ID
      const slug = match[1];
      if (/^\d+$/.test(slug)) {
        return parseInt(slug);
      }
      // Otherwise, we might need to get it from page data
      // For now, we'll use a fallback method
    }

    // Fallback: try to get from global page data or widget context
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

      const result = await settingsService.saveWidgetAllSettings(pageId, localWidget.id, allSettings);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onWidgetUpdate(localWidget);

      // This ensures isDirty is set to false and the toolbar shows "Saved"
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

export default GeneralSettings;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ToggleFieldComponent from '../../Fields/ToggleFieldComponent';
import SelectFieldComponent from '../../Fields/SelectFieldComponent';
import TextFieldComponent from '../../Fields/TextFieldComponent';
import TextareaFieldComponent from '../../Fields/TextareaFieldComponent';
import NumberFieldComponent from '../../Fields/NumberFieldComponent';
import ResponsiveFieldWrapper from '../../Fields/ResponsiveFieldWrapper';
import SaveSettingsSectionButton from './SaveSettingsSectionButton';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const ColumnAdvancedSettings = ({ column, onUpdate, onWidgetUpdate }) => {
  const { updateColumn } = usePageBuilderStore();
  const [localColumn, setLocalColumn] = useState(column);
  const debounceTimeoutRef = useRef(null);

  // Sync local column when prop changes
  useEffect(() => {
    setLocalColumn(column);
  }, [column]);

  // Debounced store update function
  const debouncedStoreUpdate = useCallback((updatedColumn) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for 500ms delay
    debounceTimeoutRef.current = setTimeout(() => {
      // Update the column in the store
      updateColumn(column.containerId, column.columnId || column.id, updatedColumn);

      // Update the selected column
      onWidgetUpdate(updatedColumn);
    }, 500);
  }, [column.containerId, column.columnId, column.id, updateColumn, onWidgetUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  const updateColumnSetting = (path, value) => {
    const updatedColumn = {
      ...localColumn,
      settings: {
        ...localColumn.settings,
        [path]: value
      }
    };

    // Update local state immediately for visual feedback
    setLocalColumn(updatedColumn);

    // Update parent state for immediate UI response
    onUpdate(prev => ({
      ...prev,
      containers: prev.containers.map(container =>
        container.id === column.containerId
          ? {
              ...container,
              columns: container.columns.map(col =>
                col.id === (column.columnId || column.id)
                  ? updatedColumn
                  : col
              )
            }
          : container
      )
    }));

    // Debounce the store update
    debouncedStoreUpdate(updatedColumn);
  };

  const getPageId = () => {
    const match = window.location.pathname.match(/\/admin\/page-builder\/(.+)$/);
    if (match) {
      const slug = match[1];
      if (/^\d+$/.test(slug)) {
        return parseInt(slug);
      }
    }
    return window.currentPageId || column?.pageId || 1;
  };

  const handleSaveSuccess = (result) => {
    console.log('[ColumnAdvancedSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[ColumnAdvancedSettings] Save failed:', error);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
        {/* Visibility Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Visibility</h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <ToggleFieldComponent
                  fieldKey="hideOnDesktop"
                  fieldConfig={{
                    label: "Hide on Desktop",
                    default: false
                  }}
                  value={localColumn?.settings?.hideOnDesktop || false}
                  onChange={(value) => updateColumnSetting('hideOnDesktop', value)}
                />

                <ToggleFieldComponent
                  fieldKey="hideOnTablet"
                  fieldConfig={{
                    label: "Hide on Tablet",
                    default: false
                  }}
                  value={localColumn?.settings?.hideOnTablet || false}
                  onChange={(value) => updateColumnSetting('hideOnTablet', value)}
                />

                <ToggleFieldComponent
                  fieldKey="hideOnMobile"
                  fieldConfig={{
                    label: "Hide on Mobile",
                    default: false
                  }}
                  value={localColumn?.settings?.hideOnMobile || false}
                  onChange={(value) => updateColumnSetting('hideOnMobile', value)}
                />
              </div>
            </div>
          </div>

          {/* Visibility Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="advanced"
              settingsData={{
                hideOnDesktop: localColumn?.settings?.hideOnDesktop || false,
                hideOnTablet: localColumn?.settings?.hideOnTablet || false,
                hideOnMobile: localColumn?.settings?.hideOnMobile || false
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              size="small"
            />
          </div>
        </div>

        {/* Custom Attributes Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Custom Attributes</h4>

            <div className="space-y-4">
              {/* CSS Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSS Classes
                </label>
                <TextFieldComponent
                  fieldKey="customClasses"
                  fieldConfig={{
                    label: 'CSS Classes',
                    placeholder: 'my-custom-class another-class',
                    default: ''
                  }}
                  value={localColumn?.settings?.customClasses || ''}
                  onChange={(value) => updateColumnSetting('customClasses', value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add custom CSS classes separated by spaces
                </p>
              </div>

              {/* Custom ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom ID
                </label>
                <TextFieldComponent
                  fieldKey="customId"
                  fieldConfig={{
                    label: 'Custom ID',
                    placeholder: `${localColumn?.columnId || localColumn?.id || 'column-id'}`,
                    default: localColumn?.columnId || localColumn?.id || ''
                  }}
                  value={localColumn?.settings?.customId || localColumn?.columnId || localColumn?.id || ''}
                  onChange={(value) => updateColumnSetting('customId', value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this column. Default: <code className="bg-gray-100 px-1 rounded text-xs">{localColumn?.columnId || localColumn?.id || 'auto-generated'}</code>
                </p>
              </div>

              {/* Z-Index */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Z-Index
                </label>
                <NumberFieldComponent
                  fieldKey="zIndex"
                  fieldConfig={{
                    label: 'Z-Index',
                    min: -1000,
                    max: 1000,
                    default: 0,
                    placeholder: '0'
                  }}
                  value={localColumn?.settings?.zIndex || 0}
                  onChange={(value) => updateColumnSetting('zIndex', value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controls stacking order (higher values appear on top)
                </p>
              </div>
            </div>
          </div>

          {/* Custom Attributes Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="advanced"
              settingsData={{
                customClasses: localColumn?.settings?.customClasses || '',
                customId: localColumn?.settings?.customId || localColumn?.columnId || localColumn?.id || '',
                zIndex: localColumn?.settings?.zIndex || 0
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              size="small"
            />
          </div>
        </div>

        {/* Animation Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Animation</h4>

            <div className="space-y-4">
              {/* Animation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrance Animation
                </label>
                <SelectFieldComponent
                  fieldKey="animation"
                  fieldConfig={{
                    label: 'Entrance Animation',
                    default: 'none',
                    options: {
                      'none': 'None',
                      'fade-in': 'Fade In',
                      'slide-up': 'Slide Up',
                      'slide-down': 'Slide Down',
                      'slide-left': 'Slide Left',
                      'slide-right': 'Slide Right',
                      'zoom-in': 'Zoom In',
                      'zoom-out': 'Zoom Out',
                      'bounce-in': 'Bounce In',
                      'rotate-in': 'Rotate In'
                    }
                  }}
                  value={localColumn?.settings?.animation || 'none'}
                  onChange={(value) => updateColumnSetting('animation', value)}
                />
              </div>

              {/* Animation Duration - Only show if animation is not 'none' */}
              {localColumn?.settings?.animation && localColumn?.settings?.animation !== 'none' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation Duration (ms)
                    </label>
                    <NumberFieldComponent
                      fieldKey="animationDuration"
                      fieldConfig={{
                        label: 'Animation Duration (ms)',
                        min: 100,
                        max: 3000,
                        step: 100,
                        default: 300,
                        placeholder: '300'
                      }}
                      value={localColumn?.settings?.animationDuration || 300}
                      onChange={(value) => updateColumnSetting('animationDuration', value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation Delay (ms)
                    </label>
                    <NumberFieldComponent
                      fieldKey="animationDelay"
                      fieldConfig={{
                        label: 'Animation Delay (ms)',
                        min: 0,
                        max: 2000,
                        step: 100,
                        default: 0,
                        placeholder: '0'
                      }}
                      value={localColumn?.settings?.animationDelay || 0}
                      onChange={(value) => updateColumnSetting('animationDelay', value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Animation Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="advanced"
              settingsData={{
                animation: localColumn?.settings?.animation || 'none',
                animationDuration: localColumn?.settings?.animationDuration || 300,
                animationDelay: localColumn?.settings?.animationDelay || 0
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              size="small"
            />
          </div>
        </div>

        {/* Custom CSS Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Custom CSS</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS
                </label>
                <TextareaFieldComponent
                  fieldKey="customCSS"
                  fieldConfig={{
                    label: 'Custom CSS',
                    placeholder: `/* Custom CSS for this column */
.my-column {
  /* Your styles here */
}`,
                    rows: 6,
                    default: ''
                  }}
                  value={localColumn?.settings?.customCSS || ''}
                  onChange={(value) => updateColumnSetting('customCSS', value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add custom CSS styles for advanced customization. Use <code>{'{{WRAPPER}}'}</code> to target this specific column.
                </p>
              </div>
            </div>
          </div>

          {/* Custom CSS Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="advanced"
              settingsData={{
                customCSS: localColumn?.settings?.customCSS || ''
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              size="small"
            />
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-50 rounded">
          <div>Column ID: {localColumn?.columnId || localColumn?.id}</div>
          <div>Container ID: {localColumn?.containerId}</div>
          <div>Current Settings: {JSON.stringify(localColumn?.settings || {}, null, 2)}</div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnAdvancedSettings; // Fixed JSX syntax
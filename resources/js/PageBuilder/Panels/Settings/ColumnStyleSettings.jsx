import React, { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedBackgroundPicker from '../../Fields/EnhancedBackgroundPicker';
import EnhancedDimensionPicker from '../../Fields/EnhancedDimensionPicker';
import BorderShadowGroup from '../../Fields/BorderShadowGroup';
import ResponsiveFieldWrapper from '../../Fields/ResponsiveFieldWrapper';
import SaveSettingsSectionButton from './SaveSettingsSectionButton';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const ColumnStyleSettings = ({ column, onUpdate, onWidgetUpdate }) => {
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
    console.log('[ColumnStyleSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[ColumnStyleSettings] Save failed:', error);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
        {/* Background Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Background</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Column Background
                </label>
                <EnhancedBackgroundPicker
                  value={localColumn?.settings?.columnBackground || {
                    type: 'none',
                    color: '#ffffff',
                    gradient: {
                      type: 'linear',
                      angle: 135,
                      colorStops: [
                        { color: '#667EEA', position: 0 },
                        { color: '#764BA2', position: 100 }
                      ]
                    },
                    image: {
                      url: '',
                      size: 'cover',
                      position: 'center center',
                      repeat: 'no-repeat',
                      attachment: 'scroll'
                    }
                  }}
                  onChange={(value) => updateColumnSetting('columnBackground', value)}
                />
              </div>
            </div>
          </div>

          {/* Background Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="style"
              settingsData={{
                columnBackground: localColumn?.settings?.columnBackground || {
                  type: 'none',
                  color: '#ffffff',
                  gradient: {
                    type: 'linear',
                    angle: 135,
                    colorStops: [
                      { color: '#667EEA', position: 0 },
                      { color: '#764BA2', position: 100 }
                    ]
                  },
                  image: {
                    url: '',
                    size: 'cover',
                    position: 'center center',
                    repeat: 'no-repeat',
                    attachment: 'scroll'
                  }
                }
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              size="small"
            />
          </div>
        </div>

        {/* Spacing Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Spacing</h4>

            <div className="space-y-4">
              {/* Padding */}
              <ResponsiveFieldWrapper
                label="Padding"
                value={localColumn?.settings?.padding}
                onChange={(value) => updateColumnSetting('padding', value)}
                defaultValue={{ top: 10, right: 10, bottom: 10, left: 10, unit: 'px' }}
              >
                <EnhancedDimensionPicker
                  value={localColumn?.settings?.padding || { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' }}
                  onChange={(value) => updateColumnSetting('padding', value)}
                  units={['px', 'em', 'rem', '%']}
                  min={0}
                  max={200}
                  label="Padding"
                  showLabels={true}
                  linked={false}
                  responsive={true}
                />
              </ResponsiveFieldWrapper>

              {/* Margin */}
              <ResponsiveFieldWrapper
                label="Margin"
                value={localColumn?.settings?.margin}
                onChange={(value) => updateColumnSetting('margin', value)}
                defaultValue={{ top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }}
              >
                <EnhancedDimensionPicker
                  value={localColumn?.settings?.margin || { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }}
                  onChange={(value) => updateColumnSetting('margin', value)}
                  units={['px', 'em', 'rem', '%']}
                  allowNegative={true}
                  min={-200}
                  max={200}
                  label="Margin"
                  showLabels={true}
                  linked={false}
                  responsive={true}
                />
              </ResponsiveFieldWrapper>
            </div>
          </div>

          {/* Spacing Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="style"
              settingsData={{
                padding: localColumn?.settings?.padding || { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
                margin: localColumn?.settings?.margin || { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={handleSaveError}
              size="small"
            />
          </div>
        </div>

        {/* Border & Shadow Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-4">Border & Shadow</h4>

            <div className="space-y-4">
              <BorderShadowGroup
                value={{
                  border: {
                    width: localColumn?.settings?.borderWidth || 0,
                    color: localColumn?.settings?.borderColor || '#e2e8f0',
                    style: localColumn?.settings?.borderStyle || 'solid',
                    radius: localColumn?.settings?.borderRadius || { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }
                  },
                  shadow: {
                    enabled: localColumn?.settings?.shadowEnabled || false,
                    x: localColumn?.settings?.shadowX || 0,
                    y: localColumn?.settings?.shadowY || 0,
                    blur: localColumn?.settings?.shadowBlur || 0,
                    spread: localColumn?.settings?.shadowSpread || 0,
                    color: localColumn?.settings?.shadowColor || 'rgba(0, 0, 0, 0.1)',
                    inset: localColumn?.settings?.shadowInset || false
                  }
                }}
                onChange={(value) => {
                  // Update border settings
                  updateColumnSetting('borderWidth', value.border.width);
                  updateColumnSetting('borderColor', value.border.color);
                  updateColumnSetting('borderStyle', value.border.style);
                  updateColumnSetting('borderRadius', value.border.radius);

                  // Update shadow settings
                  updateColumnSetting('shadowEnabled', value.shadow.enabled);
                  updateColumnSetting('shadowX', value.shadow.x);
                  updateColumnSetting('shadowY', value.shadow.y);
                  updateColumnSetting('shadowBlur', value.shadow.blur);
                  updateColumnSetting('shadowSpread', value.shadow.spread);
                  updateColumnSetting('shadowColor', value.shadow.color);
                  updateColumnSetting('shadowInset', value.shadow.inset);
                }}
                showBorder={true}
                showShadow={true}
                responsive={false}
              />
            </div>
          </div>

          {/* Border & Shadow Save Button */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <SaveSettingsSectionButton
              entity={{
                id: localColumn?.columnId || localColumn?.id,
                type: 'column'
              }}
              pageId={getPageId()}
              settingsType="style"
              settingsData={{
                borderWidth: localColumn?.settings?.borderWidth || 0,
                borderColor: localColumn?.settings?.borderColor || '#e2e8f0',
                borderStyle: localColumn?.settings?.borderStyle || 'solid',
                borderRadius: localColumn?.settings?.borderRadius || { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
                shadowEnabled: localColumn?.settings?.shadowEnabled || false,
                shadowX: localColumn?.settings?.shadowX || 0,
                shadowY: localColumn?.settings?.shadowY || 0,
                shadowBlur: localColumn?.settings?.shadowBlur || 0,
                shadowSpread: localColumn?.settings?.shadowSpread || 0,
                shadowColor: localColumn?.settings?.shadowColor || 'rgba(0, 0, 0, 0.1)',
                shadowInset: localColumn?.settings?.shadowInset || false
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

export default ColumnStyleSettings; // Fixed JSX syntax
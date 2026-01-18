import React, { useState, useEffect, useCallback, useRef } from 'react';
import SelectFieldComponent from '../../Fields/SelectFieldComponent';
import RangeFieldComponent from '../../Fields/RangeFieldComponent';
import DisplayModeField from '../../Fields/DisplayModeField';
import FlexDirectionField from '../../Fields/FlexDirectionField';
import JustifyContentField from '../../Fields/JustifyContentField';
import AlignItemsField from '../../Fields/AlignItemsField';
import FlexGapField from '../../Fields/FlexGapField';
import FlexWrapField from '../../Fields/FlexWrapField';
import ResponsiveFieldWrapper from '../../Fields/ResponsiveFieldWrapper';
import SaveAllSettingsButton from './SaveAllSettingsButton';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const ColumnGeneralSettings = ({ column, onUpdate, onWidgetUpdate }) => {
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

  const updateMultipleColumnSettings = (settingsObject) => {
    const updatedColumn = {
      ...localColumn,
      settings: {
        ...localColumn.settings,
        ...settingsObject
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
    const { currentPageId } = usePageBuilderStore.getState();
    if (currentPageId) return currentPageId;
    
    const match = window.location.pathname.match(/\/page-builder\/edit\/(\d+)/);
    if (match && match[1]) return parseInt(match[1]);
    
    return window.currentPageId || column?.pageId || 1;
  };

  const handleSaveSuccess = (result) => {
    console.log('[ColumnGeneralSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[ColumnGeneralSettings] Save failed:', error);
  };

  const displayType = localColumn?.settings?.display || 'block';
  const isFlexDisplay = displayType === 'flex';

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Items Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Items</h4>

            <div className="space-y-4">
              {/* Display Mode Selector */}
              <DisplayModeField
                value={displayType}
                onChange={(value) => updateColumnSetting('display', value)}
              />

              {/* Flex Controls - Only show when display is flex */}
              {isFlexDisplay && (
                <>
                  {/* Direction */}
                  <ResponsiveFieldWrapper
                    label="Direction"
                    value={localColumn?.settings?.flexDirection}
                    onChange={(value) => updateColumnSetting('flexDirection', value)}
                    defaultValue="column"
                  >
                    <FlexDirectionField />
                  </ResponsiveFieldWrapper>

                  {/* Justify Content */}
                  <ResponsiveFieldWrapper
                    label="Justify Content"
                    value={localColumn?.settings?.justifyContent}
                    onChange={(value) => updateColumnSetting('justifyContent', value)}
                    defaultValue="flex-start"
                  >
                    <JustifyContentField />
                  </ResponsiveFieldWrapper>

                  {/* Align Items */}
                  <ResponsiveFieldWrapper
                    label="Align Items"
                    value={localColumn?.settings?.alignItems}
                    onChange={(value) => updateColumnSetting('alignItems', value)}
                    defaultValue="stretch"
                  >
                    <AlignItemsField />
                  </ResponsiveFieldWrapper>

                  {/* Gaps */}
                  <ResponsiveFieldWrapper
                    label="Gaps"
                    value={localColumn?.settings?.gap}
                    onChange={(value) => updateColumnSetting('gap', value)}
                    defaultValue="0px"
                  >
                    <FlexGapField />
                  </ResponsiveFieldWrapper>

                  {/* Wrap */}
                  <ResponsiveFieldWrapper
                    label="Wrap"
                    value={localColumn?.settings?.flexWrap}
                    onChange={(value) => updateColumnSetting('flexWrap', value)}
                    defaultValue="nowrap"
                  >
                    <FlexWrapField />
                  </ResponsiveFieldWrapper>
                </>
              )}
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

      {/* Sticky save button at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <SaveAllSettingsButton
          entity={localColumn}
          pageId={getPageId()}
          onSaveSuccess={handleSaveSuccess}
          onSaveError={handleSaveError}
        />
      </div>
    </div>
  );
};

export default ColumnGeneralSettings;
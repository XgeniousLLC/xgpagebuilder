import React from 'react';
import RangeFieldComponent from '../../Fields/RangeFieldComponent';
import NumberFieldComponent from '../../Fields/NumberFieldComponent';
import SelectFieldComponent from '../../Fields/SelectFieldComponent';
import ToggleFieldComponent from '../../Fields/ToggleFieldComponent';
import TextFieldComponent from '../../Fields/TextFieldComponent';
import sectionSettingsMapper from '@/Services/sectionSettingsMapper';
import pageBuilderCSSService from '@/Services/pageBuilderCSSService';
import SaveAllSettingsButton from './SaveAllSettingsButton';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const SectionGeneralSettings = ({ container, onUpdate, onWidgetUpdate }) => {
  const updateSetting = (path, value) => {
    const pathArray = path.split('.');

    const updatedContainer = {
      ...container,
      settings: {
        ...container.settings,
        [pathArray[pathArray.length - 1]]: value
      }
    };

    // Update state
    onUpdate(prev => ({
      ...prev,
      containers: prev.containers.map(c =>
        c.id === container.id ? updatedContainer : c
      )
    }));

    onWidgetUpdate(updatedContainer);

    // Generate and apply CSS for layout changes
    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-container-id="${container.id}"]`);
      if (element) {
        const transformedSettings = sectionSettingsMapper.transformToCSS(updatedContainer.settings);
        const responsiveSettings = sectionSettingsMapper.transformResponsive(
          updatedContainer.settings,
          updatedContainer.responsiveSettings || {}
        );

        pageBuilderCSSService.applySettings(
          element,
          'section',
          container.id,
          transformedSettings,
          responsiveSettings
        );
      }
    });
  };

  const updateColumnStructure = (columns, gridTemplate = null) => {
    // Create exactly the specified number of columns, no more, no less
    const newColumns = [];
    const timestamp = Date.now();
    
    // Build exactly the number of columns requested
    for (let i = 0; i < columns; i++) {
      // Preserve existing column data if available
      const existingColumn = container.columns && container.columns[i];
      newColumns.push({
        id: existingColumn?.id || `column-${container.id}-${i}-${timestamp}`,
        width: gridTemplate ? 'auto' : `${100 / columns}%`,
        widgets: existingColumn?.widgets ? [...existingColumn.widgets] : [],
        settings: existingColumn?.settings ? {...existingColumn.settings} : {}
      });
    }

    const updatedSettings = {
      ...container.settings,
      gridTemplate: gridTemplate,
      columnCount: columns
    };

    // Create a completely new container object to force re-render
    const updatedContainer = {
      ...container,
      columns: newColumns,
      settings: updatedSettings
    };

    // Completely replace the container with new column structure
    onUpdate(prev => ({
      ...prev,
      containers: prev.containers.map(c =>
        c.id === container.id ? updatedContainer : c
      )
    }));

    // Update the selected widget immediately
    onWidgetUpdate(updatedContainer);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Column Structure Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Column Structure</h4>
          <div className="grid grid-cols-2 gap-2">
            {/* 1 Column */}
            <button
              onClick={() => updateColumnStructure(1)}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                (!container.settings?.gridTemplate && container.columns?.length === 1)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="24" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">1 Column</span>
            </button>

            {/* 2 Columns */}
            <button
              onClick={() => updateColumnStructure(2)}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                (!container.settings?.gridTemplate && container.columns?.length === 2)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="11" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="13" width="11" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">2 Columns</span>
            </button>

            {/* 3 Columns */}
            <button
              onClick={() => updateColumnStructure(3)}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                (!container.settings?.gridTemplate && container.columns?.length === 3)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="7" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="8.5" width="7" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="17" width="7" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">3 Columns</span>
            </button>

            {/* 4 Columns */}
            <button
              onClick={() => updateColumnStructure(4)}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                (!container.settings?.gridTemplate && container.columns?.length === 4)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="6.33" width="5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="12.67" width="5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="19" width="5" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">4 Columns</span>
            </button>

            {/* 5 Columns */}
            <button
              onClick={() => updateColumnStructure(5)}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                (!container.settings?.gridTemplate && container.columns?.length === 5)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="4" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="5" width="4" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="10" width="4" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="15" width="4" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="20" width="4" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">5 Columns</span>
            </button>

            {/* 6 Columns */}
            <button
              onClick={() => updateColumnStructure(6)}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                (!container.settings?.gridTemplate && container.columns?.length === 6)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="3.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="4.17" width="3.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="8.33" width="3.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="12.5" width="3.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="16.67" width="3.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="20.83" width="3.17" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">6 Columns</span>
            </button>

            {/* 30-70 Split */}
            <button
              onClick={() => updateColumnStructure(2, '30% 70%')}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                container.settings?.gridTemplate === '30% 70%'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="7" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="8.5" width="15.5" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">30% - 70%</span>
            </button>

            {/* 70-30 Split */}
            <button
              onClick={() => updateColumnStructure(2, '70% 30%')}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                container.settings?.gridTemplate === '70% 30%'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="15.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="17" width="7" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">70% - 30%</span>
            </button>

            {/* 25-50-25 Split */}
            <button
              onClick={() => updateColumnStructure(3, '25% 50% 25%')}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                container.settings?.gridTemplate === '25% 50% 25%'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="5.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="6.5" width="11" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="18.5" width="5.5" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">25% - 50% - 25%</span>
            </button>

            {/* 40-60 Split */}
            <button
              onClick={() => updateColumnStructure(2, '40% 60%')}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                container.settings?.gridTemplate === '40% 60%'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="9" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="10.5" width="13.5" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">40% - 60%</span>
            </button>

            {/* 60-40 Split */}
            <button
              onClick={() => updateColumnStructure(2, '60% 40%')}
              className={`p-2 border-2 rounded-lg transition-colors flex flex-col items-center ${
                container.settings?.gridTemplate === '60% 40%'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <svg className="w-6 h-3 mb-1" viewBox="0 0 24 12" fill="currentColor">
                <rect width="13.5" height="12" rx="1" className="fill-current opacity-30" />
                <rect x="15" width="9" height="12" rx="1" className="fill-current opacity-30" />
              </svg>
              <span className="text-xs font-medium">60% - 40%</span>
            </button>
          </div>
        </div>

        {/* Enhanced Column Gap - Simplified */}
        <div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Column Gap</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {parseInt(container.settings?.gap || '20px') || 20}
                </span>
                <select
                  value={container.settings?.gap?.match(/[a-zA-Z%]+$/)?.[0] || 'px'}
                  onChange={(e) => {
                    const unit = e.target.value;
                    const value = parseInt(container.settings?.gap || '20px') || 20;
                    updateSetting('settings.gap', `${value}${unit}`);
                  }}
                  className="text-xs px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                  <option value="em">em</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={parseInt(container.settings?.gap || '20px') || 20}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  const unit = container.settings?.gap?.match(/[a-zA-Z%]+$/)?.[0] || 'px';
                  updateSetting('settings.gap', `${value}${unit}`);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(parseInt(container.settings?.gap || '20px') || 20)}%, #E5E7EB ${(parseInt(container.settings?.gap || '20px') || 20)}%, #E5E7EB 100%)`
                }}
              />
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3B82F6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                input[type="range"]::-moz-range-thumb {
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3B82F6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Enhanced Section Layout Settings */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Layout Settings</h4>
          
          {/* Content Width */}
          <div className="mb-4">
            <SelectFieldComponent
              fieldKey="content_width"
              fieldConfig={{
                label: 'Content Width',
                options: {
                  'boxed': 'Boxed (Contained)',
                  'full_width': 'Full Width',
                  'full_width_contained': 'Full Width with Contained Content'
                },
                default: 'boxed'
              }}
              value={container.settings?.contentWidth || 'boxed'}
              onChange={(value) => updateSetting('settings.contentWidth', value)}
            />
          </div>

          {/* Max Width - Simplified Slider */}
          <div className="mb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Maximum Width (px)</label>
                <span className="text-sm font-medium text-gray-900">
                  {container.settings?.maxWidth || 1200}px
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min={300}
                  max={1920}
                  step={50}
                  value={container.settings?.maxWidth || 1200}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateSetting('settings.maxWidth', value);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((container.settings?.maxWidth || 1200) - 300) / (1920 - 300) * 100}%, #E5E7EB ${((container.settings?.maxWidth || 1200) - 300) / (1920 - 300) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                  input[type="range"]::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky save button at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <SaveAllSettingsButton
          entity={{
            id: container.id,
            type: 'section',
            settings: container.settings || {},
            responsiveSettings: container.responsiveSettings || {}
          }}
          pageId={(() => {
            const { currentPageId } = usePageBuilderStore.getState();
            if (currentPageId) return currentPageId;
            
            const match = window.location.pathname.match(/\/page-builder\/edit\/(\d+)/);
            if (match && match[1]) return parseInt(match[1]);
            
            return window.currentPageId || 1;
          })()}
          onSaveSuccess={(result) => {
            console.log('[SectionGeneralSettings] Save successful:', result);
          }}
          onSaveError={(error) => {
            console.error('[SectionGeneralSettings] Save failed:', error);
          }}
        />
      </div>
      </div>
    </div>
  );
};

export default SectionGeneralSettings;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PhpFieldRenderer from '@/Components/PageBuilder/Fields/PhpFieldRenderer';
import sectionSettingsMapper from '@/Services/sectionSettingsMapper';
import pageBuilderCSSService from '@/Services/pageBuilderCSSService';
import SaveAllSettingsButton from './SaveAllSettingsButton';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const SectionStyleSettings = ({ container, onUpdate, onWidgetUpdate }) => {
  const { updateContainer } = usePageBuilderStore();
  const [localContainer, setLocalContainer] = useState(container);
  const debounceTimeoutRef = useRef(null);

  // Sync local container when prop changes
  useEffect(() => {
    setLocalContainer(container);
  }, [container]);

  // Debounced store update function
  const debouncedStoreUpdate = useCallback((updatedContainer) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for 500ms delay
    debounceTimeoutRef.current = setTimeout(() => {
      // Update the container in the store
      updateContainer(container.id, updatedContainer);

      // Update the selected container
      onWidgetUpdate(updatedContainer);
    }, 500);
  }, [container.id, updateContainer, onWidgetUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const updateSetting = (path, value) => {
    const pathArray = path.split('.');

    const updatedContainer = {
      ...localContainer,
      settings: {
        ...localContainer.settings,
        [pathArray[pathArray.length - 1]]: value
      }
    };

    // Update local state immediately for visual feedback
    setLocalContainer(updatedContainer);

    // Update parent state for immediate UI response
    onUpdate(prev => ({
      ...prev,
      containers: prev.containers.map(c =>
        c.id === container.id ? updatedContainer : c
      )
    }));

    // Debounce the store update
    debouncedStoreUpdate(updatedContainer);

    // Generate and apply CSS (preserve existing CSS logic)
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

  const getPageId = () => {
    const { currentPageId } = usePageBuilderStore.getState();
    if (currentPageId) return currentPageId;
    
    const match = window.location.pathname.match(/\/page-builder\/edit\/(\d+)/);
    if (match && match[1]) return parseInt(match[1]);
    
    return window.currentPageId || container?.pageId || 1;
  };

  const handleSaveSuccess = (result) => {
    console.log('[SectionStyleSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[SectionStyleSettings] Save failed:', error);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Spacing</h4>
            <div className="space-y-4">
              <PhpFieldRenderer
                fieldKey="padding"
                fieldConfig={{
                  type: 'spacing',
                  label: 'Padding',
                  responsive: true,
                  default: '20px 20px 20px 20px',
                  units: ['px', 'em', 'rem', '%'],
                  linked: false,
                  sides: ['top', 'right', 'bottom', 'left'],
                  min: 0,
                  max: 1000,
                  step: 1
                }}
                value={localContainer.settings?.padding || '20px 20px 20px 20px'}
                onChange={(value) => updateSetting('settings.padding', value)}
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
                value={localContainer.settings?.margin || '0px 0px 0px 0px'}
                onChange={(value) => updateSetting('settings.margin', value)}
              />
            </div>
          </div>

          {/* Enhanced Background Group */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Background</h4>
            <div className="space-y-4">
              <PhpFieldRenderer
                fieldKey="section_background"
                fieldConfig={{
                  type: 'background_group',
                  label: 'Section Background',
                  responsive: true,
                  default: {
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
                    },
                    hover: {
                      color: ''
                    }
                  }
                }}
                value={localContainer.settings?.sectionBackground || {
                  type: 'none',
                  color: '#ffffff'
                }}
                onChange={(value) => updateSetting('settings.sectionBackground', value)}
              />
            </div>
          </div>

          {/* Border & Shadow Group */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Border & Shadow</h4>
            <div className="space-y-4">
              <PhpFieldRenderer
                fieldKey="border_shadow_group"
                fieldConfig={{
                  type: 'border_shadow_group',
                  label: 'Border & Shadow',
                  responsive: true,
                  showBorder: true,
                  showShadow: true,
                  default: {
                    border: {
                      width: { top: 0, right: 0, bottom: 0, left: 0 },
                      style: 'solid',
                      color: '#e2e8f0',
                      radius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, unit: 'px' }
                    },
                    shadow: {
                      enabled: false,
                      horizontal: 0,
                      vertical: 4,
                      blur: 6,
                      spread: 0,
                      color: 'rgba(0, 0, 0, 0.1)',
                      inset: false
                    }
                  }
                }}
                value={localContainer.settings?.borderShadow || {
                  border: { width: { top: 0, right: 0, bottom: 0, left: 0 } },
                  shadow: { enabled: false }
                }}
                onChange={(value) => updateSetting('settings.borderShadow', value)}
              />
            </div>
          </div>

          {/* Typography Group */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Typography</h4>
            <div className="space-y-4">
              <PhpFieldRenderer
                fieldKey="section_typography"
                fieldConfig={{
                  type: 'typography_group',
                  label: 'Section Typography',
                  responsive: true,
                  default: {
                    fontSize: '16px',
                    fontWeight: '400',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    letterSpacing: '0',
                    textTransform: 'none',
                    textDecoration: 'none',
                    textAlign: 'left'
                  }
                }}
                value={localContainer.settings?.sectionTypography || {
                  fontSize: '16px',
                  fontWeight: '400',
                  lineHeight: '1.5'
                }}
                onChange={(value) => updateSetting('settings.sectionTypography', value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save button at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <SaveAllSettingsButton
          entity={localContainer}
          pageId={getPageId()}
          onSaveSuccess={handleSaveSuccess}
          onSaveError={handleSaveError}
        />
      </div>
    </div>
  );
};

export default SectionStyleSettings;
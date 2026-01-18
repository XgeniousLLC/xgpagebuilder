import React, { useState, useEffect, useCallback, useRef } from 'react';
import TextFieldComponent from '../../Fields/TextFieldComponent';
import TextareaFieldComponent from '../../Fields/TextareaFieldComponent';
import SelectFieldComponent from '../../Fields/SelectFieldComponent';
import ToggleFieldComponent from '../../Fields/ToggleFieldComponent';
import NumberFieldComponent from '../../Fields/NumberFieldComponent';
import CheckboxFieldComponent from '../../Fields/CheckboxFieldComponent';
import sectionSettingsMapper from '@/Services/sectionSettingsMapper';
import pageBuilderCSSService from '@/Services/pageBuilderCSSService';
import SaveAllSettingsButton from './SaveAllSettingsButton';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const SectionAdvancedSettings = ({ container, onUpdate, onWidgetUpdate }) => {
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
  // Generate consistent section ID based on container
  const generateConsistentSectionId = () => {
    // Use container ID to create consistent, predictable section IDs
    if (container.id) {
      const containerId = container.id.toString();
      
      // Clean the container ID - remove special characters and convert to lowercase
      let cleanId = containerId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      // Remove 'section' prefix if it exists to avoid redundancy
      if (cleanId.startsWith('section')) {
        cleanId = cleanId.substring(7); // Remove 'section' (7 characters)
      }
      
      // If cleanId is empty after removing 'section', use a fallback
      if (!cleanId) {
        cleanId = Date.now().toString().slice(-8);
      }
      
      return `section-${cleanId}`;
    }
    // Fallback to simple incremental ID
    return `section-${Date.now().toString().slice(-8)}`;
  };

  // Auto-generate section ID on mount if not exists
  useEffect(() => {
    if (!localContainer.settings?.htmlId) {
      const consistentId = generateConsistentSectionId();
      updateSetting('settings.htmlId', consistentId);
    }
  }, [container.id]); // Only run when container ID changes

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

    // Generate and apply CSS for advanced settings changes (visibility, animation, custom CSS)
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

        // Handle custom CSS injection
        if (value && pathArray[pathArray.length - 1] === 'customCSS') {
          pageBuilderCSSService.injectCSS(`section-${container.id}-custom`, value);
        }
      }
    });
  };

  const getPageId = () => {
    const match = window.location.pathname.match(/\/admin\/page-builder\/(.+)$/);
    if (match) {
      const slug = match[1];
      if (/^\d+$/.test(slug)) {
        return parseInt(slug);
      }
    }
    return window.currentPageId || container?.pageId || 1;
  };

  const handleSaveSuccess = (result) => {
    console.log('[SectionAdvancedSettings] Save successful:', result);
  };

  const handleSaveError = (error) => {
    console.error('[SectionAdvancedSettings] Save failed:', error);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable settings content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Responsive Settings - Moved after Visibility */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Responsive Settings</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <ToggleFieldComponent
                    fieldKey="show_desktop"
                    fieldConfig={{
                      label: 'Show on Desktop',
                      default: true
                    }}
                    value={localContainer.settings?.hideOnDesktop !== true}
                    onChange={(value) => updateSetting('settings.hideOnDesktop', !value)}
                  />
                </div>
                <div>
                  <ToggleFieldComponent
                    fieldKey="show_tablet"
                    fieldConfig={{
                      label: 'Show on Tablet',
                      default: true
                    }}
                    value={localContainer.settings?.hideOnTablet !== true}
                    onChange={(value) => updateSetting('settings.hideOnTablet', !value)}
                  />
                </div>
                <div>
                  <ToggleFieldComponent
                    fieldKey="show_mobile"
                    fieldConfig={{
                      label: 'Show on Mobile',
                      default: true
                    }}
                    value={localContainer.settings?.hideOnMobile !== true}
                    onChange={(value) => updateSetting('settings.hideOnMobile', !value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Custom CSS</h4>
            <div className="space-y-4">
              <div>
                <TextFieldComponent
                  fieldKey="css_class"
                  fieldConfig={{
                    label: 'CSS Class',
                    placeholder: 'custom-class-name',
                    default: ''
                  }}
                  value={localContainer.settings?.cssClass || ''}
                  onChange={(value) => updateSetting('settings.cssClass', value)}
                />
              </div>

              {/* Section ID - Consistent Auto-generated */}
              <div>
                <TextFieldComponent
                  fieldKey="html_id"
                  fieldConfig={{
                    label: 'Section ID',
                    placeholder: 'section-12345',
                    default: ''
                  }}
                  value={localContainer.settings?.htmlId || generateConsistentSectionId()}
                  onChange={(value) => updateSetting('settings.htmlId', value)}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Consistent ID for database storage, CSS generation, and JavaScript targeting
                </div>
              </div>

              <div>
                <TextareaFieldComponent
                  fieldKey="custom_css"
                  fieldConfig={{
                    label: 'Custom CSS',
                    placeholder: '/* Custom CSS rules */',
                    rows: 6,
                    default: ''
                  }}
                  value={localContainer.settings?.customCSS || ''}
                  onChange={(value) => updateSetting('settings.customCSS', value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Animation</h4>
            <div className="space-y-4">
              <div>
                <SelectFieldComponent
                  fieldKey="animation"
                  fieldConfig={{
                    label: 'Animation Type',
                    options: {
                      'none': 'None',
                      'fade-in': 'Fade In',
                      'slide-up': 'Slide Up',
                      'slide-down': 'Slide Down',
                      'slide-left': 'Slide Left',
                      'slide-right': 'Slide Right',
                      'zoom-in': 'Zoom In',
                      'bounce': 'Bounce'
                    },
                    default: 'none'
                  }}
                  value={localContainer.settings?.animation || 'none'}
                  onChange={(value) => updateSetting('settings.animation', value)}
                />
              </div>

              {localContainer.settings?.animation && localContainer.settings.animation !== 'none' && (
                <div>
                  <NumberFieldComponent
                    fieldKey="animation_duration"
                    fieldConfig={{
                      label: 'Animation Duration (ms)',
                      min: 100,
                      max: 3000,
                      step: 100,
                      default: 500,
                      placeholder: '500'
                    }}
                    value={localContainer.settings?.animationDuration || 500}
                    onChange={(value) => updateSetting('settings.animationDuration', value)}
                  />
                </div>
              )}
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

export default SectionAdvancedSettings;
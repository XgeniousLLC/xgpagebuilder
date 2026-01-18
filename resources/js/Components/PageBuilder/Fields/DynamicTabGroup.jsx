import React, { useState, useCallback } from 'react';
import PhpFieldRenderer from './PhpFieldRenderer';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

/**
 * DynamicTabGroup - Generic tabbed interface for field groups
 * 
 * Supports any configuration of tabs with fields, perfect for:
 * - Style states (normal, hover, active, focus)
 * - Responsive breakpoints (desktop, tablet, mobile)  
 * - Custom tab organizations
 */
const DynamicTabGroup = ({ 
  tabs = {}, 
  defaultTab = 'normal',
  allowCopy = true,
  tabLabels = {},
  tabIcons = {},
  showLabels = true,
  tabStyle = 'default',
  value = {},
  onChange,
  className = ''
}) => {
  // Check if this is a responsive tab group (desktop/tablet/mobile)
  const tabKeys = Object.keys(tabs);
  const isResponsiveTabGroup = tabKeys.length === 3 &&
    tabKeys.includes('desktop') &&
    tabKeys.includes('tablet') &&
    tabKeys.includes('mobile');

  // Use global device state for responsive tabs, local state for others
  const { currentDevice, setCurrentDevice } = usePageBuilderStore();
  const [localActiveTab, setLocalActiveTab] = useState(defaultTab);

  // Determine which state to use
  const activeTab = isResponsiveTabGroup ? currentDevice : localActiveTab;
  const setActiveTab = isResponsiveTabGroup ? setCurrentDevice : setLocalActiveTab;


  // Get display label for tab
  const getTabLabel = (tabKey) => {
    if (tabLabels[tabKey]) {
      return tabLabels[tabKey];
    }
    if (tabs[tabKey]?.label) {
      return tabs[tabKey].label;
    }
    return ucfirst(tabKey.replace(/[_-]/g, ' '));
  };

  // Helper to capitalize first letter
  const ucfirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Update value for active tab
  const handleFieldChange = useCallback((fieldKey, fieldValue) => {
    const newValue = {
      ...value,
      [activeTab]: {
        ...value[activeTab],
        [fieldKey]: fieldValue
      }
    };
    onChange?.(newValue);
  }, [value, activeTab, onChange]);


  // Reset current tab values
  const resetTabValues = useCallback(() => {
    const newValue = {
      ...value,
      [activeTab]: {}
    };
    onChange?.(newValue);
  }, [value, activeTab, onChange]);

  // Get tab style classes
  const getTabStyleClasses = () => {
    const baseClasses = "flex items-center px-3 py-2 text-sm font-medium transition-colors";
    
    switch (tabStyle) {
      case 'pills':
        return {
          container: "flex space-x-1 bg-gray-100 p-1 rounded-lg",
          tab: `${baseClasses} rounded-md`,
          active: "bg-white text-gray-900 shadow-sm",
          inactive: "text-gray-600 hover:text-gray-900"
        };
      case 'underline':
        return {
          container: "flex space-x-4 border-b border-gray-200",
          tab: `${baseClasses} border-b-2 border-transparent`,
          active: "border-blue-500 text-blue-600",
          inactive: "text-gray-600 hover:text-gray-900 hover:border-gray-300"
        };
      default:
        return {
          container: "flex space-x-1 bg-gray-100 p-1 rounded-lg",
          tab: `${baseClasses} rounded-md`,
          active: "bg-white text-gray-900 shadow-sm",
          inactive: "text-gray-600 hover:text-gray-900"
        };
    }
  };

  const tabStyles = getTabStyleClasses();
  const currentTabData = tabs[activeTab];


  if (!currentTabData) {
    return (
      <div className="text-sm text-red-600">
        Invalid tab configuration: {activeTab}
        <br />
        Available tabs: {tabKeys.join(', ')}
      </div>
    );
  }

  return (
    <div className={`dynamic-tab-group space-y-4 ${className}`}>
      {/* Tab Headers */}
      <div className="flex items-center justify-between">
        <div className={tabStyles.container}>
          {tabKeys.map((tabKey) => {
            const isActive = activeTab === tabKey;
            
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className={`${tabStyles.tab} ${
                  isActive ? tabStyles.active : tabStyles.inactive
                }`}
                title={getTabLabel(tabKey)}
              >
                {showLabels && getTabLabel(tabKey)}
              </button>
            );
          })}
        </div>

      </div>


      {/* Tab Content */}
      <div className="tab-content space-y-3">
        {/* Render direct fields in tab */}
        {Object.entries(currentTabData.fields || {}).map(([fieldKey, fieldConfig]) => (
          <PhpFieldRenderer
            key={`${activeTab}-${fieldKey}`}
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value[activeTab]?.[fieldKey]}
            onChange={(fieldValue) => handleFieldChange(fieldKey, fieldValue)}
          />
        ))}

        {/* Render groups within tab */}
        {Object.entries(currentTabData.groups || {}).map(([groupKey, groupConfig]) => (
          <div key={`${activeTab}-group-${groupKey}`} className="border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Group Label */}
            {groupConfig.label && (
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">
                {groupConfig.label}
              </h4>
            )}

            {/* Group Fields */}
            <div className="space-y-3">
              {Object.entries(groupConfig.fields || {}).map(([fieldKey, fieldConfig]) => (
                <PhpFieldRenderer
                  key={`${activeTab}-${groupKey}-${fieldKey}`}
                  fieldKey={fieldKey}
                  fieldConfig={fieldConfig}
                  value={value[activeTab]?.[groupKey]?.[fieldKey]}
                  onChange={(fieldValue) => {
                    const newValue = {
                      ...value,
                      [activeTab]: {
                        ...value[activeTab],
                        [groupKey]: {
                          ...value[activeTab]?.[groupKey],
                          [fieldKey]: fieldValue
                        }
                      }
                    };
                    onChange?.(newValue);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DynamicTabGroup;
import React from 'react';
import PhpFieldRenderer from './PhpFieldRenderer';

/**
 * PhpFieldGroupRenderer - Renders PHP widget field groups
 * 
 * This component handles rendering field groups with consistent styling
 * and proper handling of nested data structures.
 */
const PhpFieldGroupRenderer = ({ 
  fields, 
  values, 
  onUpdate, 
  basePath = '' 
}) => {
  if (!fields || typeof fields !== 'object') {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No fields available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(fields).map(([groupKey, groupConfig]) => {
        // Check if this is a group field
        if (groupConfig.type === 'group' && groupConfig.fields) {
          return (
            <div key={groupKey} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                {groupConfig.label}
              </h3>
              <div className="space-y-4">
                {Object.entries(groupConfig.fields).map(([fieldKey, fieldConfig]) => (
                  <PhpFieldRenderer
                    key={`${groupKey}.${fieldKey}`}
                    fieldKey={fieldKey}
                    fieldConfig={fieldConfig}
                    value={values?.[groupKey]?.[fieldKey]}
                    onChange={(value) => onUpdate(`${basePath}${groupKey}.${fieldKey}`, value)}
                  />
                ))}
              </div>
            </div>
          );
        } else {
          // Handle non-group fields (fallback)
          return (
            <PhpFieldRenderer
              key={groupKey}
              fieldKey={groupKey}
              fieldConfig={groupConfig}
              value={values?.[groupKey]}
              onChange={(value) => onUpdate(`${basePath}${groupKey}`, value)}
            />
          );
        }
      })}
    </div>
  );
};

export default PhpFieldGroupRenderer;
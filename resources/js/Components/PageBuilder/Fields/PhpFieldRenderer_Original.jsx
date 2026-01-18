import React, { useState, useRef, lazy, Suspense } from 'react';
import { Monitor, Tablet, Smartphone, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Copy, Loader, Check } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ButtonPresetSelector from './ButtonPresetSelector';
import EnhancedGradientPicker from './EnhancedGradientPicker';
import AlignmentField from './AlignmentField';
import BorderShadowGroup from './BorderShadowGroup';
import DynamicTabGroup from './DynamicTabGroup';
import DividerField from './DividerField';

// Lazy load heavy components to reduce initial bundle size
const WysiwygEditor = lazy(() => import('./WysiwygEditor'));
const EnhancedBackgroundPicker = lazy(() => import('./EnhancedBackgroundPicker'));
const EnhancedTypographyPicker = lazy(() => import('./EnhancedTypographyPicker'));
const EnhancedColorPicker = lazy(() => import('./EnhancedColorPicker'));
const EnhancedDimensionPicker = lazy(() => import('./EnhancedDimensionPicker'));
const EnhancedLinkPicker = lazy(() => import('./EnhancedLinkPicker'));

/**
 * PhpFieldRenderer - Renders dynamic PHP widget fields
 *
 * This component handles rendering various field types from PHP widget definitions
 * with consistent styling and behavior across all settings panels.
 */
const PhpFieldRenderer = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    type,
    label,
    placeholder,
    options,
    default: defaultValue,
    required,
    description,
    min,
    max,
    step,
    rows,
    icon_set,
    searchable,
    clearable,
    condition
  } = fieldConfig;

  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || label}
            required={required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={rows || 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || label}
            required={required}
          />
        );

      case 'select':
        return (
          <select
            value={value || defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={required}
          >
            {options && Object.entries(options).map(([optionValue, optionLabel]) => (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={fieldKey}
              type="checkbox"
              checked={value !== undefined ? value : (defaultValue || false)}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={fieldKey} className="ml-2 block text-sm text-gray-700">
              {label}
            </label>
          </div>
        );

      case 'toggle':
        const isToggled = value !== undefined ? value : (defaultValue || false);
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
              type="button"
              onClick={() => onChange(!isToggled)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isToggled ? 'bg-blue-600' : 'bg-gray-200'}
              `}
              role="switch"
              aria-checked={isToggled}
              aria-labelledby={`${fieldKey}-label`}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${isToggled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || defaultValue || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || label}
            required={required}
            min={min}
            max={max}
            step={step}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value || defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder || 'https://example.com'}
            required={required}
          />
        );

      case 'color':
        return (
          <Suspense fallback={<div className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>}>
            <EnhancedColorPicker
              value={value || defaultValue || '#000000'}
              onChange={onChange}
            />
          </Suspense>
        );

      case 'gradient':
        return (
          <EnhancedGradientPicker
            value={value || defaultValue}
            onChange={onChange}
          />
        );

      case 'background_group':
        return (
          <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 rounded"></div>}>
            <EnhancedBackgroundPicker 
              key={`bg-${fieldKey || Math.random()}`} 
              value={value || defaultValue} 
              onChange={onChange}
            />
          </Suspense>
        );
      
      case 'typography_group':
        return (
          <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 rounded"></div>}>
            <EnhancedTypographyPicker 
              key={`typo-${fieldKey || Math.random()}`} 
              value={value || defaultValue} 
              onChange={onChange}
            />
          </Suspense>
        );

      case 'range':
        const rangeMin = min || 0;
        const rangeMax = max || 100;
        const rangeStep = step || 1;
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              step={rangeStep}
              value={value || defaultValue || rangeMin}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{rangeMin}</span>
              <span className="font-medium">{value || defaultValue || rangeMin}</span>
              <span>{rangeMax}</span>
            </div>
          </div>
        );

      case 'dimension':
      case 'spacing':
        return (
          <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 rounded"></div>}>
            <EnhancedDimensionPicker
              value={value || defaultValue}
              onChange={onChange}
              sides={fieldConfig.sides || ['top', 'right', 'bottom', 'left']}
              units={fieldConfig.units || ['px', 'em', 'rem', '%']}
              allowNegative={fieldConfig.allow_negative || false}
              min={fieldConfig.min || 0}
              max={fieldConfig.max || 200}
              step={fieldConfig.step || 1}
              linked={fieldConfig.linked || false}
              showLabels={fieldConfig.show_labels !== false}
              responsive={fieldConfig.responsive || false}
              label={label || (type === 'spacing' ? 'Spacing' : 'Dimension')}
            />
          </Suspense>
        );

      case 'wysiwyg':
        return (
          <div className="space-y-2">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[200px] border border-gray-300 rounded-md">
                <Loader className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading editor...</span>
              </div>
            }>
              <WysiwygEditor
                value={value || defaultValue || ''}
                onChange={onChange}
                placeholder={placeholder || 'Enter content...'}
                toolbar={fieldConfig.toolbar}
              />
            </Suspense>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        );

      case 'alignment':
        return (
          <AlignmentField
            value={value}
            onChange={onChange}
            alignments={fieldConfig.alignments || ['none', 'left', 'center', 'right']}
            defaultValue={defaultValue}
          />
        );

      case 'border_shadow_group':
        try {
          return (
            <BorderShadowGroup
              value={value}
              onChange={onChange}
              borderStyles={fieldConfig.border_styles || {}}
              shadowPresets={fieldConfig.shadow_presets || {}}
              perSideControls={fieldConfig.per_side_controls !== false}
              multipleShadows={fieldConfig.multiple_shadows || false}
              maxShadows={fieldConfig.max_shadows || 5}
            />
          );
        } catch (error) {
          console.error('BorderShadowGroup error:', error);
          return (
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">
                BorderShadowGroup Error
              </div>
              <div className="text-xs text-red-500 mt-1">
                {error.message || 'Component failed to render'}
              </div>
            </div>
          );
        }

      case 'tab_group':
        try {
          return (
            <DynamicTabGroup
              tabs={fieldConfig.tabs || {}}
              defaultTab={fieldConfig.default_tab || 'normal'}
              allowCopy={fieldConfig.allow_copy !== false}
              tabLabels={fieldConfig.tab_labels || {}}
              tabIcons={fieldConfig.tab_icons || {}}
              showLabels={fieldConfig.show_labels !== false}
              tabStyle={fieldConfig.tab_style || 'default'}
              value={value}
              onChange={onChange}
            />
          );
        } catch (error) {
          console.error('DynamicTabGroup error:', error);
          return (
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">
                Tab Group Error
              </div>
              <div className="text-xs text-red-500 mt-1">
                {error.message || 'Component failed to render'}
              </div>
            </div>
          );
        }

      case 'link_group':
        try {
          return (
            <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>}>
              <EnhancedLinkPicker
                value={value || fieldConfig.value}
                onChange={onChange}
                enabledLinkTypes={fieldConfig.enabled_link_types || ['internal', 'external', 'email', 'phone', 'file']}
                enableAdvancedOptions={fieldConfig.enable_advanced_options !== false}
                enableSEOControls={fieldConfig.enable_seo_controls !== false}
                enableUTMTracking={fieldConfig.enable_utm_tracking || false}
                enableCustomAttributes={fieldConfig.enable_custom_attributes !== false}
                enableLinkTesting={fieldConfig.enable_link_testing !== false}
                enableResponsiveBehavior={fieldConfig.enable_responsive_behavior || false}
                allowedTargets={fieldConfig.allowed_targets || { '_self': 'Same Window', '_blank': 'New Window/Tab', '_parent': 'Parent Frame', '_top': 'Top Frame' }}
                commonRelValues={fieldConfig.common_rel_values || ['nofollow', 'noopener', 'noreferrer', 'sponsored']}
              />
            </Suspense>
          );
        } catch (error) {
          console.error('EnhancedLinkPicker error:', error);
          return (
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">
                Link Group Error
              </div>
              <div className="text-xs text-red-500 mt-1">
                {error.message || 'Component failed to render'}
              </div>
            </div>
          );
        }

      case 'divider':
        return (
          <DividerField
            color={fieldConfig.color || '#e2e8f0'}
            style={fieldConfig.style || 'solid'}
            thickness={fieldConfig.thickness || 1}
            margin={fieldConfig.margin || { top: 16, bottom: 16 }}
            text={fieldConfig.text || ''}
            textPosition={fieldConfig.text_position || 'center'}
            textColor={fieldConfig.text_color || '#64748b'}
            textSize={fieldConfig.text_size || 'sm'}
            fullWidth={fieldConfig.full_width !== false}
          />
        );

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            Unsupported field type: {type}
          </div>
        );
    }
  };

  // Don't render if condition is not met
  if (condition && !condition.value) {
    return null;
  }

  return (
    <div className="field-renderer space-y-2">
      {/* Field Label */}
      {label && type !== 'checkbox' && type !== 'toggle' && type !== 'divider' && type !== 'heading' && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Field Input */}
      {renderField()}

      {/* Field Description */}
      {description && type !== 'wysiwyg' && type !== 'tab_group' && type !== 'link_group' && type !== 'divider' && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default PhpFieldRenderer;
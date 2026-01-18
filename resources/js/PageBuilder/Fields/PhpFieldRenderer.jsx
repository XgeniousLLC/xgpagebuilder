import React, { useState, useRef, lazy, Suspense } from 'react';
import { Monitor, Tablet, Smartphone, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Copy, Loader, Check } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import field components
import TextFieldComponent from './TextFieldComponent';
import TextareaFieldComponent from './TextareaFieldComponent';
import SelectFieldComponent from './SelectFieldComponent';
import CheckboxFieldComponent from './CheckboxFieldComponent';
import ToggleFieldComponent from './ToggleFieldComponent';
import NumberFieldComponent from './NumberFieldComponent';
import UrlFieldComponent from './UrlFieldComponent';
import RangeFieldComponent from './RangeFieldComponent';
import ImageFieldComponent from './ImageFieldComponent';
import RepeaterFieldComponent from './RepeaterFieldComponent';
import IconInputField from './IconInputField';
import CodeFieldComponent from './CodeFieldComponent';

// Import existing complex components
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
 * PhpFieldRenderer - Renders dynamic PHP widget fields with modular components
 *
 * This component handles rendering various field types from PHP widget definitions
 * with consistent styling and behavior across all settings panels.
 * 
 * Now split into separate components for better maintainability and code reuse.
 */
const PhpFieldRenderer = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    type,
    label,
    description,
    condition
  } = fieldConfig;

  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <TextFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'textarea':
        return (
          <TextareaFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'select':
        return (
          <SelectFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'multiselect':
        return (
          <SelectFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'checkbox':
        return (
          <CheckboxFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'toggle':
        return (
          <ToggleFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'number':
        return (
          <NumberFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'url':
        return (
          <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
            <EnhancedLinkPicker
              fieldKey={fieldKey}
              fieldConfig={fieldConfig}
              value={value}
              onChange={onChange}
            />
          </Suspense>
        );

      case 'enhanced_url':
        return (
          <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
            <EnhancedLinkPicker
              fieldKey={fieldKey}
              fieldConfig={fieldConfig}
              value={value}
              onChange={onChange}
            />
          </Suspense>
        );

      case 'color':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-12 rounded"></div>}>
            <EnhancedColorPicker
              value={value || fieldConfig.default || '#000000'}
              onChange={onChange}
            />
          </Suspense>
        );

      case 'range':
        return (
          <RangeFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'image':
        return (
          <ImageFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'gradient':
        return (
          <EnhancedGradientPicker
            value={value}
            onChange={onChange}
            label={label}
          />
        );

      case 'background_group':
        return (
          <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
            <EnhancedBackgroundPicker
              value={value}
              onChange={onChange}
              label={label}
            />
          </Suspense>
        );

      case 'typography_group':
        return (
          <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
            <EnhancedTypographyPicker
              value={value}
              onChange={onChange}
              label={label}
            />
          </Suspense>
        );

      case 'dimension':
      case 'spacing':
        return (
          <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
            <EnhancedDimensionPicker
              value={value}
              onChange={onChange}
              label={label}
              responsive={fieldConfig.responsive || false}
              sides={fieldConfig.sides || ['top', 'right', 'bottom', 'left']}
              units={fieldConfig.units || ['px', 'em', 'rem', '%']}
              allowNegative={fieldConfig.allowNegative || false}
              min={fieldConfig.min || 0}
              max={fieldConfig.max || 200}
              step={fieldConfig.step || 1}
              linked={fieldConfig.linked || false}
              showLabels={fieldConfig.showLabels !== false}
            />
          </Suspense>
        );

      case 'wysiwyg':
        return (
          <Suspense fallback={<div className="animate-pulse h-24 bg-gray-200 rounded"></div>}>
            <WysiwygEditor
              value={value}
              onChange={onChange}
              placeholder={fieldConfig.placeholder || 'Enter your content...'}
            />
          </Suspense>
        );

      case 'alignment':
        return (
          <AlignmentField
            value={value}
            onChange={onChange}
            fieldConfig={fieldConfig}
          />
        );

      case 'border_shadow_group':
        return (
          <BorderShadowGroup
            value={value}
            onChange={onChange}
            label={label}
          />
        );

      case 'tab_group':
        return (
          <DynamicTabGroup
            value={value}
            onChange={onChange}
            fieldConfig={fieldConfig}
          />
        );

      case 'link_group':
        return (
          <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
            <EnhancedLinkPicker
              value={value}
              onChange={onChange}
              fieldConfig={fieldConfig}
            />
          </Suspense>
        );

      case 'divider':
        return (
          <DividerField
            fieldConfig={fieldConfig}
          />
        );

      case 'repeater':
        return (
          <RepeaterFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'icon_input':
        return (
          <IconInputField
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'icon':
        return (
          <IconInputField
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      case 'code':
        return (
          <CodeFieldComponent
            fieldKey={fieldKey}
            fieldConfig={fieldConfig}
            value={value}
            onChange={onChange}
          />
        );

      default:
        return (
          <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-700">
              ⚠️ Unknown field type: <code className="font-mono">{type}</code>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Field key: <code className="font-mono">{fieldKey}</code>
            </p>
          </div>
        );
    }
  };

  // Don't render if condition is not met
  if (condition && !evaluateCondition(condition, value)) {
    return null;
  }

  return (
    <div className="field-wrapper">
      {/* Field Label - only show for non-checkbox/toggle fields and fields that handle their own labels */}
      {!['checkbox', 'toggle', 'divider', 'repeater', 'image', 'icon_input'].includes(type) && label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Field Component */}
      <div className="field-component">
        {renderField()}
      </div>

      {/* Field Description - only show for fields that don't handle their own descriptions */}
      {description && !['checkbox', 'toggle', 'divider', 'repeater', 'image', 'icon_input'].includes(type) && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * Helper function to evaluate field conditions
 */
const evaluateCondition = (condition, value) => {
  // Simple condition evaluation logic
  // This can be expanded based on needs
  if (typeof condition === 'object') {
    // Handle complex conditions
    return true; // Simplified for now
  }
  return true;
};

export default PhpFieldRenderer;
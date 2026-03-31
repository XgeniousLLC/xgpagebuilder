import React from 'react';

// Simple field components
import TextFieldComponent from './TextFieldComponent';
import TextareaFieldComponent from './TextareaFieldComponent';
import SelectFieldComponent from './SelectFieldComponent';
import CheckboxFieldComponent from './CheckboxFieldComponent';
import ToggleFieldComponent from './ToggleFieldComponent';
import NumberFieldComponent from './NumberFieldComponent';
import RangeFieldComponent from './RangeFieldComponent';
import ImageFieldComponent from './ImageFieldComponent';
import VideoFieldComponent from './VideoFieldComponent';
import CodeFieldComponent from './CodeFieldComponent';
import IconInputField from './IconInputField';
import RepeaterFieldComponent from './RepeaterFieldComponent';

// Composite / picker field components
import ColorFieldComponent from './ColorFieldComponent';
import GradientFieldComponent from './GradientFieldComponent';
import BackgroundGroupFieldComponent from './BackgroundGroupFieldComponent';
import TypographyGroupFieldComponent from './TypographyGroupFieldComponent';
import DimensionFieldComponent from './DimensionFieldComponent';
import WysiwygFieldComponent from './WysiwygFieldComponent';
import LinkFieldComponent from './LinkFieldComponent';

// Layout / structural field components
import AlignmentField from './AlignmentField';
import BorderShadowGroup from './BorderShadowGroup';
import DynamicTabGroup from './DynamicTabGroup';
import DividerField from './DividerField';

const SELF_LABELLED = ['checkbox', 'toggle', 'divider', 'repeater', 'image', 'video', 'icon_input', 'icon'];

const PhpFieldRenderer = ({ fieldKey, fieldConfig, value, onChange }) => {
  const { type, label, description } = fieldConfig;

  const renderField = () => {
    const props = { fieldKey, fieldConfig, value, onChange };

    switch (type) {
      case 'text':                return <TextFieldComponent {...props} />;
      case 'textarea':            return <TextareaFieldComponent {...props} />;
      case 'select':
      case 'multiselect':         return <SelectFieldComponent {...props} />;
      case 'checkbox':            return <CheckboxFieldComponent {...props} />;
      case 'toggle':              return <ToggleFieldComponent {...props} />;
      case 'number':              return <NumberFieldComponent {...props} />;
      case 'range':               return <RangeFieldComponent {...props} />;
      case 'image':               return <ImageFieldComponent {...props} />;
      case 'video':               return <VideoFieldComponent {...props} />;
      case 'code':                return <CodeFieldComponent {...props} />;
      case 'icon_input':
      case 'icon':                return <IconInputField {...props} />;
      case 'repeater':            return <RepeaterFieldComponent {...props} />;
      case 'color':               return <ColorFieldComponent {...props} />;
      case 'gradient':            return <GradientFieldComponent {...props} />;
      case 'background_group':    return <BackgroundGroupFieldComponent {...props} />;
      case 'typography_group':    return <TypographyGroupFieldComponent {...props} />;
      case 'dimension':
      case 'spacing':             return <DimensionFieldComponent {...props} />;
      case 'wysiwyg':             return <WysiwygFieldComponent {...props} />;
      case 'url':
      case 'enhanced_url':
      case 'link_group':          return <LinkFieldComponent {...props} />;
      case 'alignment':           return <AlignmentField value={value} onChange={onChange} fieldConfig={fieldConfig} />;
      case 'border_shadow_group': return <BorderShadowGroup value={value} onChange={onChange} label={label} />;
      case 'tab_group':           return <DynamicTabGroup value={value} onChange={onChange} fieldConfig={fieldConfig} />;
      case 'divider':             return <DividerField fieldConfig={fieldConfig} />;

      default:
        return (
          <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-700">
              Unknown field type: <code className="font-mono">{type}</code>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Field key: <code className="font-mono">{fieldKey}</code>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="field-wrapper">
      {!SELF_LABELLED.includes(type) && label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="field-component">
        {renderField()}
      </div>

      {description && !SELF_LABELLED.includes(type) && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default PhpFieldRenderer;

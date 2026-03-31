import React from 'react';
import EnhancedLinkPicker from './EnhancedLinkPicker';

const LinkFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => (
  <EnhancedLinkPicker
    fieldKey={fieldKey}
    fieldConfig={fieldConfig}
    value={value}
    onChange={onChange}
  />
);

export default LinkFieldComponent;

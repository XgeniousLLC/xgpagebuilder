import React from 'react';
import EnhancedBackgroundPicker from './EnhancedBackgroundPicker';

const BackgroundGroupFieldComponent = ({ fieldConfig, value, onChange }) => (
  <EnhancedBackgroundPicker
    value={value}
    onChange={onChange}
    label={fieldConfig.label}
  />
);

export default BackgroundGroupFieldComponent;

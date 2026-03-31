import React from 'react';
import EnhancedGradientPicker from './EnhancedGradientPicker';

const GradientFieldComponent = ({ fieldConfig, value, onChange }) => (
  <EnhancedGradientPicker
    value={value}
    onChange={onChange}
    label={fieldConfig.label}
  />
);

export default GradientFieldComponent;

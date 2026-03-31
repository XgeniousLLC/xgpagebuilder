import React from 'react';
import EnhancedColorPicker from './EnhancedColorPicker';

const ColorFieldComponent = ({ fieldConfig, value, onChange }) => (
  <EnhancedColorPicker
    value={value || fieldConfig.default || '#000000'}
    onChange={onChange}
  />
);

export default ColorFieldComponent;

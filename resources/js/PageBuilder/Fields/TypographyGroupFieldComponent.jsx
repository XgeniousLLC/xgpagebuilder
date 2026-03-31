import React from 'react';
import EnhancedTypographyPicker from './EnhancedTypographyPicker';

const TypographyGroupFieldComponent = ({ fieldConfig, value, onChange }) => (
  <EnhancedTypographyPicker
    value={value}
    onChange={onChange}
    label={fieldConfig.label}
  />
);

export default TypographyGroupFieldComponent;

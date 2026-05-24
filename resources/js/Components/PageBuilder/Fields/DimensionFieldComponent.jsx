import React from 'react';
import EnhancedDimensionPicker from './EnhancedDimensionPicker';

const DimensionFieldComponent = ({ fieldConfig, value, onChange }) => (
  <EnhancedDimensionPicker
    value={value}
    onChange={onChange}
    label={fieldConfig.label}
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
);

export default DimensionFieldComponent;

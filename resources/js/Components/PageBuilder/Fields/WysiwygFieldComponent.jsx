import React from 'react';
import WysiwygEditor from './WysiwygEditor';

const WysiwygFieldComponent = ({ fieldConfig, value, onChange }) => (
  <WysiwygEditor
    value={value}
    onChange={onChange}
    placeholder={fieldConfig.placeholder || 'Enter your content...'}
  />
);

export default WysiwygFieldComponent;

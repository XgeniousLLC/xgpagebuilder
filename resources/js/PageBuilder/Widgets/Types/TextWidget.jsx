import React from 'react';

const TextWidget = ({ html = '<p>Sample text content. Click to edit this text in the settings panel.</p>' }) => {
  return (
    <div 
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default TextWidget;
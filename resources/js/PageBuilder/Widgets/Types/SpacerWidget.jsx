import React from 'react';

const SpacerWidget = ({ height = '20px' }) => {
  return (
    <div 
      style={{ height }}
      className="w-full"
    />
  );
};

export default SpacerWidget;
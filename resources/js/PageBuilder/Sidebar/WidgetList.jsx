import React from 'react';

const WidgetList = ({ children, className = '' }) => {
  return (
    <div className={`widget-list p-2 space-y-1 ${className}`}>
      {children}
    </div>
  );
};

export default WidgetList;
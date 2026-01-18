import React from 'react';

const EmptyCanvasState = () => {
  return (
    <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg pointer-events-none">
      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Page</h3>
        <p className="text-gray-500 mb-4">Drag sections and widgets from the left panel to create your content.</p>
        <div className="text-sm text-gray-400">
          <p>Tip: Start with a section layout, then add widgets</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCanvasState;
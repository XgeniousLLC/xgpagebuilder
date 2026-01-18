import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableWidget from '../SortableWidget';

const ContainerWidget = ({ 
  columns = 1, 
  gap = '20px',
  padding = '20px',
  backgroundColor = '#ffffff',
  borderRadius = '0px',
  containerData = null,
  onUpdate = () => {},
  onSelectWidget = () => {},
  selectedWidget = null
}) => {
  // If containerData is provided (when used within the canvas), use it
  if (containerData) {
    return (
      <div 
        className="min-h-20"
        style={{
          padding,
          backgroundColor,
          borderRadius
        }}
      >
        <div 
          className="grid h-full"
          style={{ 
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap
          }}
        >
          {containerData.columns.map((column, index) => (
            <ContainerColumn
              key={column.id || index}
              column={column}
              containerId={containerData.id}
              onUpdate={onUpdate}
              onSelectWidget={onSelectWidget}
              selectedWidget={selectedWidget}
            />
          ))}
        </div>
      </div>
    );
  }

  // Preview mode (when dragging from panel)
  return (
    <div 
      className="min-h-20 border border-dashed border-gray-300 rounded"
      style={{
        padding,
        backgroundColor,
        borderRadius
      }}
    >
      <div 
        className="grid h-full"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            className="min-h-16 border border-dashed border-gray-200 rounded flex items-center justify-center"
          >
            <span className="text-xs text-gray-400">Column {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContainerColumn = ({ column, containerId, onUpdate, onSelectWidget, selectedWidget }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { 
      type: 'column', 
      columnId: column.id, 
      containerId,
      columnIndex: column.index || 0
    }
  });

  const widgetIds = column.widgets?.map(w => w.id) || [];

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-16 transition-all duration-200 ${
        isOver 
          ? 'bg-blue-50 border-2 border-dashed border-blue-400' 
          : 'border-2 border-dashed border-transparent hover:border-gray-300'
      }`}
      style={{
        padding: column.settings?.padding || '10px',
        ...column.settings
      }}
    >
      {/* Column Content */}
      {widgetIds.length > 0 ? (
        <SortableContext 
          items={widgetIds}
          strategy={verticalListSortingStrategy}
        >
          {column.widgets.map((widget, widgetIndex) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              widgetIndex={widgetIndex}
              columnId={column.id}
              containerId={containerId}
              onUpdate={onUpdate}
              onSelect={onSelectWidget}
              isSelected={selectedWidget?.id === widget.id}
            />
          ))}
        </SortableContext>
      ) : (
        /* Empty Column State */
        <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
          {isOver ? (
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Drop widget here</span>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-50">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Drop widgets here</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContainerWidget;
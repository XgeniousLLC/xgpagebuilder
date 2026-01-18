import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

/**
 * WidgetDropZone - Visual indicator for widget drop positions
 * 
 * Shows exactly where widgets will be inserted when dragging
 * Provides better UX with visual feedback for widget-to-widget drops
 */
const WidgetDropZone = ({ 
  id,
  position, // 'before' | 'after' | 'between'
  insertIndex,
  columnId,
  containerId,
  widgetId = null, // reference widget for 'before'/'after' positions
  className = ''
}) => {
  const { dragState } = usePageBuilderStore();
  const { isDragging, draggedItem } = dragState;
  
  // Only show for widget dragging
  const isDraggingWidget = isDragging && draggedItem?.type === 'widget';
  
  const {
    setNodeRef,
    isOver,
    active
  } = useDroppable({
    id: id,
    data: {
      type: 'widget-drop-zone',
      position: position,
      insertIndex: insertIndex,
      columnId: columnId,
      containerId: containerId,
      widgetId: widgetId
    }
  });

  // Don't render if not dragging a widget
  if (!isDraggingWidget) {
    return null;
  }

  // Don't render if dragging over the widget itself
  if (widgetId && draggedItem?.widget?.id === widgetId) {
    return null;
  }

  const isActive = isOver || (active?.id === id);

  return (
    <div
      ref={setNodeRef}
      className={`widget-drop-zone ${position} ${isActive ? 'active' : ''} ${className}`}
      data-drop-zone={id}
      style={{
        height: isActive ? '40px' : '4px',
        margin: isActive ? '8px 0' : '2px 0',
        borderRadius: '4px',
        background: isActive 
          ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))'
          : 'transparent',
        border: isActive
          ? '2px dashed #3b82f6'
          : '1px dashed rgba(59, 130, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 15,
        transition: 'all 0.2s ease-in-out',
        opacity: isActive ? 1 : (isDraggingWidget ? 0.6 : 0)
      }}
    >
      {/* Active Drop Indicator */}
      {isActive && (
        <div className="drop-indicator flex items-center space-x-2 text-blue-600 font-medium text-xs">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          <span>Drop here</span>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </div>
      )}
      
      {/* Subtle inactive indicator - shows insertion points */}
      {!isActive && isDraggingWidget && (
        <div 
          className="insertion-hint"
          style={{
            width: '60%',
            height: '2px',
            background: 'rgba(59, 130, 246, 0.4)',
            borderRadius: '1px'
          }}
        />
      )}
    </div>
  );
};

export default WidgetDropZone;
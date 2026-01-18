import React from 'react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import WidgetRenderer from '../Widgets/WidgetRenderer';

const DragGhost = () => {
  const { dragState } = usePageBuilderStore();
  const {
    isDragging,
    draggedItem,
    lastMousePosition,
    activeDropTarget
  } = dragState;

  // Only show ghost when actively dragging
  if (!isDragging || !draggedItem || !lastMousePosition) {
    return null;
  }

  // Determine ghost content based on dragged item type
  const renderGhostContent = () => {
    if (draggedItem.type === 'widget-template') {
      // Show preview of widget template
      return (
        <div className="ghost-widget-preview">
          <div className="ghost-widget-header">
            <span className="ghost-widget-title">
              {draggedItem.widget?.name || draggedItem.widget?.type}
            </span>
          </div>
          <div className="ghost-widget-content">
            {draggedItem.widget?.icon && (
              <div className="ghost-widget-icon">
                <i className={draggedItem.widget.icon}></i>
              </div>
            )}
            <div className="ghost-widget-description">
              {draggedItem.widget?.description || 'New widget'}
            </div>
          </div>
        </div>
      );
    } else if (draggedItem.type === 'widget') {
      // Show mini version of actual widget
      return (
        <div className="ghost-widget-mini">
          <WidgetRenderer
            widget={draggedItem.widget}
            isGhostPreview={true}
          />
        </div>
      );
    }

    return (
      <div className="ghost-default">
        <span>Moving item...</span>
      </div>
    );
  };

  // Calculate ghost position with offset from cursor
  const ghostStyle = {
    position: 'fixed',
    left: lastMousePosition.x + 15, // Offset from cursor
    top: lastMousePosition.y - 10,
    zIndex: 9999,
    pointerEvents: 'none',
    transition: 'none', // No transitions for smooth following
  };

  // Determine ghost appearance based on drop validity
  const getGhostClassName = () => {
    let baseClass = 'drag-ghost';

    if (activeDropTarget) {
      baseClass += ' drag-ghost-valid';
      if (activeDropTarget.isCrossContainer) {
        baseClass += ' drag-ghost-cross-container';
      }
    } else {
      baseClass += ' drag-ghost-neutral';
    }

    return baseClass;
  };

  return (
    <div
      className={getGhostClassName()}
      style={ghostStyle}
    >
      {renderGhostContent()}

      {/* Drop position indicator */}
      {activeDropTarget && (
        <div className="ghost-drop-indicator">
          <span className={`drop-arrow ${activeDropTarget.position}`}>
            {activeDropTarget.position === 'before' ? '↑' : '↓'}
          </span>
          <span className="drop-text">
            {activeDropTarget.position === 'before' ? 'Insert before' : 'Insert after'}
            {activeDropTarget.isCrossContainer && (
              <small className="cross-container-label">(Cross-container)</small>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default DragGhost;
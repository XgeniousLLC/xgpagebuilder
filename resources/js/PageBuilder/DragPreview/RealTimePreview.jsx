import React from 'react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const RealTimePreview = ({ content, onUpdate }) => {
  const { dragState } = usePageBuilderStore();
  const {
    isDragging,
    draggedItem,
    activeDropTarget,
    draggedItemType
  } = dragState;

  // Only show preview during drag operations with active drop target
  if (!isDragging || !draggedItem || !activeDropTarget) {
    return null;
  }

  // Calculate preview content with the pending drop operation
  const calculatePreviewContent = () => {
    if (!content || !content.containers) return content;

    const previewContent = JSON.parse(JSON.stringify(content)); // Deep clone

    try {
      // Handle widget drops
      if (draggedItemType === 'widget-template' || draggedItemType === 'widget') {
        const targetContainer = previewContent.containers.find(
          c => c.id === activeDropTarget.containerId
        );

        if (targetContainer) {
          const targetColumn = targetContainer.columns.find(
            c => c.id === activeDropTarget.columnId
          );

          if (targetColumn) {
            // Create new widget from template or copy existing widget
            let newWidget;
            if (draggedItemType === 'widget-template') {
              newWidget = {
                id: `preview-widget-${Date.now()}`,
                type: draggedItem.widget.type,
                content: { ...draggedItem.widget.content },
                style: { ...draggedItem.widget.style },
                advanced: { ...draggedItem.widget.advanced }
              };
            } else {
              // Remove existing widget from its current position first
              previewContent.containers.forEach(container => {
                container.columns.forEach(column => {
                  column.widgets = column.widgets.filter(
                    w => w.id !== draggedItem.widget.id
                  );
                });
              });

              newWidget = { ...draggedItem.widget };
            }

            // Insert widget at the correct position
            const insertIndex = activeDropTarget.position === 'before'
              ? activeDropTarget.widgetIndex
              : activeDropTarget.widgetIndex + 1;

            targetColumn.widgets.splice(insertIndex, 0, newWidget);
          }
        }
      }

      return previewContent;
    } catch (error) {
      console.warn('[RealTimePreview] Error calculating preview:', error);
      return content;
    }
  };

  const previewContent = calculatePreviewContent();

  // Mini preview component
  const renderMiniPreview = () => {
    if (!previewContent || !previewContent.containers) {
      return <div className="preview-empty">Empty page</div>;
    }

    return (
      <div className="mini-page-preview">
        {previewContent.containers.map((container, index) => (
          <div
            key={`preview-${container.id}`}
            className={`mini-container ${
              container.id === activeDropTarget.containerId ? 'target-container' : ''
            }`}
          >
            {container.columns.map((column, colIndex) => (
              <div
                key={`preview-col-${column.id}`}
                className={`mini-column ${
                  column.id === activeDropTarget.columnId ? 'target-column' : ''
                }`}
                style={{ flex: `0 0 ${column.width || '100%'}` }}
              >
                {column.widgets.map((widget, widgetIndex) => (
                  <div
                    key={`preview-widget-${widget.id}`}
                    className={`mini-widget ${
                      widget.id.startsWith('preview-widget') ? 'new-widget' : ''
                    } ${
                      widget.id === draggedItem?.widget?.id ? 'moved-widget' : ''
                    }`}
                  >
                    <div className="widget-indicator" />
                    <span className="widget-type">{widget.type}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Position the preview near the cursor or in a fixed location
  const getPreviewStyle = () => {
    // Position in bottom-right corner for now
    return {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
    };
  };

  return (
    <div
      className="real-time-preview"
      style={getPreviewStyle()}
    >
      <div className="preview-header">
        <span className="preview-title">Layout Preview</span>
        <div className="preview-action-indicator">
          <span className={`action-type ${draggedItemType}`}>
            {draggedItemType === 'widget-template' ? 'Adding' : 'Moving'}
          </span>
          <span className="widget-name">{draggedItem.widget?.type || 'Widget'}</span>
          {activeDropTarget.isCrossContainer && (
            <span className="cross-container-indicator">Cross-container</span>
          )}
        </div>
      </div>
      <div className="preview-content">
        {renderMiniPreview()}
      </div>
      <div className="preview-footer">
        <span className="drop-hint">
          Drop to {activeDropTarget.position} {activeDropTarget.widgetIndex + 1}
        </span>
      </div>
    </div>
  );
};

export default RealTimePreview;
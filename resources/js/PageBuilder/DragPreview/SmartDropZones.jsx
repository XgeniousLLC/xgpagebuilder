import React from 'react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const SmartDropZones = ({
  widget,
  widgetIndex,
  columnId,
  containerId,
  widgetRef,
  isHovered,
  dropPosition
}) => {
  const { dragState } = usePageBuilderStore();
  const { isDragging, draggedItem, activeDropTarget } = dragState;

  // Only show during drag operations
  if (!isDragging || !draggedItem) {
    return null;
  }

  // Don't show on the widget being dragged
  if (draggedItem.widget?.id === widget.id) {
    return null;
  }

  // Calculate compact drop zone dimensions - fixed 60px height
  const calculateSmartZones = () => {
    if (!widgetRef.current) return null;

    const rect = widgetRef.current.getBoundingClientRect();
    const height = rect.height;

    // Fixed 60px zones for clean, consistent appearance
    const FIXED_ZONE_HEIGHT = 60;

    return {
      beforeZone: FIXED_ZONE_HEIGHT,
      afterZone: FIXED_ZONE_HEIGHT,
      height,
      isFixedHeight: true
    };
  };

  const zones = calculateSmartZones();
  if (!zones) return null;

  // Determine if this widget is the active drop target
  const isActiveTarget = activeDropTarget?.widgetId === widget.id;
  const isCrossContainer = activeDropTarget?.isCrossContainer;

  return (
    <>
      {/* Always-visible subtle drop zone hints */}
      <div className="smart-drop-zones">
        {/* Before Drop Zone */}
        <div
          className={`smart-drop-zone smart-drop-zone-before ${
            isActiveTarget && dropPosition === 'before' ? 'active' : ''
          } ${isCrossContainer ? 'cross-container' : ''}`}
          style={{
            height: `${zones.beforeZone}px`,
            top: 0
          }}
        >
          <div className="drop-zone-indicator">
            <div className="drop-zone-line" />
            <div className="drop-zone-label">
              {isActiveTarget && dropPosition === 'before' && (
                <>
                  <span className="drop-icon">↑</span>
                  <span className="drop-text">Insert before</span>
                  {isCrossContainer && (
                    <span className="cross-container-badge">Cross-container</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* After Drop Zone */}
        <div
          className={`smart-drop-zone smart-drop-zone-after ${
            isActiveTarget && dropPosition === 'after' ? 'active' : ''
          } ${isCrossContainer ? 'cross-container' : ''}`}
          style={{
            height: `${zones.afterZone}px`,
            bottom: 0
          }}
        >
          <div className="drop-zone-indicator">
            <div className="drop-zone-line" />
            <div className="drop-zone-label">
              {isActiveTarget && dropPosition === 'after' && (
                <>
                  <span className="drop-icon">↓</span>
                  <span className="drop-text">Insert after</span>
                  {isCrossContainer && (
                    <span className="cross-container-badge">Cross-container</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Magnetic Helper Zones (invisible, larger target areas) */}
        <div
          className="magnetic-zone magnetic-zone-before"
          style={{
            height: `${zones.beforeZone + 20}px`, // 20px larger
            top: -10
          }}
        />
        <div
          className="magnetic-zone magnetic-zone-after"
          style={{
            height: `${zones.afterZone + 20}px`, // 20px larger
            bottom: -10
          }}
        />
      </div>

      {/* Enhanced visual feedback for hover state */}
      {isHovered && isActiveTarget && (
        <div className={`widget-drop-highlight ${isCrossContainer ? 'cross-container' : ''}`}>
          <div className="highlight-overlay" />
          {isCrossContainer && (
            <div className="cross-container-indicator">
              <span className="cross-container-icon">⇄</span>
              <span className="cross-container-text">Cross-container operation</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SmartDropZones;
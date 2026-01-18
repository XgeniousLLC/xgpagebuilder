import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import { Plus, ArrowDown, Layers, Component } from 'lucide-react';

/**
 * Enhanced DropZone - Professional visual indicator for section and widget drop areas
 *
 * Features:
 * - Smooth animations and transitions
 * - Context-aware icons and messaging
 * - Progressive hover states
 * - Professional visual feedback
 */
const DropZone = ({
  id,
  position, // 'before' | 'after'
  index,    // insertion index
  containerId = null, // container ID for 'after' positions
  className = ''
}) => {
  const { dragState, setActiveDropZone } = usePageBuilderStore();
  const { activeDropZone, isDragging, draggedItem } = dragState;
  const [isHovered, setIsHovered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const isActive = activeDropZone?.id === id;
  const isDraggingSection = dragState.isDraggingSection;
  const isDraggingWidgetFromPanel = isDragging && draggedItem?.type === 'widget-template';

  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: id,
    data: {
      type: isDraggingSection ? 'section-drop-zone' : 'widget-drop-zone',
      position: position,
      index: index,
      containerId: containerId
    }
  });

  // Don't render if not dragging a section or widget from panel
  if (!isDraggingSection && !isDraggingWidgetFromPanel) {
    return null;
  }

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setActiveDropZone({
      id,
      position,
      index,
      containerId
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (activeDropZone?.id === id) {
      setActiveDropZone(null);
    }
  };

  // Determine the appropriate icon and message
  const getDropZoneContent = () => {
    if (isDraggingSection) {
      return {
        icon: Layers,
        iconColor: 'text-purple-500',
        bgColor: 'from-purple-50 to-blue-50',
        borderColor: 'border-purple-300',
        message: position === 'before'
          ? 'Drop section at the beginning'
          : `Drop section ${containerId ? 'after this section' : 'at the end'}`
      };
    } else {
      return {
        icon: Component,
        iconColor: 'text-green-500',
        bgColor: 'from-green-50 to-blue-50',
        borderColor: 'border-green-300',
        message: position === 'before'
          ? 'Create new section at the beginning'
          : `Create new section ${containerId ? 'after this section' : 'at the end'}`
      };
    }
  };

  const content = getDropZoneContent();
  const IconComponent = content.icon;
  const isActiveOrOver = isActive || isOver || isHovered;

  return (
    <div
      ref={setNodeRef}
      className={`
        drop-zone transition-all duration-300 ease-out
        ${position} ${isActiveOrOver ? 'active' : ''} ${className}
        ${shouldAnimate ? 'opacity-100' : 'opacity-0'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        height: isActiveOrOver ? '80px' : '12px',
        borderRadius: '12px',
        background: isActiveOrOver
          ? `linear-gradient(135deg, ${content.bgColor.includes('purple') ? 'rgba(147, 51, 234, 0.08)' : 'rgba(34, 197, 94, 0.08)'}, rgba(59, 130, 246, 0.08))`
          : 'transparent',
        border: isActiveOrOver
          ? `2px dashed ${content.bgColor.includes('purple') ? '#a855f7' : '#22c55e'}`
          : '1px dashed rgba(59, 130, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        margin: '4px 0',
        boxShadow: isActiveOrOver
          ? '0 4px 12px rgba(59, 130, 246, 0.15)'
          : 'none'
      }}
    >
      {/* Active state content */}
      {isActiveOrOver && (
        <div className={`
          drop-indicator flex items-center justify-center space-x-3
          transition-all duration-200 ease-in-out
          ${isActiveOrOver ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}>
          {/* Leading icon */}
          <div className={`
            p-2 rounded-full bg-white shadow-sm border
            ${content.borderColor} ${content.iconColor}
            ${isOver ? 'scale-110' : 'scale-100'}
            transition-transform duration-200
          `}>
            <IconComponent className="w-4 h-4" />
          </div>

          {/* Message */}
          <div className="text-center">
            <div className={`
              font-semibold text-sm
              ${content.iconColor.replace('text-', 'text-').replace('-500', '-700')}
              transition-colors duration-200
            `}>
              {content.message}
            </div>
            {isDraggingWidgetFromPanel && (
              <div className="text-xs text-gray-500 mt-1">
                Widget will be placed in a new section
              </div>
            )}
          </div>

          {/* Trailing arrow */}
          <div className={`
            ${content.iconColor}
            ${isOver ? 'animate-bounce' : ''}
            transition-all duration-200
          `}>
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Subtle inactive indicator */}
      {!isActiveOrOver && (
        <div className={`
          drop-hint w-full transition-all duration-300 ease-out
          ${shouldAnimate ? 'scale-100 opacity-60' : 'scale-90 opacity-30'}
        `}>
          <div
            className="w-full mx-auto rounded-full"
            style={{
              height: '3px',
              background: `linear-gradient(90deg,
                rgba(59, 130, 246, 0.4),
                rgba(16, 185, 129, 0.4),
                rgba(59, 130, 246, 0.4)
              )`,
              maxWidth: '60%'
            }}
          />

          {/* Small pulse indicator */}
          <div className={`
            absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-2 h-2 rounded-full bg-blue-400
            ${shouldAnimate ? 'animate-pulse' : ''}
          `} />
        </div>
      )}

      {/* Hover enhancement glow */}
      {isActiveOrOver && (
        <div
          className="absolute inset-0 rounded-xl opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center,
              ${content.bgColor.includes('purple') ? 'rgba(147, 51, 234, 0.1)' : 'rgba(34, 197, 94, 0.1)'} 0%,
              transparent 70%
            )`,
            animation: isOver ? 'pulse 1.5s infinite' : 'none'
          }}
        />
      )}
    </div>
  );
};

export default DropZone;
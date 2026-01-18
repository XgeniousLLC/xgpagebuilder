import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import pageBuilderCSSService from '@/Services/pageBuilderCSSService';
import WidgetRenderer from './WidgetRenderer';

const SortableWidget = ({ 
  widget, 
  widgetIndex, 
  columnId, 
  containerId, 
  onUpdate, 
  onSelect, 
  isSelected 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const widgetRef = useRef(null);
  const {
    removeWidget,
    updateWidget
  } = usePageBuilderStore();
  
  // Apply CSS wrapper classes and generate styles for widget
  useEffect(() => {
    if (widgetRef.current) {
      // Get widget settings with defaults
      const widgetSettings = {
        ...pageBuilderCSSService.getDefaultSettings('widget'),
        ...widget.settings
      };

      // Apply wrapper classes and generate CSS
      pageBuilderCSSService.applySettings(
        widgetRef.current,
        'widget',
        widget.id,
        widgetSettings,
        widget.responsiveSettings || {}
      );
    }
  }, [widget.id, widget.settings, widget.responsiveSettings]);

  // Track content height for better drop positioning
  useEffect(() => {
    const updateContentHeight = () => {
      if (widgetRef.current) {
        const height = widgetRef.current.scrollHeight;
        setContentHeight(height);
      }
    };

    updateContentHeight();

    // Update height when content changes
    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (widgetRef.current) {
      resizeObserver.observe(widgetRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [widget]);

  // Content height tracking for adaptive drop zones (no size restrictions)
  // All widgets now support drop zones regardless of size

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: widget.id,
    data: {
      type: 'widget',
      widget,
      widgetIndex,
      columnId,
      containerId
    }
  });

  // Removed dual droppable system - using only standard @dnd-kit sortable

  // Simplified state - removed complex drop position tracking

  // Simplified - no complex drop zone calculations needed

  // Simplified drag state detection
  const isDraggingThisWidget = isDragging; // Current widget being dragged

  // Simplified - no complex mouse tracking needed for basic sortable

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleDeleteWidget = () => {
    if (confirm('Are you sure you want to delete this widget?')) {
      removeWidget(widget.id);
    }
  };

  const handleDuplicateWidget = () => {
    const duplicatedWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    onUpdate(prev => ({
      ...prev,
      containers: prev.containers.map(container => {
        if (container.id === containerId) {
          return {
            ...container,
            columns: container.columns.map(column => {
              if (column.id === columnId) {
                const newWidgets = [...column.widgets];
                newWidgets.splice(widgetIndex + 1, 0, duplicatedWidget);
                return { ...column, widgets: newWidgets };
              }
              return column;
            })
          };
        }
        return container;
      })
    }));
  };

  const handleSelectWidget = (e) => {
    e.stopPropagation();
    onSelect(widget);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);           // Standard sortable ref
        widgetRef.current = node;
      }}
      style={style}
      className={`relative group mb-4 ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelectWidget}
      data-widget-height={contentHeight}
      data-widget-id={widget.id}
    >
      {/* Widget Controls - Fixed position at top-right */}
      {(isHovered || isSelected) && !isDragging && (
        <div className="absolute top-1 right-1 z-20 flex space-x-1">
        <button 
          {...attributes}
          {...listeners}
          className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicateWidget();
          }}
          className="p-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center shadow-sm"
          title="Duplicate widget"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleSelectWidget(e);
          }}
          className="p-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors flex items-center shadow-sm"
          title="Edit widget settings"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteWidget();
          }}
          className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors flex items-center shadow-sm"
          title="Delete widget"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      )}

      {/* Simplified drag feedback - using @dnd-kit's built-in visual feedback */}

      {/* Widget Content */}
      <div 
        className={`transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        } ${isHovered ? 'ring-1 ring-blue-300 ring-opacity-30' : ''}`}
        style={{
          margin: widget.style?.margin || '0',
          padding: widget.style?.padding || '0',
          ...widget.style
        }}
      >
        <WidgetRenderer widget={widget} />
      </div>
    </div>
  );
};

export default SortableWidget;
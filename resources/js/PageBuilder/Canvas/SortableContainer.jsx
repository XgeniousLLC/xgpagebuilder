import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import pageBuilderCSSService from '@/Services/pageBuilderCSSService';
import sectionSettingsMapper from '@/Services/sectionSettingsMapper';
import Column from './Column';

const SortableContainer = ({ container, index, onUpdate, onSelectWidget, selectedWidget, hoveredDropZone }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { removeContainer, updateContainer } = usePageBuilderStore();
  const containerRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: container.id,
    data: { 
      type: 'container', 
      container,
      index
    }
  });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver
  } = useDroppable({
    id: container.id,
    data: {
      type: 'container',
      container,
      index
    }
  });

  // Combine refs for both sortable and droppable
  const setNodeRef = (node) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
    containerRef.current = node;
  };

  // Apply CSS wrapper classes and generate styles with enhanced transformation
  useEffect(() => {
    if (containerRef.current) {
      // Transform section settings using the mapper
      const transformedSettings = sectionSettingsMapper.transformToCSS(container.settings || {});
      const responsiveSettings = sectionSettingsMapper.transformResponsive(
        container.settings || {},
        container.responsiveSettings || {}
      );

      // Apply wrapper classes and generate CSS
      const classInfo = pageBuilderCSSService.applySettings(
        containerRef.current,
        'section',
        container.id,
        transformedSettings,
        responsiveSettings
      );

      // Apply layout wrapper class for section content width
      if (transformedSettings.contentWidth) {
        const layoutClass = `section-layout-${transformedSettings.contentWidth}`;
        if (!containerRef.current.classList.contains(layoutClass)) {
          // Remove existing layout classes
          const existingLayoutClasses = Array.from(containerRef.current.classList).filter(
            cls => cls.startsWith('section-layout-')
          );
          existingLayoutClasses.forEach(cls => containerRef.current.classList.remove(cls));

          // Add new layout class
          containerRef.current.classList.add(layoutClass);
        }
      }

      // Handle custom CSS injection
      if (container.settings?.customCSS) {
        pageBuilderCSSService.injectCSS(`section-${container.id}-custom`, container.settings.customCSS);
      }

      // Add section ID attribute for CSS targeting
      if (container.settings?.htmlId) {
        containerRef.current.id = container.settings.htmlId;
      }

      // Add custom CSS classes
      if (container.settings?.cssClass) {
        const customClasses = container.settings.cssClass.split(' ').filter(cls => cls.trim());
        customClasses.forEach(cls => {
          if (cls && !containerRef.current.classList.contains(cls)) {
            containerRef.current.classList.add(cls);
          }
        });
      }
    }
  }, [container.id, container.settings, container.responsiveSettings]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleDeleteContainer = () => {
    if (confirm('Are you sure you want to delete this section?')) {
      removeContainer(container.id);
    }
  };

  const handleDuplicateContainer = () => {
    const duplicatedContainer = {
      ...container,
      id: `container-${Date.now()}`,
      columns: container.columns.map(column => ({
        ...column,
        id: `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        widgets: column.widgets.map(widget => ({
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }))
    };

    onUpdate(prev => ({
      ...prev,
      containers: [
        ...prev.containers.slice(0, index + 1),
        duplicatedContainer,
        ...prev.containers.slice(index + 1)
      ]
    }));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-container-id={container.id}
    >
      {/* Container Controls - Fixed position at top-left */}
      {(isHovered || selectedWidget?.id === container.id) && !isDragging && (
        <div className="absolute top-2 left-2 z-20 flex space-x-1">
        <button 
          {...attributes}
          {...listeners}
          className="p-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <button 
          onClick={handleDuplicateContainer}
          className="p-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center shadow-sm"
          title="Duplicate section"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button 
          onClick={() => onSelectWidget({ type: 'section', ...container })}
          className="p-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors flex items-center shadow-sm"
          title="Edit section settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button 
          onClick={handleDeleteContainer}
          className="p-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors flex items-center shadow-sm"
          title="Delete section"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      )}

      {/* Container Content */}
      <div
        className={`min-h-20 transition-all duration-200 ${
          isHovered ? 'ring-1 ring-blue-300' : ''
        } ${selectedWidget?.id === container.id ? 'ring-2 ring-blue-500' : ''} ${
          isOver ? 'ring-2 ring-green-400 bg-green-50' : ''
        }`}
      >
        {/* Section Inner Container for Layout Modes */}
        <div className="section-inner">
          <div
            className={container.settings?.gridTemplate ? "grid h-full" : "flex h-full"}
            style={container.settings?.gridTemplate ? {
              gridTemplateColumns: container.settings.gridTemplate,
              gap: container.settings?.gap || '20px'
            } : {
              gap: container.settings?.gap || '20px',
              flexWrap: 'nowrap',
              width: '100%'
            }}
          >
            {container.columns.map((column, columnIndex) => (
              <Column
                key={column.id}
                column={column}
                columnIndex={columnIndex}
                containerId={container.id}
                onUpdate={onUpdate}
                onSelectWidget={onSelectWidget}
                selectedWidget={selectedWidget}
                hoveredDropZone={hoveredDropZone}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortableContainer;
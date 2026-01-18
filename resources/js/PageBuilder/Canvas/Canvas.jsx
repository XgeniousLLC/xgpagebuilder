import React, { Fragment } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableContainer from './SortableContainer';
import EmptyCanvasState from './EmptyCanvasState';
import DropZone from './DropZone';
import DragGhost from '../DragPreview/DragGhost';
import RealTimePreview from '../DragPreview/RealTimePreview';
import CanvasPlusButton from './CanvasPlusButton';
import SectionQuickAdd from './SectionQuickAdd';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const Canvas = ({ content, onUpdate, onSelectWidget, selectedWidget, hoveredDropZone }) => {
  const { dragState, currentDevice, getCurrentViewport, getDeviceLabel } = usePageBuilderStore();
  const { isDraggingSection, isDragging, draggedItem } = dragState;

  // Show drop zones for both section drags AND widget panel drags
  const shouldShowDropZones = isDraggingSection || (isDragging && draggedItem?.type === 'widget-template');
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
    data: { type: 'canvas' }
  });

  const containerIds = content?.containers?.map(c => c.id) || [];
  
  // Check if this canvas is being hovered with valid/invalid drop
  const isCanvasHovered = hoveredDropZone?.id === 'canvas';
  const isValidDrop = hoveredDropZone?.isValid;

  // Get current viewport dimensions
  const currentViewport = getCurrentViewport();
  const deviceLabel = getDeviceLabel();
  const isResponsiveMode = currentDevice !== 'desktop';

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-6">
      {/* Device indicator for non-desktop modes */}
      {isResponsiveMode && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shadow-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            {deviceLabel}
            <span className="ml-2 text-xs text-blue-600">({currentViewport})</span>
          </div>
        </div>
      )}

      {/* Responsive Canvas Container */}
      <div className="mx-auto transition-all duration-300 ease-in-out" style={{
        maxWidth: currentDevice === 'desktop' ? '1450px' : currentViewport
      }}>
        {/* Device Frame for tablet/mobile */}
        <div className={`mx-auto relative ${
          isResponsiveMode
            ? 'border-2 border-gray-300 rounded-xl shadow-xl bg-gray-50 p-2'
            : ''
        }`} style={{
          width: currentDevice === 'desktop' ? '100%' : currentViewport
        }}>
          {/* Device header for visual effect */}
          {isResponsiveMode && (
            <div className="flex items-center justify-center mb-2 pb-2 border-b border-gray-200">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="absolute right-3 text-xs text-gray-500 font-mono">
                {currentViewport}
              </div>
            </div>
          )}
          <div
            ref={setNodeRef}
            className={`page-builder-canvas min-h-screen bg-white transition-all duration-200 p-4 ${
              isResponsiveMode ? 'rounded-lg' : 'shadow-sm rounded-lg'
            } ${
              isCanvasHovered && isValidDrop ? 'ring-2 ring-blue-400 bg-blue-50' : ''
            } ${
              isCanvasHovered && !isValidDrop ? 'ring-2 ring-red-400 bg-red-50' : ''
            }`}
          >
          {containerIds.length > 0 ? (
            <SortableContext 
              items={containerIds}
              strategy={verticalListSortingStrategy}
            >
              {/* Section Quick Add - Before first section */}
              <SectionQuickAdd
                position={0}
                key="quick-add-before-0"
              />

              {/* Drop zone before first section */}
              {shouldShowDropZones && (
                <DropZone
                  id="drop-zone-before-0"
                  position="before"
                  index={0}
                />
              )}

              {content.containers.map((container, index) => (
                <Fragment key={container.id}>
                  <SortableContainer
                    container={container}
                    index={index}
                    onUpdate={onUpdate}
                    onSelectWidget={onSelectWidget}
                    selectedWidget={selectedWidget}
                    hoveredDropZone={hoveredDropZone}
                  />

                  {/* Section Quick Add - After each section */}
                  <SectionQuickAdd
                    position={index + 1}
                    containerId={container.id}
                    key={`quick-add-after-${index}`}
                  />

                  {/* Drop zone after each section */}
                  {shouldShowDropZones && (
                    <DropZone
                      id={`drop-zone-after-${index}`}
                      position="after"
                      index={index + 1}
                      containerId={container.id}
                    />
                  )}
                </Fragment>
              ))}
            </SortableContext>
          ) : (
            <EmptyCanvasState />
          )}
          </div>
        </div>
      </div>

      {/* Global Drag Ghost - Temporarily disabled to fix drop zone conflicts */}
      {false && <DragGhost />}

      {/* Canvas Plus Button - Always available for adding sections */}
      <CanvasPlusButton />
    </div>
  );
};

export default Canvas;
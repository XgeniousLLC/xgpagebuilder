import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, Search, Layers, Columns, Component, GripVertical, Plus } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

// Drop Zone Indicator Component with Enhanced Hover Detection
const DropZoneIndicator = ({ dropId, position, level = 0, isDragOverActive = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: { type: 'tree-drop-zone', position, level }
  });

  const isActive = isOver || isDragOverActive;

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isActive ? 'h-8 opacity-100' : 'h-4 opacity-30 hover:opacity-70'
      }`}
      style={{ marginLeft: `${level * 16}px` }}
    >
      <div
        className={`w-full transition-all duration-200 ${
          isActive
            ? 'h-6 bg-gradient-to-r from-blue-100 to-green-100 border-2 border-dashed border-blue-400 rounded-md flex items-center justify-center'
            : 'h-2 bg-transparent border border-dashed border-gray-400 rounded-sm flex items-center justify-center hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        {isActive && (
          <div className="flex items-center space-x-1 text-blue-600">
            <Plus className="w-3 h-3" />
            <span className="text-xs font-medium">Drop here</span>
          </div>
        )}
        {!isActive && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-400 opacity-50"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavigationTree = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isNavigationDragging, setIsNavigationDragging] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [renamingSectionId, setRenamingSectionId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Safeguards to prevent infinite operations
  const dragOperationCount = React.useRef(0);
  const lastDragOperation = React.useRef(null);
  const maxDragOperations = 10; // Prevent more than 10 rapid operations
  const dragCooldown = 1000; // 1 second cooldown between rapid operations

  const { pageContent, selectedWidget, reorderContainers, reorderWidgets, moveWidgetBetweenColumns, updateContainer } = usePageBuilderStore();

  // Generate navigation tree from page content with better icons
  const navigationTree = useMemo(() => {
    if (!pageContent?.containers) return [];

    return pageContent.containers.map((container, containerIndex) => ({
      id: container.id,
      type: 'section',
      name: container.name || `Section ${containerIndex + 1}`,
      icon: Layers,
      path: `section-${containerIndex}`,
      isExpanded: true,
      children: container.columns?.map((column, columnIndex) => ({
        id: column.id,
        type: 'column',
        name: `Column ${columnIndex + 1}`,
        icon: Columns,
        path: `section-${containerIndex}.column-${columnIndex}`,
        isExpanded: true,
        children: column.widgets?.map((widget, widgetIndex) => ({
          id: widget.id,
          type: 'widget',
          name: widget.settings?.general?.content?.text || widget.type || `Widget ${widgetIndex + 1}`,
          icon: Component,
          path: `section-${containerIndex}.column-${columnIndex}.widget-${widgetIndex}`,
          widget,
          widgetType: widget.type
        })) || []
      })) || []
    }));
  }, [pageContent]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm) return navigationTree;

    const filterNode = (node) => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (node.widgetType && node.widgetType.toLowerCase().includes(searchTerm.toLowerCase()));
      const filteredChildren = node.children?.map(filterNode).filter(Boolean) || [];

      if (matchesSearch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren, isExpanded: true };
      }
      return null;
    };

    return navigationTree.map(filterNode).filter(Boolean);
  }, [navigationTree, searchTerm]);

  // Get only draggable items (sections and widgets, not columns) for SortableContext
  const draggableItems = useMemo(() => {
    const extractDraggableIds = (nodes) => {
      let ids = [];
      nodes.forEach(node => {
        if (node.type === 'section' || node.type === 'widget') {
          ids.push(node.id);
        }
        if (node.children) {
          ids = ids.concat(extractDraggableIds(node.children));
        }
      });
      return ids;
    };
    return extractDraggableIds(filteredTree);
  }, [filteredTree]);

  const handleItemClick = useCallback((item) => {
    setActiveItem(item.id);

    // Scroll to element in canvas
    const element = document.querySelector(`[data-widget-id="${item.id}"], [data-container-id="${item.id}"], [data-column-id="${item.id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight element briefly
      element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-75');
      }, 2000);
    }
  }, []);

  // Section rename handlers
  const handleSectionRename = useCallback((sectionId, currentName) => {
    setRenamingSectionId(sectionId);
    setRenameValue(currentName);
  }, []);

  const handleRenameSubmit = useCallback((sectionId) => {
    if (renameValue.trim() && renameValue.trim() !== '') {
      updateContainer(sectionId, { name: renameValue.trim() });
      console.log('[NavigationTree] Section renamed:', { sectionId, newName: renameValue.trim() });
    }
    setRenamingSectionId(null);
    setRenameValue('');
  }, [renameValue, updateContainer]);

  const handleRenameCancel = useCallback(() => {
    setRenamingSectionId(null);
    setRenameValue('');
  }, []);

  // Navigation drag handlers - Optimized to prevent rapid state updates
  const handleNavigationDragStart = useCallback((event) => {
    const { active } = event;
    setIsNavigationDragging(true);
    setActiveDropZone(null);

    const findNodeData = (nodes, targetId) => {
      for (const node of nodes) {
        if (node.id === targetId) return node;
        if (node.children) {
          const found = findNodeData(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const nodeData = findNodeData(navigationTree, active.id);
    setDraggedItem(nodeData);
  }, [navigationTree]);

  const handleNavigationDragOver = useCallback((event) => {
    const { over } = event;
    const newDropZone = over && over.data.current?.type === 'tree-drop-zone' ? over.id : null;

    // Only update if the drop zone actually changed - use requestAnimationFrame to prevent rapid updates
    if (newDropZone !== activeDropZone) {
      requestAnimationFrame(() => {
        setActiveDropZone(newDropZone);
      });
    }
  }, [activeDropZone]);

  const handleNavigationDragEnd = useCallback((event) => {
    const { active, over } = event;

    // Safeguard: Check for rapid operations
    const now = Date.now();
    if (lastDragOperation.current && (now - lastDragOperation.current) < dragCooldown) {
      dragOperationCount.current++;
      if (dragOperationCount.current > maxDragOperations) {
        console.warn('[NavigationTree] Too many rapid drag operations detected. Blocking to prevent infinite loop.');
        setIsNavigationDragging(false);
        setDraggedItem(null);
        setActiveDropZone(null);
        return;
      }
    } else {
      dragOperationCount.current = 0; // Reset counter if enough time has passed
    }
    lastDragOperation.current = now;

    // Only cleanup drag state at the very end, after all operations
    const cleanupDragState = () => {
      setIsNavigationDragging(false);
      setDraggedItem(null);
      setActiveDropZone(null);
    };

    if (!over || active.id === over.id) {
      cleanupDragState();
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log('[NavigationTree] Drag end operation:', {
      activeId: active.id,
      overId: over.id,
      activeType: activeData?.type,
      overType: overData?.type,
      timestamp: new Date().toISOString()
    });

    // Handle section reordering
    if (activeData?.type === 'section') {
      let targetIndex = -1;

      if (overData?.type === 'section') {
        // Direct drop on another section
        targetIndex = pageContent.containers.findIndex(c => c.id === overData.id);
      } else if (overData?.type === 'tree-drop-zone') {
        // Drop on a drop zone
        const dropId = over.id;
        if (dropId.startsWith('before-')) {
          const nodeId = dropId.replace('before-', '');
          targetIndex = pageContent.containers.findIndex(c => c.id === nodeId);
        } else if (dropId.startsWith('after-')) {
          const nodeId = dropId.replace('after-', '');
          const nodeIndex = pageContent.containers.findIndex(c => c.id === nodeId);
          targetIndex = nodeIndex + 1;
        }
      }

      const activeIndex = pageContent.containers.findIndex(c => c.id === activeData.id);

      if (activeIndex !== -1 && targetIndex !== -1 && activeIndex !== targetIndex) {
        // Adjust target index if moving item from before the target position
        const adjustedTargetIndex = activeIndex < targetIndex ? targetIndex - 1 : targetIndex;
        console.log('[NavigationTree] Reordering sections:', { activeIndex, targetIndex, adjustedTargetIndex });
        reorderContainers(activeIndex, adjustedTargetIndex);
      }
      cleanupDragState();
      return;
    }

    // Handle widget reordering
    if (activeData?.type === 'widget') {
      if (overData?.type === 'widget') {
        // Direct drop on another widget
        const activeColumnId = activeData.path?.split('.')[1]?.replace('column-', '');
        const overColumnId = overData.path?.split('.')[1]?.replace('column-', '');

        if (activeColumnId === overColumnId) {
          // Same column reordering
          const container = pageContent.containers.find(c =>
            c.columns.some(col => col.widgets.some(w => w.id === activeData.id))
          );
          const column = container?.columns.find(col =>
            col.widgets.some(w => w.id === activeData.id)
          );

          if (column) {
            reorderWidgets(column.id, activeData.widgetIndex, overData.widgetIndex);
          }
        } else {
          // Cross-column movement
          const sourceContainer = pageContent.containers.find(c =>
            c.columns.some(col => col.widgets.some(w => w.id === activeData.id))
          );
          const sourceColumn = sourceContainer?.columns.find(col =>
            col.widgets.some(w => w.id === activeData.id)
          );

          const targetContainer = pageContent.containers.find(c =>
            c.columns.some(col => col.widgets.some(w => w.id === overData.id))
          );
          const targetColumn = targetContainer?.columns.find(col =>
            col.widgets.some(w => w.id === overData.id)
          );

          if (sourceColumn && targetColumn) {
            moveWidgetBetweenColumns(
              activeData.id,
              sourceColumn.id,
              targetColumn.id,
              overData.widgetIndex
            );
          }
        }
      } else if (overData?.type === 'tree-drop-zone') {
        // Drop on a drop zone - handle widget reordering within columns only
        const dropId = over.id;
        let targetWidgetId = null;
        let targetPosition = null;

        if (dropId.startsWith('before-')) {
          targetWidgetId = dropId.replace('before-', '');
          targetPosition = 'before';
        } else if (dropId.startsWith('after-')) {
          targetWidgetId = dropId.replace('after-', '');
          targetPosition = 'after';
        }

        if (targetWidgetId) {
          // Restriction: Only allow widget drops if target is a widget (inside a column)
          // First, check if the target is a widget
          const targetContainer = pageContent.containers.find(c =>
            c.columns.some(col => col.widgets.some(w => w.id === targetWidgetId))
          );
          const targetColumn = targetContainer?.columns.find(col =>
            col.widgets.some(w => w.id === targetWidgetId)
          );

          // Only proceed if target is a widget (which means it's inside a column)
          if (!targetColumn) {
            console.log('[NavigationTree] Widget drop rejected - target is not a widget inside a column');
            return;
          }

          // Find the source widget column
          const sourceContainer = pageContent.containers.find(c =>
            c.columns.some(col => col.widgets.some(w => w.id === activeData.id))
          );
          const sourceColumn = sourceContainer?.columns.find(col =>
            col.widgets.some(w => w.id === activeData.id)
          );

          if (sourceColumn && targetColumn && sourceColumn.id === targetColumn.id) {
            // Same column reordering
            const targetWidget = targetColumn.widgets.find(w => w.id === targetWidgetId);
            const targetIndex = targetColumn.widgets.findIndex(w => w.id === targetWidgetId);
            const sourceIndex = sourceColumn.widgets.findIndex(w => w.id === activeData.id);

            if (targetIndex !== -1 && sourceIndex !== -1) {
              let newIndex = targetPosition === 'before' ? targetIndex : targetIndex + 1;

              // Adjust index if moving item from before the target position
              if (sourceIndex < newIndex) {
                newIndex = newIndex - 1;
              }

              console.log('[NavigationTree] Reordering widgets within same column:', {
                sourceIndex,
                targetIndex,
                newIndex,
                targetPosition,
                activeWidgetId: activeData.id,
                targetWidgetId
              });

              if (sourceIndex !== newIndex) {
                reorderWidgets(sourceColumn.id, sourceIndex, newIndex);
              }
            }
          } else if (sourceColumn && targetColumn && sourceColumn.id !== targetColumn.id) {
            // Cross-column movement
            const targetIndex = targetColumn.widgets.findIndex(w => w.id === targetWidgetId);
            let newIndex = targetPosition === 'before' ? targetIndex : targetIndex + 1;

            console.log('[NavigationTree] Moving widget between columns:', {
              sourceColumnId: sourceColumn.id,
              targetColumnId: targetColumn.id,
              newIndex,
              activeWidgetId: activeData.id,
              targetWidgetId
            });

            moveWidgetBetweenColumns(
              activeData.id,
              sourceColumn.id,
              targetColumn.id,
              newIndex
            );
          }
        }
      }
    }

    // Always cleanup drag state at the end
    cleanupDragState();
  }, [pageContent]);

  // Memoized styling functions
  const getNodeBg = useCallback((isDragging, nodeId, nodeType) => {
    if (isDragging) return 'bg-blue-50 border border-blue-300';
    if (activeItem === nodeId) return 'bg-blue-100 text-blue-800';
    if (nodeType === 'section') return 'hover:bg-red-50';
    if (nodeType === 'column') return 'hover:bg-blue-50';
    return 'hover:bg-green-50';
  }, [activeItem]);

  const getIconColor = useCallback((nodeType) => {
    if (nodeType === 'section') return 'text-red-500';
    if (nodeType === 'column') return 'text-blue-500';
    return 'text-green-500';
  }, []);

  // Compact Tree Node component for dialog - Memoized to prevent unnecessary re-renders
  const TreeNode = React.memo(({ node, level = 0, containerIndex, columnIndex, widgetIndex, isNavigationDragging, activeDropZone, activeItem, onItemClick, onSectionRename, renamingSectionId, renameValue, onRenameValueChange, onRenameSubmit, onRenameCancel, draggedItem }) => {
    const [isExpanded, setIsExpanded] = useState(node.isExpanded || false);
    const hasChildren = node.children && node.children.length > 0;
    const IconComponent = node.icon;

    // Only enable drag for sections and widgets, not columns
    const isDragEnabled = node.type === 'section' || node.type === 'widget';

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: node.id,
      disabled: !isDragEnabled, // Disable dragging for columns
      data: {
        type: node.type,
        id: node.id,
        widget: node.widget,
        path: node.path,
        widgetIndex: widgetIndex,
        containerIndex: containerIndex,
        columnIndex: columnIndex
      }
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1
    };

    // Use memoized styling functions passed as props
    const nodeBackgroundClass = getNodeBg(isDragging, node.id, node.type);
    const iconColorClass = getIconColor(node.type);

    // UX: Only collapse sections during section dragging, not widget dragging
    const isDraggingSection = draggedItem?.type === 'section';
    const isDraggingWidget = draggedItem?.type === 'widget';
    const shouldShowExpanded = isExpanded && (!isDraggingSection || isDragging);
    const isExpandButtonDisabled = isDraggingSection && node.type === 'section';

    // Widget drop zone restriction: Only show drop zones around widgets when dragging widgets
    const shouldShowDropZone = isNavigationDragging && (
      (isDraggingSection && node.type === 'section') ||
      (isDraggingWidget && node.type === 'widget')
    );

    return (
      <>
        {/* Drop zone before this node */}
        {shouldShowDropZone && (
          <DropZoneIndicator
            dropId={`before-${node.id}`}
            position="before"
            level={level}
            isDragOverActive={activeDropZone === `before-${node.id}`}
          />
        )}

        <div
          ref={setNodeRef}
          style={{
            ...style,
            marginLeft: `${level * 16}px`
          }}
          className={`${isDragging ? 'z-50' : ''}`}
        >
          <div
            className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer group transition-all duration-200 ${nodeBackgroundClass} ${
              isDragging ? 'transform scale-105 shadow-lg' : ''
            }`}
            onClick={() => onItemClick(node)}
          >
            {/* Enhanced Drag handle - only show for draggable items */}
            {isDragEnabled && (
              <div
                {...attributes}
                {...listeners}
                className={`mr-2 p-1 rounded transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  isNavigationDragging || isDragging
                    ? 'opacity-100 bg-gray-200 scale-110'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3 h-3 text-gray-500" />
              </div>
            )}

            {/* Spacer for non-draggable items to maintain alignment */}
            {!isDragEnabled && <div className="mr-2 w-5" />}

          {/* Expand/collapse for nodes with children */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isExpandButtonDisabled) {
                  setIsExpanded(!isExpanded);
                }
              }}
              disabled={isExpandButtonDisabled}
              className={`mr-1 p-0.5 rounded transition-colors ${
                isExpandButtonDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-gray-200 cursor-pointer'
              }`}
              title={isExpandButtonDisabled ? 'Expand/collapse disabled during section dragging' : ''}
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${shouldShowExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}

          {/* Icon with type-based coloring */}
          <IconComponent className={`w-4 h-4 mr-2 ${iconColorClass}`} />

          {/* Node name - with rename functionality for sections */}
          {node.type === 'section' && renamingSectionId === node.id ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => onRenameValueChange(e.target.value)}
              onBlur={() => onRenameSubmit(node.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRenameSubmit(node.id);
                } else if (e.key === 'Escape') {
                  onRenameCancel();
                }
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="flex-1 text-sm font-medium bg-white border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <span
              className="flex-1 text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors"
              onClick={(e) => {
                if (node.type === 'section') {
                  e.stopPropagation();
                  onSectionRename(node.id, node.name);
                } else {
                  onItemClick(node);
                }
              }}
              title={node.type === 'section' ? 'Click to rename section' : ''}
            >
              {node.name}
            </span>
          )}

          {/* Widget type indicator */}
          {node.type === 'widget' && node.widgetType && (
            <span className="text-xs text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
              {node.widgetType}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && shouldShowExpanded && (
          <div className="mt-1">
            {node.children.map((child, index) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                containerIndex={containerIndex}
                columnIndex={node.type === 'section' ? null : columnIndex}
                widgetIndex={child.type === 'widget' ? index : null}
                isNavigationDragging={isNavigationDragging}
                activeDropZone={activeDropZone}
                activeItem={activeItem}
                onItemClick={onItemClick}
                onSectionRename={onSectionRename}
                renamingSectionId={renamingSectionId}
                renameValue={renameValue}
                onRenameValueChange={onRenameValueChange}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
                draggedItem={draggedItem}
              />
            ))}

            {/* Drop zone after last child - only for widgets when dragging widgets */}
            {shouldShowDropZone && node.type === 'column' && isDraggingWidget && (
              <DropZoneIndicator
                dropId={`after-${node.id}-children`}
                position="after"
                level={level + 1}
                isDragOverActive={activeDropZone === `after-${node.id}-children`}
              />
            )}
          </div>
        )}

        {/* Drop zone after this node */}
        {shouldShowDropZone && (
          <>
            {/* For sections at top level */}
            {level === 0 && isDraggingSection && (
              <DropZoneIndicator
                dropId={`after-${node.id}`}
                position="after"
                level={level}
                isDragOverActive={activeDropZone === `after-${node.id}`}
              />
            )}

            {/* For individual widgets */}
            {node.type === 'widget' && isDraggingWidget && (
              <DropZoneIndicator
                dropId={`after-${node.id}`}
                position="after"
                level={level}
                isDragOverActive={activeDropZone === `after-${node.id}`}
              />
            )}
          </>
        )}
      </div>
      </>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.level === nextProps.level &&
      prevProps.isNavigationDragging === nextProps.isNavigationDragging &&
      prevProps.activeDropZone === nextProps.activeDropZone &&
      prevProps.activeItem === nextProps.activeItem &&
      prevProps.node.name === nextProps.node.name &&
      prevProps.node.type === nextProps.node.type &&
      prevProps.containerIndex === nextProps.containerIndex &&
      prevProps.columnIndex === nextProps.columnIndex &&
      prevProps.widgetIndex === nextProps.widgetIndex &&
      prevProps.renamingSectionId === nextProps.renamingSectionId &&
      prevProps.renameValue === nextProps.renameValue &&
      prevProps.draggedItem?.type === nextProps.draggedItem?.type
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search structure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto">
        {filteredTree.length > 0 ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleNavigationDragStart}
            onDragOver={handleNavigationDragOver}
            onDragEnd={handleNavigationDragEnd}
          >
            <SortableContext
              items={draggableItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="p-2">
                {filteredTree.map((node, index) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    containerIndex={index}
                    isNavigationDragging={isNavigationDragging}
                    activeDropZone={activeDropZone}
                    activeItem={activeItem}
                    onItemClick={handleItemClick}
                    onSectionRename={handleSectionRename}
                    renamingSectionId={renamingSectionId}
                    renameValue={renameValue}
                    onRenameValueChange={setRenameValue}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={handleRenameCancel}
                    draggedItem={draggedItem}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Enhanced Drag Overlay */}
            <DragOverlay>
              {draggedItem ? (
                <div className="bg-white border-2 border-blue-400 rounded-lg px-4 py-3 shadow-2xl transform rotate-3 ring-4 ring-blue-200 ring-opacity-50">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <draggedItem.icon className={`w-4 h-4 ${
                      draggedItem.type === 'section' ? 'text-red-500' :
                      draggedItem.type === 'column' ? 'text-blue-500' : 'text-green-500'
                    }`} />
                    <span className="text-sm font-semibold text-gray-900">{draggedItem.name}</span>
                    {draggedItem.type === 'widget' && draggedItem.widgetType && (
                      <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded-full">
                        {draggedItem.widgetType}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-10 rounded-lg pointer-events-none" />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchTerm ? 'No items match your search' : 'No sections found'}
            </p>
          </div>
        )}
      </div>

      {/* Statistics Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 flex justify-between">
          <span>{navigationTree.length} sections</span>
          <span>
            {navigationTree.reduce((acc, section) =>
              acc + (section.children?.reduce((colAcc, column) =>
                colAcc + (column.children?.length || 0), 0) || 0), 0
            )} widgets
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavigationTree;
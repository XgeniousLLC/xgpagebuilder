import React, { useState, useMemo } from 'react';
import { ChevronRight, List, Search, MoreHorizontal, Eye, Move, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const PageBuilderNavigation = () => {
  const [showTreeView, setShowTreeView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isNavigationDragging, setIsNavigationDragging] = useState(false);
  const { pageContent, selectedWidget, reorderContainers, reorderWidgets, moveWidgetBetweenColumns } = usePageBuilderStore();

  // Generate navigation tree from page content
  const navigationTree = useMemo(() => {
    if (!pageContent?.containers) return [];

    return pageContent.containers.map((container, containerIndex) => ({
      id: container.id,
      type: 'section',
      name: `Section ${containerIndex + 1}`,
      icon: '□',
      path: `section-${containerIndex}`,
      children: container.columns?.map((column, columnIndex) => ({
        id: column.id,
        type: 'column',
        name: `Column ${columnIndex + 1}`,
        icon: '│',
        path: `section-${containerIndex}.column-${columnIndex}`,
        children: column.widgets?.map((widget, widgetIndex) => ({
          id: widget.id,
          type: 'widget',
          name: widget.type || `Widget ${widgetIndex + 1}`,
          icon: '◦',
          path: `section-${containerIndex}.column-${columnIndex}.widget-${widgetIndex}`,
          widget
        })) || []
      })) || []
    }));
  }, [pageContent]);

  // Generate breadcrumb from selected widget
  const breadcrumb = useMemo(() => {
    if (!selectedWidget) return [];

    // Find the widget in the tree
    for (let sIndex = 0; sIndex < navigationTree.length; sIndex++) {
      const section = navigationTree[sIndex];
      for (let cIndex = 0; cIndex < section.children.length; cIndex++) {
        const column = section.children[cIndex];
        for (let wIndex = 0; wIndex < column.children.length; wIndex++) {
          const widget = column.children[wIndex];
          if (widget.id === selectedWidget.id) {
            return [
              { name: section.name, path: section.path },
              { name: column.name, path: column.path },
              { name: widget.name, path: widget.path }
            ];
          }
        }
      }
    }
    return [];
  }, [selectedWidget, navigationTree]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm) return navigationTree;

    const filterNode = (node) => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = node.children?.map(filterNode).filter(Boolean) || [];

      if (matchesSearch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return navigationTree.map(filterNode).filter(Boolean);
  }, [navigationTree, searchTerm]);

  const handleItemClick = (item) => {
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
  };

  // Navigation drag handlers (isolated from main canvas)
  const handleNavigationDragStart = (event) => {
    const { active } = event;
    setIsNavigationDragging(true);

    // Find the node data from navigation tree
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

    console.log('[Navigation] Drag started:', {
      activeId: active.id,
      nodeData,
      activeData: active.data.current
    });
  };

  const handleNavigationDragEnd = (event) => {
    const { active, over } = event;
    setIsNavigationDragging(false);
    setDraggedItem(null);

    if (!over || active.id === over.id) {
      console.log('[Navigation] No valid drop target or same item');
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log('[Navigation] Drag ended:', {
      activeId: active.id,
      overId: over.id,
      activeData,
      overData
    });

    // Handle section reordering
    if (activeData?.type === 'section' && overData?.type === 'section') {
      const activeIndex = pageContent.containers.findIndex(c => c.id === activeData.id);
      const overIndex = pageContent.containers.findIndex(c => c.id === overData.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        console.log('[Navigation] Reordering sections:', { activeIndex, overIndex });
        reorderContainers(activeIndex, overIndex);
      }
      return;
    }

    // Handle widget reordering within same column
    if (activeData?.type === 'widget' && overData?.type === 'widget') {
      // Extract column information from path
      const activeColumnId = activeData.path?.split('.')[1]?.replace('column-', '');
      const overColumnId = overData.path?.split('.')[1]?.replace('column-', '');

      if (activeColumnId === overColumnId) {
        console.log('[Navigation] Reordering widgets within column:', {
          columnId: activeColumnId,
          activeIndex: activeData.widgetIndex,
          overIndex: overData.widgetIndex
        });

        // Get the actual column ID from pageContent
        const container = pageContent.containers.find(c =>
          c.columns.some(col => col.widgets.some(w => w.id === activeData.id))
        );
        const column = container?.columns.find(col =>
          col.widgets.some(w => w.id === activeData.id)
        );

        if (column) {
          reorderWidgets(column.id, activeData.widgetIndex, overData.widgetIndex);
        }
      } else if (activeColumnId !== overColumnId) {
        // Handle widget movement between columns
        console.log('[Navigation] Moving widget between columns:', {
          widgetId: activeData.id,
          fromColumnIndex: activeColumnId,
          toColumnIndex: overColumnId
        });

        // Find actual column IDs
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
    }
  };

  // Sortable Tree Node component
  const SortableTreeNode = ({ node, level = 0, containerIndex, columnIndex, widgetIndex }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: node.id,
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

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`ml-${level * 4} ${isDragging ? 'z-50' : ''}`}
      >
        <div
          className={`flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-100 group ${
            activeItem === node.id ? 'bg-blue-100 text-blue-800' : ''
          } ${isDragging ? 'bg-blue-50 border border-blue-300' : ''}`}
          onClick={() => handleItemClick(node)}
        >
          {/* Drag handle - only visible on hover or when dragging */}
          <div
            {...attributes}
            {...listeners}
            className="mr-1 p-0.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}

          <span className="mr-2 text-gray-500 font-mono text-sm">{node.icon}</span>
          <span className="flex-1 text-sm">{node.name}</span>

          {node.type === 'widget' && (
            <span className="text-xs text-gray-400 uppercase">{node.widget?.type}</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children.map((child, index) => (
              <SortableTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                containerIndex={containerIndex}
                columnIndex={node.type === 'section' ? null : columnIndex}
                widgetIndex={child.type === 'widget' ? index : null}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Page Structure</h2>

          {breadcrumb.length > 0 && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <nav className="flex items-center space-x-1 text-sm">
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={item.path}>
                    {index > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                    <button
                      onClick={() => handleItemClick({ id: item.path })}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTreeView(!showTreeView)}
            className={`p-2 rounded-lg transition-colors ${
              showTreeView ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title="Toggle tree view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree View */}
      {showTreeView && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections, columns, widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Navigation Tree (with dedicated DndContext) */}
            <div className="bg-white rounded-lg border max-h-64 overflow-y-auto">
              {filteredTree.length > 0 ? (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragStart={handleNavigationDragStart}
                  onDragEnd={handleNavigationDragEnd}
                >
                  <SortableContext
                    items={filteredTree.map(node => node.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="p-2">
                      {filteredTree.map((node, index) => (
                        <SortableTreeNode
                          key={node.id}
                          node={node}
                          containerIndex={index}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {/* Navigation Drag Overlay */}
                  <DragOverlay>
                    {draggedItem ? (
                      <div className="bg-blue-50 border border-blue-300 rounded px-3 py-2 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 font-mono text-sm">{draggedItem.icon}</span>
                          <span className="text-sm font-medium">{draggedItem.name}</span>
                          {draggedItem.type === 'widget' && (
                            <span className="text-xs text-gray-400 uppercase">{draggedItem.widget?.type}</span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchTerm ? 'No items match your search' : 'No sections found'}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="mt-3 text-xs text-gray-500 flex justify-between">
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
      )}
    </div>
  );
};

export default PageBuilderNavigation;
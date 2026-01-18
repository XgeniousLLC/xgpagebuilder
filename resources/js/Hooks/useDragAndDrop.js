import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import Swal from 'sweetalert2';

export const useDragAndDrop = () => {
  const {
    setIsDragging,
    setActiveId,
    setHoveredDropZone,
    addWidgetToColumn,
    addContainer,
    reorderWidgets,
    reorderContainers,
    updateWidget,
    moveWidgetBetweenColumns,
    // Enhanced global drag state actions
    setGlobalDragState,
    setActiveDropTarget,
    resetGlobalDragState,
    updateMousePosition,
    // Section drag state actions
    setIsDraggingSection,
    setDraggedSectionId,
    calculateDropZones,
    setActiveDropZone,
    clearDragState
  } = usePageBuilderStore();

  const handleDragStart = (event) => {
    const { active } = event;
    const activeData = active.data.current;

    console.log('[DragAndDrop] Enhanced drag started:', {
      activeId: active.id,
      activeData: activeData,
      containerId: activeData?.containerId,
      columnId: activeData?.columnId
    });

    setActiveId(active.id);

    // Enhanced global drag state with cross-container awareness
    setGlobalDragState(true, activeData, {
      containerId: activeData?.containerId,
      columnId: activeData?.columnId,
      itemType: activeData?.type,
      mousePosition: null // Will be updated by mouse move events
    });

    // Backward compatibility with old setIsDragging
    setIsDragging(true, activeData);

    // Check if we're dragging a section/container
    if (activeData?.type === 'container') {
      console.log('[DragAndDrop] Section drag detected, setting up drop zones');
      setIsDraggingSection(true);
      setDraggedSectionId(active.id);
      calculateDropZones();
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (over) {
      const activeData = active.data.current;
      const overData = over.data.current;

      // Handle section drag over drop zones
      if (activeData?.type === 'container' && overData?.type === 'section-drop-zone') {
        console.log('[DragAndDrop] Section hovering over drop zone:', {
          activeId: active.id,
          dropZone: overData
        });
        setActiveDropZone({
          id: over.id,
          position: overData.position,
          index: overData.index,
          containerId: overData.containerId
        });
      } else {
        // Clear active drop zone if not over a section drop zone
        if (activeData?.type === 'container') {
          setActiveDropZone(null);
        }
      }

      // Check if this is a valid drop target
      const isValidDrop = validateDropTarget(activeData, overData);

      setHoveredDropZone({
        id: over.id,
        isValid: isValidDrop
      });
    }
  };

  // Helper function to validate drop targets
  const validateDropTarget = (activeData, overData) => {
    if (!activeData || !overData) return false;

    // Section widgets can be dropped on canvas or other sections (will be placed after)
    if (activeData?.widget?.type === 'section') {
      return overData?.type === 'canvas' || overData?.type === 'section';
    }

    // Container widgets can only be dropped on canvas
    if (activeData?.widget?.type === 'container') {
      return overData?.type === 'canvas';
    }

    // Regular widgets can be dropped in columns OR on canvas (with auto-section creation)
    if (activeData?.type === 'widget-template') {
      return overData?.type === 'column' || overData?.type === 'canvas' || overData?.type === 'widget';
    }

    // Widgets can be reordered within columns or between columns
    if (activeData?.type === 'widget') {
      return overData?.type === 'column' || overData?.type === 'widget';
    }

    // Sections can be dropped on canvas
    if (activeData?.type === 'section-template') {
      return overData?.type === 'canvas';
    }

    return true;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    console.log('[DragAndDrop] Enhanced drag ended:', {
      activeId: active.id,
      overId: over?.id,
      activeData: active.data.current,
      overData: over?.data.current
    });

    setActiveId(null);
    setIsDragging(false, null);
    setHoveredDropZone(null);

    // Reset enhanced global drag state
    resetGlobalDragState();

    // Clean up section drag state
    const activeData = active.data.current;
    if (activeData?.type === 'container') {
      clearDragState();
    }

    if (!over) {
      console.log('[DragAndDrop] No drop target - drag cancelled');
      return;
    }

    try {
      const activeData = active.data.current;
      const overData = over.data.current;

      console.log('[DragAndDrop] Processing drag data:', {
        activeType: activeData?.type,
        overType: overData?.type,
        activeDataFull: activeData,
        overDataFull: overData
      });

      // Handle section drop on drop zones (Priority 1)
      if (activeData?.type === 'container' && overData?.type === 'section-drop-zone') {
        console.log('[DragAndDrop] Section dropped on drop zone:', {
          sectionId: active.id,
          dropZone: overData,
          targetIndex: overData.index
        });

        const { pageContent } = usePageBuilderStore.getState();
        const oldIndex = pageContent.containers.findIndex(c => c.id === active.id);
        const newIndex = overData.index;

        console.log('[DragAndDrop] Drop zone reordering:', {
          oldIndex,
          newIndex,
          containersCount: pageContent.containers.length
        });

        if (oldIndex !== -1 && newIndex >= 0 && oldIndex !== newIndex) {
          // Adjust newIndex if dragging to a position after the current position
          const adjustedNewIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;

          console.log('[DragAndDrop] Executing drop zone reorder:', {
            oldIndex,
            adjustedNewIndex
          });

          reorderContainers(oldIndex, adjustedNewIndex);

          console.log('✅ Section reordered via drop zone successfully');
        }
        return;
      }

      // Handle widget panel drop on drop zones (Create new section with widget)
      if (activeData?.type === 'widget-template' && overData?.type === 'widget-drop-zone') {
        console.log('[DragAndDrop] Widget from panel dropped on drop zone:', {
          widget: activeData.widget.type,
          dropZone: overData,
          targetIndex: overData.index
        });

        // Create new section container with the widget inside
        const newContainerId = `section-${Date.now()}`;
        const newColumnId = `column-${Date.now()}`;

        // Helper to ensure we get an object, not an array
        const ensureObject = (val) => {
          if (!val || (Array.isArray(val) && val.length === 0)) return {};
          if (typeof val !== 'object') return {};
          return val;
        };

        // Create widget with unique ID and proper structure
        const newWidget = {
          id: `widget-${Date.now()}`,
          type: activeData.widget.type,
          general: ensureObject(activeData.widget.defaultContent || activeData.widget.content),
          style: ensureObject(activeData.widget.defaultStyle),
          advanced: ensureObject(activeData.widget.defaultAdvanced)
        };

        const newSection = {
          id: newContainerId,
          type: 'section',
          columns: [{
            id: newColumnId,
            width: '100%',
            widgets: [newWidget],
            settings: {}
          }],
          settings: {
            padding: '40px 20px',
            margin: '0px',
            backgroundColor: '#ffffff'
          }
        };

        // Insert section at the specified index
        const { pageContent, setPageContent, currentPageId, saveWidgetAllSettings, autoSave } = usePageBuilderStore.getState();
        const newContainers = [...pageContent.containers];
        newContainers.splice(overData.index, 0, newSection);

        setPageContent({
          ...pageContent,
          containers: newContainers
        });

        // IMPORTANT: Save the widget to the database
        if (currentPageId) {
          console.log('[DragAndDrop] Saving widget created via drop zone:', newWidget.id);
          try {
            await saveWidgetAllSettings(currentPageId, newWidget.id, {
              type: newWidget.type,
              widget_type: newWidget.type,
              general: newWidget.general || {},
              style: newWidget.style || {},
              advanced: newWidget.advanced || {}
            });
            // Force a page save after widget is saved
            await autoSave(currentPageId);
            console.log('[DragAndDrop] Widget and page saved successfully:', newWidget.id);
          } catch (error) {
            console.error('[DragAndDrop] Failed to save widget on drop zone creation:', error);
          }
        }

        console.log(`✅ Widget from panel inserted as new section at position ${overData.index}`);
        return;
      }

      // Validation Rules
      // Rule 1: Handle section widget placement
      if (activeData?.widget?.type === 'section' && overData?.type === 'section') {
        // Section dropped on another section - place it after the target section
        const { pageContent } = usePageBuilderStore.getState();
        const targetSectionIndex = pageContent.containers.findIndex(c => c.id === over.id);

        if (targetSectionIndex !== -1) {
          // Create new section container
          const newContainerId = `section-${Date.now()}`;
          const newSection = {
            id: newContainerId,
            type: 'section',
            columns: [{
              id: `column-${Date.now()}`,
              width: '100%',
              widgets: [],
              settings: {}
            }],
            settings: {
              padding: '40px 20px',
              margin: '0px',
              backgroundColor: 'transparent'
            },
            widgetType: 'section',
            widgetSettings: activeData.widget.content || {}
          };

          // Insert after target section
          const newContainers = [...pageContent.containers];
          newContainers.splice(targetSectionIndex + 1, 0, newSection);

          const { setPageContent } = usePageBuilderStore.getState();
          setPageContent({
            ...pageContent,
            containers: newContainers
          });

          // Show success alert
          Swal.fire({
            icon: 'success',
            title: 'Section Added',
            text: 'New section has been added after the target section',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
        return;
      }

      // Rule 1b: Section widgets can only be placed on canvas or other sections
      if (activeData?.widget?.type === 'section' && overData?.type !== 'canvas' && overData?.type !== 'section') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Placement',
          text: 'Section widgets can only be placed on the main canvas or after other sections',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Rule 2: Container widgets cannot be placed inside other containers/columns
      if (activeData?.widget?.type === 'container' && overData?.type === 'column') {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Placement',
          text: 'Container widgets cannot be placed inside other containers or columns',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Rule 3: Auto-create section for regular widgets dropped on canvas
      if (activeData?.type === 'widget-template' &&
        activeData?.widget?.type !== 'container' &&
        activeData?.widget?.type !== 'section' &&
        overData?.type === 'canvas') {

        console.log('Auto-creating section for widget dropped on canvas');

        // Auto-create a section container with the widget inside
        const newContainerId = `section-${Date.now()}`;
        const newColumnId = `column-${Date.now()}`;

        // Helper to ensure we get an object, not an array
        const ensureObj = (val) => {
          if (!val || (Array.isArray(val) && val.length === 0)) return {};
          if (typeof val !== 'object') return {};
          return val;
        };

        // Create widget with unique ID
        const newWidget = {
          id: `widget-${Date.now()}`,
          type: activeData.widget.type,
          general: ensureObj(activeData.widget.defaultContent || activeData.widget.content),
          style: ensureObj(activeData.widget.defaultStyle),
          advanced: ensureObj(activeData.widget.defaultAdvanced)
        };

        addContainer({
          id: newContainerId,
          type: 'section',
          columns: [{
            id: newColumnId,
            width: '100%',
            widgets: [newWidget], // Place the widget inside the auto-created column
            settings: {}
          }],
          settings: {
            padding: '40px 20px',
            margin: '0px',
            backgroundColor: 'transparent'
          }
        });

        // IMPORTANT: Also save the widget to the database
        const { currentPageId, saveWidgetAllSettings, autoSave } = usePageBuilderStore.getState();
        if (currentPageId) {
          console.log('[DragAndDrop] Saving widget created via auto-section:', newWidget.id);
          try {
            await saveWidgetAllSettings(currentPageId, newWidget.id, {
              type: newWidget.type,
              widget_type: newWidget.type,
              general: newWidget.general || {},
              style: newWidget.style || {},
              advanced: newWidget.advanced || {}
            });
            // Force a page save after widget is saved
            await autoSave(currentPageId);
            console.log('[DragAndDrop] Widget and page saved successfully:', newWidget.id);
          } catch (error) {
            console.error('[DragAndDrop] Failed to save widget on auto-section creation:', error);
          }
        }

        // Show user-friendly message
        console.info(`✅ Auto-created section for ${activeData.widget.type} widget`);
        return;
      }

      // Handle widget drop from panel to column
      if (activeData?.type === 'widget-template' && overData?.type === 'column') {
        await addWidgetToColumn(activeData.widget, overData.columnId, overData.containerId);
        return;
      }

      // [NEW] Handle widget drop from panel to widget drop zone (precise insertion)
      if (activeData?.type === 'widget-template' && overData?.type === 'widget-drop-zone') {
        console.log('[DragAndDrop] 🎯 Widget from panel dropped on drop zone:', {
          widget: activeData.widget.type,
          position: overData.position,
          insertIndex: overData.insertIndex,
          columnId: overData.columnId,
          containerId: overData.containerId
        });

        // Use addWidgetToColumn to ensure widget is saved to database
        await addWidgetToColumn(activeData.widget, overData.columnId, overData.containerId);

        console.log(`✅ Widget from panel added via drop zone`);
        return;
      }

      // [NEW] Handle existing widget drop to widget drop zone (reordering/moving)
      if (activeData?.type === 'widget' && overData?.type === 'widget-drop-zone') {
        console.log('[DragAndDrop] 🎯 Widget dropped on drop zone:', {
          widgetId: activeData.widget.id,
          position: overData.position,
          insertIndex: overData.insertIndex,
          sourceColumn: activeData.columnId,
          targetColumn: overData.columnId,
          sameColumn: activeData.columnId === overData.columnId
        });

        if (activeData.columnId === overData.columnId) {
          // Same column - reorder using drop zone index
          const { pageContent } = usePageBuilderStore.getState();
          const container = pageContent.containers.find(c => c.id === activeData.containerId);
          const column = container?.columns.find(c => c.id === activeData.columnId);

          if (column) {
            const oldIndex = column.widgets.findIndex(w => w.id === activeData.widget.id);
            let newIndex = overData.insertIndex;

            // Adjust index if moving within same column
            if (oldIndex < newIndex) {
              newIndex = newIndex - 1; // Account for removed item
            }

            if (oldIndex !== newIndex && oldIndex !== -1) {
              console.log('[DragAndDrop] 🔄 Reordering via drop zone:', { oldIndex, newIndex });
              reorderWidgets(activeData.columnId, oldIndex, newIndex);
            }
          }
        } else {
          // Cross-column movement via drop zone
          console.log('[DragAndDrop] 🔄 Cross-column movement via drop zone');
          moveWidgetBetweenColumns(
            activeData.widget.id,
            activeData.columnId,
            overData.columnId,
            overData.insertIndex
          );
        }

        console.log(`✅ Widget moved via drop zone`);
        return;
      }

      // Handle widget drop from panel to existing widget (enhanced positioning)
      if (activeData?.type === 'widget-template' && overData?.type === 'widget') {
        const { dragState } = usePageBuilderStore.getState();
        const dropPosition = dragState.dropPosition;

        console.log('[DragAndDrop] Widget from panel dropped on widget:', {
          widget: activeData.widget.type,
          targetWidget: overData.widget.id,
          position: dropPosition,
          columnId: overData.columnId,
          targetIndex: overData.widgetIndex
        });

        // Use addWidgetToColumn to ensure widget is saved to database
        await addWidgetToColumn(activeData.widget, overData.columnId, overData.containerId);

        console.log(`✅ Widget from panel added via widget drop`);
        return;
      }

      // Handle section widget drop on canvas
      if (activeData?.type === 'widget-template' &&
        activeData?.widget?.type === 'section' &&
        overData?.type === 'canvas') {

        // Create a new section container
        const newContainerId = `section-${Date.now()}`;

        addContainer({
          id: newContainerId,
          type: 'section',
          columns: [{
            id: `column-${Date.now()}`,
            width: '100%',
            widgets: [],
            settings: {}
          }],
          settings: {
            padding: '40px 20px',
            margin: '0px',
            backgroundColor: 'transparent'
          },
          widgetType: 'section',
          widgetSettings: activeData.widget.content || {}
        });
        return;
      }

      // Handle container widget drop on canvas - only containers allowed on canvas
      if (activeData?.type === 'widget-template' &&
        activeData?.widget?.type === 'container' &&
        overData?.type === 'canvas') {

        // Create a new container based on the container widget settings
        const newContainerId = `container-${Date.now()}`;
        const columns = activeData.widget.defaultContent?.columns || 1;

        const containerColumns = Array.from({ length: columns }).map((_, index) => ({
          id: `column-${Date.now()}-${index}`,
          width: `${100 / columns}%`,
          widgets: [],
          settings: {}
        }));

        addContainer({
          id: newContainerId,
          type: 'section',
          columns: containerColumns,
          settings: {
            padding: activeData.widget.defaultContent?.padding || '40px 20px',
            margin: '0px',
            backgroundColor: activeData.widget.defaultContent?.backgroundColor || '#ffffff',
            gap: activeData.widget.defaultContent?.gap || '20px'
          }
        });
        return;
      }

      // Handle section drop from panel to canvas
      if (activeData?.type === 'section-template' && overData?.type === 'canvas') {
        addContainer({
          type: 'section',
          columns: activeData.section.columns || [
            {
              id: `column-${Date.now()}`,
              width: '100%',
              widgets: [],
              settings: {}
            }
          ],
          settings: activeData.section.settings || {}
        });
        return;
      }


      // Simplified widget-to-widget reordering (Basic @dnd-kit sortable)
      if (activeData?.type === 'widget' && overData?.type === 'widget') {
        console.log('[DragAndDrop] 🎯 BASIC WIDGET SORTING - Widget dropped on widget:', {
          activeWidget: activeData.widget.id,
          targetWidget: overData.widget.id,
          sameColumn: activeData.columnId === overData.columnId,
          activeColumnId: activeData.columnId,
          overColumnId: overData.columnId,
          activeIndex: activeData.widgetIndex,
          overIndex: overData.widgetIndex
        });

        if (activeData.columnId === overData.columnId) {
          // Same column - simple reordering using @dnd-kit indices
          const oldIndex = activeData.widgetIndex;
          const newIndex = overData.widgetIndex;

          console.log('[DragAndDrop] 🔄 BASIC WIDGET SORTING - Same column reorder:', {
            columnId: activeData.columnId,
            oldIndex,
            newIndex
          });

          if (oldIndex !== newIndex && oldIndex >= 0 && newIndex >= 0) {
            reorderWidgets(activeData.columnId, oldIndex, newIndex);
            console.log('✅ Basic widget reordered successfully');
          }
        } else {
          // Different columns - handle cross-column movement
          console.log('[DragAndDrop] 🔄 Cross-column widget movement');
          moveWidgetBetweenColumns(
            activeData.widget.id,
            activeData.columnId,
            overData.columnId,
            overData.widgetIndex
          );
        }
        return;
      }

      // Handle widget drop to different column
      if (activeData?.type === 'widget' && overData?.type === 'column') {
        if (activeData.columnId !== overData.columnId) {
          console.log('[DragAndDrop] Moving widget between columns:', {
            widgetId: activeData.widget.id,
            fromColumn: activeData.columnId,
            toColumn: overData.columnId,
            fromContainer: activeData.containerId,
            toContainer: overData.containerId
          });

          // Move widget to different column using store method
          moveWidgetBetweenColumns(
            activeData.widget.id,
            activeData.columnId,
            overData.columnId,
            overData.containerId
          );
        }
        return;
      }

      // Handle widget drop on another widget (for reordering between columns)
      if (activeData?.type === 'widget' && overData?.type === 'widget' &&
        activeData.columnId !== overData.columnId) {
        console.log('[DragAndDrop] Moving widget via widget drop:', {
          widgetId: activeData.widget.id,
          fromColumn: activeData.columnId,
          toColumn: overData.columnId,
          fromContainer: activeData.containerId,
          toContainer: overData.containerId
        });

        // Move widget to the same column as the target widget
        moveWidgetBetweenColumns(
          activeData.widget.id,
          activeData.columnId,
          overData.columnId,
          overData.containerId
        );
        return;
      }

      // Handle container reordering - check for container drops or drops within containers
      if (activeData?.type === 'container' && (overData?.type === 'container' || overData?.containerId)) {
        console.log('[DragAndDrop] Container reordering detected:', {
          activeId: active.id,
          overId: over.id,
          activeData,
          overData
        });

        const { pageContent } = usePageBuilderStore.getState();
        const oldIndex = pageContent.containers.findIndex(c => c.id === active.id);

        // Find target container ID - either direct container or container of the dropped element
        const targetContainerId = overData?.type === 'container' ? over.id : overData?.containerId;
        const newIndex = pageContent.containers.findIndex(c => c.id === targetContainerId);

        console.log('[DragAndDrop] Container reordering indices:', {
          oldIndex,
          newIndex,
          targetContainerId,
          containersCount: pageContent.containers.length
        });

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          console.log('[DragAndDrop] Executing container reorder');
          reorderContainers(oldIndex, newIndex);

          // Show success feedback
          console.log('✅ Section reordered successfully');
        } else {
          console.warn('[DragAndDrop] Container reorder skipped - invalid indices or same position');
        }
        return;
      }
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
      console.error('Active data:', active.data.current);
      console.error('Over data:', over?.data?.current);
    }
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};
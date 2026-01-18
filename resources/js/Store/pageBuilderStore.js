import { create } from 'zustand';
import { router } from '@inertiajs/react';

// Helper function to move array items
const arrayMove = (array, oldIndex, newIndex) => {
  const newArray = [...array];
  const [removed] = newArray.splice(oldIndex, 1);
  newArray.splice(newIndex, 0, removed);
  return newArray;
};

const usePageBuilderStore = create((set, get) => ({
  // State
  pageContent: {
    containers: []
  },
  originalContent: null,
  selectedWidget: null,
  activePanel: 'widgets',
  isDirty: false,
  isDragging: false,
  activeId: null,
  hoveredDropZone: null,
  settingsPanelVisible: false,
  navigationDialogVisible: false, // Navigation dialog visibility
  navigationDialogPosition: { x: 100, y: 100 }, // Dialog position
  sidebarCollapsed: false, // Left sidebar collapse state
  widgetSnapshots: {}, // Store original widget states for reverting changes

  // Auto-save state
  autoSaveEnabled: true,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  currentPageId: null, // Track current page ID for auto-save

  // Responsive Device State
  currentDevice: 'desktop', // Current device mode: 'desktop', 'tablet', 'mobile'
  canvasViewport: {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  },
  deviceBreakpoints: {
    desktop: { min: 1025, label: 'Desktop (1025px+)' },
    tablet: { min: 769, max: 1024, label: 'Tablet (769px - 1024px)' },
    mobile: { max: 768, label: 'Mobile (≤768px)' }
  },

  // Enhanced global drag state for cross-container always-visible drop zones
  dragState: {
    // Section dragging
    isDraggingSection: false,
    draggedSectionId: null,
    availableDropZones: [], // [{ id, position, index, type }]
    activeDropZone: null,   // Currently highlighted drop zone

    // Global widget dragging (supports cross-container operations)
    isDragging: false,      // Global drag state for all widgets
    draggedItem: null,      // Currently dragged item (widget, template, or section)
    draggedItemType: null,  // 'widget', 'widget-template', 'section'
    dragStartContainer: null, // Container where drag started
    dragStartColumn: null,  // Column where drag started

    // Drop positioning and targeting
    dropPosition: null,     // Current drop position ('before' or 'after')
    activeDropTarget: null, // Currently active drop target info
    crossContainerMode: false, // Whether dragging across containers

    // Visual feedback state
    showAllDropZones: false, // Show drop zones in all containers
    dropZoneVisibility: {},  // Per-container drop zone visibility

    // Performance optimization
    dragStartTime: null,    // When drag started (for velocity calculations)
    lastMousePosition: null, // Last recorded mouse position
    dragVelocity: { x: 0, y: 0 } // Mouse movement velocity
  },

  // Actions
  initializePageContent: (content) => set({
    pageContent: content || { containers: [] },
    originalContent: content || { containers: [] }
  }),

  setPageContent: (updater) => set(state => {
    const newContent = typeof updater === 'function' ? updater(state.pageContent) : updater;
    return {
      pageContent: newContent,
      isDirty: JSON.stringify(newContent) !== JSON.stringify(state.originalContent)
    };
  }),

  setSelectedWidget: (widget) => set(state => {
    // Create snapshot when selecting a widget for the first time
    if (widget && widget.id && !state.widgetSnapshots[widget.id]) {
      return {
        selectedWidget: widget,
        settingsPanelVisible: widget !== null,
        widgetSnapshots: {
          ...state.widgetSnapshots,
          [widget.id]: {
            content: JSON.parse(JSON.stringify(widget.content || {})),
            style: JSON.parse(JSON.stringify(widget.style || {})),
            advanced: JSON.parse(JSON.stringify(widget.advanced || {}))
          }
        }
      };
    }

    return {
      selectedWidget: widget,
      settingsPanelVisible: widget !== null
    };
  }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setIsDragging: (isDragging, draggedItem = null) => set(state => ({
    isDragging,
    dragState: {
      ...state.dragState,
      isDragging,
      draggedItem: isDragging ? draggedItem : null,
      draggedItemType: isDragging && draggedItem ? (draggedItem.type || 'widget') : null,
      showAllDropZones: isDragging, // Always show drop zones when dragging
      dragStartTime: isDragging ? Date.now() : null,
      // Reset positioning when drag ends
      dropPosition: isDragging ? state.dragState.dropPosition : null,
      activeDropTarget: isDragging ? state.dragState.activeDropTarget : null,
      crossContainerMode: isDragging ? state.dragState.crossContainerMode : false
    }
  })),

  setActiveId: (activeId) => set({ activeId }),

  setHoveredDropZone: (zone) => set({ hoveredDropZone: zone }),

  setDropPosition: (position) => set(state => ({
    dragState: {
      ...state.dragState,
      dropPosition: position
    }
  })),

  // Enhanced drag state management actions
  setGlobalDragState: (isDragging, draggedItem = null, options = {}) => set(state => ({
    dragState: {
      ...state.dragState,
      isDragging,
      draggedItem: isDragging ? draggedItem : null,
      draggedItemType: isDragging && draggedItem ? (draggedItem.type || options.itemType || 'widget') : null,
      dragStartContainer: isDragging ? options.containerId : null,
      dragStartColumn: isDragging ? options.columnId : null,
      showAllDropZones: isDragging,
      dragStartTime: isDragging ? Date.now() : null,
      lastMousePosition: isDragging ? options.mousePosition : null,
      // Reset when drag ends
      dropPosition: isDragging ? state.dragState.dropPosition : null,
      activeDropTarget: isDragging ? state.dragState.activeDropTarget : null,
      crossContainerMode: isDragging ? state.dragState.crossContainerMode : false,
      dropZoneVisibility: isDragging ? state.dragState.dropZoneVisibility : {}
    }
  })),

  setActiveDropTarget: (target) => set(state => ({
    dragState: {
      ...state.dragState,
      activeDropTarget: target,
      crossContainerMode: target && target.containerId !== state.dragState.dragStartContainer
    }
  })),

  updateMousePosition: (position) => set(state => {
    const lastPos = state.dragState.lastMousePosition;
    const velocity = lastPos ? {
      x: position.x - lastPos.x,
      y: position.y - lastPos.y
    } : { x: 0, y: 0 };

    return {
      dragState: {
        ...state.dragState,
        lastMousePosition: position,
        dragVelocity: velocity
      }
    };
  }),

  setDropZoneVisibility: (containerId, visible) => set(state => ({
    dragState: {
      ...state.dragState,
      dropZoneVisibility: {
        ...state.dragState.dropZoneVisibility,
        [containerId]: visible
      }
    }
  })),

  resetGlobalDragState: () => set(state => ({
    dragState: {
      ...state.dragState,
      isDragging: false,
      draggedItem: null,
      draggedItemType: null,
      dragStartContainer: null,
      dragStartColumn: null,
      dropPosition: null,
      activeDropTarget: null,
      crossContainerMode: false,
      showAllDropZones: false,
      dropZoneVisibility: {},
      dragStartTime: null,
      lastMousePosition: null,
      dragVelocity: { x: 0, y: 0 }
    }
  })),

  setSettingsPanelVisible: (visible) => set({ settingsPanelVisible: visible }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Section drag actions
  setIsDraggingSection: (isDragging) => set(state => ({
    dragState: {
      ...state.dragState,
      isDraggingSection: isDragging,
      draggedSectionId: isDragging ? state.dragState.draggedSectionId : null,
      availableDropZones: isDragging ? state.dragState.availableDropZones : [],
      activeDropZone: isDragging ? state.dragState.activeDropZone : null
    }
  })),

  setDraggedSectionId: (sectionId) => set(state => ({
    dragState: {
      ...state.dragState,
      draggedSectionId: sectionId
    }
  })),

  setAvailableDropZones: (dropZones) => set(state => ({
    dragState: {
      ...state.dragState,
      availableDropZones: dropZones
    }
  })),

  setActiveDropZone: (dropZone) => set(state => ({
    dragState: {
      ...state.dragState,
      activeDropZone: dropZone
    }
  })),

  calculateDropZones: () => set(state => {
    const { containers } = state.pageContent;
    const dropZones = [];

    // Add drop zone before first container
    dropZones.push({
      id: 'drop-zone-before-0',
      position: 'before',
      index: 0,
      type: 'section-drop-zone'
    });

    // Add drop zones after each container
    containers.forEach((container, index) => {
      dropZones.push({
        id: `drop-zone-after-${index}`,
        position: 'after',
        index: index + 1,
        containerId: container.id,
        type: 'section-drop-zone'
      });
    });

    return {
      dragState: {
        ...state.dragState,
        availableDropZones: dropZones
      }
    };
  }),

  clearDragState: () => set(state => ({
    dragState: {
      isDraggingSection: false,
      draggedSectionId: null,
      availableDropZones: [],
      activeDropZone: null
    }
  })),

  toggleSettingsPanel: () => set(state => ({ settingsPanelVisible: !state.settingsPanelVisible })),

  // Navigation dialog methods
  toggleNavigationDialog: () => set(state => ({ navigationDialogVisible: !state.navigationDialogVisible })),
  setNavigationDialogPosition: (position) => set(state => ({ navigationDialogPosition: position })),

  // Widget snapshot methods
  createWidgetSnapshot: (widgetId, widget) => set(state => ({
    widgetSnapshots: {
      ...state.widgetSnapshots,
      [widgetId]: {
        content: JSON.parse(JSON.stringify(widget.content || {})),
        style: JSON.parse(JSON.stringify(widget.style || {})),
        advanced: JSON.parse(JSON.stringify(widget.advanced || {}))
      }
    }
  })),

  revertWidgetToSnapshot: (widgetId) => set(state => {
    const snapshot = state.widgetSnapshots[widgetId];
    if (!snapshot) return state;

    return {
      pageContent: {
        ...state.pageContent,
        containers: state.pageContent.containers.map(container => ({
          ...container,
          columns: container.columns.map(column => ({
            ...column,
            widgets: column.widgets.map(widget =>
              widget.id === widgetId
                ? {
                  ...widget,
                  content: JSON.parse(JSON.stringify(snapshot.content)),
                  style: JSON.parse(JSON.stringify(snapshot.style)),
                  advanced: JSON.parse(JSON.stringify(snapshot.advanced))
                }
                : widget
            )
          }))
        }))
      },
      selectedWidget: state.selectedWidget?.id === widgetId
        ? {
          ...state.selectedWidget,
          content: JSON.parse(JSON.stringify(snapshot.content)),
          style: JSON.parse(JSON.stringify(snapshot.style)),
          advanced: JSON.parse(JSON.stringify(snapshot.advanced))
        }
        : state.selectedWidget
    };
  }),

  clearWidgetSnapshot: (widgetId) => set(state => {
    const newSnapshots = { ...state.widgetSnapshots };
    delete newSnapshots[widgetId];
    return { widgetSnapshots: newSnapshots };
  }),

  clearAllWidgetSnapshots: () => set({ widgetSnapshots: {} }),

  // Container Actions
  addContainer: async (container) => {
    set(state => ({
      pageContent: {
        ...state.pageContent,
        containers: [...state.pageContent.containers, {
          id: `container-${Date.now()}`,
          type: 'section',
          columns: [
            {
              id: `column-${Date.now()}`,
              width: '100%',
              widgets: [],
              settings: {}
            }
          ],
          settings: {
            padding: '20px',
            margin: '0px',
            backgroundColor: '#ffffff'
          },
          ...container
        }]
      },
      isDirty: true
    }));

    // Immediate save for structural change
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      await autoSave(currentPageId);
    }
  },

  insertSectionAt: async (position, section) => {
    set(state => {
      const newContainers = [...state.pageContent.containers];
      newContainers.splice(position, 0, {
        id: section.id || `container-${Date.now()}`,
        type: 'section',
        columns: section.columns || [
          {
            id: `column-${Date.now()}`,
            width: '100%',
            widgets: [],
            settings: {}
          }
        ],
        settings: {
          padding: '20px',
          margin: '0px',
          backgroundColor: '#ffffff',
          ...section.settings
        },
        ...section
      });

      return {
        pageContent: {
          ...state.pageContent,
          containers: newContainers
        },
        isDirty: true
      };
    });

    // Immediate save for structural change
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      await autoSave(currentPageId);
    }
  },

  // Widget Actions
  addWidgetToColumn: async (widgetTemplate, columnId, containerId) => {
    // Helper to ensure we get an object, not an array
    const ensureObject = (val) => {
      if (!val || (Array.isArray(val) && val.length === 0)) return {};
      if (typeof val !== 'object') return {};
      return val;
    };

    try {
      const newWidget = {
        id: `widget-${Date.now()}`,
        type: widgetTemplate.type,
        general: { ...ensureObject(widgetTemplate.defaultContent) },  // Use 'general' instead of 'content'
        style: { ...ensureObject(widgetTemplate.defaultStyle) },
        advanced: { ...ensureObject(widgetTemplate.defaultAdvanced) }
      };

      // Special handling for container widgets
      if (widgetTemplate.type === 'container') {
        const columns = widgetTemplate.defaultContent?.columns || 1;
        newWidget.containerData = {
          id: `container-${Date.now()}`,
          columns: Array.from({ length: columns }).map((_, index) => ({
            id: `column-${Date.now()}-${index}`,
            width: `${100 / columns}%`,
            widgets: [],
            settings: {}
          })),
          settings: {
            padding: widgetTemplate.defaultContent?.padding || '20px',
            backgroundColor: widgetTemplate.defaultContent?.backgroundColor || '#ffffff',
            gap: widgetTemplate.defaultContent?.gap || '20px'
          }
        };
      }

      set(state => ({
        pageContent: {
          ...state.pageContent,
          containers: state.pageContent.containers.map(container =>
            container.id === containerId
              ? {
                ...container,
                columns: container.columns.map(column =>
                  column.id === columnId
                    ? { ...column, widgets: [...column.widgets, newWidget] }
                    : column
                )
              }
              : container
          )
        },
        isDirty: true
      }));

      // IMPORTANT: Save widget to database immediately after adding
      // This ensures the widget is persisted to page_builder_widgets table
      const { currentPageId, saveWidgetAllSettings, autoSave } = get();
      if (currentPageId) {
        console.log('[Store] Widget added via DnD, saving to database:', newWidget.id);

        try {
          // First, save the widget to the database with its initial settings
          await saveWidgetAllSettings(currentPageId, newWidget.id, {
            type: newWidget.type,
            widget_type: newWidget.type,
            general: newWidget.general || {},  // Use 'general' property
            style: newWidget.style || {},
            advanced: newWidget.advanced || {}
          });

          // Then save the entire page structure
          await autoSave(currentPageId);

          console.log('[Store] Widget and page saved successfully:', newWidget.id);
        } catch (error) {
          console.error('[Store] Failed to save widget on DnD:', error);
          // Don't throw - widget is still in memory, user can save manually
        }
      }
    } catch (error) {
      console.error('[PageBuilderStore] Error in addWidgetToColumn:', error);
    }
  },

  updateWidget: (widgetId, updates) => {
    set(state => {
      const updatedWidget = state.selectedWidget?.id === widgetId
        ? { ...state.selectedWidget, ...updates }
        : state.selectedWidget;

      return {
        pageContent: {
          ...state.pageContent,
          containers: state.pageContent.containers.map(container => ({
            ...container,
            columns: container.columns.map(column => ({
              ...column,
              widgets: column.widgets.map(widget =>
                widget.id === widgetId ? { ...widget, ...updates } : widget
              )
            }))
          }))
        },
        // Update selectedWidget if it's the one being updated
        // This ensures the settings panel has the latest data
        selectedWidget: updatedWidget,
        isDirty: true
      };
    });

    // NO auto-save - settings changes only save on manual save button
  },

  removeWidget: async (widgetId) => {
    set(state => ({
      pageContent: {
        ...state.pageContent,
        containers: state.pageContent.containers.map(container => ({
          ...container,
          columns: container.columns.map(column => ({
            ...column,
            widgets: column.widgets.filter(widget => widget.id !== widgetId)
          }))
        }))
      },
      selectedWidget: state.selectedWidget?.id === widgetId ? null : state.selectedWidget,
      isDirty: true
    }));

    // Trigger IMMEDIATE save for widget deletion (structural change)
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      console.log('[Store] Triggering immediate save for widget deletion:', widgetId);
      await autoSave(currentPageId);
    }
  },

  reorderWidgets: async (columnId, oldIndex, newIndex) => {
    set(state => {
      console.log('[Store] 🔄 REORDER WIDGETS START:', {
        columnId,
        oldIndex,
        newIndex,
        timestamp: new Date().toISOString()
      });

      return {
        pageContent: {
          ...state.pageContent,
          containers: state.pageContent.containers.map(container => ({
            ...container,
            columns: container.columns.map(column => {
              if (column.id === columnId) {
                const beforeWidgets = column.widgets.map(w => ({ id: w.id, type: w.type }));
                const newWidgets = [...column.widgets];
                const [removed] = newWidgets.splice(oldIndex, 1);
                newWidgets.splice(newIndex, 0, removed);

                const afterWidgets = newWidgets.map(w => ({ id: w.id, type: w.type }));

                console.log('[Store] ✅ REORDER WIDGETS SUCCESS:', {
                  columnId,
                  oldIndex,
                  newIndex,
                  movedWidget: removed.id,
                  beforeOrder: beforeWidgets,
                  afterOrder: afterWidgets
                });

                return { ...column, widgets: newWidgets };
              }
              return column;
            })
          }))
        },
        isDirty: true
      };
    });



    // Trigger IMMEDIATE save for reordering (structural change)
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      console.log('[Store] Triggering immediate save for reorder');
      await autoSave(currentPageId);
    }
  },

  moveWidgetBetweenColumns: async (widgetId, fromColumnId, toColumnId, toContainerId) => {
    set(state => {
      console.log('[Store] moveWidgetBetweenColumns called:', {
        widgetId,
        fromColumnId,
        toColumnId,
        toContainerId
      });

      let widgetToMove = null;
      let sourceContainerId = null;

      // First pass: find and remove the widget from source column
      const containersAfterRemoval = state.pageContent.containers.map(container => {
        const hasSourceColumn = container.columns.some(col => col.id === fromColumnId);
        if (hasSourceColumn) {
          sourceContainerId = container.id;
        }

        return {
          ...container,
          columns: container.columns.map(column => {
            if (column.id === fromColumnId) {
              const widget = column.widgets.find(w => w.id === widgetId);
              if (widget) {
                widgetToMove = widget;
                console.log('[Store] Found widget to move:', widget);
                return {
                  ...column,
                  widgets: column.widgets.filter(w => w.id !== widgetId)
                };
              }
            }
            return column;
          })
        };
      });

      // Second pass: add widget to destination column
      if (widgetToMove) {
        const finalContainers = containersAfterRemoval.map(container => {
          // Check if this container contains the destination column
          const hasDestColumn = container.columns.some(col => col.id === toColumnId);

          if (hasDestColumn || container.id === toContainerId) {
            console.log('[Store] Adding widget to container:', container.id);
            return {
              ...container,
              columns: container.columns.map(column => {
                if (column.id === toColumnId) {
                  console.log('[Store] Adding widget to column:', column.id);
                  return {
                    ...column,
                    widgets: [...column.widgets, widgetToMove]
                  };
                }
                return column;
              })
            };
          }
          return container;
        });


        return {
          pageContent: {
            ...state.pageContent,
            containers: finalContainers
          },
          isDirty: true
        };
      } else {
        console.warn('[Store] Widget not found for move:', widgetId);
        return state;
      }
    });

    // Trigger IMMEDIATE save for move (structural change)
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      console.log('[Store] Triggering immediate save for move');
      await autoSave(currentPageId);
    }
  },



  // Container Actions
  updateContainer: (containerId, updates) => set(state => ({
    pageContent: {
      ...state.pageContent,
      containers: state.pageContent.containers.map(container =>
        container.id === containerId ? { ...container, ...updates } : container
      )
    },
    isDirty: true
  })),

  removeContainer: async (containerId) => {
    set(state => ({
      pageContent: {
        ...state.pageContent,
        containers: state.pageContent.containers.filter(container => container.id !== containerId)
      },
      selectedWidget: null,
      isDirty: true
    }));

    // Immediate save for structural change
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      await autoSave(currentPageId);
    }
  },

  reorderContainers: async (oldIndex, newIndex) => {
    set(state => ({
      pageContent: {
        ...state.pageContent,
        containers: arrayMove(state.pageContent.containers, oldIndex, newIndex)
      },
      isDirty: true
    }));

    // Immediate save for structural change
    const { currentPageId, autoSave } = get();
    if (currentPageId) {
      await autoSave(currentPageId);
    }
  },

  // Data Transformer: Extract widgets from pageContent for proper database storage
  extractWidgetsFromPageContent: (pageContent) => {
    // Helper to ensure we always get an object, not an array
    const ensureObj = (val) => {
      if (!val || (Array.isArray(val) && val.length === 0)) return {};
      if (typeof val !== 'object') return {};
      return val;
    };

    const widgets = {};
    const cleanContent = {
      containers: pageContent.containers.map(container => ({
        ...container,
        columns: container.columns.map(column => ({
          ...column,
          widgets: column.widgets.map(widget => {
            // Extract widget settings for separate storage
            if (widget.id && widget.type) {
              // Ensure settings are objects, not empty arrays
              const generalSettings = ensureObj(widget.general || widget.content);
              const styleSettings = ensureObj(widget.style);
              const advancedSettings = ensureObj(widget.advanced);

              // Create widget object matching frontend structure
              widgets[widget.id] = {
                id: widget.id,
                type: widget.type,
                container_id: container.id,
                column_id: column.id,
                sort_order: column.widgets.indexOf(widget),

                // Frontend structure - direct properties not nested in settings
                general: generalSettings,
                style: styleSettings,
                advanced: advancedSettings,

                // Database structure for saving (kept for compatibility)
                settings: {
                  general: generalSettings,
                  style: styleSettings,
                  advanced: advancedSettings
                },
                is_visible: widget.is_visible !== false,
                is_enabled: widget.is_enabled !== false,
                version: widget.version || '1.0.0'
              };
            }

            // Return clean widget reference for layout structure
            return {
              id: widget.id,
              type: widget.type
            };
          })
        }))
      }))
    };

    return { content: cleanContent, widgets };
  },

  // Save Actions
  savePage: async (pageId) => {
    const { pageContent, extractWidgetsFromPageContent } = get();
    try {
      // Transform pageContent to separate layout and widget data
      const { content, widgets } = extractWidgetsFromPageContent(pageContent);

      console.log('Saving with separated data:', { content, widgets });

      // Use the new page builder API endpoint with proper data separation
      const response = await fetch('/api/page-builder/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          page_id: pageId,
          content: content,        // Clean layout structure
          widgets: widgets,        // Separate widget data
          is_published: false,     // Save as draft by default
          version: '1.0'
        })
      });

      if (!response.ok) {
        // Check if response is HTML (likely redirect to login)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Authentication required. Please log in as admin.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      // Check if response is HTML instead of JSON
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Authentication required. Please log in as admin.');
      }

      const data = JSON.parse(text);

      if (data.success) {
        set({
          isDirty: false,
          originalContent: pageContent
        });

        // Show success message (you can use a toast library here)
        console.log('Page saved successfully:', data.message);

        return data;
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);

      // Handle authentication errors
      if (error.message.includes('Authentication required')) {
        // Redirect to admin login
        window.location.href = '/admin/login';
      }

      throw error;
    }
  },

  // Auto-save functionality
  autoSave: async (pageId) => {
    const { autoSaveEnabled, isSaving } = get();

    if (!autoSaveEnabled || isSaving) {
      console.log('[Auto-save] Skipped - disabled or already saving');
      return;
    }

    try {
      set({ isSaving: true, saveError: null });
      console.log('[Auto-save] Starting auto-save for page:', pageId);

      await get().savePage(pageId);

      set({
        isSaving: false,
        lastSaved: new Date(),
        saveError: null
      });

      console.log('[Auto-save] Completed successfully');
    } catch (error) {
      console.error('[Auto-save] Failed:', error);
      set({
        isSaving: false,
        saveError: error.message
      });
    }
  },

  // Debounced auto-save to prevent excessive API calls
  debouncedAutoSave: (() => {
    let timeoutId = null;

    return (pageId, delay = 1500) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      console.log('[Auto-save] Debouncing save request...');

      timeoutId = setTimeout(() => {
        get().autoSave(pageId);
      }, delay);
    };
  })(),

  // Set current page ID for auto-save
  setCurrentPageId: (pageId) => set({ currentPageId: pageId }),

  // Toggle auto-save
  setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),

  loadPageContent: async (pageId) => {
    try {
      const response = await fetch(`/api/page-builder/pages/${pageId}/content`, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        // Check if response is HTML (likely redirect to login)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Authentication required. Please log in as admin.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      // Check if response is HTML instead of JSON
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Authentication required. Please log in as admin.');
      }

      const data = JSON.parse(text);

      if (data.success) {
        // Backend already returns complete content with all widget settings merged
        // DO NOT strip widget settings - keep the complete data for rendering
        const completeContent = data.data.content || { containers: [] };

        console.log('[Store] Loaded complete content from backend:', completeContent);

        // Store the complete content with all widget settings preserved
        set({
          pageContent: completeContent,      // Complete content with widget settings
          originalContent: JSON.parse(JSON.stringify(completeContent)),  // Deep clone for original
          isDirty: false
        });

        return data.data;
      } else {
        throw new Error(data.message || 'Failed to load content');
      }
    } catch (error) {
      console.error('Load content failed:', error);

      // Handle authentication errors
      if (error.message.includes('Authentication required')) {
        // Redirect to admin login
        window.location.href = '/admin/login';
      }

      throw error;
    }
  },

  // Publish page content
  publishPage: async (pageId) => {
    try {
      const response = await fetch('/api/page-builder/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          page_id: pageId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('Page published successfully:', data.message);
        return data;
      } else {
        throw new Error(data.message || 'Publish failed');
      }
    } catch (error) {
      console.error('Publish failed:', error);
      throw error;
    }
  },

  resetChanges: () => set(state => ({
    pageContent: state.originalContent,
    selectedWidget: null,
    isDirty: false
  })),

  // Preview Actions
  setPreviewMode: (mode) => set({ previewMode: mode }),

  // Device Management Actions
  setCurrentDevice: (device) => set(state => {
    // Validate device
    const validDevices = ['desktop', 'tablet', 'mobile'];
    if (!validDevices.includes(device)) {
      console.warn(`Invalid device: ${device}. Using desktop.`);
      device = 'desktop';
    }

    // Store in session storage for persistence
    try {
      sessionStorage.setItem('pagebuilder_current_device', device);
    } catch (e) {
      console.warn('Could not save device to session storage:', e);
    }

    return { currentDevice: device };
  }),

  getCurrentViewport: () => {
    const { currentDevice, canvasViewport } = get();
    return canvasViewport[currentDevice];
  },

  getDeviceLabel: () => {
    const { currentDevice, deviceBreakpoints } = get();
    return deviceBreakpoints[currentDevice]?.label || currentDevice;
  },

  initializeDeviceFromStorage: () => {
    try {
      const storedDevice = sessionStorage.getItem('pagebuilder_current_device');
      if (storedDevice && ['desktop', 'tablet', 'mobile'].includes(storedDevice)) {
        set({ currentDevice: storedDevice });
      }
    } catch (e) {
      console.warn('Could not load device from session storage:', e);
    }
  },

  // Individual Settings Save Actions
  saveWidgetAllSettings: async (pageId, widgetId, allSettings) => {
    // Helper to ensure we always send objects, not arrays
    const ensureObject = (val) => {
      if (!val || Array.isArray(val) && val.length === 0) return {};
      if (typeof val !== 'object') return {};
      return val;
    };

    try {
      const response = await fetch(`/api/page-builder/pages/${pageId}/widgets/${widgetId}/save-all-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          widget_type: allSettings.widget_type || allSettings.type,  // Required for new widgets
          general: ensureObject(allSettings.general),
          style: ensureObject(allSettings.style),
          advanced: ensureObject(allSettings.advanced)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('Widget settings saved successfully:', data.message);

        // Update the widget in the store with latest data
        const widgetLocation = get().findWidget(widgetId);
        if (widgetLocation) {
          set(state => ({
            pageContent: {
              ...state.pageContent,
              containers: state.pageContent.containers.map(container =>
                container.id === widgetLocation.containerId ? {
                  ...container,
                  columns: container.columns.map(column =>
                    column.id === widgetLocation.columnId ? {
                      ...column,
                      widgets: column.widgets.map(widget =>
                        widget.id === widgetId ? {
                          ...widget,
                          general: allSettings.general || widget.general,
                          style: allSettings.style || widget.style,
                          advanced: allSettings.advanced || widget.advanced
                        } : widget
                      )
                    } : column
                  )
                } : container
              )
            }
            // Widget settings are saved to database, so page is not dirty
            // The page will be marked dirty by updateWidget when settings change
          }));
        }

        return data;
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save widget settings failed:', error);
      throw error;
    }
  },

  saveSectionAllSettings: async (pageId, sectionId, settings, responsiveSettings = {}) => {
    try {
      const response = await fetch(`/api/page-builder/pages/${pageId}/sections/${sectionId}/save-all-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          settings: settings || {},
          responsiveSettings: responsiveSettings || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('Section settings saved successfully:', data.message);

        // Update the section in the store
        set(state => ({
          pageContent: {
            ...state.pageContent,
            containers: state.pageContent.containers.map(container =>
              container.id === sectionId ? {
                ...container,
                settings: { ...container.settings, ...settings },
                responsiveSettings: { ...container.responsiveSettings, ...responsiveSettings }
              } : container
            )
          }
        }));

        return data;
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save section settings failed:', error);
      throw error;
    }
  },

  saveColumnAllSettings: async (pageId, columnId, settings, responsiveSettings = {}) => {
    try {
      const response = await fetch(`/api/page-builder/pages/${pageId}/columns/${columnId}/save-all-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          settings: settings || {},
          responsiveSettings: responsiveSettings || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('Column settings saved successfully:', data.message);

        // Update the column in the store
        set(state => ({
          pageContent: {
            ...state.pageContent,
            containers: state.pageContent.containers.map(container => ({
              ...container,
              columns: container.columns.map(column =>
                column.id === columnId ? {
                  ...column,
                  settings: { ...column.settings, ...settings },
                  responsiveSettings: { ...column.responsiveSettings, ...responsiveSettings }
                } : column
              )
            }))
          }
        }));

        return data;
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save column settings failed:', error);
      throw error;
    }
  },

  // Utility Actions
  findWidget: (widgetId) => {
    const { pageContent } = get();
    for (const container of pageContent.containers) {
      for (const column of container.columns) {
        const widget = column.widgets.find(w => w.id === widgetId);
        if (widget) {
          return { widget, columnId: column.id, containerId: container.id };
        }
      }
    }
    return null;
  },

  findContainer: (containerId) => {
    const { pageContent } = get();
    return pageContent.containers.find(c => c.id === containerId);
  }
}));

export { usePageBuilderStore };
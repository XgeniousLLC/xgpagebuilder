import { useEffect, useRef } from 'react';

/**
 * Hook for injecting dynamic CSS into the page builder editor
 * This ensures that widget styles are visible in real-time during editing
 */
export const useDynamicCSS = () => {
  const styleElementRef = useRef(null);
  const injectedCSS = useRef(new Set());

  // Initialize the style element
  useEffect(() => {
    if (!styleElementRef.current) {
      styleElementRef.current = document.createElement('style');
      styleElementRef.current.id = 'page-builder-dynamic-styles';
      styleElementRef.current.setAttribute('type', 'text/css');
      document.head.appendChild(styleElementRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (styleElementRef.current && styleElementRef.current.parentNode) {
        styleElementRef.current.parentNode.removeChild(styleElementRef.current);
      }
    };
  }, []);

  // Function to inject CSS
  const injectCSS = (css, key = null) => {
    if (!styleElementRef.current || !css) return;

    // If key is provided, track to avoid duplicates
    if (key) {
      if (injectedCSS.current.has(key)) {
        return; // Already injected
      }
      injectedCSS.current.add(key);
    }

    // Append CSS to the style element
    const currentCSS = styleElementRef.current.textContent || '';
    styleElementRef.current.textContent = currentCSS + '\n' + css;
  };

  // Function to replace all CSS
  const replaceCSS = (css) => {
    if (!styleElementRef.current) return;

    styleElementRef.current.textContent = css;
    injectedCSS.current.clear();
  };

  // Function to remove specific CSS by key
  const removeCSS = (key) => {
    if (!key || !injectedCSS.current.has(key)) return;

    injectedCSS.current.delete(key);
    // Note: For complete removal, we'd need to track CSS content by key
    // For now, this just removes from the tracking set
  };

  // Function to generate and inject widget CSS
  const injectWidgetCSS = async (widgetId, widgetType, settings, sectionId = null) => {
    try {
      const response = await fetch('/api/page-builder/css/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          type: 'widget',
          id: widgetId,
          widget_type: widgetType,
          settings: settings,
          section_id: sectionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.css) {
          injectCSS(data.data.css, `widget-${widgetId}`);
          return data.data.css;
        }
      }
    } catch (error) {
      console.error('Failed to generate widget CSS:', error);
    }
    return null;
  };

  // Function to generate and inject section CSS
  const injectSectionCSS = async (sectionId, settings) => {
    try {
      const response = await fetch('/api/page-builder/css/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          type: 'section',
          id: sectionId,
          settings: settings
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.css) {
          injectCSS(data.data.css, `section-${sectionId}`);
          return data.data.css;
        }
      }
    } catch (error) {
      console.error('Failed to generate section CSS:', error);
    }
    return null;
  };

  // Function to generate and inject column CSS
  const injectColumnCSS = async (columnId, settings) => {
    try {
      const response = await fetch('/api/page-builder/css/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          type: 'column',
          id: columnId,
          settings: settings
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.css) {
          injectCSS(data.data.css, `column-${columnId}`);
          return data.data.css;
        }
      }
    } catch (error) {
      console.error('Failed to generate column CSS:', error);
    }
    return null;
  };

  // Function to inject bulk CSS for entire page
  const injectPageCSS = async (pageContent) => {
    try {
      const components = [];

      // Extract all components from page content
      pageContent.containers?.forEach(container => {
        // Add section
        components.push({
          type: 'section',
          id: container.id,
          settings: container.settings || {}
        });

        // Add columns and widgets
        container.columns?.forEach(column => {
          components.push({
            type: 'column',
            id: column.id,
            settings: column.settings || {}
          });

          column.widgets?.forEach(widget => {
            components.push({
              type: 'widget',
              id: widget.id,
              widget_type: widget.type,
              section_id: container.id,
              settings: {
                general: widget.content || {},
                style: widget.style || {},
                advanced: widget.advanced || {}
              }
            });
          });
        });
      });

      if (components.length === 0) return;

      const response = await fetch('/api/page-builder/css/generate-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          components: components
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.combinedCSS) {
          replaceCSS(data.data.combinedCSS);
          return data.data.combinedCSS;
        }
      }
    } catch (error) {
      console.error('Failed to generate page CSS:', error);
    }
    return null;
  };

  return {
    injectCSS,
    replaceCSS,
    removeCSS,
    injectWidgetCSS,
    injectSectionCSS,
    injectColumnCSS,
    injectPageCSS
  };
};
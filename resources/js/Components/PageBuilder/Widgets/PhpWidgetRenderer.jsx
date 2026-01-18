import React, { useState, useEffect } from "react";
import widgetService from "@/Services/widgetService";
import { WidgetIcon } from "@/Components/PageBuilder/Icons/WidgetIcons";

/**
 * PhpWidgetRenderer - Renders PHP-based widgets using server-side rendering
 *
 * This component communicates with the PHP backend to render widgets
 * with their current settings and styling.
 */
const PhpWidgetRenderer = ({ widget, className = "", style = {} }) => {
    const [renderedContent, setRenderedContent] = useState("");
    const [renderedCSS, setRenderedCSS] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useApiRendering, setUseApiRendering] = useState(true);

    useEffect(() => {
        if (!widget || !widget.type) {
            setError("Invalid widget data");
            setIsLoading(false);
            return;
        }

        if (useApiRendering) {
            renderWidget();
        } else {
            renderFallback();
        }
    }, [widget, useApiRendering]);

    const renderWidget = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get default values for this widget type
            const defaults = await widgetService.getWidgetDefaults(widget.type);

            // Ensure defaults has the required structure
            const safeDefaults = {
                general: defaults?.general || {},
                style: defaults?.style || {},
                advanced: defaults?.advanced || {},
            };

            // Deep merge helper function that respects nested group structure
            const deepMerge = (target, source) => {
                if (!source || typeof source !== "object") return target;
                if (!target || typeof target !== "object") return source;

                const result = { ...target };
                for (const key of Object.keys(source)) {
                    if (
                        source[key] !== null &&
                        typeof source[key] === "object" &&
                        !Array.isArray(source[key])
                    ) {
                        result[key] = deepMerge(result[key] || {}, source[key]);
                    } else if (
                        source[key] !== undefined &&
                        source[key] !== null
                    ) {
                        result[key] = source[key];
                    }
                }
                return result;
            };

            // Build settings by deeply merging defaults with widget data
            // The widget.general should already have the nested group structure from the store
            // (e.g., { content: { heading_text: 'My Text' }, link: { enhanced_link: {...} } })
            const settings = {
                general: deepMerge(safeDefaults.general, widget.general || {}),
                style: deepMerge(safeDefaults.style, widget.style || {}),
                advanced: deepMerge(
                    safeDefaults.advanced,
                    widget.advanced || {}
                ),
            };

            // Enhanced debug logging for all widgets
            console.log(`[DEBUG] Rendering ${widget.type} widget with:`, {
                widget: widget,
                settings: settings,
                defaults: safeDefaults,
            });

            // Call the PHP API to render the widget
            const renderResult = await widgetService.renderWidget(
                widget.type,
                settings
            );

            // Enhanced debug logging for all widgets
            console.log(
                `[DEBUG] ${widget.type} widget render result:`,
                renderResult
            );

            if (renderResult) {
                setRenderedContent(renderResult.html || "");
                setRenderedCSS(renderResult.css || "");
            } else {
                // API rendering failed, automatically switch to fallback rendering
                if (useApiRendering) {
                    console.log(
                        `[DEBUG] API rendering failed for ${widget.type} widget, switching to fallback`
                    );
                    setUseApiRendering(false);
                    return; // This will trigger useEffect to re-render with fallback
                }

                // If we're already in fallback mode and still failing, show error
                setError("Failed to render widget");
            }
        } catch (err) {
            console.error("Error rendering PHP widget:", err);

            // If API rendering fails, automatically switch to fallback rendering
            if (useApiRendering) {
                console.log(
                    `[DEBUG] Switching to fallback rendering for ${widget.type} widget due to API error`
                );
                setUseApiRendering(false);
                return; // Don't set error, let fallback render instead
            }

            setError("Error rendering widget: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFallback = () => {
        setIsLoading(true);
        console.log(
            `[DEBUG] Using fallback rendering for ${widget.type} widget`
        );

        // Create a basic fallback based on widget type
        let fallbackContent = "";
        switch (widget.type) {
            case "divider":
                fallbackContent = `
          <div class="divider-container divider-simple" style="text-align: center; margin: 20px 0;">
            <div class="divider-line style-solid" style="width: 100%; border-top-width: 1px; border-top-style: solid; border-color: #CCCCCC; height: 1px;"></div>
          </div>
        `;
                break;
            case "button":
                const buttonText =
                    widget.content?.text ||
                    widget.general?.content?.text ||
                    "Click me";
                const buttonUrl =
                    widget.content?.url || widget.general?.content?.url || "#";
                fallbackContent = `
          <a href="${buttonUrl}" class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-decoration-none">
            ${buttonText}
          </a>
        `;
                break;
            case "paragraph":
                const paragraphText =
                    widget.content?.text ||
                    widget.general?.content?.paragraph_text ||
                    "Your paragraph text goes here.";
                fallbackContent = `
          <p class="text-gray-700 leading-relaxed mb-4">
            ${paragraphText}
          </p>
        `;
                break;
            case "code":
                const codeContent =
                    widget.content?.code_content ||
                    widget.general?.content?.code_content ||
                    "// Enter your code here";
                const language =
                    widget.content?.language ||
                    widget.general?.content?.language ||
                    "javascript";
                fallbackContent = `
          <div class="code-widget-container" style="background: #1e1e1e; border-radius: 8px; overflow: hidden; margin: 20px 0;">
            <div class="code-header" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #2d2d2d; border-bottom: 1px solid #3d3d3d;">
              <span class="code-language-badge" style="font-size: 12px; font-weight: 600; color: #9cdcfe; text-transform: uppercase;">${language}</span>
              <div class="code-copy-btn" style="display: flex; align-items: center; gap: 6px; color: #9cdcfe; font-size: 12px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy</span>
              </div>
            </div>
            <pre class="code-block" style="font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; line-height: 1.6; padding: 16px; margin: 0; color: #d4d4d4; overflow-x: auto;"><code>${codeContent}</code></pre>
          </div>
        `;
                break;
            default:
                fallbackContent = `
          <div class="p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 class="text-sm font-medium text-gray-700 mb-2">${widget.type} Widget</h3>
            <p class="text-xs text-gray-500">Displaying fallback content. Widget functionality will be restored automatically when API connection is available.</p>
          </div>
        `;
        }

        setRenderedContent(fallbackContent);
        setRenderedCSS("");
        setError(null);
        setIsLoading(false);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className={`php-widget-loading ${className}`} style={style}>
                <div className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">
                        Loading widget...
                    </span>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className={`php-widget-error ${className}`} style={style}>
                <div className="p-4 border-2 border-dashed border-red-300 bg-red-50 text-red-600 text-center rounded">
                    <p className="font-medium">Widget Render Error</p>
                    <p className="text-sm mt-1">{error}</p>
                    <p className="text-xs mt-1 opacity-75">
                        Type: {widget.type}
                    </p>
                    <div className="mt-2 space-x-2">
                        <button
                            onClick={() => {
                                setUseApiRendering(true);
                                setError(null);
                            }}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors"
                        >
                            Retry API
                        </button>
                        <button
                            onClick={() => {
                                setUseApiRendering(false);
                                setError(null);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
                        >
                            Use Fallback
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If no content rendered, show placeholder
    if (!renderedContent) {
        return (
            <div className={`php-widget-empty ${className}`} style={style}>
                <div className="p-4 border border-gray-200 bg-gray-50 text-gray-500 text-center rounded">
                    <p className="text-sm">Empty widget</p>
                    <p className="text-xs opacity-75">Type: {widget.type}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`php-widget-container ${className}`} style={style}>
            {/* Show fallback indicator */}
            {!useApiRendering && (
                <div className="fallback-indicator bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2">
                    <p className="text-xs text-yellow-800 flex items-center">
                        <span className="mr-2">⚡</span>
                        Fallback rendering active
                        <button
                            onClick={() => {
                                setUseApiRendering(true);
                                setError(null);
                            }}
                            className="ml-2 text-yellow-600 hover:text-yellow-800 text-xs underline"
                        >
                            Retry API
                        </button>
                    </p>
                </div>
            )}

            {/* Inject widget-specific CSS */}
            {renderedCSS && <style>{renderedCSS}</style>}

            {/* Render the PHP-generated HTML */}
            <div
                className="php-widget-content"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
        </div>
    );
};

/**
 * PhpWidgetPreview - A lighter version for previews and drag overlays
 */
export const PhpWidgetPreview = ({
    widgetType,
    settings = {},
    className = "",
}) => {
    const [previewContent, setPreviewContent] = useState("");
    const [previewCSS, setPreviewCSS] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!widgetType) return;

        const renderPreview = async () => {
            try {
                setIsLoading(true);

                // Get default values for preview
                const defaults = await widgetService.getWidgetDefaults(
                    widgetType
                );

                // Deep merge helper function that respects nested group structure
                const deepMerge = (target, source) => {
                    if (!source || typeof source !== "object") return target;
                    if (!target || typeof target !== "object") return source;

                    const result = { ...target };
                    for (const key of Object.keys(source)) {
                        if (
                            source[key] !== null &&
                            typeof source[key] === "object" &&
                            !Array.isArray(source[key])
                        ) {
                            result[key] = deepMerge(
                                result[key] || {},
                                source[key]
                            );
                        } else if (
                            source[key] !== undefined &&
                            source[key] !== null
                        ) {
                            result[key] = source[key];
                        }
                    }
                    return result;
                };

                // Use defaults merged with provided settings using deep merge
                const previewSettings = {
                    general: deepMerge(
                        defaults.general || {},
                        settings.general || {}
                    ),
                    style: deepMerge(
                        defaults.style || {},
                        settings.style || {}
                    ),
                    advanced: deepMerge(
                        defaults.advanced || {},
                        settings.advanced || {}
                    ),
                };

                const result = await widgetService.renderWidget(
                    widgetType,
                    previewSettings
                );
                if (result) {
                    setPreviewContent(result.html || "");
                    setPreviewCSS(result.css || "");
                }
            } catch (error) {
                console.error("Error rendering widget preview:", error);
                setPreviewContent(
                    `<div class="text-xs text-gray-500 p-2">Preview unavailable</div>`
                );
            } finally {
                setIsLoading(false);
            }
        };

        renderPreview();
    }, [widgetType, settings]);

    if (isLoading) {
        return (
            <div className={`widget-preview-loading ${className}`}>
                <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
            </div>
        );
    }

    return (
        <>
            {previewCSS && <style>{previewCSS}</style>}
            <div
                className={`widget-preview ${className}`}
                dangerouslySetInnerHTML={{ __html: previewContent }}
            />
        </>
    );
};

/**
 * PhpWidgetIcon - Renders widget icon using SVG icons
 */
export const PhpWidgetIcon = ({
    iconName,
    widgetType,
    className = "w-6 h-6",
}) => {
    // Use SVG icons based on widget type
    if (widgetType) {
        return <WidgetIcon type={widgetType} className={className} />;
    }

    // Fallback for legacy icon names
    const iconTypeMap = {
        "lni-text-format": "heading",
        "lni-text-align-left": "paragraph",
        "lni-list": "list",
        "lni-link": "link",
        "lni-hand": "button",
        "lni-layout": "section",
        "lni-minus": "divider",
        "lni-move-vertical": "spacer",
        "lni-grid-alt": "grid",
        "lni-image": "image",
        "lni-video": "video",
        "lni-star": "icon",
        "lni-gallery": "image_gallery",
        "lni-tab": "tabs",
        "lni-quotation": "testimonial",
        "lni-envelope": "contact_form",
        "lni-code": "code",
    };

    const mappedWidgetType = iconTypeMap[iconName];
    if (mappedWidgetType) {
        return <WidgetIcon type={mappedWidgetType} className={className} />;
    }

    // Final fallback
    return <WidgetIcon type="section" className={className} />;
};

export default PhpWidgetRenderer;

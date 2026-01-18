<?php

namespace Xgenious\PageBuilder\Core\Widgets;

/**
 * ColumnWidget - Minimal stub class for ColumnCSSManager compatibility
 *
 * This class provides minimal functionality to prevent errors in ColumnCSSManager
 * without registering as an actual widget in the page builder.
 *
 * Note: This class intentionally does NOT extend BaseWidget to prevent
 * it from appearing in the widget sidebar.
 */
class ColumnWidget
{
    /**
     * Get general fields (empty for compatibility)
     */
    public function getGeneralFields(): array
    {
        return [];
    }

    /**
     * Get style fields (empty for compatibility)
     */
    public function getStyleFields(): array
    {
        return [];
    }
}
import React from 'react';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import PageBuilderIndex from './Pages/Index.jsx';

// Standalone entry point for the page builder
document.addEventListener('DOMContentLoaded', () => {
    const data = window.pageBuilderData || {};
    const container = document.getElementById('page-builder-root');
    if (container) {
        const root = createRoot(container);
        root.render(
            <PageBuilderIndex 
                page={data.page}
                content={data.content}
                contentId={data.contentId}
                widgets={data.widgets}
                sections={data.sections || []}
                templates={data.templates || []}
            />
        );
    }
});

import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  Layout, 
  Type, 
  FileText, 
  MousePointer, 
  Image, 
  Minus, 
  Space, 
  ChevronDown, 
  RotateCcw,
  Layers,
  Columns,
  Grid3X3
} from 'lucide-react';
import UniversalIcon from '@/Components/PageBuilder/Icons/UniversalIcon';
import widgetService from '@/Services/widgetService';

const DragOverlayContent = ({ activeId, widgets, sections }) => {
  const [phpWidgets, setPhpWidgets] = useState([]);

  // Fetch PHP widgets for overlay display
  useEffect(() => {
    const fetchPhpWidgets = async () => {
      try {
        const allWidgets = await widgetService.getAllWidgets();
        const formattedWidgets = widgetService.formatWidgetsForReact(allWidgets);
        setPhpWidgets(Array.isArray(formattedWidgets) ? formattedWidgets : []);
      } catch (error) {
        console.error('Error fetching PHP widgets for drag overlay:', error);
        setPhpWidgets([]);
      }
    };

    fetchPhpWidgets();
  }, []);
  // Icon mapping
  const iconMap = {
    'Type': Type,
    'FileText': FileText,
    'MousePointer': MousePointer,
    'Image': Image,
    'Layout': Layout,
    'Minus': Minus,
    'Space': Space,
    'ChevronDown': ChevronDown,
    'RotateCcw': RotateCcw
  };

  // Handle widget dragging
  if (activeId.startsWith('widget-')) {
    const widgetType = activeId.replace('widget-', '');
    
    // First check PHP widgets
    const phpWidget = Array.isArray(phpWidgets) ? phpWidgets.find(w => w.type === widgetType) : null;
    if (phpWidget) {
      return (
        <div className={`bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg w-full max-w-md min-w-[240px] ${
          phpWidget.is_pro ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <UniversalIcon icon={phpWidget.icon} type={phpWidget.type} className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <div className="text-base font-medium text-gray-800">{phpWidget.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">Widget from panel</div>
              {phpWidget.is_pro && (
                <span className="inline-block mt-1 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  PRO
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Fall back to legacy React widgets
    const widget = widgets?.find(w => w.type === widgetType);
    if (widget) {
      const IconComponent = iconMap[widget.icon] || Puzzle;
      return (
        <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg w-full max-w-md min-w-[240px]">
          <div className="flex items-center space-x-3">
            <IconComponent className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <div className="text-base font-medium text-gray-800">{widget.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">Widget from panel</div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Handle section dragging
  if (activeId.startsWith('section-')) {
    const sectionId = activeId.replace('section-', '');
    const section = sections?.find(s => s.id === sectionId);
    
    if (section) {
      // Map icon string to component
      const iconMap = {
        'Layers': Layers,
        'Columns': Columns,
        'Grid3X3': Grid3X3
      };
      const IconComponent = iconMap[section.icon] || Layout;
      
      return (
        <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg w-full max-w-md min-w-[240px]">
          <div className="flex items-center space-x-3">
            <IconComponent className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <div className="text-base font-medium text-gray-900">{section.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {section.columns?.length || 1} column{(section.columns?.length || 1) !== 1 ? 's' : ''} • Section template
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Handle container dragging
  if (activeId.startsWith('container-')) {
    return (
      <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg w-full max-w-md min-w-[240px]">
        <div className="flex items-center space-x-3">
          <Layout className="w-6 h-6 text-gray-600" />
          <div className="flex-1">
            <div className="text-base font-medium text-gray-900">Section</div>
            <div className="text-xs text-gray-500 mt-0.5">Moving section</div>
          </div>
        </div>
      </div>
    );
  }

  // Handle widget instance dragging
  if (activeId.includes('widget-')) {
    return (
      <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg w-full max-w-md min-w-[240px]">
        <div className="flex items-center space-x-3">
          <Puzzle className="w-6 h-6 text-gray-600" />
          <div className="flex-1">
            <div className="text-base font-medium text-gray-800">Widget</div>
            <div className="text-xs text-gray-500 mt-0.5">Moving widget</div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg w-full max-w-md min-w-[240px]">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-blue-500 rounded"></div>
        <div className="flex-1">
          <div className="text-base font-medium text-gray-800">Dragging...</div>
          <div className="text-xs text-gray-500 mt-0.5">Moving element</div>
        </div>
      </div>
    </div>
  );
};

export default DragOverlayContent;
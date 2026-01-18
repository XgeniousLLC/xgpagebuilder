import React, { useState } from 'react';
import { Plus, Columns2, Columns3, Grid2X2, Grid3X3 } from 'lucide-react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const QUICK_TEMPLATES = {
  oneColumn: {
    name: '1 Column',
    icon: '│',
    columns: 1,
    layout: ['100%']
  },
  twoColumns: {
    name: '2 Columns',
    icon: '││',
    columns: 2,
    layout: ['50%', '50%']
  },
  threeColumns: {
    name: '3 Columns',
    icon: '│││',
    columns: 3,
    layout: ['33.33%', '33.33%', '33.33%']
  },
  fourColumns: {
    name: '4 Columns',
    icon: '││││',
    columns: 4,
    layout: ['25%', '25%', '25%', '25%']
  },
  fiveColumns: {
    name: '5 Columns',
    icon: '│││││',
    columns: 5,
    layout: ['20%', '20%', '20%', '20%', '20%']
  },
  sixColumns: {
    name: '6 Columns',
    icon: '││││││',
    columns: 6,
    layout: ['16.67%', '16.67%', '16.67%', '16.67%', '16.67%', '16.67%']
  },
  // Popular asymmetric layouts
  asymmetric30_70: {
    name: '30% - 70%',
    icon: '┃│',
    columns: 2,
    layout: ['30%', '70%']
  },
  asymmetric70_30: {
    name: '70% - 30%',
    icon: '│┃',
    columns: 2,
    layout: ['70%', '30%']
  },
  asymmetric25_50_25: {
    name: '25% - 50% - 25%',
    icon: '┃│┃',
    columns: 3,
    layout: ['25%', '50%', '25%']
  },
  asymmetric40_60: {
    name: '40% - 60%',
    icon: '│┃',
    columns: 2,
    layout: ['40%', '60%']
  },
  asymmetric60_40: {
    name: '60% - 40%',
    icon: '┃│',
    columns: 2,
    layout: ['60%', '40%']
  }
};

const SectionQuickAdd = ({ position, containerId, onSectionAdded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { insertSectionAt } = usePageBuilderStore();

  const handleAddSection = (template) => {
    const templateConfig = QUICK_TEMPLATES[template];

    // Create columns based on template
    const columns = templateConfig.layout.map((width, index) => ({
      id: `column-${Date.now()}-${index}`,
      width,
      widgets: [],
      settings: {
        padding: '20px',
        margin: '0px'
      }
    }));

    // Create new section
    const newSection = {
      id: `section-${Date.now()}`,
      type: 'section',
      columns,
      settings: {
        padding: '40px 20px',
        margin: '20px 0px',
        backgroundColor: '#ffffff',
        gap: '20px'
      }
    };

    // Insert at specific position
    insertSectionAt(position, newSection);

    // Close picker and notify parent
    setShowPicker(false);
    if (onSectionAdded) {
      onSectionAdded(newSection);
    }
  };

  return (
    <div
      className="relative w-full h-16 flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPicker(false);
      }}
    >
      {/* Horizontal line indicator */}
      <div className={`absolute w-full h-px bg-gray-300 transition-all duration-200 ${
        isHovered ? 'bg-blue-400' : ''
      }`} />

      {/* Plus button - only visible on hover */}
      {isHovered && (
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="relative z-10 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
          title="Add section here"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      {/* Quick template picker */}
      {showPicker && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border z-20 p-4 w-80">
          <div className="text-sm font-medium text-gray-900 mb-3 text-center">Quick Add Section</div>

          {/* Grid layout for templates */}
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {Object.entries(QUICK_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleAddSection(key)}
                className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                title={template.name}
              >
                <div className="text-sm font-mono text-gray-600 mb-1 group-hover:text-blue-600">
                  {template.icon}
                </div>
                <div className="text-xs text-gray-500 text-center group-hover:text-blue-700">
                  {template.columns}C
                </div>
              </button>
            ))}
          </div>

          {/* Arrow pointing to insertion point */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-t border-l rotate-45 border-gray-300" />
        </div>
      )}
    </div>
  );
};

export default SectionQuickAdd;
import React, { useState } from 'react';
import { Plus, Columns2, Columns3, Columns4, Grid2X2, X, Grid3X3 } from 'lucide-react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';

const SECTION_TEMPLATES = {
  oneColumn: {
    name: '1 Column',
    icon: Columns2,
    columns: 1,
    layout: ['100%'],
    description: 'Full width single column'
  },
  twoColumns: {
    name: '2 Columns',
    icon: Columns2,
    columns: 2,
    layout: ['50%', '50%'],
    description: 'Two equal columns'
  },
  threeColumns: {
    name: '3 Columns',
    icon: Columns3,
    columns: 3,
    layout: ['33.33%', '33.33%', '33.33%'],
    description: 'Three equal columns'
  },
  fourColumns: {
    name: '4 Columns',
    icon: Columns4,
    columns: 4,
    layout: ['25%', '25%', '25%', '25%'],
    description: 'Four equal columns'
  },
  fiveColumns: {
    name: '5 Columns',
    icon: Grid3X3,
    columns: 5,
    layout: ['20%', '20%', '20%', '20%', '20%'],
    description: 'Five equal columns'
  },
  sixColumns: {
    name: '6 Columns',
    icon: Grid3X3,
    columns: 6,
    layout: ['16.67%', '16.67%', '16.67%', '16.67%', '16.67%', '16.67%'],
    description: 'Six equal columns'
  },
  // Asymmetric layouts
  asymmetric30_70: {
    name: '30% - 70%',
    icon: Columns2,
    columns: 2,
    layout: ['30%', '70%'],
    description: 'Narrow left, wide right'
  },
  asymmetric70_30: {
    name: '70% - 30%',
    icon: Columns2,
    columns: 2,
    layout: ['70%', '30%'],
    description: 'Wide left, narrow right'
  },
  asymmetric25_50_25: {
    name: '25% - 50% - 25%',
    icon: Columns3,
    columns: 3,
    layout: ['25%', '50%', '25%'],
    description: 'Narrow sides, wide center'
  },
  asymmetric40_60: {
    name: '40% - 60%',
    icon: Columns2,
    columns: 2,
    layout: ['40%', '60%'],
    description: 'Moderate left, wider right'
  },
  asymmetric60_40: {
    name: '60% - 40%',
    icon: Columns2,
    columns: 2,
    layout: ['60%', '40%'],
    description: 'Wider left, moderate right'
  }
};

const CanvasPlusButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addContainer } = usePageBuilderStore();

  const handleAddSection = (template) => {
    const templateConfig = SECTION_TEMPLATES[template];

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

    // Add new container/section
    addContainer({
      type: 'section',
      columns,
      settings: {
        padding: '40px 20px',
        margin: '20px 0px',
        backgroundColor: '#ffffff',
        gap: '20px'
      }
    });

    // Close picker and scroll to new section
    setIsOpen(false);

    // Scroll to bottom where new section was added
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
            isOpen
              ? 'bg-red-500 hover:bg-red-600 rotate-45'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={isOpen ? 'Close section picker' : 'Add new section'}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white m-auto" />
          ) : (
            <Plus className="w-6 h-6 text-white m-auto" />
          )}
        </button>
      </div>

      {/* Section Template Picker */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker Panel */}
          <div className="fixed bottom-24 right-6 bg-white rounded-lg shadow-xl border z-50 w-96">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Section</h3>
              <p className="text-sm text-gray-600">Choose a layout for your new section</p>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Grid Layout for Templates */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SECTION_TEMPLATES).map(([key, template]) => {
                  return (
                    <button
                      key={key}
                      onClick={() => handleAddSection(key)}
                      className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      {/* Visual Column Preview */}
                      <div className="w-16 h-10 mb-3 bg-gray-50 rounded border flex items-center justify-center p-1">
                        <div className="flex space-x-0.5 w-full h-full">
                          {template.layout.map((width, index) => (
                            <div
                              key={index}
                              className="bg-blue-200 rounded-sm group-hover:bg-blue-300"
                              style={{
                                width: `${(parseFloat(width) / 100) * 100}%`,
                                height: '100%'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Template Name */}
                      <div className="text-center">
                        <div className="font-medium text-gray-900 group-hover:text-blue-900 text-sm">
                          {template.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CanvasPlusButton;
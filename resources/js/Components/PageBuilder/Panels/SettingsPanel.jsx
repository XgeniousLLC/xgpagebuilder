import React, { useState, useEffect, useRef } from 'react';
import { Settings, Palette, Wrench, X } from 'lucide-react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import GeneralSettings from './Settings/GeneralSettings';
import StyleSettings from './Settings/StyleSettings';
import AdvancedSettings from './Settings/AdvancedSettings';
import SectionGeneralSettings from './Settings/SectionGeneralSettings';
import SectionStyleSettings from './Settings/SectionStyleSettings';
import SectionAdvancedSettings from './Settings/SectionAdvancedSettings';
import ColumnGeneralSettings from './Settings/ColumnGeneralSettings';
import ColumnStyleSettings from './Settings/ColumnStyleSettings';
import ColumnAdvancedSettings from './Settings/ColumnAdvancedSettings';

// Helper functions for padding/margin parsing
const parseSpacing = (value) => {
  if (!value) return { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' };

  // Remove any extra spaces and split
  const parts = value.toString().replace(/\s+/g, ' ').trim().split(' ');

  // Extract unit from first part
  const unit = parts[0]?.match(/[a-zA-Z%]+$/)?.[0] || 'px';

  // Extract numeric values
  const values = parts.map(part => parseInt(part.replace(/[a-zA-Z%]+$/, '')) || 0);

  // CSS shorthand: top, right, bottom, left
  switch (values.length) {
    case 1: return { top: values[0], right: values[0], bottom: values[0], left: values[0], unit };
    case 2: return { top: values[0], right: values[1], bottom: values[0], left: values[1], unit };
    case 3: return { top: values[0], right: values[1], bottom: values[2], left: values[1], unit };
    case 4: return { top: values[0], right: values[1], bottom: values[2], left: values[3], unit };
    default: return { top: 0, right: 0, bottom: 0, left: 0, unit };
  }
};

const formatSpacing = (spacing) => {
  const { top, right, bottom, left, unit } = spacing;
  return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
};

// Helper functions for responsive spacing
const parseResponsiveSpacing = (value) => {
  if (!value) {
    return {
      desktop: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      tablet: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      mobile: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }
    };
  }

  // If it's a string, treat it as desktop-only
  if (typeof value === 'string') {
    const parsed = parseSpacing(value);
    return {
      desktop: parsed,
      tablet: parsed,
      mobile: parsed
    };
  }

  // If it's an object with responsive values
  if (typeof value === 'object' && value !== null) {
    return {
      desktop: value.desktop ? parseSpacing(value.desktop) : { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      tablet: value.tablet ? parseSpacing(value.tablet) : { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      mobile: value.mobile ? parseSpacing(value.mobile) : { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }
    };
  }

  // Fallback
  const fallback = { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' };
  return { desktop: fallback, tablet: fallback, mobile: fallback };
};

const formatResponsiveSpacing = (responsiveSpacing) => {
  return {
    desktop: formatSpacing(responsiveSpacing.desktop),
    tablet: formatSpacing(responsiveSpacing.tablet),
    mobile: formatSpacing(responsiveSpacing.mobile)
  };
};

// Responsive Spacing Input Component
const SpacingInput = ({ label, value, onChange }) => {
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  // Close device selector when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeviceSelector && !event.target.closest('.device-selector-container')) {
        setShowDeviceSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeviceSelector]);

  const responsiveSpacing = parseResponsiveSpacing(value);
  const currentSpacing = responsiveSpacing[activeDevice];

  const updateCurrentSpacing = (property, newValue) => {
    const updatedSpacing = { ...currentSpacing, [property]: parseInt(newValue) || 0 };
    const newResponsiveSpacing = {
      ...responsiveSpacing,
      [activeDevice]: updatedSpacing
    };
    onChange(formatResponsiveSpacing(newResponsiveSpacing));
  };

  const updateCurrentUnit = (newUnit) => {
    const updatedSpacing = { ...currentSpacing, unit: newUnit };
    const newResponsiveSpacing = {
      ...responsiveSpacing,
      [activeDevice]: updatedSpacing
    };
    onChange(formatResponsiveSpacing(newResponsiveSpacing));
  };

  const deviceIcons = {
    desktop: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth={2}/>
        <line x1="8" y1="21" x2="16" y2="21" strokeWidth={2}/>
        <line x1="12" y1="17" x2="12" y2="21" strokeWidth={2}/>
      </svg>
    ),
    tablet: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" strokeWidth={2}/>
        <line x1="12" y1="18" x2="12" y2="18" strokeWidth={2}/>
      </svg>
    ),
    mobile: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth={2}/>
        <line x1="12" y1="18" x2="12" y2="18" strokeWidth={2}/>
      </svg>
    )
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative device-selector-container">
          <button
            onClick={() => setShowDeviceSelector(!showDeviceSelector)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              activeDevice === 'desktop' ? 'bg-blue-50 border-blue-300 text-blue-700' :
              activeDevice === 'tablet' ? 'bg-green-50 border-green-300 text-green-700' :
              'bg-orange-50 border-orange-300 text-orange-700'
            }`}
            title={`Currently editing ${activeDevice} spacing`}
          >
            {deviceIcons[activeDevice]}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="6,9 12,15 18,9" strokeWidth={2}/>
            </svg>
          </button>

          {showDeviceSelector && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-12">
              {Object.entries(deviceIcons).map(([device, icon]) => (
                <button
                  key={device}
                  onClick={() => {
                    setActiveDevice(device);
                    setShowDeviceSelector(false);
                  }}
                  className={`w-full flex items-center justify-center px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                    activeDevice === device ?
                    (device === 'desktop' ? 'bg-blue-50 text-blue-700' :
                     device === 'tablet' ? 'bg-green-50 text-green-700' :
                     'bg-orange-50 text-orange-700') : 'text-gray-700'
                  }`}
                  title={`Switch to ${device} spacing`}
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Top */}
        <input
          type="number"
          value={currentSpacing.top}
          onChange={(e) => updateCurrentSpacing('top', e.target.value)}
          className="w-12 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
          min="0"
          title="Top"
        />

        {/* Right */}
        <input
          type="number"
          value={currentSpacing.right}
          onChange={(e) => updateCurrentSpacing('right', e.target.value)}
          className="w-12 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
          min="0"
          title="Right"
        />

        {/* Bottom */}
        <input
          type="number"
          value={currentSpacing.bottom}
          onChange={(e) => updateCurrentSpacing('bottom', e.target.value)}
          className="w-12 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
          min="0"
          title="Bottom"
        />

        {/* Left */}
        <input
          type="number"
          value={currentSpacing.left}
          onChange={(e) => updateCurrentSpacing('left', e.target.value)}
          className="w-12 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
          min="0"
          title="Left"
        />

        {/* Unit selector at the end */}
        <select
          value={currentSpacing.unit}
          onChange={(e) => updateCurrentUnit(e.target.value)}
          className="w-14 px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="em">em</option>
          <option value="rem">rem</option>
        </select>
      </div>

      {/* Inline labels */}
      <div className="flex items-center gap-1 mt-1">
        <div className="w-12 text-xs text-gray-500 text-center">Top</div>
        <div className="w-12 text-xs text-gray-500 text-center">Right</div>
        <div className="w-12 text-xs text-gray-500 text-center">Bottom</div>
        <div className="w-12 text-xs text-gray-500 text-center">Left</div>
        <div className="w-14 text-xs text-gray-500 text-center">Unit</div>
      </div>
    </div>
  );
};

// Enhanced Background Input Component
const BackgroundInput = ({ label, value, onChange }) => {
  const [backgroundType, setBackgroundType] = useState('color');
  const [showOptions, setShowOptions] = useState(false);

  // Close options when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.background-options-container')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  // Parse background value to determine type and settings
  React.useEffect(() => {
    if (value) {
      if (value.startsWith('linear-gradient') || value.startsWith('radial-gradient')) {
        setBackgroundType('gradient');
      } else if (value.startsWith('url(') || value.includes('image')) {
        setBackgroundType('image');
      } else {
        setBackgroundType('color');
      }
    }
  }, [value]);

  const handleColorChange = (color) => {
    onChange(color);
  };

  const handleImageChange = (imageUrl) => {
    onChange(`url(${imageUrl})`);
  };

  const handleGradientChange = (gradient) => {
    onChange(gradient);
  };

  const backgroundTypeIcons = {
    color: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" strokeWidth={2}/>
        <path strokeWidth={2} d="M12 1v6m0 6v6m11-7H7m5 0H1"/>
      </svg>
    ),
    image: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2}/>
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2}/>
        <polyline points="21,15 16,10 5,21" strokeWidth={2}/>
      </svg>
    ),
    gradient: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth={2} d="M8 2v20l8-20v20"/>
      </svg>
    )
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative background-options-container">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              backgroundType === 'color' ? 'bg-blue-50 border-blue-300 text-blue-700' :
              backgroundType === 'image' ? 'bg-green-50 border-green-300 text-green-700' :
              'bg-purple-50 border-purple-300 text-purple-700'
            }`}
            title={`Background type: ${backgroundType}`}
          >
            {backgroundTypeIcons[backgroundType]}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="6,9 12,15 18,9" strokeWidth={2}/>
            </svg>
          </button>

          {showOptions && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
              {Object.entries(backgroundTypeIcons).map(([type, icon]) => (
                <button
                  key={type}
                  onClick={() => {
                    setBackgroundType(type);
                    setShowOptions(false);
                    // Set default values based on type
                    if (type === 'color') {
                      onChange('#ffffff');
                    } else if (type === 'image') {
                      onChange('url()');
                    } else if (type === 'gradient') {
                      onChange('linear-gradient(90deg, #ffffff 0%, #000000 100%)');
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                    backgroundType === type ?
                    (type === 'color' ? 'bg-blue-50 text-blue-700' :
                     type === 'image' ? 'bg-green-50 text-green-700' :
                     'bg-purple-50 text-purple-700') : 'text-gray-700'
                  }`}
                  title={`Switch to ${type} background`}
                >
                  {icon}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Background Type Specific Controls */}
      {backgroundType === 'color' && (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value || '#ffffff'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="#ffffff"
          />
        </div>
      )}

      {backgroundType === 'image' && (
        <div className="space-y-2">
          <input
            type="url"
            value={value?.replace('url(', '').replace(')', '') || ''}
            onChange={(e) => handleImageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <div className="text-xs text-gray-500">
            Enter image URL or upload an image
          </div>
        </div>
      )}

      {backgroundType === 'gradient' && (
        <GradientEditor value={value} onChange={handleGradientChange} />
      )}
    </div>
  );
};

// Gradient Editor Component
const GradientEditor = ({ value, onChange }) => {
  const [gradientType, setGradientType] = useState('linear');
  const [direction, setDirection] = useState(90);
  const [colors, setColors] = useState([
    { color: '#ffffff', position: 0 },
    { color: '#000000', position: 100 }
  ]);

  // Parse gradient value
  React.useEffect(() => {
    if (value) {
      if (value.startsWith('linear-gradient')) {
        setGradientType('linear');
        // Extract direction and colors from CSS
        const match = value.match(/linear-gradient\(([^)]+)\)/);
        if (match) {
          const content = match[1];
          const parts = content.split(',').map(p => p.trim());

          // First part might be direction
          let directionPart = parts[0];
          let colorParts = parts.slice(1);

          if (directionPart.includes('deg')) {
            setDirection(parseInt(directionPart) || 90);
          } else {
            colorParts = parts;
            setDirection(90);
          }

          // Parse colors
          const parsedColors = colorParts.map((part, index) => {
            const colorMatch = part.match(/(#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\([^)]+\)|rgba\([^)]+\))/i);
            const positionMatch = part.match(/(\d+)%/);

            return {
              color: colorMatch ? colorMatch[1] : index === 0 ? '#ffffff' : '#000000',
              position: positionMatch ? parseInt(positionMatch[1]) : index * 100
            };
          });

          if (parsedColors.length > 0) {
            setColors(parsedColors);
          }
        }
      } else if (value.startsWith('radial-gradient')) {
        setGradientType('radial');
        // Similar parsing for radial gradients
      }
    }
  }, [value]);

  // Generate gradient CSS
  const generateGradient = () => {
    const colorStops = colors
      .sort((a, b) => a.position - b.position)
      .map(c => `${c.color} ${c.position}%`)
      .join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${direction}deg, ${colorStops})`;
    } else {
      return `radial-gradient(circle, ${colorStops})`;
    }
  };

  // Update gradient
  const updateGradient = () => {
    onChange(generateGradient());
  };

  // Update color
  const updateColor = (index, newColor) => {
    const newColors = [...colors];
    newColors[index].color = newColor;
    setColors(newColors);
    setTimeout(updateGradient, 0);
  };

  // Update position
  const updatePosition = (index, newPosition) => {
    const newColors = [...colors];
    newColors[index].position = Math.max(0, Math.min(100, newPosition));
    setColors(newColors);
    setTimeout(updateGradient, 0);
  };

  // Add color stop
  const addColorStop = () => {
    const newColors = [...colors, { color: '#808080', position: 50 }];
    setColors(newColors);
    setTimeout(updateGradient, 0);
  };

  // Remove color stop
  const removeColorStop = (index) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      setTimeout(updateGradient, 0);
    }
  };

  return (
    <div className="space-y-3">
      {/* Gradient Type */}
      <div className="flex gap-2">
        <select
          value={gradientType}
          onChange={(e) => {
            setGradientType(e.target.value);
            setTimeout(updateGradient, 0);
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>

        {gradientType === 'linear' && (
          <input
            type="number"
            value={direction}
            onChange={(e) => {
              setDirection(parseInt(e.target.value) || 90);
              setTimeout(updateGradient, 0);
            }}
            className="w-16 px-2 py-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="90"
            min="0"
            max="360"
            title="Direction in degrees"
          />
        )}
      </div>

      {/* Gradient Preview */}
      <div
        className="w-full h-8 border border-gray-300 rounded"
        style={{ background: generateGradient() }}
      ></div>

      {/* Color Stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Colors</span>
          <button
            onClick={addColorStop}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Color
          </button>
        </div>

        {colors.map((colorStop, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              value={colorStop.color}
              onChange={(e) => updateColor(index, e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={colorStop.color}
              onChange={(e) => updateColor(index, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="number"
              value={colorStop.position}
              onChange={(e) => updatePosition(index, parseInt(e.target.value) || 0)}
              className="w-12 px-1 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
              max="100"
            />
            <span className="text-xs text-gray-500">%</span>
            {colors.length > 2 && (
              <button
                onClick={() => removeColorStop(index)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Remove color"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPanel = ({ widget, page, onUpdate, onWidgetUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const originalSettingsRef = useRef(null);
  const currentSettingsRef = useRef(null);
  const { 
    setSelectedWidget, 
    setSettingsPanelVisible, 
    revertWidgetToSnapshot, 
    clearWidgetSnapshot 
  } = usePageBuilderStore();

  // Reset active tab when widget changes
  useEffect(() => {
    if (widget?.id) {
      setActiveTab('general'); // Always reset to general tab
    }
  }, [widget?.id]);

  // Store original settings when widget changes
  useEffect(() => {
    if (widget) {
      originalSettingsRef.current = JSON.stringify({
        content: widget.content || {},
        style: widget.style || {},
        advanced: widget.advanced || {}
      });
      setHasUnsavedChanges(false);
    }
  }, [widget?.id]);

  // Track changes to detect unsaved changes - Use useCallback for stable comparison
  const currentSettingsString = React.useMemo(() => {
    if (!widget) return '';
    return JSON.stringify({
      content: widget.content || {},
      style: widget.style || {},
      advanced: widget.advanced || {}
    });
  }, [widget?.content, widget?.style, widget?.advanced, widget?.id]);

  useEffect(() => {
    if (widget && originalSettingsRef.current && currentSettingsString) {
      currentSettingsRef.current = currentSettingsString;
      setHasUnsavedChanges(currentSettingsString !== originalSettingsRef.current);
    }
  }, [currentSettingsString, widget?.id]); // Only depend on the memoized string and widget ID

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleEscKey);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [hasUnsavedChanges]);

  // Handle close with confirmation for unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      closePanel();
    }
  };

  // Close panel without confirmation
  const closePanel = () => {
    setSelectedWidget(null);
    setSettingsPanelVisible(false);
    setShowConfirmDialog(false);
    if (onClose) {
      onClose();
    }
  };

  // Discard changes and close
  const discardChanges = () => {
    if (widget?.id) {
      // Revert widget to its snapshot state
      revertWidgetToSnapshot(widget.id);
      // Clear the snapshot since we're closing
      clearWidgetSnapshot(widget.id);
    }
    closePanel();
  };

  // Save changes and close
  const saveAndClose = () => {
    if (widget?.id) {
      // Clear the snapshot since we're accepting changes
      clearWidgetSnapshot(widget.id);
      // Update original settings reference
      originalSettingsRef.current = JSON.stringify({
        content: widget.content || {},
        style: widget.style || {},
        advanced: widget.advanced || {}
      });
    }
    setHasUnsavedChanges(false);
    closePanel();
  };

  if (!widget) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Selection</h3>
          <p className="text-gray-500 text-sm">Select a widget or section to edit its properties</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Wrench }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">
              {widget.type === 'section' ? 'Section' : widget.type === 'column' ? 'Column' : widget.type} Settings
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure the selected {widget.type === 'section' ? 'section' : widget.type === 'column' ? 'column' : 'widget'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Close settings panel (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Only show tabs for widgets, not containers/sections */}
      {widget.type !== 'section' && widget.type !== 'column' && (
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex p-3 text-sm font-medium transition-colors items-center ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-1" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ scrollBehavior: 'auto' }}>
        {widget.type === 'section' ? (
          <>
            {/* Section Settings Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex p-3 text-sm font-medium transition-colors items-center ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section Tab Content */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === 'general' && (
                <SectionGeneralSettings
                  key={widget.id}
                  container={widget}
                  onUpdate={onUpdate}
                  onWidgetUpdate={onWidgetUpdate}
                />
              )}
              {activeTab === 'style' && (
                <SectionStyleSettings
                  key={widget.id}
                  container={widget}
                  onUpdate={onUpdate}
                  onWidgetUpdate={onWidgetUpdate}
                />
              )}
              {activeTab === 'advanced' && (
                <SectionAdvancedSettings
                  key={widget.id}
                  container={widget}
                  onUpdate={onUpdate}
                  onWidgetUpdate={onWidgetUpdate}
                />
              )}
            </div>
          </>
        ) : widget.type === 'column' ? (
          <>
            {/* Column Settings Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex p-3 text-sm font-medium transition-colors items-center ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Column Tab Content */}
            <div className="flex-1 flex flex-col min-h-0">
              {activeTab === 'general' && (
                <ColumnGeneralSettings
                  key={widget.id}
                  column={widget}
                  onUpdate={onUpdate}
                  onWidgetUpdate={onWidgetUpdate}
                />
              )}
              {activeTab === 'style' && (
                <ColumnStyleSettings
                  key={widget.id}
                  column={widget}
                  onUpdate={onUpdate}
                  onWidgetUpdate={onWidgetUpdate}
                />
              )}
              {activeTab === 'advanced' && (
                <ColumnAdvancedSettings
                  key={widget.id}
                  column={widget}
                  onUpdate={onUpdate}
                  onWidgetUpdate={onWidgetUpdate}
                />
              )}
            </div>
          </>
        ) : (
          <>
            {activeTab === 'general' && (
              <GeneralSettings
                key={widget.id}
                widget={widget}
                onUpdate={onUpdate}
                onWidgetUpdate={onWidgetUpdate}
              />
            )}
            {activeTab === 'style' && (
              <StyleSettings
                key={widget.id}
                widget={widget}
                onUpdate={onUpdate}
                onWidgetUpdate={onWidgetUpdate}
              />
            )}
            {activeTab === 'advanced' && (
              <AdvancedSettings
                key={widget.id}
                widget={widget}
                onUpdate={onUpdate}
                onWidgetUpdate={onWidgetUpdate}
              />
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833-.23 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have unsaved changes to this {widget.type === 'section' ? 'section' : widget.type === 'column' ? 'column' : 'widget'}. 
              What would you like to do?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={discardChanges}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={saveAndClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default SettingsPanel;

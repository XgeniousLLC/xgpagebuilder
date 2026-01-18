import React from 'react';
import { Link } from 'lucide-react';

/**
 * FlexGapField Component
 * 
 * Gap control with separate column and row gap inputs
 * Matches the design pattern with linked/unlinked values
 */
const FlexGapField = ({ 
  value = '0px', 
  onChange, 
  className = '',
  label = 'Gaps'
}) => {
  // Parse gap value - can be single value or space-separated "row column"
  const parseGap = (gap) => {
    if (!gap) return { row: 0, column: 0, unit: 'px' };
    
    const parts = gap.toString().split(' ');
    if (parts.length === 2) {
      // row column format
      const rowMatch = parts[0].match(/^(\d+(?:\.\d+)?)(px|%|em|rem)?$/);
      const colMatch = parts[1].match(/^(\d+(?:\.\d+)?)(px|%|em|rem)?$/);
      return {
        row: rowMatch ? parseFloat(rowMatch[1]) : 0,
        column: colMatch ? parseFloat(colMatch[1]) : 0,
        unit: rowMatch?.[2] || colMatch?.[2] || 'px'
      };
    } else {
      // single value format
      const match = parts[0].match(/^(\d+(?:\.\d+)?)(px|%|em|rem)?$/);
      const val = match ? parseFloat(match[1]) : 0;
      return {
        row: val,
        column: val,
        unit: match?.[2] || 'px'
      };
    }
  };

  const currentGap = parseGap(value);
  const [isLinked, setIsLinked] = React.useState(currentGap.row === currentGap.column);

  const handleGapChange = (type, newValue) => {
    const numValue = parseFloat(newValue) || 0;
    
    if (isLinked) {
      // Update both when linked
      const newGap = `${numValue}${currentGap.unit}`;
      onChange(newGap);
    } else {
      // Update only the specific axis
      const newRow = type === 'row' ? numValue : currentGap.row;
      const newColumn = type === 'column' ? numValue : currentGap.column;
      const newGap = `${newRow}${currentGap.unit} ${newColumn}${currentGap.unit}`;
      onChange(newGap);
    }
  };

  const handleUnitChange = (newUnit) => {
    if (isLinked) {
      const newGap = `${currentGap.row}${newUnit}`;
      onChange(newGap);
    } else {
      const newGap = `${currentGap.row}${newUnit} ${currentGap.column}${newUnit}`;
      onChange(newGap);
    }
  };

  const toggleLink = () => {
    const newLinked = !isLinked;
    setIsLinked(newLinked);
    
    if (newLinked) {
      // When linking, use the column value for both
      const newGap = `${currentGap.column}${currentGap.unit}`;
      onChange(newGap);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with Unit Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
        <select
          value={currentGap.unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="em">em</option>
          <option value="rem">rem</option>
        </select>
      </div>

      {/* Gap Inputs */}
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* Column Gap */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-300 rounded px-2 py-1.5 text-center">
            <input
              type="number"
              value={currentGap.column}
              onChange={(e) => handleGapChange('column', e.target.value)}
              className="w-full bg-transparent text-gray-700 text-sm text-center focus:outline-none"
              min="0"
              step="1"
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">Column</div>
        </div>

        {/* Link Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleLink}
            className={`
              p-1.5 rounded border transition-all duration-200
              ${isLinked 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
            title={isLinked ? 'Unlink gaps' : 'Link gaps'}
            aria-label={isLinked ? 'Unlink gaps' : 'Link gaps'}
          >
            <Link className="w-3 h-3" />
          </button>
        </div>

        {/* Row Gap */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-300 rounded px-2 py-1.5 text-center">
            <input
              type="number"
              value={currentGap.row}
              onChange={(e) => handleGapChange('row', e.target.value)}
              className="w-full bg-transparent text-gray-700 text-sm text-center focus:outline-none"
              min="0"
              step="1"
              disabled={isLinked}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">Row</div>
        </div>
      </div>
    </div>
  );
};

export default FlexGapField;
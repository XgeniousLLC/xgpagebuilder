import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBox = ({ value, onChange, placeholder = "Search widgets..." }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Debounced search
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      if (onChange && inputValue !== value) {
        onChange(inputValue);
      }
    }, 300);

    // Cleanup on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, onChange, value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative search-box ${isFocused ? 'focused' : ''}`}>
      <div className={`relative flex items-center transition-colors ${
        isFocused 
          ? 'ring-2 ring-blue-500 ring-opacity-20' 
          : ''
      }`}>
        <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {/* Search suggestions could go here */}
      {isFocused && inputValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {/* Future: Add search suggestions, recent searches, etc. */}
          <div className="p-2 text-xs text-gray-500">
            Press Enter to search or Escape to cancel
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
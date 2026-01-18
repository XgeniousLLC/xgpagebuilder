import React from 'react';

/**
 * CodeFieldComponent - Renders a code editor input field
 * Uses a textarea with monospace font and styling to resemble a code editor
 */
const CodeFieldComponent = ({ fieldKey, fieldConfig, value, onChange }) => {
  const {
    label,
    placeholder,
    default: defaultValue,
    required,
    rows,
    language
  } = fieldConfig;

  const [code, setCode] = React.useState(value ?? defaultValue ?? '');
  const textareaRef = React.useRef(null);
  const lineNumbersRef = React.useRef(null);

  React.useEffect(() => {
    setCode(value ?? defaultValue ?? '');
  }, [value, defaultValue]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      onChange(newCode);
      
      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange(newValue);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, rows || 10) }, (_, i) => i + 1).join('\n');

  return (
    <div className="relative border border-gray-700 rounded-md overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400 uppercase">{label || 'Code Editor'}</span>
        <span className="text-xs font-mono text-[#9cdcfe] bg-[#3d3d3d] px-2 py-0.5 rounded">
          {language || 'TEXT'}
        </span>
      </div>
      
      <div className="relative flex">
        {/* Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className="flex-none w-10 py-2 text-right pr-2 text-gray-600 bg-[#1e1e1e] font-mono text-sm leading-6 select-none overflow-hidden"
          style={{ fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace" }}
        >
          <pre className="m-0">{lineNumbers}</pre>
        </div>

        {/* Code Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          rows={rows || 10}
          className="flex-1 w-full px-2 py-2 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm leading-6 border-none focus:outline-none focus:ring-0 resize-y"
          placeholder={placeholder || 'Enter code here...'}
          required={required}
          spellCheck="false"
          style={{
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            tabSize: 4,
            whiteSpace: 'pre'
          }}
        />
      </div>
    </div>
  );
};

export default CodeFieldComponent;

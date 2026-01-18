import React, { useState, useRef, useEffect } from 'react';
import { X, Move, MoreHorizontal } from 'lucide-react';
import { usePageBuilderStore } from '@/Store/pageBuilderStore';
import NavigationTree from './NavigationTree';

const MovableNavigationDialog = () => {
  const {
    navigationDialogVisible,
    navigationDialogPosition,
    toggleNavigationDialog,
    setNavigationDialogPosition
  } = usePageBuilderStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navigationDialogVisible && dialogRef.current && !dialogRef.current.contains(e.target)) {
        // Don't close if clicking on toolbar button
        if (!e.target.closest('[data-navigation-toggle]')) {
          toggleNavigationDialog();
        }
      }
    };

    if (navigationDialogVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [navigationDialogVisible, toggleNavigationDialog]);

  // Handle drag start
  const handleMouseDown = (e) => {
    if (e.target.closest('.dialog-content')) return; // Don't drag when clicking content

    setIsDragging(true);
    const rect = dialogRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragStart({
      x: e.clientX - navigationDialogPosition.x,
      y: e.clientY - navigationDialogPosition.y
    });

    // Prevent text selection during drag
    e.preventDefault();
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep dialog within viewport bounds
      const maxX = window.innerWidth - 320; // Dialog width
      const maxY = window.innerHeight - 400; // Dialog height

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      setNavigationDialogPosition({
        x: constrainedX,
        y: constrainedY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, setNavigationDialogPosition]);

  if (!navigationDialogVisible) return null;

  return (
    <>
      {/* Movable Dialog - No Backdrop for Transparent Interaction */}
      <div
        ref={dialogRef}
        className={`fixed bg-white rounded-xl border-2 z-50 transition-all duration-200 ${
          isDragging
            ? 'shadow-2xl border-blue-400 ring-4 ring-blue-200 ring-opacity-50'
            : 'shadow-xl border-gray-300 hover:shadow-2xl hover:border-gray-400'
        }`}
        style={{
          left: `${navigationDialogPosition.x}px`,
          top: `${navigationDialogPosition.y}px`,
          width: '320px',
          height: '400px',
          transition: isDragging ? 'none' : 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        {/* Draggable Header */}
        <div
          className={`bg-gray-50 rounded-t-lg border-b px-4 py-3 flex items-center justify-between ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Page Structure</h3>
          </div>

          <div className="flex items-center space-x-1">
            {/* Minimize/Options button */}
            <button
              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={toggleNavigationDialog}
              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="dialog-content h-full pb-14 overflow-hidden">
          <NavigationTree />
        </div>
      </div>
    </>
  );
};

export default MovableNavigationDialog;
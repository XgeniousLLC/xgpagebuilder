import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Star, Crown, Grip, Info } from 'lucide-react';
import UniversalIcon from '@/Components/PageBuilder/Icons/UniversalIcon';

const WidgetCard = ({ 
  widget, 
  isFavorite = false, 
  isSelected = false,
  onDrag, 
  onSelect, 
  onToggleFavorite 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `widget-${widget.type}`,
    data: {
      type: 'widget',
      widget: widget
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 1000 : undefined
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(widget);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(widget.type);
    }
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        className={`widget-card group relative bg-white border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : isHovered
            ? 'border-gray-300 shadow-sm'
            : 'border-gray-200 hover:border-gray-300'
        } ${isDragging ? 'shadow-lg' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          title="Drag to add widget"
        >
          <Grip className="w-4 h-4 text-gray-400" />
        </div>

        {/* Widget Icon and Info */}
        <div className="flex items-start space-x-3 mb-2">
          <div 
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: getCategoryColor(widget.category) }}
          >
            <UniversalIcon icon={widget.icon} type={widget.type} className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {widget.name}
              </h3>
              
              {/* Pro Badge */}
              {widget.is_pro && (
                <Crown className="w-3 h-3 text-yellow-500" title="Pro widget" />
              )}
              
              {/* Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleFavoriteClick}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    isFavorite ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleInfoClick}
                  className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
                  title="Widget information"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {widget.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        {widget.tags && widget.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {widget.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
            {widget.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                +{widget.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 text-white text-xs rounded-lg p-3 z-20 shadow-lg">
          <div className="space-y-2">
            <div>
              <strong>Category:</strong> {widget.category_name || widget.category}
            </div>
            <div>
              <strong>Description:</strong> {widget.description}
            </div>
            {widget.tags && widget.tags.length > 0 && (
              <div>
                <strong>Tags:</strong> {widget.tags.join(', ')}
              </div>
            )}
            {widget.is_pro && (
              <div className="text-yellow-300">
                <Crown className="w-3 h-3 inline mr-1" />
                Pro widget - Premium features included
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    basic: '#3B82F6',
    content: '#10B981',
    media: '#F59E0B',
    form: '#EF4444',
    layout: '#8B5CF6',
    ecommerce: '#EC4899',
    social: '#06B6D4',
    navigation: '#84CC16',
    seo: '#F97316',
    advanced: '#6B7280',
    third_party: '#374151'
  };
  return colors[category] || '#6B7280';
};

export default WidgetCard;
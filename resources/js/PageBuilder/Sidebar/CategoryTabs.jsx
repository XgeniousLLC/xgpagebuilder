import React from 'react';
import { 
  Square, FileText, Image, ClipboardList, Layout, ShoppingCart, 
  Share2, Menu, Search, Code, ExternalLink, Grid
} from 'lucide-react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  // Icon mapping for categories
  const iconMap = {
    square: Square,
    'file-text': FileText,
    image: Image,
    'clipboard-list': ClipboardList,
    layout: Layout,
    'shopping-cart': ShoppingCart,
    'share-2': Share2,
    menu: Menu,
    search: Search,
    code: Code,
    'external-link': ExternalLink,
    grid: Grid
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Grid;
    return IconComponent;
  };

  // Add "All" category at the beginning
  const allCategories = [
    {
      slug: 'all',
      name: 'All',
      icon: 'grid',
      widget_count: categories.reduce((sum, cat) => sum + cat.widget_count, 0),
      color: '#6B7280'
    },
    ...categories
  ];

  return (
    <div className="category-tabs border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {allCategories.map((category) => {
          const IconComponent = getIcon(category.icon);
          const isActive = activeCategory === category.slug;
          
          return (
            <button
              key={category.slug}
              onClick={() => onCategoryChange(category.slug)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-3 min-w-[80px] transition-colors ${
                isActive
                  ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={category.description || category.name}
            >
              <div className="relative">
                <IconComponent 
                  className="w-5 h-5 mb-1" 
                  style={{ 
                    color: isActive ? '#3B82F6' : category.color || '#6B7280' 
                  }} 
                />
                {category.widget_count > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-xs rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {category.widget_count > 99 ? '99+' : category.widget_count}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
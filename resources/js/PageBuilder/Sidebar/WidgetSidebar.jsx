import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Grid, Loader, AlertCircle } from 'lucide-react';
import CategoryTabs from './CategoryTabs';
import SearchBox from './SearchBox';
import WidgetList from './WidgetList';
import WidgetCard from './WidgetCard';

const WidgetSidebar = ({ onWidgetDrag, onWidgetSelect, selectedWidget }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [filteredWidgets, setFilteredWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('popular'); // popular, recent, all
  const [favorites, setFavorites] = useState(new Set());

  // Fetch categories and widgets on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter widgets when category, search, or view mode changes
  useEffect(() => {
    filterWidgets();
  }, [activeCategory, searchQuery, viewMode, widgets]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch categories and widgets in parallel
      const [categoriesResponse, widgetsResponse] = await Promise.all([
        fetch('/api/pagebuilder/widgets/categories'),
        fetch('/api/pagebuilder/widgets')
      ]);

      if (!categoriesResponse.ok || !widgetsResponse.ok) {
        throw new Error('Failed to fetch widget data');
      }

      const categoriesData = await categoriesResponse.json();
      const widgetsData = await widgetsResponse.json();

      if (categoriesData.success && widgetsData.success) {
        setCategories(categoriesData.data);
        setWidgets(widgetsData.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch widget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterWidgets = () => {
    let filtered = [...widgets];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(widget => widget.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(widget => 
        widget.name.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query) ||
        widget.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by view mode
    switch (viewMode) {
      case 'popular':
        // Would typically sort by usage statistics
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        // Would typically sort by creation date
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'favorites':
        filtered = filtered.filter(widget => favorites.has(widget.type));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredWidgets(filtered);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const response = await fetch(`/api/pagebuilder/widgets/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // For search results, we update the widgets list
            setWidgets(data.data);
          }
        }
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      // If search is cleared, reload all widgets
      fetchInitialData();
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchQuery(''); // Clear search when changing category
  };

  const toggleFavorite = (widgetType) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(widgetType)) {
      newFavorites.delete(widgetType);
    } else {
      newFavorites.add(widgetType);
    }
    setFavorites(newFavorites);
    
    // Save to localStorage
    localStorage.setItem('widget_favorites', JSON.stringify([...newFavorites]));
  };

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('widget_favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(new Set(parsed));
      } catch (err) {
        console.error('Failed to load favorites:', err);
      }
    }
  }, []);

  const handleRetry = () => {
    fetchInitialData();
  };

  if (loading) {
    return (
      <div className="widget-sidebar bg-white border-r border-gray-200 w-80 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Widgets</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading widgets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-sidebar bg-white border-r border-gray-200 w-80 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Widgets</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-900 mb-2">Failed to load widgets</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-sidebar bg-white border-r border-gray-200 w-80 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Widgets</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('popular')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'popular'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Popular widgets"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('recent')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'recent'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Recent widgets"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="All widgets"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Box */}
        <SearchBox
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search widgets..."
        />
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto">
        {filteredWidgets.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? `No widgets found for "${searchQuery}"` 
                : 'No widgets available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-500 hover:text-blue-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <WidgetList>
            {filteredWidgets.map((widget) => (
              <WidgetCard
                key={widget.type}
                widget={widget}
                isFavorite={favorites.has(widget.type)}
                isSelected={selectedWidget?.type === widget.type}
                onDrag={onWidgetDrag}
                onSelect={onWidgetSelect}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </WidgetList>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {filteredWidgets.length} {filteredWidgets.length === 1 ? 'widget' : 'widgets'}
            {activeCategory !== 'all' && (
              <span className="ml-1">
                in {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
              </span>
            )}
          </span>
          {favorites.size > 0 && (
            <button
              onClick={() => setViewMode('favorites')}
              className={`flex items-center space-x-1 hover:text-gray-700 transition-colors ${
                viewMode === 'favorites' ? 'text-blue-600' : ''
              }`}
            >
              <Star className="w-3 h-3" />
              <span>{favorites.size}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetSidebar;
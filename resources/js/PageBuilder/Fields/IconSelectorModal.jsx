import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

const IconSelectorModal = ({
    isOpen,
    onSelect,
    onClose,
    currentValue = '',
    modalTitle = 'Select Icon',
    allowedCategories = [],
    allowEmpty = true
}) => {
    const [icons, setIcons] = useState([]);
    const [displayedIcons, setDisplayedIcons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreIcons, setHasMoreIcons] = useState(true);
    const ICONS_PER_PAGE = 500;

    // Fetch icons and categories on component mount
    useEffect(() => {
        if (!isOpen) return;

        const fetchIcons = async () => {
            try {
                setLoading(true);
                const [iconsResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/icons?per_page=2000'), // Get all icons by setting high per_page limit
                    fetch('/api/icons/categories')
                ]);

                if (!iconsResponse.ok || !categoriesResponse.ok) {
                    throw new Error('Failed to fetch icons');
                }

                const iconsData = await iconsResponse.json();
                const categoriesData = await categoriesResponse.json();

                const allIcons = iconsData.data || [];
                setIcons(allIcons);
                setDisplayedIcons(allIcons.slice(0, ICONS_PER_PAGE));
                setCategories(categoriesData.data || {});
                setCurrentPage(1);
                setHasMoreIcons(allIcons.length > ICONS_PER_PAGE);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch icons:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIcons();
    }, [isOpen]);

    // Load more icons function
    const loadMoreIcons = () => {
        if (loadingMore || !hasMoreIcons) return;

        setLoadingMore(true);
        setTimeout(() => {
            const nextPage = currentPage + 1;
            const startIndex = nextPage * ICONS_PER_PAGE;
            const endIndex = startIndex + ICONS_PER_PAGE;
            const moreIcons = icons.slice(startIndex, endIndex);

            setDisplayedIcons(prev => [...prev, ...moreIcons]);
            setCurrentPage(nextPage);
            setHasMoreIcons(endIndex < icons.length);
            setLoadingMore(false);
        }, 300); // Small delay for better UX
    };

    // Filter icons based on search and category
    const filteredIcons = useMemo(() => {
        // If there's search or category filter, use all icons, otherwise use displayed icons
        const sourceIcons = (searchQuery.trim() || selectedCategory !== 'all') ? icons : displayedIcons;
        let filtered = sourceIcons;

        // Filter by allowed categories if specified
        if (allowedCategories.length > 0) {
            filtered = filtered.filter(icon =>
                // Check if icon has category and matches allowed categories
                icon.category && allowedCategories.includes(icon.category)
            );
        }

        // Filter by selected category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(icon =>
                // Check if icon category matches selected category
                icon.category === selectedCategory ||
                (selectedCategory === 'uncategorized' && !icon.category)
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(icon =>
                icon.name.toLowerCase().includes(query) ||
                icon.displayName.toLowerCase().includes(query) ||
                (icon.cssClass && icon.cssClass.toLowerCase().includes(query)) ||
                (icon.keywords && icon.keywords.some && icon.keywords.some(keyword =>
                    keyword.toLowerCase().includes(query)
                ))
            );
        }

        return filtered;
    }, [icons, displayedIcons, searchQuery, selectedCategory, allowedCategories]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleIconClick = (iconClass) => {
        onSelect(iconClass);
    };

    const handleClearSelection = () => {
        onSelect('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const getAvailableCategories = () => {
        let availableCategories = categories;

        if (allowedCategories.length > 0) {
            availableCategories = Object.fromEntries(
                Object.entries(categories).filter(([key]) =>
                    allowedCategories.includes(key)
                )
            );
        }

        // Add "Uncategorized" option for icons without categories
        const hasUncategorizedIcons = icons.some(icon =>
            !icon.categories || icon.categories.length === 0
        );

        if (hasUncategorizedIcons && allowedCategories.length === 0) {
            availableCategories = {
                ...availableCategories,
                'uncategorized': 'Uncategorized'
            };
        }

        return availableCategories;
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {modalTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-gray-200 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search icons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="sm:w-48">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(getAvailableCategories()).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Button */}
                        {allowEmpty && (
                            <button
                                onClick={handleClearSelection}
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Results Count */}
                    {!loading && (
                        <div className="text-sm text-gray-500">
                            {filteredIcons.length} icons found
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-red-500">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Error loading icons: {error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    ) : filteredIcons.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m-6-4h6M7 8h.01M7 12h.01M7 16h.01" />
                                </svg>
                                <p>No icons found</p>
                                <p className="text-sm mt-1">Try adjusting your search or category filter</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 xl:grid-cols-10 gap-2">
                                {filteredIcons.map((icon) => (
                                    <div
                                        key={icon.cssClass}
                                        onClick={() => handleIconClick(icon.cssClass)}
                                        className={`
                                            relative flex items-center justify-center w-15 h-15 rounded cursor-pointer transition-all duration-200
                                            hover:bg-blue-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500
                                            ${currentValue === icon.cssClass ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700'}
                                        `}
                                        title={`${icon.displayName} (${icon.cssClass})`}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleIconClick(icon.cssClass);
                                            }
                                        }}
                                        role="button"
                                        aria-label={`Select ${icon.displayName} icon`}
                                    >
                                        <i
                                            className={`${icon.cssClass} text-2xl`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button - only show when no search/filter and more icons available */}
                            {!searchQuery.trim() && selectedCategory === 'all' && hasMoreIcons && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={loadMoreIcons}
                                        disabled={loadingMore}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loadingMore ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : (
                                            `Load More Icons (${icons.length - displayedIcons.length} remaining)`
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        {currentValue ? (
                            <span className="font-mono">{currentValue}</span>
                        ) : (
                            'No icon selected'
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSelect(currentValue)}
                            disabled={!allowEmpty && !currentValue}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Select Icon
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default IconSelectorModal;
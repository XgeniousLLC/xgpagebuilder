<?php

namespace Xgenious\PageBuilder\Core;

class WidgetCategory
{
    // Category constants
    public const CORE = 'core';
    public const THEME = 'theme';
    public const BASIC = 'basic';
    public const CONTENT = 'content';
    public const MEDIA = 'media';
    public const FORM = 'form';
    public const LAYOUT = 'layout';
    public const ECOMMERCE = 'ecommerce';
    public const SOCIAL = 'social';
    public const NAVIGATION = 'navigation';
    public const SEO = 'seo';
    public const INTERACTIVE = 'interactive';
    public const ADVANCED = 'advanced';
    public const THIRD_PARTY = 'third_party';

    // Category definitions
    private static array $categories = [
        self::CORE => [
            'name' => 'Core',
            'icon' => 'cpu',
            'description' => 'Core system widgets (hidden from developer view)',
            'color' => '#6B7280',
            'sort_order' => 0,
            'hidden' => true // Hide from main sidebar
        ],
        self::THEME => [
            'name' => 'Theme',
            'icon' => 'palette',
            'description' => 'Theme-specific sections like Hero, Features, CTAs',
            'color' => '#7C3AED',
            'sort_order' => 1
        ],
        self::LAYOUT => [
            'name' => 'Layout',
            'icon' => 'layout',
            'description' => 'Structural and layout widgets',
            'color' => '#8B5CF6',
            'sort_order' => 2
        ],
        self::BASIC => [
            'name' => 'Basic',
            'icon' => 'square',
            'description' => 'Essential widgets for basic functionality',
            'color' => '#3B82F6',
            'sort_order' => 3
        ],
        self::CONTENT => [
            'name' => 'Content',
            'icon' => 'file-text',
            'description' => 'Text, headings, and content widgets',
            'color' => '#10B981',
            'sort_order' => 4
        ],
        self::MEDIA => [
            'name' => 'Media',
            'icon' => 'image',
            'description' => 'Images, videos, and media widgets',
            'color' => '#F59E0B',
            'sort_order' => 5
        ],
        self::FORM => [
            'name' => 'Form',
            'icon' => 'clipboard-list',
            'description' => 'Form elements and input widgets',
            'color' => '#EF4444',
            'sort_order' => 6
        ],
        self::ECOMMERCE => [
            'name' => 'E-commerce',
            'icon' => 'shopping-cart',
            'description' => 'Shopping and e-commerce widgets',
            'color' => '#EC4899',
            'sort_order' => 7
        ],
        self::SOCIAL => [
            'name' => 'Social',
            'icon' => 'share-2',
            'description' => 'Social media and sharing widgets',
            'color' => '#06B6D4',
            'sort_order' => 8
        ],
        self::NAVIGATION => [
            'name' => 'Navigation',
            'icon' => 'menu',
            'description' => 'Navigation and menu widgets',
            'color' => '#84CC16',
            'sort_order' => 9
        ],
        self::SEO => [
            'name' => 'SEO',
            'icon' => 'search',
            'description' => 'SEO and marketing widgets',
            'color' => '#F97316',
            'sort_order' => 10
        ],
        self::INTERACTIVE => [
            'name' => 'Interactive',
            'icon' => 'zap',
            'description' => 'Interactive and dynamic widgets',
            'color' => '#8B5CF6',
            'sort_order' => 11
        ],
        self::ADVANCED => [
            'name' => 'Advanced',
            'icon' => 'code',
            'description' => 'Advanced and custom widgets',
            'color' => '#6B7280',
            'sort_order' => 12
        ],
        self::THIRD_PARTY => [
            'name' => 'Third Party',
            'icon' => 'external-link',
            'description' => 'Third-party integrations and widgets',
            'color' => '#374151',
            'sort_order' => 13
        ]
    ];

    /**
     * Get all available categories
     */
    public static function getAllCategories(): array
    {
        // Sort by sort_order
        $categories = self::$categories;
        uasort($categories, function($a, $b) {
            return $a['sort_order'] <=> $b['sort_order'];
        });

        return $categories;
    }

    /**
     * Get category by slug
     */
    public static function getCategory(string $categorySlug): ?array
    {
        return self::$categories[$categorySlug] ?? null;
    }

    /**
     * Get category name by slug
     */
    public static function getCategoryName(string $categorySlug): string
    {
        return self::$categories[$categorySlug]['name'] ?? 'Unknown';
    }

    /**
     * Get category icon by slug
     */
    public static function getCategoryIcon(string $categorySlug): string
    {
        return self::$categories[$categorySlug]['icon'] ?? 'help-circle';
    }

    /**
     * Get category color by slug
     */
    public static function getCategoryColor(string $categorySlug): string
    {
        return self::$categories[$categorySlug]['color'] ?? '#6B7280';
    }

    /**
     * Check if a category exists
     */
    public static function categoryExists(string $categorySlug): bool
    {
        return isset(self::$categories[$categorySlug]);
    }

    /**
     * Get all category slugs
     */
    public static function getCategorySlugs(): array
    {
        return array_keys(self::$categories);
    }

    /**
     * Get categories formatted for API response
     */
    public static function getCategoriesForApi(): array
    {
        $categories = [];
        foreach (self::getAllCategories() as $slug => $category) {
            $categories[] = [
                'slug' => $slug,
                'name' => $category['name'],
                'icon' => $category['icon'],
                'description' => $category['description'],
                'color' => $category['color'],
                'sort_order' => $category['sort_order'],
                'widget_count' => 0 // Will be populated by the registry
            ];
        }
        return $categories;
    }

    /**
     * Validate category slug
     */
    public static function validateCategory(string $categorySlug): bool
    {
        return in_array($categorySlug, self::getCategorySlugs(), true);
    }

    /**
     * Get category constants as array (useful for validation)
     */
    public static function getConstants(): array
    {
        $reflection = new \ReflectionClass(__CLASS__);
        return $reflection->getConstants();
    }

    /**
     * Add custom category (for extensibility)
     */
    public static function addCustomCategory(string $slug, array $categoryData): void
    {
        if (!isset($categoryData['name'], $categoryData['icon'], $categoryData['description'], $categoryData['color'])) {
            throw new \InvalidArgumentException('Category data must include name, icon, description, and color');
        }

        $categoryData['sort_order'] = $categoryData['sort_order'] ?? 999;
        self::$categories[$slug] = $categoryData;
    }

    /**
     * Register a custom category (simplified method for WidgetRegistrar)
     */
    public static function registerCustomCategory(string $slug, string $name, string $icon, int $sortOrder = 100): void
    {
        if (self::categoryExists($slug)) {
            throw new \InvalidArgumentException("Category '{$slug}' already exists");
        }

        self::addCustomCategory($slug, [
            'name' => $name,
            'icon' => $icon,
            'description' => "Custom {$name} widgets",
            'color' => '#6366F1', // Default indigo color for custom categories
            'sort_order' => $sortOrder
        ]);
    }

    /**
     * Get categories grouped by type (for admin interface)
     */
    public static function getCategoriesGrouped(): array
    {
        return [
            'core' => [
                'label' => 'Core Categories',
                'categories' => array_slice(self::getAllCategories(), 0, 6, true)
            ],
            'specialized' => [
                'label' => 'Specialized Categories',
                'categories' => array_slice(self::getAllCategories(), 6, 3, true)
            ],
            'advanced' => [
                'label' => 'Advanced Categories',
                'categories' => array_slice(self::getAllCategories(), 9, null, true)
            ]
        ];
    }

    /**
     * Search categories by name or description
     */
    public static function searchCategories(string $query): array
    {
        $query = strtolower($query);
        $results = [];

        foreach (self::$categories as $slug => $category) {
            if (
                str_contains(strtolower($category['name']), $query) ||
                str_contains(strtolower($category['description']), $query)
            ) {
                $results[$slug] = $category;
            }
        }

        return $results;
    }
}
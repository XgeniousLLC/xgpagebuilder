import React, { useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PhpFieldRenderer from './PhpFieldRenderer';

/**
 * SortableRepeaterItem - Individual draggable repeater item
 */
const SortableRepeaterItem = ({
    id,
    index,
    item,
    fields,
    itemLabel = 'Item',
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    onDuplicate,
    canDelete,
    showHandle = true
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`border border-gray-200 rounded-lg bg-white ${isDragging ? 'shadow-lg' : ''}`}
        >
            {/* Repeater Item Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    {showHandle && (
                        <button
                            type="button"
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical size={16} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onToggle}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex-shrink-0"
                    >
                        {isExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                        {itemLabel} {index + 1}
                    </button>

                    {/* Preview of first field value */}
                    {!isExpanded && (
                        <span
                            className="text-xs text-gray-500 truncate flex-1 min-w-0 ml-2"
                            title={getItemPreview(item, fields)}
                        >
                            {getItemPreview(item, fields)}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onDuplicate}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Duplicate item"
                    >
                        <Copy size={14} />
                    </button>

                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete item"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Repeater Item Content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {Object.entries(fields).map(([fieldKey, fieldConfig]) => {
                        // Check if field should be visible based on conditions
                        if (!shouldShowField(fieldConfig, item)) {
                            return null;
                        }

                        return (
                            <PhpFieldRenderer
                                key={fieldKey}
                                fieldKey={fieldKey}
                                fieldConfig={fieldConfig}
                                value={item[fieldKey]}
                                onChange={(newValue) => onUpdate(fieldKey, newValue)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/**
 * Get preview text for collapsed repeater item
 */
const getItemPreview = (item, fields) => {
    if (!item || typeof item !== 'object') {
        return 'No content';
    }

    // Priority order for preview fields
    const priorityFields = ['title', 'text', 'name', 'label', 'heading', 'btn_text', 'content', 'description'];

    // Check priority fields first
    for (const fieldName of priorityFields) {
        if (item[fieldName] && typeof item[fieldName] === 'string' && item[fieldName].trim()) {
            return item[fieldName].trim();
        }
    }

    // Fallback to any text or textarea field with content
    const textFieldEntries = Object.entries(fields).filter(([key, config]) =>
        ['text', 'textarea'].includes(config.type)
    );

    for (const [fieldKey, fieldConfig] of textFieldEntries) {
        if (item[fieldKey] && typeof item[fieldKey] === 'string' && item[fieldKey].trim()) {
            return item[fieldKey].trim();
        }
    }

    // Show field type indicators for non-text fields
    const nonEmptyFields = Object.entries(item).filter(([key, value]) => {
        if (key === 'id' || !value) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
    });

    if (nonEmptyFields.length > 0) {
        const [fieldKey, value] = nonEmptyFields[0];
        const fieldConfig = fields[fieldKey];

        if (fieldConfig) {
            switch (fieldConfig.type) {
                case 'image':
                    return '📷 Image uploaded';
                case 'url':
                    return '🔗 ' + (typeof value === 'string' ? value : 'Link set');
                case 'select':
                    return '📋 ' + (typeof value === 'string' ? value : 'Option selected');
                case 'toggle':
                    return value ? '✅ Enabled' : '❌ Disabled';
                default:
                    return fieldConfig.label || fieldKey;
            }
        }
    }

    return 'Empty item';
};

/**
 * Check if a field should be visible based on conditional logic
 */
const shouldShowField = (fieldConfig, itemData) => {
    if (!fieldConfig.condition) {
        return true;
    }

    const condition = fieldConfig.condition;

    // Simple field dependency check
    if (condition.field && condition.value !== undefined) {
        const dependentField = condition.field;
        const expectedValue = condition.value;
        const operator = condition.operator || '=';
        const actualValue = itemData[dependentField];

        switch (operator) {
            case '=':
            case '==':
                return actualValue == expectedValue;
            case '!=':
                return actualValue != expectedValue;
            case 'in':
                return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
            case 'not_in':
                return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
            case 'not_empty':
                return !!(actualValue && actualValue.toString().trim());
            case 'empty':
                return !(actualValue && actualValue.toString().trim());
            default:
                return actualValue == expectedValue;
        }
    }

    return true;
};

/**
 * RepeaterFieldComponent - Dynamic repeater field for managing arrays of data
 */
const RepeaterFieldComponent = ({
    fieldKey,
    fieldConfig,
    value = [],
    onChange,
    className = ''
}) => {
    const [expandedItems, setExpandedItems] = useState(new Set([0])); // First item expanded by default
    const [activeId, setActiveId] = useState(null);

    const {
        label,
        description,
        fields = {},
        min = 0,
        max = 10,
        required = false,
        itemLabel = 'Item',
        addButtonText = 'Add Item'
    } = fieldConfig;

    // Ensure value is an array
    const items = Array.isArray(value) ? value : [];

    // Create default item structure
    const createDefaultItem = useCallback(() => {
        const defaultItem = {};
        Object.entries(fields).forEach(([key, config]) => {
            defaultItem[key] = config.default || '';
        });
        return defaultItem;
    }, [fields]);

    // Add new item
    const handleAddItem = useCallback(() => {
        if (items.length >= max) return;

        const newItem = createDefaultItem();
        const newItems = [...items, newItem];
        const newIndex = newItems.length - 1;

        // Expand the new item
        setExpandedItems(prev => new Set([...prev, newIndex]));

        onChange(newItems);
    }, [items, max, createDefaultItem, onChange]);

    // Delete item
    const handleDeleteItem = useCallback((index) => {
        if (items.length <= min) return;

        const newItems = items.filter((_, i) => i !== index);

        // Update expanded items indices
        setExpandedItems(prev => {
            const newSet = new Set();
            prev.forEach(expandedIndex => {
                if (expandedIndex < index) {
                    newSet.add(expandedIndex);
                } else if (expandedIndex > index) {
                    newSet.add(expandedIndex - 1);
                }
            });
            return newSet;
        });

        onChange(newItems);
    }, [items, min, onChange]);

    // Duplicate item
    const handleDuplicateItem = useCallback((index) => {
        if (items.length >= max) return;

        const itemToDuplicate = { ...items[index] };
        const newItems = [...items];
        newItems.splice(index + 1, 0, itemToDuplicate);

        // Expand the duplicated item
        setExpandedItems(prev => {
            const newSet = new Set();
            prev.forEach(expandedIndex => {
                if (expandedIndex <= index) {
                    newSet.add(expandedIndex);
                } else {
                    newSet.add(expandedIndex + 1);
                }
            });
            newSet.add(index + 1); // Expand the new duplicated item
            return newSet;
        });

        onChange(newItems);
    }, [items, max, onChange]);

    // Update item field
    const handleUpdateItem = useCallback((index, fieldKey, newValue) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [fieldKey]: newValue
        };
        onChange(newItems);
    }, [items, onChange]);

    // Toggle item expansion
    const handleToggleExpansion = useCallback((index) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((_, index) => index.toString() === active.id);
            const newIndex = items.findIndex((_, index) => index.toString() === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = [...items];
                const [reorderedItem] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, reorderedItem);

                // Update expanded items indices
                setExpandedItems(prev => {
                    const newSet = new Set();
                    prev.forEach(expandedIndex => {
                        if (expandedIndex === oldIndex) {
                            newSet.add(newIndex);
                        } else if (expandedIndex > oldIndex && expandedIndex <= newIndex) {
                            newSet.add(expandedIndex - 1);
                        } else if (expandedIndex < oldIndex && expandedIndex >= newIndex) {
                            newSet.add(expandedIndex + 1);
                        } else {
                            newSet.add(expandedIndex);
                        }
                    });
                    return newSet;
                });

                onChange(newItems);
            }
        }

        setActiveId(null);
    }, [items, onChange]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const canAddMore = items.length < max;
    const canDelete = items.length > min;

    return (
        <div className={`repeater-field ${className}`}>
            {/* Field Header */}
            <div className="mb-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{items.length} / {max} items</span>
                        {min > 0 && <span>(min: {min})</span>}
                    </div>
                </div>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>

            {/* Repeater Items */}
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-3">No items yet</p>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md transition-colors"
                        >
                            <Plus size={16} />
                            {addButtonText}
                        </button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        onDragStart={({ active }) => setActiveId(active.id)}
                    >
                        <SortableContext
                            items={items.map((_, index) => index.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((item, index) => (
                                <SortableRepeaterItem
                                    key={index}
                                    id={index.toString()}
                                    index={index}
                                    item={item}
                                    fields={fields}
                                    itemLabel={itemLabel}
                                    isExpanded={expandedItems.has(index)}
                                    onToggle={() => handleToggleExpansion(index)}
                                    onUpdate={(fieldKey, newValue) => handleUpdateItem(index, fieldKey, newValue)}
                                    onDelete={() => handleDeleteItem(index)}
                                    onDuplicate={() => handleDuplicateItem(index)}
                                    canDelete={canDelete}
                                />
                            ))}
                        </SortableContext>

                        <DragOverlay>
                            {activeId ? (
                                <div className="border border-gray-200 rounded-lg bg-white shadow-lg opacity-95">
                                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                                        <span className="text-sm font-medium text-gray-700">
                                            Moving {itemLabel} {parseInt(activeId) + 1}
                                        </span>
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            {/* Add Button */}
            {items.length > 0 && canAddMore && (
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md transition-colors"
                    >
                        <Plus size={16} />
                        {addButtonText}
                    </button>
                </div>
            )}

            {/* Validation Messages */}
            <div className="mt-2 space-y-1">
                {required && items.length === 0 && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        At least one item is required
                    </p>
                )}

                {items.length < min && min > 0 && (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                        <span className="text-amber-500">⚠</span>
                        Minimum {min} item{min > 1 ? 's' : ''} required ({items.length}/{min})
                    </p>
                )}

                {items.length === max && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                        <span className="text-amber-500">ℹ</span>
                        Maximum number of items reached ({max})
                    </p>
                )}

                {/* Show field validation errors */}
                {Object.entries(fields).map(([fieldKey, fieldConfig]) => {
                    if (!fieldConfig.required) return null;

                    const itemsWithEmptyRequiredField = items.filter(item =>
                        !item[fieldKey] || (typeof item[fieldKey] === 'string' && !item[fieldKey].trim())
                    );

                    if (itemsWithEmptyRequiredField.length > 0) {
                        return (
                            <p key={fieldKey} className="text-sm text-red-600 flex items-center gap-1">
                                <span className="text-red-500">⚠</span>
                                {fieldConfig.label || fieldKey} is required in {itemsWithEmptyRequiredField.length} item{itemsWithEmptyRequiredField.length > 1 ? 's' : ''}
                            </p>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default RepeaterFieldComponent;
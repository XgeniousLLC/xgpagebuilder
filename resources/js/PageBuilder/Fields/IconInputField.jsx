import React, { useState } from 'react';
import IconSelectorModal from './IconSelectorModal';

const IconInputField = ({ fieldKey, fieldConfig, value, onChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        label = 'Icon',
        placeholder = 'Click to select an icon',
        required = false,
        description = '',
        defaultIcon = '',
        previewSize = 'medium',
        allowEmpty = true,
        modalTitle = 'Select Icon',
        allowedCategories = []
    } = fieldConfig;

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleIconSelect = (iconClass) => {
        onChange(iconClass);
        closeModal();
    };

    const handleClear = () => {
        if (allowEmpty) {
            onChange('');
        }
    };

    const getPreviewSizeClass = () => {
        switch (previewSize) {
            case 'small':
                return 'text-sm';
            case 'large':
                return 'text-xl';
            default:
                return 'text-base';
        }
    };

    const currentValue = value || defaultIcon;

    return (
        <div className="icon-input-field mb-4">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {allowEmpty && currentValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div
                onClick={openModal}
                className="icon-input-trigger relative flex items-center justify-center min-h-[60px] p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openModal();
                    }
                }}
                role="button"
                aria-label={`Select icon. Current selection: ${currentValue || 'None'}`}
            >
                {currentValue ? (
                    <div className="flex flex-col items-center space-y-2">
                        <i
                            className={`${currentValue} ${getPreviewSizeClass()} text-gray-700`}
                            aria-hidden="true"
                        />
                        <span className="text-xs text-gray-500 font-mono">
                            {currentValue}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 text-gray-400">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        <span className="text-sm">
                            {placeholder}
                        </span>
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                </div>
            </div>

            {description && (
                <p className="mt-1 text-xs text-gray-500">
                    {description}
                </p>
            )}

            {required && !currentValue && (
                <p className="mt-1 text-xs text-red-500">
                    This field is required
                </p>
            )}

            {isModalOpen && (
                <IconSelectorModal
                    isOpen={isModalOpen}
                    onSelect={handleIconSelect}
                    onClose={closeModal}
                    currentValue={currentValue}
                    modalTitle={modalTitle}
                    allowedCategories={allowedCategories}
                    allowEmpty={allowEmpty}
                />
            )}
        </div>
    );
};

export default IconInputField;
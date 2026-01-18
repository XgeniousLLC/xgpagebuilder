import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Save } from 'lucide-react';
import settingsService from '@/Services/settingsService';

/**
 * SaveSettingsSectionButton Component
 *
 * A reusable button component that saves individual settings sections
 * (general OR style OR advanced) for a widget, section, or column.
 * Provides loading, success, and error states.
 */
const SaveSettingsSectionButton = ({
    entity,
    pageId,
    settingsType, // 'general', 'style', or 'advanced'
    settingsData,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    className = "",
    disabled = false,
    size = "medium" // 'small', 'medium', 'large'
}) => {
    const [saveState, setSaveState] = useState('idle'); // idle, loading, success, error
    const [saveError, setSaveError] = useState(null);
    const [saveMessage, setSaveMessage] = useState('');

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (saveState === 'success') {
            const timeout = setTimeout(() => {
                setSaveState('idle');
                setSaveMessage('');
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [saveState]);

    // Auto-hide error message after 5 seconds
    useEffect(() => {
        if (saveState === 'error') {
            const timeout = setTimeout(() => {
                setSaveState('idle');
                setSaveError(null);
                setSaveMessage('');
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [saveState]);

    const handleSave = async () => {
        // Validate entity and settingsType
        try {
            settingsService.validateEntity(entity);

            if (!settingsType || !['general', 'style', 'advanced'].includes(settingsType)) {
                throw new Error(`Invalid settings type: ${settingsType}`);
            }

            if (!settingsData) {
                throw new Error('Settings data is required');
            }
        } catch (error) {
            setSaveState('error');
            setSaveError(error.message);
            setSaveMessage('Invalid data');
            if (onSaveError) onSaveError(error);
            return;
        }

        // Start save process
        setSaveState('loading');
        setSaveError(null);
        setSaveMessage('');

        if (onSaveStart) onSaveStart();

        try {
            console.log(`[SaveSettingsSectionButton] Saving ${entity.type} ${entity.id} ${settingsType} settings:`, settingsData);

            let result;

            // Call appropriate save method based on entity type and settings type
            if (entity.type === 'section') {
                // For sections, use the existing saveAllSettings method with the specific settings type
                result = await settingsService.saveSectionAllSettings(
                    pageId,
                    entity.id,
                    { [settingsType]: settingsData },
                    entity.responsiveSettings || {}
                );
            } else if (entity.type === 'column') {
                // For columns, use the existing saveAllSettings method with the specific settings type
                result = await settingsService.saveColumnAllSettings(
                    pageId,
                    entity.id,
                    { [settingsType]: settingsData },
                    entity.responsiveSettings || {}
                );
            } else {
                // For widgets, use the new individual save methods
                switch (settingsType) {
                    case 'general':
                        result = await settingsService.saveWidgetGeneralSettings(pageId, entity.id, settingsData);
                        break;
                    case 'style':
                        result = await settingsService.saveWidgetStyleSettings(pageId, entity.id, settingsData);
                        break;
                    case 'advanced':
                        result = await settingsService.saveWidgetAdvancedSettings(pageId, entity.id, settingsData);
                        break;
                    default:
                        throw new Error(`Unsupported settings type: ${settingsType}`);
                }
            }

            console.log(`[SaveSettingsSectionButton] Save successful:`, result);

            setSaveState('success');
            setSaveMessage(`${getDisplayName()} ${settingsType} settings saved!`);

            if (onSaveSuccess) onSaveSuccess(result);

        } catch (error) {
            console.error(`[SaveSettingsSectionButton] Save failed:`, error);

            setSaveState('error');
            setSaveError(error.message || 'Failed to save settings');
            setSaveMessage(`Failed to save ${settingsType} settings`);

            if (onSaveError) onSaveError(error);
        }
    };

    const getDisplayName = () => {
        return settingsService.getEntityTypeDisplayName(entity?.type || 'widget');
    };

    const getSettingsTypeDisplayName = (type) => {
        switch (type) {
            case 'general':
                return 'General';
            case 'style':
                return 'Style';
            case 'advanced':
                return 'Advanced';
            default:
                return type;
        }
    };

    const getButtonContent = () => {
        const settingsName = getSettingsTypeDisplayName(settingsType);

        switch (saveState) {
            case 'loading':
                return (
                    <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        <span>Saving...</span>
                    </div>
                );

            case 'success':
                return (
                    <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span>Saved!</span>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex items-center justify-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        <span>Failed</span>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" />
                        <span>Save {settingsName}</span>
                    </div>
                );
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'px-3 py-2 text-xs';
            case 'large':
                return 'px-6 py-4 text-base';
            default:
                return 'px-4 py-3 text-sm';
        }
    };

    const getButtonClass = () => {
        const baseClass = `
            w-full rounded-md font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${getSizeClasses()}
        `;

        switch (saveState) {
            case 'loading':
                return `${baseClass} bg-blue-500 text-white cursor-not-allowed`;

            case 'success':
                return `${baseClass} bg-green-600 text-white`;

            case 'error':
                return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;

            default:
                return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
        }
    };

    const isDisabled = disabled || saveState === 'loading';

    return (
        <div className="w-full">
            <button
                onClick={handleSave}
                disabled={isDisabled}
                className={`${getButtonClass()} ${className}`}
                title={
                    saveState === 'error'
                        ? `Error: ${saveError}`
                        : `Save ${getSettingsTypeDisplayName(settingsType).toLowerCase()} settings for this ${getDisplayName().toLowerCase()}`
                }
            >
                {getButtonContent()}
            </button>

            {/* Status message */}
            {saveMessage && (
                <div className={`
                    mt-2 text-xs text-center px-2 py-1 rounded
                    ${saveState === 'success'
                        ? 'text-green-700 bg-green-50 border border-green-200'
                        : saveState === 'error'
                        ? 'text-red-700 bg-red-50 border border-red-200'
                        : 'text-blue-700 bg-blue-50 border border-blue-200'
                    }
                `}>
                    {saveMessage}
                </div>
            )}

            {/* Error details */}
            {saveState === 'error' && saveError && (
                <div className="mt-1 text-xs text-red-600 text-center">
                    {saveError}
                </div>
            )}
        </div>
    );
};

export default SaveSettingsSectionButton;
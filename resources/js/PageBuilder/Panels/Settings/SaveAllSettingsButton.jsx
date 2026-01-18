import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Save } from 'lucide-react';
import settingsService from '@/Services/settingsService';

/**
 * SaveAllSettingsButton Component
 *
 * A reusable button component that saves all settings (general + style + advanced)
 * for a widget, section, or column. Provides loading, success, and error states.
 */
const SaveAllSettingsButton = ({
    entity,
    pageId,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    className = "",
    disabled = false
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
        // Validate entity
        try {
            settingsService.validateEntity(entity);
        } catch (error) {
            setSaveState('error');
            setSaveError(error.message);
            setSaveMessage('Invalid entity data');
            if (onSaveError) onSaveError(error);
            return;
        }

        // Start save process
        setSaveState('loading');
        setSaveError(null);
        setSaveMessage('');

        if (onSaveStart) onSaveStart();

        try {
            console.log(`[SaveAllSettingsButton] Saving ${entity.type} ${entity.id} settings:`, entity);

            const result = await settingsService.saveAllSettings(pageId, entity);

            console.log(`[SaveAllSettingsButton] Save successful:`, result);

            setSaveState('success');
            setSaveMessage(`${settingsService.getEntityTypeDisplayName(entity.type)} settings saved successfully!`);

            if (onSaveSuccess) onSaveSuccess(result);

        } catch (error) {
            console.error(`[SaveAllSettingsButton] Save failed:`, error);

            setSaveState('error');
            setSaveError(error.message || 'Failed to save settings');
            setSaveMessage(`Failed to save ${settingsService.getEntityTypeDisplayName(entity.type).toLowerCase()} settings`);

            if (onSaveError) onSaveError(error);
        }
    };

    const getButtonContent = () => {
        switch (saveState) {
            case 'loading':
                return (
                    <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        <span>Saving Settings...</span>
                    </div>
                );

            case 'success':
                return (
                    <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        <span>Saved Successfully!</span>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex items-center justify-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        <span>Save Failed</span>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" />
                        <span>Save All Settings</span>
                    </div>
                );
        }
    };

    const getButtonClass = () => {
        const baseClass = `
            w-full px-4 py-3 rounded-md font-medium text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
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
                        : `Save all settings for this ${settingsService.getEntityTypeDisplayName(entity?.type || 'widget').toLowerCase()}`
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

export default SaveAllSettingsButton;
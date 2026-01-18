import React, { useState } from 'react';
import { X, Clock, User, AlertTriangle, FileText } from 'lucide-react';

/**
 * EditingConflictModal
 *
 * Shows when multiple users are trying to edit the same page,
 * with options to take over or exit.
 */
const EditingConflictModal = ({
    isOpen,
    conflictData,
    onTakeover,
    onExit,
    onClose
}) => {
    const [takeoverMessage, setTakeoverMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !conflictData) return null;

    const handleTakeover = async () => {
        setIsLoading(true);
        try {
            await onTakeover(takeoverMessage);
        } catch (error) {
            console.error('Takeover failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (startedAt) => {
        const start = new Date(startedAt);
        const now = new Date();
        const minutes = Math.floor((now - start) / (1000 * 60));

        if (minutes < 1) return 'Just started';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ago`;
    };

    const currentEditor = conflictData.conflicts?.[0] || conflictData.current_editors?.[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Page Being Edited
                            </h3>
                            <p className="text-sm text-gray-500">
                                Another user is currently editing this page
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {currentEditor && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {currentEditor.admin?.name || 'Unknown User'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {currentEditor.admin?.email}
                                    </p>
                                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-3 w-3" />
                                            <span>Started {formatDuration(currentEditor.started_at)}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FileText className="h-3 w-3" />
                                            <span>
                                                {currentEditor.editing_section === 'full_page'
                                                    ? 'Full page'
                                                    : currentEditor.editing_section
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-700 mb-3">
                                What would you like to do?
                            </p>
                        </div>

                        {/* Takeover Option */}
                        <div className="border border-red-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-red-800 mb-2">
                                Take Over Editing
                            </h4>
                            <p className="text-xs text-red-600 mb-3">
                                This will end the other user's session and may cause them to lose unsaved changes.
                            </p>
                            <textarea
                                value={takeoverMessage}
                                onChange={(e) => setTakeoverMessage(e.target.value)}
                                placeholder="Optional: Explain why you need to take over (visible to other user)"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onExit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Go Back
                    </button>

                    <button
                        onClick={handleTakeover}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Taking Over...</span>
                            </div>
                        ) : (
                            'Take Over'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditingConflictModal;
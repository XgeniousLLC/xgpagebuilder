import { useState, useEffect, useCallback, useRef } from 'react';
import editingSessionService, { EditingConflictError } from '@/Services/editingSessionService';

/**
 * useEditingSession Hook
 *
 * Manages editing session state and provides conflict resolution UI integration
 */
export const useEditingSession = (pageId) => {
    const [sessionState, setSessionState] = useState({
        hasSession: false,
        sessionData: null,
        activeEditors: [],
        conflicts: [],
        isLoading: false,
        error: null
    });

    const [conflictModal, setConflictModal] = useState({
        isOpen: false,
        conflictData: null
    });

    const cleanupRef = useRef([]);

    /**
     * Start editing session
     */
    const startSession = useCallback(async (editingSection = 'full_page') => {
        setSessionState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const sessionData = await editingSessionService.startSession(pageId, editingSection);

            setSessionState(prev => ({
                ...prev,
                hasSession: true,
                sessionData,
                activeEditors: sessionData.current_editors || [],
                isLoading: false
            }));

            return sessionData;

        } catch (error) {
            if (error instanceof EditingConflictError) {
                // Show conflict resolution modal
                setConflictModal({
                    isOpen: true,
                    conflictData: {
                        conflicts: error.conflicts,
                        current_editors: error.currentEditors
                    }
                });

                setSessionState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message
                }));
            } else {
                setSessionState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error.message
                }));
            }

            throw error;
        }
    }, [pageId]);

    /**
     * End editing session
     */
    const endSession = useCallback(async () => {
        try {
            await editingSessionService.endSession();

            setSessionState(prev => ({
                ...prev,
                hasSession: false,
                sessionData: null,
                activeEditors: [],
                conflicts: []
            }));

        } catch (error) {
            console.error('Failed to end session:', error);
        }
    }, []);

    /**
     * Handle takeover
     */
    const handleTakeover = useCallback(async (message = '') => {
        setSessionState(prev => ({ ...prev, isLoading: true }));

        try {
            const sessionData = await editingSessionService.takeover(pageId, message, 'full_page');

            setSessionState(prev => ({
                ...prev,
                hasSession: true,
                sessionData,
                activeEditors: sessionData.current_editors || [],
                isLoading: false,
                error: null
            }));

            setConflictModal({ isOpen: false, conflictData: null });

            return sessionData;

        } catch (error) {
            setSessionState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message
            }));

            throw error;
        }
    }, [pageId]);

    /**
     * Handle conflict modal exit
     */
    const handleConflictExit = useCallback(() => {
        setConflictModal({ isOpen: false, conflictData: null });
        window.history.back();
    }, []);

    /**
     * Close conflict modal
     */
    const closeConflictModal = useCallback(() => {
        setConflictModal({ isOpen: false, conflictData: null });
    }, []);

    /**
     * Check current editors
     */
    const checkEditors = useCallback(async () => {
        try {
            const editorsData = await editingSessionService.getEditors(pageId);
            setSessionState(prev => ({
                ...prev,
                activeEditors: editorsData.editors || []
            }));
            return editorsData;
        } catch (error) {
            console.error('Failed to check editors:', error);
            return null;
        }
    }, [pageId]);

    /**
     * Setup event listeners
     */
    useEffect(() => {
        const unsubscribers = [
            editingSessionService.on('session-started', (data) => {
                setSessionState(prev => ({
                    ...prev,
                    hasSession: true,
                    sessionData: data.session,
                    activeEditors: data.current_editors || []
                }));
            }),

            editingSessionService.on('session-ended', () => {
                setSessionState(prev => ({
                    ...prev,
                    hasSession: false,
                    sessionData: null,
                    activeEditors: [],
                    conflicts: []
                }));
            }),

            editingSessionService.on('session-takeover', (data) => {
                setSessionState(prev => ({
                    ...prev,
                    hasSession: true,
                    sessionData: data.session,
                    activeEditors: data.current_editors || []
                }));
            }),

            editingSessionService.on('editors-updated', (editors) => {
                setSessionState(prev => ({
                    ...prev,
                    activeEditors: editors || []
                }));
            }),

            editingSessionService.on('conflicts-detected', (conflicts) => {
                setSessionState(prev => ({
                    ...prev,
                    conflicts: conflicts || []
                }));

                // Optionally show notification about conflicts
                console.warn('Editing conflicts detected:', conflicts);
            }),

            editingSessionService.on('session-expired', () => {
                setSessionState(prev => ({
                    ...prev,
                    hasSession: false,
                    sessionData: null,
                    activeEditors: [],
                    conflicts: [],
                    error: 'Your editing session has expired. Please refresh the page.'
                }));
            }),

            editingSessionService.on('heartbeat-failed', (error) => {
                console.error('Heartbeat failed:', error);
            })
        ];

        // Store cleanup functions
        cleanupRef.current = unsubscribers;

        return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };
    }, []);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            endSession();
        };
    }, [endSession]);

    /**
     * Window beforeunload handler
     */
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (sessionState.hasSession) {
                editingSessionService.endSession();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [sessionState.hasSession]);

    return {
        // Session state
        sessionState,

        // Actions
        startSession,
        endSession,
        checkEditors,

        // Conflict resolution
        conflictModal,
        handleTakeover,
        handleConflictExit,
        closeConflictModal,

        // Utilities
        hasActiveSession: sessionState.hasSession,
        isLoading: sessionState.isLoading,
        error: sessionState.error,
        activeEditors: sessionState.activeEditors,
        conflicts: sessionState.conflicts
    };
};
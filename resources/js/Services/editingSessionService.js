/**
 * EditingSessionService
 *
 * Handles real-time editing session management for page builder
 * to prevent conflicts and enable collaborative editing awareness.
 */
class EditingSessionService {
    constructor() {
        this.sessionToken = null;
        this.heartbeatInterval = null;
        this.heartbeatRate = 30000; // 30 seconds
        this.listeners = new Map();
    }

    /**
     * Start an editing session for a page
     */
    async startSession(pageId, editingSection = 'full_page') {
        try {
            const response = await fetch(`/api/page-builder/pages/${pageId}/start-editing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    editing_section: editingSection
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'PAGE_CONFLICT' || data.code === 'SECTION_CONFLICT') {
                    throw new EditingConflictError(data);
                }
                throw new Error(data.message || 'Failed to start editing session');
            }

            this.sessionToken = data.data.session.session_token;
            this.startHeartbeat();

            this.emit('session-started', data.data);

            return data.data;

        } catch (error) {
            console.error('Failed to start editing session:', error);
            throw error;
        }
    }

    /**
     * End the current editing session
     */
    async endSession() {
        if (!this.sessionToken) {
            return;
        }

        try {
            this.stopHeartbeat();

            const response = await fetch(`/api/page-builder/editing-sessions/${this.sessionToken}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn('Failed to end editing session:', data.message);
            }

            this.sessionToken = null;
            this.emit('session-ended', data.data);

        } catch (error) {
            console.error('Failed to end editing session:', error);
            this.sessionToken = null;
        }
    }

    /**
     * Force takeover editing session
     */
    async takeover(pageId, message = '', editingSection = 'full_page') {
        try {
            const response = await fetch(`/api/page-builder/pages/${pageId}/takeover`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    force: true,
                    message: message,
                    editing_section: editingSection
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to takeover editing session');
            }

            this.sessionToken = data.data.session.session_token;
            this.startHeartbeat();

            this.emit('session-takeover', data.data);

            return data.data;

        } catch (error) {
            console.error('Failed to takeover editing session:', error);
            throw error;
        }
    }

    /**
     * Get current editors for a page
     */
    async getEditors(pageId) {
        try {
            const response = await fetch(`/api/page-builder/pages/${pageId}/editors`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get page editors');
            }

            return data.data;

        } catch (error) {
            console.error('Failed to get page editors:', error);
            throw error;
        }
    }

    /**
     * Start heartbeat to keep session alive
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            this.stopHeartbeat();
        }

        this.heartbeatInterval = setInterval(async () => {
            await this.sendHeartbeat();
        }, this.heartbeatRate);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Send heartbeat to server
     */
    async sendHeartbeat() {
        if (!this.sessionToken) {
            return;
        }

        try {
            const response = await fetch(`/api/page-builder/editing-sessions/${this.sessionToken}/heartbeat`, {
                method: 'PUT',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 'SESSION_NOT_FOUND' || data.code === 'UNAUTHORIZED_SESSION') {
                    this.handleSessionExpired();
                    return;
                }
                throw new Error(data.message || 'Heartbeat failed');
            }

            // Check for conflicts
            if (data.data.conflicts && data.data.conflicts.length > 0) {
                this.emit('conflicts-detected', data.data.conflicts);
            }

            // Update active editors
            this.emit('editors-updated', data.data.active_editors);

        } catch (error) {
            console.error('Heartbeat failed:', error);
            this.emit('heartbeat-failed', error);
        }
    }

    /**
     * Handle session expiration
     */
    handleSessionExpired() {
        this.stopHeartbeat();
        this.sessionToken = null;
        this.emit('session-expired');
    }

    /**
     * Check if there's an active session
     */
    hasActiveSession() {
        return this.sessionToken !== null;
    }

    /**
     * Event listener management
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
        };
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Cleanup all listeners and intervals
     */
    destroy() {
        this.stopHeartbeat();
        this.listeners.clear();
        this.sessionToken = null;
    }
}

/**
 * Custom error for editing conflicts
 */
class EditingConflictError extends Error {
    constructor(conflictData) {
        super(conflictData.message || 'Editing conflict detected');
        this.name = 'EditingConflictError';
        this.code = conflictData.code;
        this.conflicts = conflictData.data.conflicts;
        this.currentEditors = conflictData.data.current_editors;
    }
}

// Export singleton instance
const editingSessionService = new EditingSessionService();

export default editingSessionService;
export { EditingConflictError };
import api from './axiosConfig';

/**
 * Chat API Service
 * Handles communication with chat endpoints
 */

/**
 * Create or get existing chat session
 * @param {string} guestId - Guest ID for non-authenticated users
 * @returns {Promise} Session data
 */
export const createOrGetSession = async (guestId = null) => {
    try {
        const params = guestId ? { guestId } : {};
        const response = await api.post('/chat/session', null, { params });
        return response.data;
    } catch (error) {
        console.error('Error creating/getting session:', error);
        throw error;
    }
};

/**
 * Send a message and get bot response
 * @param {Object} messageData - { sessionId, guestId, content }
 * @returns {Promise} Chat response with bot reply
 */
export const sendMessage = async (messageData) => {
    try {
        const response = await api.post('/chat/message', messageData);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Get session by ID with all messages
 * @param {number} sessionId - Session ID
 * @returns {Promise} Session with messages
 */
export const getSession = async (sessionId) => {
    try {
        const response = await api.get(`/chat/session/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting session:', error);
        throw error;
    }
};

/**
 * Get messages of a session
 * @param {number} sessionId - Session ID
 * @returns {Promise} List of messages
 */
export const getMessages = async (sessionId) => {
    try {
        const response = await api.get(`/chat/session/${sessionId}/messages`);
        return response.data;
    } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
};

/**
 * Request staff support
 * @param {number} sessionId - Session ID
 * @returns {Promise} Updated session
 */
export const requestStaffSupport = async (sessionId) => {
    try {
        const response = await api.post(`/chat/session/${sessionId}/request-staff`);
        return response.data;
    } catch (error) {
        console.error('Error requesting staff support:', error);
        throw error;
    }
};

/**
 * Close a chat session
 * @param {number} sessionId - Session ID
 * @returns {Promise} Success message
 */
export const closeSession = async (sessionId) => {
    try {
        const response = await api.post(`/chat/session/${sessionId}/close`);
        return response.data;
    } catch (error) {
        console.error('Error closing session:', error);
        throw error;
    }
};

/**
 * Get user's chat history
 * @returns {Promise} List of past sessions
 */
export const getChatHistory = async () => {
    try {
        const response = await api.get('/chat/history');
        return response.data;
    } catch (error) {
        console.error('Error getting chat history:', error);
        throw error;
    }
};

// ==================== Admin Endpoints ====================

/**
 * Get all sessions waiting for staff (Admin)
 * @returns {Promise} List of waiting sessions
 */
export const getWaitingSessions = async () => {
    try {
        const response = await api.get('/chat/admin/waiting');
        return response.data;
    } catch (error) {
        console.error('Error getting waiting sessions:', error);
        throw error;
    }
};

/**
 * Assign staff to a session (Admin)
 * @param {number} sessionId - Session ID
 * @returns {Promise} Updated session
 */
export const assignStaffToSession = async (sessionId) => {
    try {
        const response = await api.post(`/chat/admin/session/${sessionId}/assign`);
        return response.data;
    } catch (error) {
        console.error('Error assigning staff:', error);
        throw error;
    }
};

/**
 * Staff sends a message (Admin)
 * @param {number} sessionId - Session ID
 * @param {string} content - Message content
 * @returns {Promise} Sent message
 */
export const sendStaffMessage = async (sessionId, content) => {
    try {
        const response = await api.post(`/chat/admin/session/${sessionId}/message`, { content });
        return response.data;
    } catch (error) {
        console.error('Error sending staff message:', error);
        throw error;
    }
};

// ==================== Local Storage Helpers ====================

const GUEST_ID_KEY = 'flower_shop_guest_id';
const SESSION_ID_KEY = 'flower_shop_chat_session_id';

/**
 * Get or create guest ID
 * @returns {string} Guest ID
 */
export const getGuestId = () => {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
};

/**
 * Save session ID to local storage
 * @param {number} sessionId - Session ID
 */
export const saveSessionId = (sessionId) => {
    localStorage.setItem(SESSION_ID_KEY, sessionId.toString());
};

/**
 * Get saved session ID
 * @returns {number|null} Session ID or null
 */
export const getSavedSessionId = () => {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    return sessionId ? parseInt(sessionId, 10) : null;
};

/**
 * Clear saved session
 */
export const clearSavedSession = () => {
    localStorage.removeItem(SESSION_ID_KEY);
};

export default {
    createOrGetSession,
    sendMessage,
    getSession,
    getMessages,
    requestStaffSupport,
    closeSession,
    getChatHistory,
    getWaitingSessions,
    assignStaffToSession,
    sendStaffMessage,
    getGuestId,
    saveSessionId,
    getSavedSessionId,
    clearSavedSession
};


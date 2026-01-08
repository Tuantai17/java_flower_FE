import api from './axiosConfig';

/**
 * Live Chat API Service
 * Handles REST API calls for live chat functionality
 */

/**
 * Check if any admin is online
 * @returns {Promise} Admin online status
 */
export const checkAdminOnline = async () => {
    try {
        const response = await api.get('/livechat/admin-online');
        return response.data;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return { adminOnline: false, onlineAdmins: [] };
    }
};

/**
 * Get unread message count for a session
 * @param {number} sessionId - Session ID
 * @returns {Promise} Unread count
 */
export const getUnreadCount = async (sessionId) => {
    try {
        const response = await api.get(`/livechat/sessions/${sessionId}/unread`);
        return response.data.unreadCount;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};

/**
 * Mark session as read
 * @param {number} sessionId - Session ID
 * @param {string} readerType - USER or ADMIN
 */
export const markSessionAsRead = async (sessionId, readerType = 'USER') => {
    try {
        await api.post(`/livechat/sessions/${sessionId}/read`, { readerType });
    } catch (error) {
        console.error('Error marking as read:', error);
    }
};

// ==================== Admin API ====================

/**
 * Get all active sessions for admin
 * @returns {Promise} List of active sessions
 */
export const getActiveSessionsForAdmin = async () => {
    try {
        const response = await api.get('/livechat/admin/sessions');
        return response.data;
    } catch (error) {
        console.error('Error getting active sessions:', error);
        throw error;
    }
};

/**
 * Get session details by ID for admin
 * @param {number} sessionId - Session ID
 * @returns {Promise} Session with messages
 */
export const getSessionForAdmin = async (sessionId) => {
    try {
        const response = await api.get(`/livechat/admin/session/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting session for admin:', error);
        throw error;
    }
};

/**
 * Get messages for a session
 * @param {number} sessionId - Session ID
 * @returns {Promise} List of messages
 */
export const getMessagesForAdmin = async (sessionId) => {
    try {
        const response = await api.get(`/livechat/admin/session/${sessionId}/messages`);
        return response.data;
    } catch (error) {
        console.error('Error getting messages for admin:', error);
        throw error;
    }
};

/**
 * Get sessions waiting for staff
 * @returns {Promise} List of waiting sessions
 */
export const getWaitingSessionsForAdmin = async () => {
    try {
        const response = await api.get('/livechat/admin/sessions/waiting');
        return response.data;
    } catch (error) {
        console.error('Error getting waiting sessions:', error);
        throw error;
    }
};

/**
 * Get admin status info (online users, admins, unread count)
 * @returns {Promise} Admin status info
 */
export const getAdminStatusInfo = async () => {
    try {
        const response = await api.get('/livechat/admin/status');
        return response.data;
    } catch (error) {
        console.error('Error getting admin status:', error);
        throw error;
    }
};

/**
 * Send message as admin (REST fallback)
 * @param {number} sessionId - Session ID
 * @param {string} content - Message content
 */
export const sendAdminMessage = async (sessionId, content) => {
    try {
        const response = await api.post(`/livechat/admin/sessions/${sessionId}/message`, { content });
        return response.data;
    } catch (error) {
        console.error('Error sending admin message:', error);
        throw error;
    }
};

/**
 * Toggle chat mode between AI Bot and Manual Staff
 * @param {number} sessionId - Session ID
 * @param {string} mode - "BOT" or "STAFF"
 * @returns {Promise} New status
 */
export const toggleChatMode = async (sessionId, mode) => {
    try {
        const response = await api.post(`/livechat/admin/sessions/${sessionId}/toggle-mode`, { mode });
        return response.data;
    } catch (error) {
        console.error('Error toggling chat mode:', error);
        throw error;
    }
};

export default {
    checkAdminOnline,
    getUnreadCount,
    markSessionAsRead,
    getActiveSessionsForAdmin,
    getWaitingSessionsForAdmin,
    getAdminStatusInfo,
    sendAdminMessage,
    toggleChatMode
};

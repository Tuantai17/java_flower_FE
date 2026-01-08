import axiosInstance from './axiosConfig';

/**
 * API cho notifications - Admin và User
 */

// ==================== ADMIN NOTIFICATIONS ====================

// Lấy danh sách notifications cho admin (paginated)
export const getAdminNotifications = async (page = 0, size = 20) => {
    try {
        const response = await axiosInstance.get('/admin/notifications', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        return { success: false, data: { content: [] } };
    }
};

// Lấy notifications chưa đọc cho admin (cho dropdown)
export const getUnreadNotifications = async () => {
    try {
        const response = await axiosInstance.get('/admin/notifications/unread');
        return response.data;
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        return { success: false, data: [] };
    }
};

// Đếm số notifications chưa đọc cho admin
export const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get('/admin/notifications/count');
        return response.data;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return { success: false, data: { unreadCount: 0 } };
    }
};

// Đánh dấu tất cả đã đọc (admin)
export const markAllAsRead = async () => {
    try {
        const response = await axiosInstance.post('/admin/notifications/mark-all-read');
        return response.data;
    } catch (error) {
        console.error('Error marking all as read:', error);
        return { success: false };
    }
};

// Đánh dấu 1 notification đã đọc (admin)
export const markAsRead = async (notificationId) => {
    try {
        const response = await axiosInstance.post(`/admin/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking as read:', error);
        return { success: false };
    }
};

// Xóa 1 notification (admin)
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axiosInstance.delete(`/admin/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false };
    }
};

// Xóa nhiều notifications (admin)
export const deleteNotifications = async (ids) => {
    try {
        const response = await axiosInstance.delete('/admin/notifications/bulk', {
            data: ids
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting notifications:', error);
        return { success: false };
    }
};

// Xóa tất cả notifications (admin)
export const deleteAllNotifications = async () => {
    try {
        const response = await axiosInstance.delete('/admin/notifications/all');
        return response.data;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        return { success: false };
    }
};

// Xóa các notifications đã đọc (admin)
export const deleteReadNotifications = async () => {
    try {
        const response = await axiosInstance.delete('/admin/notifications/read');
        return response.data;
    } catch (error) {
        console.error('Error deleting read notifications:', error);
        return { success: false };
    }
};

// ==================== USER NOTIFICATIONS ====================

// Lấy danh sách notifications cho user (paginated)
export const getUserNotifications = async (page = 0, size = 20) => {
    try {
        const response = await axiosInstance.get('/notifications', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        return { success: false, data: { content: [] } };
    }
};

// Đếm số notifications chưa đọc cho user
export const getUserUnreadCount = async () => {
    try {
        const response = await axiosInstance.get('/notifications/count');
        return response.data;
    } catch (error) {
        console.error('Error fetching user unread count:', error);
        return { success: false, data: { unreadCount: 0 } };
    }
};

// Đánh dấu tất cả đã đọc (user)
export const userMarkAllAsRead = async () => {
    try {
        const response = await axiosInstance.post('/notifications/mark-all-read');
        return response.data;
    } catch (error) {
        console.error('Error marking all as read:', error);
        return { success: false };
    }
};

// Đánh dấu 1 notification đã đọc (user)
export const userMarkAsRead = async (notificationId) => {
    try {
        const response = await axiosInstance.post(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking as read:', error);
        return { success: false };
    }
};

// Xóa 1 notification (user)
export const userDeleteNotification = async (notificationId) => {
    try {
        const response = await axiosInstance.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false };
    }
};

// Xóa nhiều notifications (user)
export const userDeleteNotifications = async (ids) => {
    try {
        const response = await axiosInstance.delete('/notifications/bulk', {
            data: ids
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting notifications:', error);
        return { success: false };
    }
};

// Xóa tất cả notifications (user)
export const userDeleteAllNotifications = async () => {
    try {
        const response = await axiosInstance.delete('/notifications/all');
        return response.data;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        return { success: false };
    }
};

// Xóa các notifications đã đọc (user)
export const userDeleteReadNotifications = async () => {
    try {
        const response = await axiosInstance.delete('/notifications/read');
        return response.data;
    } catch (error) {
        console.error('Error deleting read notifications:', error);
        return { success: false };
    }
};

const notificationApi = {
    // Admin
    getAdminNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    deleteNotifications,
    deleteAllNotifications,
    deleteReadNotifications,
    // User
    getUserNotifications,
    getUserUnreadCount,
    userMarkAllAsRead,
    userMarkAsRead,
    userDeleteNotification,
    userDeleteNotifications,
    userDeleteAllNotifications,
    userDeleteReadNotifications,
};

export default notificationApi;

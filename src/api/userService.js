import axiosInstance from './axiosConfig';

/**
 * Helper function để unwrap response từ backend
 * Backend trả về: { success, data, message, timestamp }
 */
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
    }
    return response.data;
};

const userService = {
    /**
     * Lấy thông tin người dùng hiện tại (Profile)
     * Endpoint: GET /api/users/me
     * Yêu cầu: Bearer token trong header
     */
    getProfile: async () => {
        const response = await axiosInstance.get('/users/me');
        return unwrapResponse(response);
    },

    /**
     * Cập nhật thông tin người dùng
     * Endpoint: PUT /api/users/me
     * @param {object} profileData - { fullName, phoneNumber, address }
     */
    updateProfile: async (profileData) => {
        const response = await axiosInstance.put('/users/me', profileData);
        return unwrapResponse(response);
    },

    /**
     * Đổi mật khẩu
     * Endpoint: PUT /api/users/change-password
     * @param {object} passwordData - { currentPassword, newPassword, confirmPassword }
     */
    changePassword: async (passwordData) => {
        const response = await axiosInstance.put('/users/change-password', passwordData);
        return unwrapResponse(response);
    },

    /**
     * Upload avatar
     * Endpoint: POST /api/users/avatar
     * @param {File} file - File ảnh
     */
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return unwrapResponse(response);
    },

    /**
     * Upload avatar cho Admin (sử dụng adminToken)
     * Endpoint: POST /api/users/me/avatar
     * @param {File} file - File ảnh
     */
    uploadAvatarAdmin: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Explicit use adminToken
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            throw new Error('Admin chưa đăng nhập');
        }

        const response = await axiosInstance.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${adminToken}`,
            },
        });
        return unwrapResponse(response);
    },

    /**
     * Cập nhật thông tin Admin profile (sử dụng adminToken)
     * Endpoint: PUT /api/users/me
     * @param {object} profileData - { fullName, phoneNumber, address, email }
     */
    updateProfileAdmin: async (profileData) => {
        // Explicit use adminToken
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            throw new Error('Admin chưa đăng nhập');
        }

        const response = await axiosInstance.put('/users/me', profileData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
            },
        });
        return unwrapResponse(response);
    },
};

export default userService;

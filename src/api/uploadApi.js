import axiosInstance from './axiosConfig';

/**
 * Upload API Service
 * 
 * Backend Endpoints:
 * - POST /api/upload/product   : Upload 1 ảnh sản phẩm (ADMIN)
 * - POST /api/upload/products  : Upload nhiều ảnh sản phẩm (ADMIN)
 * - POST /api/upload/category  : Upload ảnh danh mục (ADMIN)
 * - POST /api/upload/user      : Upload avatar người dùng (Đã đăng nhập)
 * - DELETE /api/upload?url=... : Xóa ảnh (ADMIN)
 * - GET /api/upload/info       : Kiểm tra Storage mode (Công khai)
 */

/**
 * Helper để unwrap response từ backend
 */
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return response.data.data;
    }
    return response.data;
};

const uploadApi = {
    /**
     * Upload 1 ảnh sản phẩm
     * Endpoint: POST /api/upload/product
     * Quyền: ADMIN
     * @param {File} file - File ảnh cần upload
     * @returns {Promise<string>} - URL của ảnh sau khi upload
     */
    uploadProductImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/upload/product', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return unwrapResponse(response);
    },

    /**
     * Upload nhiều ảnh sản phẩm
     * Endpoint: POST /api/upload/products
     * Quyền: ADMIN
     * @param {File[]} files - Mảng các file ảnh
     * @returns {Promise<string[]>} - Mảng URL của các ảnh
     */
    uploadProductImages: async (files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await axiosInstance.post('/upload/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return unwrapResponse(response);
    },

    /**
     * Upload ảnh danh mục
     * Endpoint: POST /api/upload/category
     * Quyền: ADMIN
     * @param {File} file - File ảnh cần upload
     * @returns {Promise<string>} - URL của ảnh sau khi upload
     */
    uploadCategoryImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/upload/category', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return unwrapResponse(response);
    },

    /**
     * Upload avatar người dùng
     * Endpoint: POST /api/upload/user
     * Quyền: Đã đăng nhập
     * @param {File} file - File ảnh cần upload
     * @returns {Promise<string>} - URL của avatar sau khi upload
     */
    uploadUserAvatar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/upload/user', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return unwrapResponse(response);
    },

    /**
     * Xóa ảnh
     * Endpoint: DELETE /api/upload?url=...
     * Quyền: ADMIN
     * @param {string} imageUrl - URL của ảnh cần xóa
     */
    deleteImage: async (imageUrl) => {
        const response = await axiosInstance.delete('/upload', {
            params: { url: imageUrl },
        });
        return unwrapResponse(response);
    },

    /**
     * Kiểm tra thông tin Storage
     * Endpoint: GET /api/upload/info
     * Quyền: Công khai
     * @returns {Promise<object>} - Thông tin về storage mode (Local, Cloudinary, Dual)
     */
    getStorageInfo: async () => {
        const response = await axiosInstance.get('/upload/info');
        return unwrapResponse(response);
    },

    /**
     * Upload ảnh theo loại (helper function)
     * @param {File} file - File ảnh cần upload
     * @param {'product' | 'category' | 'user'} type - Loại ảnh
     * @returns {Promise<string>} - URL của ảnh sau khi upload
     */
    uploadImage: async (file, type = 'product') => {
        switch (type) {
            case 'category':
                return uploadApi.uploadCategoryImage(file);
            case 'user':
                return uploadApi.uploadUserAvatar(file);
            case 'product':
            default:
                return uploadApi.uploadProductImage(file);
        }
    },

    /**
     * Get image preview URL - xử lý cả URL đầy đủ và path tương đối
     * @param {string} imageUrl - URL hoặc path của ảnh
     * @returns {string} - URL đầy đủ để hiển thị
     */
    getPreviewUrl: (imageUrl) => {
        if (!imageUrl) return 'https://placehold.co/500x500/f3f4f6/9ca3af?text=No+Image';

        // Nếu đã là URL đầy đủ
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // Nếu là blob URL (preview tạm)
        if (imageUrl.startsWith('blob:')) {
            return imageUrl;
        }

        // Nếu là path tương đối, thêm base URL
        let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        baseUrl = baseUrl.replace(/\/api$/, '');
        const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

        return `${baseUrl}${cleanPath}`;
    },
};

export default uploadApi;

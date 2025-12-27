import axiosInstance from './axiosConfig';

/**
 * ============================================
 * UPLOAD API SERVICE
 * ============================================
 * 
 * Xử lý upload ảnh lên server (Dual Storage: Local + Cloudinary)
 * 
 * Backend Endpoints:
 * - POST /api/upload/product   : Upload 1 ảnh sản phẩm (ADMIN)
 * - POST /api/upload/products  : Upload nhiều ảnh sản phẩm (ADMIN)
 * - POST /api/upload/category  : Upload ảnh danh mục (ADMIN)
 * - POST /api/upload/user      : Upload avatar người dùng (Đã đăng nhập)
 * - DELETE /api/upload?url=... : Xóa ảnh (ADMIN)
 * - GET /api/upload/info       : Kiểm tra Storage mode (Công khai)
 * 
 * Response Format từ Backend:
 * {
 *   "code": 200,
 *   "message": "Upload anh san pham thanh cong",
 *   "data": {
 *     "url": "https://res.cloudinary.com/.../image.jpg",
 *     "originalName": "image.jpg",
 *     "size": 150240,
 *     "contentType": "image/jpeg"
 *   }
 * }
 */

/**
 * Helper để unwrap response từ backend
 * Backend trả về: { success, data, message, timestamp }
 * => Lấy data từ wrapper
 */
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object' &&
        'data' in response.data && 'success' in response.data) {
        return response.data.data;
    }
    return response.data;
};

/**
 * Trích xuất URL từ response upload
 * Xử lý nhiều format response khác nhau
 */
const extractUrlFromResponse = (response) => {
    // Nếu response là string (URL trực tiếp)
    if (typeof response === 'string') {
        return response;
    }

    // Nếu response là object với url
    if (response?.url) {
        return response.url;
    }

    // Các trường hợp khác
    if (response?.imageUrl) return response.imageUrl;
    if (response?.path) return response.path;
    if (response?.data?.url) return response.data.url;
    if (typeof response?.data === 'string') return response.data;

    return null;
};

const uploadApi = {
    /**
     * ============================================
     * UPLOAD ẢNH SẢN PHẨM (SINGLE)
     * ============================================
     * Endpoint: POST /api/upload/product
     * Quyền: ADMIN
     * 
     * @param {File} file - File ảnh cần upload
     * @returns {Promise<{url: string, originalName: string, size: number, contentType: string}>}
     */
    uploadProductImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file); // 'file' phải khớp với @RequestParam("file") ở BE

        console.log('📤 Uploading product image:', file.name);

        try {
            const response = await axiosInstance.post('/upload/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = unwrapResponse(response);
            console.log('✅ Upload success:', result);
            return result;
        } catch (error) {
            console.error('❌ Upload failed:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * ============================================
     * UPLOAD NHIỀU ẢNH SẢN PHẨM
     * ============================================
     * Endpoint: POST /api/upload/products
     * Quyền: ADMIN
     * 
     * @param {File[]} files - Mảng các file ảnh
     * @returns {Promise<Array<{url: string, originalName: string}>>}
     */
    uploadProductImages: async (files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        console.log('📤 Uploading', files.length, 'product images');

        try {
            const response = await axiosInstance.post('/upload/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = unwrapResponse(response);
            console.log('✅ Upload success:', result);
            return result;
        } catch (error) {
            console.error('❌ Upload failed:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * ============================================
     * UPLOAD ẢNH DANH MỤC
     * ============================================
     * Endpoint: POST /api/upload/category
     * Quyền: ADMIN
     * 
     * @param {File} file - File ảnh cần upload
     * @returns {Promise<{url: string, originalName: string, size: number, contentType: string}>}
     */
    uploadCategoryImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        console.log('📤 Uploading category image:', file.name);

        try {
            const response = await axiosInstance.post('/upload/category', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = unwrapResponse(response);
            console.log('✅ Upload success:', result);
            return result;
        } catch (error) {
            console.error('❌ Upload failed:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * ============================================
     * UPLOAD AVATAR NGƯỜI DÙNG
     * ============================================
     * Endpoint: POST /api/upload/user
     * Quyền: Đã đăng nhập
     * 
     * @param {File} file - File ảnh cần upload
     * @returns {Promise<{url: string, originalName: string, size: number, contentType: string}>}
     */
    uploadUserAvatar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        console.log('📤 Uploading user avatar:', file.name);

        try {
            const response = await axiosInstance.post('/upload/user', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = unwrapResponse(response);
            console.log('✅ Upload success:', result);
            return result;
        } catch (error) {
            console.error('❌ Upload failed:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * ============================================
     * XÓA ẢNH
     * ============================================
     * Endpoint: DELETE /api/upload?url=...
     * Quyền: ADMIN
     * 
     * @param {string} imageUrl - URL của ảnh cần xóa
     */
    deleteImage: async (imageUrl) => {
        console.log('🗑️ Deleting image:', imageUrl);

        try {
            const response = await axiosInstance.delete('/upload', {
                params: { url: imageUrl },
            });
            console.log('✅ Delete success');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Delete failed:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * ============================================
     * KIỂM TRA STORAGE INFO
     * ============================================
     * Endpoint: GET /api/upload/info
     * Quyền: Công khai
     * 
     * @returns {Promise<{mode: string, cloudinary: boolean, local: boolean}>}
     */
    getStorageInfo: async () => {
        const response = await axiosInstance.get('/upload/info');
        return unwrapResponse(response);
    },

    /**
     * ============================================
     * UPLOAD ẢNH THEO LOẠI (Helper)
     * ============================================
     * 
     * @param {File} file - File ảnh cần upload
     * @param {'product' | 'category' | 'user'} type - Loại ảnh
     * @returns {Promise<{url: string}>}
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
     * ============================================
     * TRÍCH XUẤT URL TỪ RESPONSE
     * ============================================
     * 
     * @param {any} response - Response từ upload API
     * @returns {string|null} - URL của ảnh hoặc null
     */
    extractUrl: extractUrlFromResponse,

    /**
     * ============================================
     * LẤY PREVIEW URL
     * ============================================
     * Xử lý cả URL đầy đủ và path tương đối
     * 
     * @param {string} imageUrl - URL hoặc path của ảnh
     * @returns {string} - URL đầy đủ để hiển thị
     */
    getPreviewUrl: (imageUrl) => {
        // Placeholder nếu không có URL
        if (!imageUrl) {
            return 'https://placehold.co/500x500/f3f4f6/9ca3af?text=No+Image';
        }

        // Nếu đã là URL đầy đủ (Cloudinary hoặc external)
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // Nếu là blob URL (preview tạm từ FileReader)
        if (imageUrl.startsWith('blob:')) {
            return imageUrl;
        }

        // Nếu là path tương đối, thêm base URL của backend
        let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        baseUrl = baseUrl.replace(/\/api$/, ''); // Bỏ /api suffix
        const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

        return `${baseUrl}${cleanPath}`;
    },

    /**
     * ============================================
     * VALIDATE FILE TRƯỚC KHI UPLOAD
     * ============================================
     * 
     * @param {File} file - File cần validate
     * @param {Object} options - Các tùy chọn validate
     * @returns {{valid: boolean, error: string|null}}
     */
    validateFile: (file, options = {}) => {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB mặc định
            acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        } = options;

        // Kiểm tra loại file
        if (!acceptedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Định dạng không hỗ trợ. Chấp nhận: ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
            };
        }

        // Kiểm tra kích thước
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
            return {
                valid: false,
                error: `File quá lớn. Tối đa ${maxSizeMB}MB`
            };
        }

        return { valid: true, error: null };
    },

    /**
     * ============================================
     * UPLOAD VỚI PROGRESS CALLBACK
     * ============================================
     * 
     * @param {File} file - File cần upload
     * @param {'product' | 'category' | 'user'} type - Loại upload
     * @param {Function} onProgress - Callback theo dõi progress (0-100)
     * @returns {Promise<{url: string}>}
     */
    uploadWithProgress: async (file, type = 'product', onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        // Xác định endpoint dựa theo type
        const endpoints = {
            product: '/upload/product',
            category: '/upload/category',
            user: '/upload/user'
        };
        const endpoint = endpoints[type] || endpoints.product;

        console.log('📤 Uploading with progress:', file.name);

        try {
            const response = await axiosInstance.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress?.(percent);
                    }
                }
            });

            const result = unwrapResponse(response);
            console.log('✅ Upload complete:', result);
            return result;
        } catch (error) {
            console.error('❌ Upload failed:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default uploadApi;

// Named exports cho tiện sử dụng
export const {
    uploadProductImage,
    uploadProductImages,
    uploadCategoryImage,
    uploadUserAvatar,
    uploadImage,
    deleteImage,
    getStorageInfo,
    getPreviewUrl,
    validateFile,
    uploadWithProgress
} = uploadApi;

import axios from 'axios';

/**
 * Axios Instance Configuration
 * 
 * Token Selection Logic:
 * - Admin routes (/admin/*): Sử dụng adminToken
 * - User routes: Sử dụng userToken
 * - Đảm bảo User/Admin session hoạt động độc lập
 */

// Token keys (phải match với authService.TOKEN_KEYS)
const TOKEN_KEYS = {
    USER: 'userToken',
    ADMIN: 'adminToken',
};

// Các routes yêu cầu admin token (ngoài /admin/*)
const ADMIN_REQUIRED_ROUTES = [
    '/upload/product',   // Upload ảnh sản phẩm
    '/upload/products',  // Upload nhiều ảnh sản phẩm
    '/upload/category',  // Upload ảnh danh mục
];

/**
 * Hàm lấy token phù hợp dựa vào URL
 * - Admin routes (/admin/*) và upload routes: Sử dụng adminToken
 * - User routes: Sử dụng userToken
 */
const getTokenForRequest = (url) => {
    // Kiểm tra xem URL có yêu cầu admin token không
    const requiresAdminToken =
        (url && url.includes('/admin')) ||
        ADMIN_REQUIRED_ROUTES.some(route => url?.includes(route));

    if (requiresAdminToken) {
        const adminToken = localStorage.getItem(TOKEN_KEYS.ADMIN);
        if (adminToken) {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔐 Using adminToken for:', url);
            }
            return adminToken;
        }
    }

    // Fallback: userToken hoặc token (tương thích ngược)
    return localStorage.getItem(TOKEN_KEYS.USER) || localStorage.getItem('token');
};

// Create axios instance
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // CHỈ set token nếu header Authorization CHƯA được set explicit
        // Điều này cho phép các function như updateProfileAdmin() tự set token riêng
        if (!config.headers.Authorization) {
            const token = getTokenForRequest(config.url);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } else {
            // Header đã được set explicit, log để debug
            if (process.env.NODE_ENV === 'development') {
                console.log('🔐 Using explicit Authorization header for:', config.url);
            }
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [${response.status}] ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        const { response, config } = error;

        if (response) {
            switch (response.status) {
                case 400:
                    console.error('Bad Request:', response.data);
                    if (response.data?.data) {
                        console.error('Validation details:', response.data.data);
                    }
                    break;

                case 401:
                    // Unauthorized - xóa token tương ứng
                    console.error('Unauthorized - Token expired or invalid');

                    // Xác định xóa token nào dựa vào URL
                    if (config?.url?.includes('/admin')) {
                        localStorage.removeItem(TOKEN_KEYS.ADMIN);
                    } else {
                        localStorage.removeItem(TOKEN_KEYS.USER);
                        localStorage.removeItem('token');
                    }
                    break;

                case 403:
                    console.error('Forbidden - No permission');
                    break;

                case 404:
                    console.error('Not Found:', config?.url);
                    break;

                case 422:
                    console.error('Unprocessable Entity:', response.data);
                    break;

                case 500:
                    console.error('Server Error');
                    break;

                default:
                    console.error(`Error: ${response.status}`);
            }
        } else if (error.request) {
            console.error('Network Error - Check connection');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

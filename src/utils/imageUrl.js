/**
 * Utility functions for image URL handling
 */

/**
 * Hỗ trợ tạo URL ảnh đầy đủ từ đường dẫn tương đối của backend
 * @param {string} path - Đường dẫn ảnh (ví dụ: /uploads/products/image.jpg)
 * @returns {string} - URL đầy đủ hoặc placeholder
 */
export const getImageUrl = (path) => {
    // Placeholder mặc định
    const PLACEHOLDER = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';

    // Handle null, undefined, empty string
    if (!path || path.trim() === '') return PLACEHOLDER;

    // Nếu đã là URL đầy đủ (http/https)
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Nếu là data URL (base64 hoặc SVG)
    if (path.startsWith('data:')) {
        return path;
    }

    // Lưu ý: blob URL dùng cho preview tạm thời
    if (path.startsWith('blob:')) {
        return path;
    }

    // Lấy Base URL từ env hoặc mặc định localhost:8080
    // Loại bỏ phần /api ở cuối nếu có
    let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    baseUrl = baseUrl.replace(/\/api$/, '');

    // Đảm bảo không bị lặp dấu /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};

/**
 * Kiểm tra xem URL ảnh có hợp lệ không
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean} - true nếu hợp lệ
 */
export const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;

    // Check for valid URL patterns
    const validPatterns = [
        /^https?:\/\/.+/i,
        /^blob:.+/,
        /^data:.+/,
        /^\/.+/  // Relative path
    ];

    return validPatterns.some(pattern => pattern.test(url));
};

/**
 * Tạo placeholder image với text tùy chỉnh
 * Sử dụng placehold.co (service miễn phí và ổn định)
 * @param {string} text - Text hiển thị trên placeholder
 * @param {number} width - Chiều rộng
 * @param {number} height - Chiều cao
 * @returns {string} - URL placeholder
 */
export const getPlaceholder = (text = 'No Image', width = 400, height = 400) => {
    return `https://placehold.co/${width}x${height}/f3f4f6/9ca3af?text=${encodeURIComponent(text)}`;
};

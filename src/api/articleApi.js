import axiosClient from './axiosConfig';

/**
 * Article API - Tin tuc / Blog
 * 
 * Public endpoints: /api/news
 * Admin endpoints: /api/admin/articles
 */
const articleApi = {
    // ========== PUBLIC API ==========

    /**
     * Lay danh sach bai viet da publish
     * @param {number} page - So trang (0-indexed)
     * @param {number} size - So bai moi trang
     * @param {string} q - Tu khoa tim kiem
     * @param {string} tag - Filter theo tag
     */
    getPublicArticles: (page = 0, size = 10, q = '', tag = '') => {
        let url = `/news?page=${page}&size=${size}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (tag) url += `&tag=${encodeURIComponent(tag)}`;
        return axiosClient.get(url);
    },

    /**
     * Lay chi tiet bai viet theo slug (public)
     */
    getBySlug: (slug) => {
        return axiosClient.get(`/news/${slug}`);
    },

    // Legacy - backward compatible
    getAll: () => {
        return axiosClient.get('/public/articles');
    },

    // ========== ADMIN API ==========

    /**
     * Lay danh sach tat ca bai viet (admin)
     * @param {number} page - So trang
     * @param {number} size - So bai moi trang
     * @param {string} status - Filter theo status: DRAFT, SCHEDULED, PUBLISHED, ARCHIVED
     * @param {string} q - Tu khoa tim kiem
     */
    getAdminArticles: (page = 0, size = 10, status = '', q = '') => {
        let url = `/admin/articles?page=${page}&size=${size}`;
        if (status) url += `&status=${status}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        return axiosClient.get(url);
    },

    /**
     * Lay chi tiet bai viet theo ID (admin)
     */
    getById: (id) => {
        return axiosClient.get(`/admin/articles/${id}`);
    },

    /**
     * Tao bai viet moi (mac dinh DRAFT)
     * @param {Object} data - { title, summary, content, thumbnail, tags, author }
     */
    create: (data) => {
        return axiosClient.post('/admin/articles', data);
    },

    /**
     * Cap nhat bai viet
     * @param {number} id - ID bai viet
     * @param {Object} data - { title, summary, content, thumbnail, tags, author, updateSlug }
     */
    update: (id, data) => {
        return axiosClient.put(`/admin/articles/${id}`, data);
    },

    /**
     * Xoa bai viet
     */
    delete: (id) => {
        return axiosClient.delete(`/admin/articles/${id}`);
    },

    /**
     * Thay doi trang thai bai viet
     * @param {number} id - ID bai viet
     * @param {Object} data - { status: 'DRAFT'|'SCHEDULED'|'PUBLISHED'|'ARCHIVED', scheduledAt?: string }
     */
    updateStatus: (id, data) => {
        return axiosClient.patch(`/admin/articles/${id}/status`, data);
    },

    /**
     * Publish ngay
     */
    publish: (id) => {
        return axiosClient.patch(`/admin/articles/${id}/status`, { status: 'PUBLISHED' });
    },

    /**
     * Dat lich dang bai
     * @param {string} scheduledAt - ISO datetime string
     */
    schedule: (id, scheduledAt) => {
        return axiosClient.patch(`/admin/articles/${id}/status`, { 
            status: 'SCHEDULED',
            scheduledAt: scheduledAt
        });
    },

    /**
     * Luu tru bai viet
     */
    archive: (id) => {
        return axiosClient.patch(`/admin/articles/${id}/status`, { status: 'ARCHIVED' });
    },

    /**
     * Chuyen ve Draft
     */
    toDraft: (id) => {
        return axiosClient.patch(`/admin/articles/${id}/status`, { status: 'DRAFT' });
    },

    // ========== AI GENERATE ==========

    /**
     * Tao bai viet bang AI
     * @param {Object} data - { topic, tone, keywords, length, callToAction, author }
     */
    generateWithAI: (data) => {
        return axiosClient.post('/admin/articles/ai-generate', data);
    },

    // ========== IMPORT FROM URL ==========

    /**
     * Import bai viet tu URL ben ngoai
     * Ho tro: VnExpress, Kenh14, Dantri, TuoiTre, 24h, va cac website khac
     * @param {Object} data - { url, defaultAuthor, defaultTags, customThumbnail }
     */
    importFromUrl: (data) => {
        return axiosClient.post('/admin/articles/import', data);
    }
};

export default articleApi;


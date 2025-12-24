import axiosInstance from './axiosConfig';

/**
 * ========================================
 * Cart API Service
 * ========================================
 * 
 * API Endpoints (Backend):
 * GET    /api/cart                : Lấy giỏ hàng của user
 * POST   /api/cart/add            : Thêm sản phẩm vào giỏ
 * PUT    /api/cart/items/{id}     : Cập nhật số lượng
 * DELETE /api/cart/items/{id}     : Xóa item khỏi giỏ
 * DELETE /api/cart/clear          : Xóa toàn bộ giỏ hàng
 */

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Helper để unwrap response từ backend
 */
const unwrapResponse = (response) => {
    if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
            return response.data.data;
        }
    }
    return response.data;
};

// ====================
// API FUNCTIONS
// ====================

const cartApi = {
    /**
     * Lấy giỏ hàng của user đang đăng nhập
     * Endpoint: GET /api/cart
     */
    getCart: async () => {
        console.log('🛒 Fetching cart...');
        try {
            const response = await axiosInstance.get('/cart');
            console.log('✅ Cart fetched');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Get cart error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Thêm sản phẩm vào giỏ hàng
     * Endpoint: POST /api/cart/add
     * 
     * @param {number} productId - ID sản phẩm
     * @param {number} quantity - Số lượng
     */
    addToCart: async (productId, quantity = 1) => {
        console.log(`🛒 Adding to cart: productId=${productId}, qty=${quantity}`);
        try {
            const response = await axiosInstance.post('/cart/add', {
                productId,
                quantity,
            });
            console.log('✅ Added to cart');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Add to cart error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Cập nhật số lượng item trong giỏ
     * Endpoint: PUT /api/cart/items/{itemId}
     */
    updateCartItem: async (itemId, quantity) => {
        console.log(`🛒 Updating cart item: itemId=${itemId}, qty=${quantity}`);
        try {
            const response = await axiosInstance.put(`/cart/items/${itemId}`, {
                quantity,
            });
            console.log('✅ Cart item updated');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Update cart item error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Xóa item khỏi giỏ hàng
     * Endpoint: DELETE /api/cart/items/{itemId}
     */
    removeFromCart: async (itemId) => {
        console.log(`🛒 Removing from cart: itemId=${itemId}`);
        try {
            const response = await axiosInstance.delete(`/cart/items/${itemId}`);
            console.log('✅ Removed from cart');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Remove from cart error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Xóa toàn bộ giỏ hàng
     * Endpoint: DELETE /api/cart/clear
     */
    clearCart: async () => {
        console.log('🛒 Clearing cart...');
        try {
            const response = await axiosInstance.delete('/cart/clear');
            console.log('✅ Cart cleared');
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Clear cart error:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    /**
     * Thêm nhiều sản phẩm cùng lúc vào giỏ hàng
     * Sử dụng khi sync từ localStorage trước checkout
     * 
     * @param {Array} items - [{ productId, quantity }]
     */
    addMultipleToCart: async (items) => {
        console.log('🛒 Syncing cart with server...', items.length, 'items');

        const results = [];
        let successCount = 0;
        let failCount = 0;

        // Add items one by one (backend chưa có endpoint sync bulk)
        for (const item of items) {
            try {
                const result = await cartApi.addToCart(item.productId, item.quantity);
                results.push({ productId: item.productId, success: true, data: result });
                successCount++;
            } catch (error) {
                console.warn(`⚠️ Failed to add product ${item.productId}`);
                results.push({ productId: item.productId, success: false, error });
                failCount++;
            }
        }

        console.log(`✅ Cart sync completed: ${successCount} success, ${failCount} failed`);

        // Return cart after syncing
        try {
            return await cartApi.getCart();
        } catch {
            return { items: results };
        }
    },

    /**
     * Đảm bảo giỏ hàng được sync với server trước khi checkout
     * 
     * @param {Array} localCart - Giỏ hàng từ localStorage [{ id, quantity, ... }]
     */
    ensureCartSynced: async (localCart) => {
        if (!localCart || localCart.length === 0) {
            console.log('⚠️ Local cart is empty, skipping sync');
            return null;
        }

        console.log('🔄 Syncing local cart to server...', localCart.length, 'items');

        // Transform local cart to items format
        const items = localCart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
        }));

        return await cartApi.addMultipleToCart(items);
    },
};

export default cartApi;

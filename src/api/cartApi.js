import axiosInstance from './axiosConfig';

/**
 * Cart API Service
 * 
 * API Endpoints:
 * GET    /api/cart                : Lấy giỏ hàng của user
 * POST   /api/cart/add            : Thêm sản phẩm vào giỏ
 * PUT    /api/cart/items/{id}     : Cập nhật số lượng
 * DELETE /api/cart/items/{id}     : Xóa item khỏi giỏ
 * DELETE /api/cart/clear          : Xóa toàn bộ giỏ hàng
 * POST   /api/cart/sync           : Sync giỏ hàng từ client
 */

/**
 * Helper để unwrap response từ backend
 */
const unwrapResponse = (response) => {
    console.log('Cart API Response:', response.data);

    if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
            return response.data.data;
        }
    }
    return response.data;
};

const cartApi = {
    /**
     * Lấy giỏ hàng của user đang đăng nhập
     * Endpoint: GET /api/cart
     */
    getCart: async () => {
        console.log('🛒 Fetching cart...');
        try {
            const response = await axiosInstance.get('/cart');
            console.log('✅ Cart fetched:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Get cart error:', error.response?.data);
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
            console.log('✅ Added to cart:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Add to cart error:', error.response?.data);
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
            console.log('✅ Cart item updated:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Update cart item error:', error.response?.data);
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
            console.log('✅ Removed from cart:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Remove from cart error:', error.response?.data);
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
            console.log('✅ Cart cleared:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Clear cart error:', error.response?.data);
            throw error;
        }
    },

    /**
     * Sync giỏ hàng từ localStorage lên server
     * Sử dụng khi user đăng nhập với giỏ hàng local
     * Endpoint: POST /api/cart/sync
     * 
     * @param {Array} items - Danh sách sản phẩm [{ productId, quantity }]
     */
    syncCart: async (items) => {
        console.log('🛒 Syncing cart:', items);
        try {
            const response = await axiosInstance.post('/cart/sync', { items });
            console.log('✅ Cart synced:', response.data);
            return unwrapResponse(response);
        } catch (error) {
            console.error('❌ Sync cart error:', error.response?.data);
            throw error;
        }
    },

    /**
     * Thêm nhiều sản phẩm cùng lúc vào giỏ hàng
     * Dùng để sync từ localStorage trước khi checkout
     * 
     * @param {Array} items - [{ productId, quantity }]
     */
    addMultipleToCart: async (items) => {
        console.log('🛒 Adding multiple items to cart:', items);

        // Try sync endpoint first
        try {
            const response = await axiosInstance.post('/cart/sync', { items });
            console.log('✅ Cart synced via /cart/sync');
            return unwrapResponse(response);
        } catch (syncError) {
            console.log('⚠️ /cart/sync failed, trying individual adds...');

            // Fallback: add items one by one
            for (const item of items) {
                try {
                    await cartApi.addToCart(item.productId, item.quantity);
                } catch (addError) {
                    console.error(`❌ Failed to add product ${item.productId}:`, addError);
                }
            }

            // Return the cart after adding
            return await cartApi.getCart();
        }
    },

    /**
     * Đảm bảo giỏ hàng được sync với server trước khi checkout
     * 
     * @param {Array} localCart - Giỏ hàng từ localStorage [{ id, quantity, ... }]
     */
    ensureCartSynced: async (localCart) => {
        if (!localCart || localCart.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        console.log('🔄 Ensuring cart is synced with server...');

        // Transform local cart to items format
        const items = localCart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
        }));

        return await cartApi.addMultipleToCart(items);
    },
};

export default cartApi;

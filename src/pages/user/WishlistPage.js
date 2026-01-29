import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import WishlistItem from '../../components/user/WishlistItem';
import {
    HeartIcon,
    ArrowLeftIcon,
    TrashIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';

/**
 * WishlistPage Component
 * 
 * Trang hiển thị danh sách sản phẩm yêu thích của người dùng
 * 
 * Features:
 * - Hiển thị grid sản phẩm yêu thích
 * - Xóa từng sản phẩm hoặc xóa tất cả
 * - Thêm sản phẩm vào giỏ hàng
 * - Empty state khi chưa có sản phẩm
 * - Responsive design
 */
const WishlistPage = () => {
    const { 
        state, 
        removeFromFavorites, 
        clearFavorites,
        addToCart,
        showNotification,
        favoritesCount 
    } = useApp();
    const { isAuthenticated } = useAuth();
    
    const { favorites } = state;

    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg"
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    /**
     * Xử lý xóa sản phẩm khỏi yêu thích
     */
    const handleRemoveItem = (productId) => {
        const product = favorites.find(item => item.id === productId);
        removeFromFavorites(productId);
        showNotification({
            type: 'info',
            message: `Đã xóa "${product?.name}" khỏi yêu thích`,
        });
    };

    /**
     * Xử lý xóa tất cả sản phẩm yêu thích
     */
    const handleClearAll = () => {
        if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?')) {
            clearFavorites();
            showNotification({
                type: 'info',
                message: 'Đã xóa tất cả sản phẩm yêu thích',
            });
        }
    };

    /**
     * Xử lý thêm tất cả vào giỏ hàng
     */
    const handleAddAllToCart = () => {
        const availableProducts = favorites.filter(item => item.stockQuantity !== 0);
        
        if (availableProducts.length === 0) {
            showNotification({
                type: 'warning',
                message: 'Không có sản phẩm nào còn hàng để thêm vào giỏ',
            });
            return;
        }

        availableProducts.forEach(product => {
            addToCart(product, 1);
        });

        showNotification({
            type: 'success',
            message: `Đã thêm ${availableProducts.length} sản phẩm vào giỏ hàng!`,
        });
    };

    // Empty state khi chưa có sản phẩm yêu thích
    if (favorites.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center max-w-md">
                    {/* Empty Icon */}
                    <div className="relative inline-block mb-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                            <HeartIcon className="h-16 w-16 text-rose-300" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <span className="text-2xl">💔</span>
                        </div>
                    </div>

                    {/* Message */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Danh sách yêu thích trống
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. 
                        Hãy khám phá và lưu những bông hoa đẹp nhất!
                    </p>

                    {/* CTA Button */}
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl text-white">
                                <HeartIcon className="h-6 w-6" />
                            </span>
                            Sản phẩm yêu thích
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {favoritesCount} sản phẩm trong danh sách yêu thích
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {/* Add All to Cart */}
                        <button
                            onClick={handleAddAllToCart}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                        >
                            <ShoppingBagIcon className="h-5 w-5" />
                            Thêm tất cả vào giỏ
                        </button>

                        {/* Clear All */}
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-500 rounded-lg transition-all duration-300 font-medium"
                        >
                            <TrashIcon className="h-5 w-5" />
                            Xóa tất cả
                        </button>
                    </div>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map((product) => (
                        <WishlistItem
                            key={product.id}
                            product={product}
                            onRemove={handleRemoveItem}
                        />
                    ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-12 text-center">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors font-medium"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;

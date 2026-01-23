import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Components
import Breadcrumb from '../../components/user/Breadcrumb';
import Loading from '../../components/common/Loading';
import LoginRequiredModal from '../../components/common/LoginRequiredModal';

// Product Detail Components
import { 
    ProductImageGallery,
    ProductMainInfo, 
    ProductPurchaseActions,
    ProductDetailTabs,
    RelatedProductsSection 
} from '../../components/user/product-detail';

// API & Context
import productApi from '../../api/productApi';
import reviewApi from '../../api/reviewApi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

/**
 * ========================================
 * Product Detail Page
 * ========================================
 * 
 * Trang chi tiết sản phẩm với cấu trúc modular:
 * - ProductImageGallery: Gallery ảnh sản phẩm
 * - ProductMainInfo: Thông tin chính (tên, giá, mô tả ngắn)
 * - ProductPurchaseActions: Nút mua hàng, yêu thích
 * - ProductDetailTabs: Tabs Mô tả / Đánh giá
 * - RelatedProductsSection: Sản phẩm liên quan
 */

const ProductDetailPage = () => {
    const { id } = useParams();
    
    // State
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Context
    const { addToCart, toggleFavorite, isFavorite, showNotification } = useApp();
    const { isAuthenticated } = useAuth();

    // ========== Effects ==========
    
    // Scroll to top and fetch data when product ID changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchProductData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ========== Data Fetching ==========

    const fetchProductData = async () => {
        setLoading(true);
        try {
            // Fetch product details
            const productData = await productApi.getById(id);
            setProduct(productData);

            // Parallel fetch: related products + review stats
            const [relatedData, statsData] = await Promise.all([
                fetchRelatedProducts(productData),
                fetchReviewStats(id)
            ]);

            setRelatedProducts(relatedData);
            setReviewStats(statsData);

        } catch (error) {
            console.error('Error fetching product:', error);
            setProduct(null);
            setRelatedProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (productData) => {
        if (!productData?.categoryId) return [];
        
        try {
            const related = await productApi.getByCategory(productData.categoryId, 0, 5);
            const products = related.content || related || [];
            // Exclude current product from related list
            return products.filter((p) => p.id !== productData.id);
        } catch (error) {
            console.error('Error fetching related products:', error);
            return [];
        }
    };

    const fetchReviewStats = async (productId) => {
        try {
            return await reviewApi.getProductStats(productId);
        } catch (error) {
            console.error('Error fetching review stats:', error);
            return { averageRating: 0, totalReviews: 0 };
        }
    };

    // ========== Event Handlers ==========

    const handleAddToCart = (product, quantity) => {
        // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        addToCart(product, quantity);
        showNotification({
            type: 'success',
            message: `Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`,
        });
    };

    const handleToggleFavorite = (product) => {
        const wasFavorite = isFavorite(product.id);
        toggleFavorite(product);
        showNotification({
            type: wasFavorite ? 'info' : 'success',
            message: wasFavorite
                ? `Đã xóa "${product.name}" khỏi yêu thích`
                : `Đã thêm "${product.name}" vào yêu thích!`,
        });
    };

    // ========== Render: Loading State ==========

    if (loading) {
        return <Loading fullScreen text="Đang tải sản phẩm..." />;
    }

    // ========== Render: Not Found State ==========

    if (!product) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-7xl mb-6">🌻</div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                        Không tìm thấy sản phẩm
                    </h2>
                    <p className="text-gray-500 mb-6 max-w-md">
                        Sản phẩm này có thể đã bị xóa hoặc không tồn tại. 
                        Hãy khám phá các sản phẩm khác của chúng tôi!
                    </p>
                    <Link 
                        to="/shop" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
                    >
                        Quay lại cửa hàng
                    </Link>
                </div>
            </div>
        );
    }

    // ========== Prepare Data ==========

    const imageSources = product.images?.length > 0 
        ? product.images 
        : [product.thumbnail];

    // ========== Render: Main Content ==========

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb
                        items={[
                            { label: 'Cửa hàng', path: '/shop' },
                            { label: product.categoryName || 'Sản phẩm', path: `/category/${product.categoryId}` },
                            { label: product.name },
                        ]}
                    />
                </div>
            </div>

            <div className="container-custom py-8">
                {/* ===== Product Overview Section ===== */}
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
                        
                        {/* Left: Image Gallery */}
                        <ProductImageGallery 
                            images={imageSources} 
                            productName={product.name} 
                        />

                        {/* Right: Product Info & Actions */}
                        <div className="space-y-6">
                            <ProductMainInfo 
                                product={product} 
                                reviewStats={reviewStats}
                            />
                            
                            <ProductPurchaseActions
                                product={product}
                                onAddToCart={handleAddToCart}
                                onToggleFavorite={handleToggleFavorite}
                                isFavorite={isFavorite(product.id)}
                            />
                        </div>
                    </div>
                </div>

                {/* ===== Product Details Tabs (Description / Reviews) ===== */}
                <div className="mb-10">
                    <ProductDetailTabs product={product} />
                </div>

                {/* ===== Related Products Section ===== */}
                <RelatedProductsSection
                    products={relatedProducts}
                    categoryId={product.categoryId}
                    categoryName={product.categoryName}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                />
            </div>

            {/* Login Required Modal */}
            <LoginRequiredModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng"
            />
        </div>
    );
};

export default ProductDetailPage;

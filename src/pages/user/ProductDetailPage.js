import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import ProductGrid from '../../components/user/ProductGrid';
import Loading from '../../components/common/Loading';
import productApi from '../../api/productApi';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/formatPrice';
import {
    HeartIcon,
    ShoppingBagIcon,
    MinusIcon,
    PlusIcon,
    TruckIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart, toggleFavorite, isFavorite } = useApp();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await productApi.getById(id);
            setProduct(data);

            // Fetch related products
            if (data.categoryId) {
                const related = await productApi.getByCategory(data.categoryId, 0, 5);
                setRelatedProducts((related.content || related || []).filter((p) => p.id !== data.id));
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            // Không sử dụng mock data - chỉ lấy từ API
            setProduct(null);
            setRelatedProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 99)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

    if (loading) {
        return <Loading fullScreen text="Đang tải sản phẩm..." />;
    }

    if (!product) {
        return (
            <div className="container-custom py-20 text-center">
                <div className="text-6xl mb-4">🌻</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-500 mb-6">Sản phẩm này có thể đã bị xóa hoặc không tồn tại</p>
                <Link to="/shop" className="btn-primary">
                    Quay lại cửa hàng
                </Link>
            </div>
        );
    }

    const images = product.images || [product.thumbnail];
    const discount = product.salePrice && product.price > product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <div className="bg-gray-50">
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
                {/* Product Detail */}
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
                        {/* Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-3">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-pink-500 shadow-md'
                                                : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="space-y-6">
                            {/* Category */}
                            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
                                {product.categoryName}
                            </span>

                            {/* Title */}
                            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                {product.salePrice && product.salePrice < product.price ? (
                                    <>
                                        <span className="text-3xl font-bold text-rose-600">
                                            {formatPrice(product.salePrice)}
                                        </span>
                                        <span className="text-xl text-gray-400 line-through">
                                            {formatPrice(product.price)}
                                        </span>
                                        <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                                            -{discount}%
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-bold text-rose-600">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>

                            {/* Stock */}
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : 'Hết hàng'}
                                </span>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Quantity */}
                                <div className="flex items-center border border-gray-300 rounded-full">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="p-3 hover:bg-gray-100 rounded-l-full transition-colors"
                                    >
                                        <MinusIcon className="h-5 w-5 text-gray-600" />
                                    </button>
                                    <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="p-3 hover:bg-gray-100 rounded-r-full transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity === 0}
                                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                                    Thêm vào giỏ hàng
                                </button>

                                {/* Favorite */}
                                <button
                                    onClick={() => toggleFavorite(product)}
                                    className={`p-3 rounded-full border-2 transition-all ${isFavorite(product.id)
                                        ? 'bg-pink-500 border-pink-500 text-white'
                                        : 'border-gray-300 text-gray-600 hover:border-pink-500 hover:text-pink-500'
                                        }`}
                                >
                                    {isFavorite(product.id) ? (
                                        <HeartSolidIcon className="h-6 w-6" />
                                    ) : (
                                        <HeartIcon className="h-6 w-6" />
                                    )}
                                </button>
                            </div>

                            {/* Services */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                <div className="text-center">
                                    <TruckIcon className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                                    <p className="text-xs text-gray-600">Giao hàng nhanh 2h</p>
                                </div>
                                <div className="text-center">
                                    <ShieldCheckIcon className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                                    <p className="text-xs text-gray-600">Đảm bảo chất lượng</p>
                                </div>
                                <div className="text-center">
                                    <ArrowPathIcon className="h-8 w-8 mx-auto text-pink-500 mb-2" />
                                    <p className="text-xs text-gray-600">Đổi trả miễn phí</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                            Sản phẩm liên quan
                        </h2>
                        <ProductGrid
                            products={relatedProducts}
                            columns={5}
                            onAddToCart={addToCart}
                            onToggleFavorite={toggleFavorite}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;

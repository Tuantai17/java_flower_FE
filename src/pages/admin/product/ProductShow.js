import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productApi from '../../../api/productApi';
import reviewApi, { REVIEW_STATUS, REVIEW_STATUS_LABELS, REVIEW_STATUS_COLORS } from '../../../api/reviewApi';
import { formatPrice } from '../../../utils/formatPrice';
import {
    ArrowLeftIcon,
    PencilIcon,
    StarIcon,
    TagIcon,
    CubeIcon,
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    CalendarIcon,
    PhotoIcon,
    TrashIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * ProductShow - Admin Product Detail Page
 * Hiển thị chi tiết sản phẩm và danh sách đánh giá
 */
const ProductShow = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Product state
    const [product, setProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(true);
    const [productError, setProductError] = useState('');

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewStats, setReviewStats] = useState(null);
    const [reviewPage, setReviewPage] = useState(0);
    const [reviewTotalPages, setReviewTotalPages] = useState(0);
    const [reviewFilter, setReviewFilter] = useState(''); // '', 'APPROVED', 'PENDING', 'REJECTED'

    // Reply state
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Fetch product detail
    const fetchProduct = useCallback(async () => {
        setProductLoading(true);
        setProductError('');
        try {
            console.log('🔄 Fetching product detail:', id);
            const data = await productApi.getById(id);
            console.log('✅ Product:', data);
            setProduct(data);
        } catch (err) {
            console.error('❌ Error fetching product:', err);
            setProductError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
        } finally {
            setProductLoading(false);
        }
    }, [id]);

    // Fetch product reviews
    const fetchReviews = useCallback(async () => {
        setReviewsLoading(true);
        try {
            console.log('🔄 Fetching product reviews:', id);
            // Use admin API to see all reviews (including pending)
            const params = {
                productId: id,
                page: reviewPage,
                size: 10,
            };
            if (reviewFilter) {
                params.status = reviewFilter;
            }
            const data = await reviewApi.adminGetAllReviews(params);
            console.log('✅ Reviews:', data);

            if (data?.content) {
                setReviews(data.content);
                setReviewTotalPages(data.totalPages || 1);
            } else if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (err) {
            console.error('❌ Error fetching reviews:', err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, [id, reviewPage, reviewFilter]);

    // Fetch review stats
    const fetchReviewStats = useCallback(async () => {
        try {
            const stats = await reviewApi.getProductStats(id);
            console.log('✅ Review stats:', stats);
            setReviewStats(stats);
        } catch (err) {
            console.error('❌ Error fetching review stats:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
        fetchReviewStats();
    }, [fetchProduct, fetchReviewStats]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Subscribe to WebSocket for realtime review updates
    useEffect(() => {
        // Import the WebSocket service dynamically to avoid circular deps
        import('../../../services/ticketWebSocketService').then(({ default: ticketWebSocketService }) => {
            const handleReviewUpdate = (payload) => {
                console.log('⭐ Realtime review update on product page:', payload);
                // Refresh reviews and stats when update received
                if (payload.type === 'PRODUCT_REVIEW_UPDATE' || 
                    payload.type === 'REVIEW_NEW' || 
                    payload.action === 'REPLY' ||
                    payload.action === 'NEW') {
                    fetchReviews();
                    fetchReviewStats();
                }
            };

            // Subscribe to product-specific reviews
            ticketWebSocketService.subscribeToProductReviews(id, handleReviewUpdate);
            
            // Also subscribe to admin review updates
            ticketWebSocketService.subscribeToAdminNotifications(null, null, null, handleReviewUpdate);

            return () => {
                ticketWebSocketService.unsubscribeFromProductReviews(id);
            };
        });
    }, [id, fetchReviews, fetchReviewStats]);

    // Handle approve review
    const handleApprove = async (reviewId) => {
        setActionLoading(reviewId);
        try {
            await reviewApi.adminUpdateStatus(reviewId, REVIEW_STATUS.APPROVED);
            fetchReviews();
            fetchReviewStats();
        } catch (err) {
            console.error('Error approving review:', err);
            alert(err.response?.data?.message || 'Không thể duyệt đánh giá');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle reject review
    const handleReject = async (reviewId) => {
        setActionLoading(reviewId);
        try {
            await reviewApi.adminUpdateStatus(reviewId, REVIEW_STATUS.REJECTED);
            fetchReviews();
            fetchReviewStats();
        } catch (err) {
            console.error('Error rejecting review:', err);
            alert(err.response?.data?.message || 'Không thể từ chối đánh giá');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle reply to review
    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return;

        setActionLoading(reviewId);
        try {
            await reviewApi.adminReplyReview(reviewId, replyText);
            setReplyingId(null);
            setReplyText('');
            fetchReviews();
        } catch (err) {
            console.error('Error replying to review:', err);
            alert(err.response?.data?.message || 'Không thể phản hồi đánh giá');
        } finally {
            setActionLoading(null);
        }
    };

    // Handle delete review
    const handleDelete = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

        setActionLoading(reviewId);
        try {
            await reviewApi.adminDeleteReview(reviewId);
            fetchReviews();
            fetchReviewStats();
        } catch (err) {
            console.error('Error deleting review:', err);
            alert(err.response?.data?.message || 'Không thể xóa đánh giá');
        } finally {
            setActionLoading(null);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render stars
    const renderStars = (rating, size = 'h-4 w-4') => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    star <= rating ? (
                        <StarIconSolid key={star} className={`${size} text-yellow-400`} />
                    ) : (
                        <StarIcon key={star} className={`${size} text-gray-300`} />
                    )
                ))}
            </div>
        );
    };

    // Loading state
    if (productLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <ArrowPathIcon className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (productError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{productError}</p>
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="btn-secondary"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Chi tiết sản phẩm
                        </h1>
                        <p className="text-gray-500 text-sm">
                            ID: #{product.id} • {product.slug}
                        </p>
                    </div>
                </div>
                <Link
                    to={`/admin/products/edit/${id}`}
                    className="btn-primary"
                >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Chỉnh sửa
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Product Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Basic Info */}
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <div className="flex gap-6">
                            {/* Thumbnail */}
                            <div className="w-48 h-48 flex-shrink-0">
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                                        <PhotoIcon className="h-16 w-16 text-gray-300" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    {product.name}
                                </h2>

                                {/* Status Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {product.active ? '✓ Hoạt động' : '✗ Đã ẩn'}
                                </span>

                                {/* Price */}
                                <div className="mt-4 flex items-center gap-4">
                                    {product.salePrice && product.salePrice > 0 ? (
                                        <>
                                            <span className="text-2xl font-bold text-pink-600">
                                                {formatPrice(product.salePrice)}
                                            </span>
                                            <span className="text-lg text-gray-400 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm rounded-full font-medium">
                                                -{Math.round((1 - product.salePrice / product.price) * 100)}%
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-800">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <TagIcon className="h-4 w-4 text-gray-400" />
                                        <span>{product.categoryName || 'Chưa phân loại'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CubeIcon className="h-4 w-4 text-gray-400" />
                                        <span>Tồn kho: <strong>{product.stockQuantity || 0}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <ShoppingCartIcon className="h-4 w-4 text-gray-400" />
                                        <span>Đã bán: <strong>{product.soldCount || 0}</strong></span>
                                    </div>
                                    {reviewStats && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <StarIcon className="h-4 w-4 text-yellow-400" />
                                            <span>
                                                <strong>{reviewStats.averageRating?.toFixed(1) || 0}</strong>
                                                ({reviewStats.totalReviews || 0} đánh giá)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả sản phẩm</h3>
                                <p className="text-gray-600 text-sm whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-pink-500" />
                                Đánh giá sản phẩm
                                {reviews.length > 0 && (
                                    <span className="text-sm font-normal text-gray-500">
                                        ({reviews.length} đánh giá)
                                    </span>
                                )}
                            </h3>

                            {/* Filter */}
                            <select
                                value={reviewFilter}
                                onChange={(e) => {
                                    setReviewFilter(e.target.value);
                                    setReviewPage(0);
                                }}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value={REVIEW_STATUS.PENDING}>Chờ duyệt</option>
                                <option value={REVIEW_STATUS.APPROVED}>Đã duyệt</option>
                                <option value={REVIEW_STATUS.REJECTED}>Bị từ chối</option>
                            </select>
                        </div>

                        {/* Reviews List */}
                        {reviewsLoading ? (
                            <div className="text-center py-8">
                                <ArrowPathIcon className="h-8 w-8 text-pink-500 animate-spin mx-auto" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>Chưa có đánh giá nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="border border-gray-100 rounded-xl p-4 hover:border-pink-100 transition-colors"
                                    >
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {(review.userFullName || review.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {review.userFullName || review.username || 'Khách hàng'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {formatDate(review.createdAt)}
                                                        {review.orderCode && (
                                                            <>
                                                                <span className="text-gray-300">|</span>
                                                                <span>Đơn hàng: {review.orderCode}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${REVIEW_STATUS_COLORS[review.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {REVIEW_STATUS_LABELS[review.status] || review.status}
                                                </span>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1">
                                                    {review.status === REVIEW_STATUS.PENDING && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(review.id)}
                                                                disabled={actionLoading === review.id}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Duyệt"
                                                            >
                                                                <CheckCircleIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(review.id)}
                                                                disabled={actionLoading === review.id}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Từ chối"
                                                            >
                                                                <XCircleIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setReplyingId(replyingId === review.id ? null : review.id)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Phản hồi"
                                                    >
                                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(review.id)}
                                                        disabled={actionLoading === review.id}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-2">
                                            {renderStars(review.rating, 'h-5 w-5')}
                                        </div>

                                        {/* Comment */}
                                        {review.comment && (
                                            <p className="text-gray-700 text-sm mb-3">
                                                {review.comment}
                                            </p>
                                        )}

                                        {/* Review Images */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2 mb-3">
                                                {review.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img}
                                                        alt={`Review ${idx + 1}`}
                                                        className="w-16 h-16 object-cover rounded-lg border"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Admin Reply */}
                                        {review.adminReply && (
                                            <div className="bg-pink-50 rounded-lg p-3 mt-3">
                                                <p className="text-xs font-medium text-pink-700 mb-1">
                                                    Phản hồi từ Shop ({formatDate(review.repliedAt)}):
                                                </p>
                                                <p className="text-sm text-gray-700">{review.adminReply}</p>
                                            </div>
                                        )}

                                        {/* Reply Form */}
                                        {replyingId === review.id && (
                                            <div className="mt-3 border-t pt-3">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Nhập phản hồi của bạn..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none"
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setReplyingId(null);
                                                            setReplyText('');
                                                        }}
                                                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        disabled={!replyText.trim() || actionLoading === review.id}
                                                        className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                                                    >
                                                        Gửi phản hồi
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Pagination */}
                                {reviewTotalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        <button
                                            onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                                            disabled={reviewPage === 0}
                                            className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-3 py-1.5 text-sm text-gray-600">
                                            Trang {reviewPage + 1} / {reviewTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setReviewPage(p => Math.min(reviewTotalPages - 1, p + 1))}
                                            disabled={reviewPage >= reviewTotalPages - 1}
                                            className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                    {/* Review Stats Card */}
                    {reviewStats && (
                        <div className="bg-white rounded-2xl shadow-soft p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <ChartBarIcon className="h-5 w-5 text-pink-500" />
                                Thống kê đánh giá
                            </h3>

                            {/* Average Rating */}
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-gray-800 mb-1">
                                    {reviewStats.averageRating?.toFixed(1) || '0.0'}
                                </div>
                                <div className="flex justify-center mb-1">
                                    {renderStars(Math.round(reviewStats.averageRating || 0), 'h-6 w-6')}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {reviewStats.totalReviews || 0} đánh giá
                                </p>
                            </div>

                            {/* Rating Distribution */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    // Support cả 2 format: ratingDistribution Map hoặc fiveStars/fourStars/...
                                    let count = 0;
                                    if (reviewStats.ratingDistribution) {
                                        count = reviewStats.ratingDistribution[star] || 0;
                                    } else {
                                        // Fallback to old format
                                        const starNames = { 1: 'oneStars', 2: 'twoStars', 3: 'threeStars', 4: 'fourStars', 5: 'fiveStars' };
                                        count = reviewStats[starNames[star]] || 0;
                                    }
                                    const percentage = reviewStats.totalReviews > 0
                                        ? (count / reviewStats.totalReviews * 100)
                                        : 0;

                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 w-6">{star}</span>
                                            <StarIconSolid className="h-4 w-4 text-yellow-400" />
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Thao tác nhanh
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to={`/admin/products/edit/${id}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors font-medium"
                            >
                                <PencilIcon className="h-5 w-5" />
                                Chỉnh sửa sản phẩm
                            </Link>

                            <Link
                                to="/admin/reviews"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                Quản lý tất cả đánh giá
                            </Link>
                        </div>
                    </div>

                    {/* Product Meta */}
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Thông tin khác
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ngày tạo</span>
                                <span className="text-gray-800">{formatDate(product.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cập nhật</span>
                                <span className="text-gray-800">{formatDate(product.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">SKU</span>
                                <span className="text-gray-800">{product.sku || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductShow;

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import reviewApi from '../../api/reviewApi';
import StarRating from '../common/StarRating';
import ticketWebSocketService from '../../services/ticketWebSocketService';

/**
 * ========================================
 * Review List Component
 * ========================================
 * 
 * Hiển thị danh sách đánh giá của sản phẩm
 * Bao gồm: avatar, rating, comment, images, admin reply
 * Hỗ trợ realtime updates qua WebSocket
 */

const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 5,
        totalPages: 0,
        totalElements: 0,
    });

    // Fetch reviews - wrapped in useCallback for WebSocket handler
    const fetchReviews = useCallback(async () => {
        if (!productId) return;

        try {
            setLoading(true);
            const data = await reviewApi.getProductReviews(
                productId,
                pagination.page,
                pagination.size
            );

            // Handle paginated response
            if (data?.content) {
                setReviews(data.content);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.totalPages,
                    totalElements: data.totalElements,
                }));
            } else if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (err) {
            setError('Không thể tải đánh giá');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [productId, pagination.page, pagination.size]);

    // Fetch reviews on mount and pagination change
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Subscribe to WebSocket for realtime review updates
    useEffect(() => {
        if (!productId) return;

        const handleReviewUpdate = (payload) => {
            console.log('⭐ Realtime product review update:', payload);
            
            // Update review in place if it's a reply
            if (payload.action === 'REPLY' && payload.review) {
                setReviews(prev => prev.map(r => 
                    r.id === payload.review.id ? payload.review : r
                ));
            }
            // Refresh list for new reviews
            else if (payload.action === 'NEW') {
                fetchReviews();
            }
        };

        // Subscribe to product reviews
        ticketWebSocketService.subscribeToProductReviews(productId, handleReviewUpdate);

        // Cleanup on unmount
        return () => {
            ticketWebSocketService.unsubscribeFromProductReviews(productId);
        };
    }, [productId, fetchReviews]);

    // Change page
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    if (loading) {
        return <ReviewListLoading />;
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                {error}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có đánh giá nào</p>
                <p className="text-sm text-gray-400 mt-1">
                    Hãy mua và đánh giá sản phẩm này nhé!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Reviews */}
            {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 0}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>

                    <span className="text-sm text-gray-600">
                        Trang {pagination.page + 1} / {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * Single Review Item
 */
const ReviewItem = ({ review }) => {
    const [showAllImages, setShowAllImages] = useState(false);

    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: vi,
            });
        } catch {
            return dateString;
        }
    };

    const images = review.imageUrls || review.images || [];
    const displayImages = showAllImages ? images : images.slice(0, 3);

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
            {/* Header: User info + Rating */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.userName?.charAt(0)?.toUpperCase() || review.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div>
                        <p className="font-medium text-gray-800">
                            {review.userName || review.user?.username || 'Khách hàng'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatDate(review.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Rating */}
                <StarRating rating={review.rating} size="sm" />
            </div>

            {/* Comment */}
            {review.comment && (
                <p className="text-gray-700 mb-3 leading-relaxed">
                    {review.comment}
                </p>
            )}

            {/* Images */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {displayImages.map((img, idx) => (
                        <div
                            key={idx}
                            className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                        >
                            <img
                                src={img}
                                alt={`Review ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(img, '_blank')}
                            />
                        </div>
                    ))}
                    {images.length > 3 && !showAllImages && (
                        <button
                            onClick={() => setShowAllImages(true)}
                            className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                        >
                            <span className="text-sm font-medium">
                                +{images.length - 3}
                            </span>
                        </button>
                    )}
                </div>
            )}

            {/* Admin Reply */}
            {review.adminReply && (
                <div className="mt-4 bg-rose-50 rounded-lg p-4 border-l-4 border-rose-400">
                    <p className="text-sm font-semibold text-rose-700 mb-1">
                        Phản hồi từ FlowerCorner:
                    </p>
                    <p className="text-sm text-gray-700">
                        {review.adminReply}
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * Loading State
 */
const ReviewListLoading = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
        ))}
    </div>
);

export default ReviewList;

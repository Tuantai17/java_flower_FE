import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleLeftIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import reviewApi, {
    REVIEW_STATUS,
    REVIEW_STATUS_LABELS,
    REVIEW_STATUS_COLORS,
} from '../../../api/reviewApi';

/**
 * ========================================
 * Admin Review List Page
 * ========================================
 * 
 * Trang quản lý đánh giá cho Admin
 * - Xem tất cả reviews
 * - Filter theo status
 * - Duyệt/Từ chối review
 * - Phản hồi review
 */

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 0,
        size: 10,
    });
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
    });

    // Fetch reviews
    useEffect(() => {
        fetchReviews();
    }, [filters.status, filters.page]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = {
                page: filters.page,
                size: filters.size,
            };
            if (filters.status) params.status = filters.status;

            const data = await reviewApi.adminGetAllReviews(params);

            if (data?.content) {
                setReviews(data.content);
                setPagination({
                    totalPages: data.totalPages,
                    totalElements: data.totalElements,
                });
            } else if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle status update
    const handleUpdateStatus = async (reviewId, status) => {
        try {
            await reviewApi.adminUpdateStatus(reviewId, status);
            fetchReviews();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Handle delete
    const handleDelete = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

        try {
            await reviewApi.adminDeleteReview(reviewId);
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    // Open reply modal
    const openReplyModal = (review) => {
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h1>
                <p className="text-gray-500 mt-1">Duyệt và phản hồi đánh giá của khách hàng</p>
            </div>

            {/* Stats Cards */}
            <StatsCards reviews={reviews} />

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm đánh giá..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 0 }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value={REVIEW_STATUS.PENDING}>Chờ duyệt</option>
                        <option value={REVIEW_STATUS.APPROVED}>Đã duyệt</option>
                        <option value={REVIEW_STATUS.REJECTED}>Bị từ chối</option>
                    </select>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <LoadingState />
                ) : reviews.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Đánh giá
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <ReviewRow
                                        key={review.id}
                                        review={review}
                                        onApprove={() => handleUpdateStatus(review.id, REVIEW_STATUS.APPROVED)}
                                        onReject={() => handleUpdateStatus(review.id, REVIEW_STATUS.REJECTED)}
                                        onReply={() => openReplyModal(review)}
                                        onDelete={() => handleDelete(review.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Tổng: {pagination.totalElements} đánh giá
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={filters.page === 0}
                                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <span className="px-4 py-2 text-gray-600">
                                {filters.page + 1} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={filters.page >= pagination.totalPages - 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            {replyModalOpen && selectedReview && (
                <ReplyModal
                    review={selectedReview}
                    onClose={() => {
                        setReplyModalOpen(false);
                        setSelectedReview(null);
                    }}
                    onSuccess={fetchReviews}
                />
            )}
        </div>
    );
};

/**
 * Stats Cards
 */
const StatsCards = ({ reviews }) => {
    const pending = reviews.filter(r => r.status === REVIEW_STATUS.PENDING).length;
    const approved = reviews.filter(r => r.status === REVIEW_STATUS.APPROVED).length;
    const rejected = reviews.filter(r => r.status === REVIEW_STATUS.REJECTED).length;

    const cards = [
        { label: 'Chờ duyệt', value: pending, color: 'bg-yellow-500', icon: StarIcon },
        { label: 'Đã duyệt', value: approved, color: 'bg-green-500', icon: CheckCircleIcon },
        { label: 'Bị từ chối', value: rejected, color: 'bg-red-500', icon: XCircleIcon },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className={`p-3 rounded-lg ${card.color}`}>
                        <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                        <p className="text-sm text-gray-500">{card.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Review Row
 */
const ReviewRow = ({ review, onApprove, onReject, onReply, onDelete }) => {
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            {/* Customer */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                        {review.userName || 'Khách hàng'}
                    </span>
                </div>
            </td>

            {/* Product */}
            <td className="px-6 py-4">
                <p className="text-sm text-gray-800 line-clamp-1 max-w-[200px]">
                    {review.productName || `Sản phẩm #${review.productId}`}
                </p>
            </td>

            {/* Rating & Comment */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarSolid
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 max-w-[250px]">
                    {review.comment}
                </p>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${REVIEW_STATUS_COLORS[review.status] || 'bg-gray-100 text-gray-700'
                    }`}>
                    {REVIEW_STATUS_LABELS[review.status] || review.status}
                </span>
            </td>

            {/* Date */}
            <td className="px-6 py-4">
                <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                    {review.status === REVIEW_STATUS.PENDING && (
                        <>
                            <button
                                onClick={onApprove}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Duyệt"
                            >
                                <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onReject}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Từ chối"
                            >
                                <XCircleIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={onReply}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Phản hồi"
                    >
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

/**
 * Reply Modal
 */
const ReplyModal = ({ review, onClose, onSuccess }) => {
    const [reply, setReply] = useState(review.adminReply || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        try {
            setLoading(true);
            await reviewApi.adminReplyReview(review.id, reply.trim());
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error replying:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Phản hồi đánh giá
                </h3>

                {/* Original Review */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-800">
                            {review.userName}
                        </span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarSolid
                                    key={star}
                                    className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Nhập phản hồi của bạn..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none mb-4"
                    />

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reply.trim()}
                            className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Loading State
 */
const LoadingState = () => (
    <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Đang tải đánh giá...</p>
    </div>
);

/**
 * Empty State
 */
const EmptyState = () => (
    <div className="p-12 text-center">
        <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Chưa có đánh giá nào</p>
    </div>
);

export default ReviewList;

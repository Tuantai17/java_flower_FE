import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { calculateRatingPercentage } from '../../api/reviewApi';

/**
 * ========================================
 * Review Stats Component
 * ========================================
 * 
 * Hiển thị thống kê đánh giá:
 * - Điểm trung bình
 * - Tổng số đánh giá
 * - Biểu đồ phân bố theo sao
 */

const ReviewStats = ({ stats, loading = false }) => {
    if (loading) {
        return <ReviewStatsLoading />;
    }

    if (!stats || stats.totalReviews === 0) {
        return <ReviewStatsEmpty />;
    }

    const percentages = calculateRatingPercentage(stats);

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Đánh giá của khách hàng
            </h3>

            <div className="flex gap-8">
                {/* Left: Average Rating */}
                <div className="text-center">
                    <div className="text-5xl font-bold text-gray-800">
                        {stats.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`h-5 w-5 ${star <= Math.round(stats.averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500">
                        {stats.totalReviews} đánh giá
                    </div>
                </div>

                {/* Right: Rating Distribution */}
                <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <RatingBar
                            key={star}
                            star={star}
                            percentage={percentages[star]}
                            count={stats[getStarKey(star)] || 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Rating Bar - Thanh hiển thị phần trăm mỗi mức sao
 */
const RatingBar = ({ star, percentage, count }) => {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-8">{star} ★</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm text-gray-500 w-12 text-right">
                {percentage}%
            </span>
        </div>
    );
};

/**
 * Empty State
 */
const ReviewStatsEmpty = () => (
    <div className="bg-gray-50 rounded-xl p-6 text-center">
        <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
            Chưa có đánh giá nào cho sản phẩm này
        </p>
        <p className="text-gray-400 text-xs mt-1">
            Hãy là người đầu tiên đánh giá!
        </p>
    </div>
);

/**
 * Loading State
 */
const ReviewStatsLoading = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex gap-8">
            <div className="text-center">
                <div className="h-12 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
            <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Helper: Lấy key của stats theo số sao
 */
const getStarKey = (star) => {
    const keys = {
        5: 'fiveStars',
        4: 'fourStars',
        3: 'threeStars',
        2: 'twoStars',
        1: 'oneStars',
    };
    return keys[star];
};

export default ReviewStats;

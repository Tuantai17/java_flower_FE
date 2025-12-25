import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

/**
 * ========================================
 * Star Rating Component
 * ========================================
 * 
 * Reusable component để hiển thị và chọn rating
 * 
 * Props:
 * - rating: Số sao hiện tại (0-5)
 * - onChange: Callback khi user chọn sao (optional - nếu editable)
 * - size: Kích thước icon ('sm' | 'md' | 'lg')
 * - showText: Hiển thị text mô tả không
 * - editable: Cho phép click để chọn sao không
 */

const SIZES = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
};

const RATING_TEXT = {
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Tuyệt vời',
};

const StarRating = ({
    rating = 0,
    onChange,
    size = 'md',
    showText = false,
    editable = false,
    className = '',
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);
    const sizeClass = SIZES[size] || SIZES.md;

    const displayRating = hoverRating || rating;

    const handleClick = (value) => {
        if (editable && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (editable) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (editable) {
            setHoverRating(0);
        }
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayRating;

                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => handleMouseEnter(star)}
                            onMouseLeave={handleMouseLeave}
                            disabled={!editable}
                            className={`focus:outline-none transition-transform ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                                }`}
                        >
                            {isFilled ? (
                                <StarSolid className={`${sizeClass} text-yellow-400`} />
                            ) : (
                                <StarOutline className={`${sizeClass} text-gray-300`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {showText && displayRating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                    {RATING_TEXT[Math.round(displayRating)]}
                </span>
            )}
        </div>
    );
};

/**
 * Star Rating Display - Hiển thị rating với số điểm
 */
export const StarRatingDisplay = ({ rating, reviewCount, size = 'sm' }) => {
    return (
        <div className="flex items-center gap-2">
            <StarRating rating={rating} size={size} />
            <span className="text-sm text-gray-600">
                {rating?.toFixed(1) || '0.0'}
                {reviewCount !== undefined && (
                    <span className="text-gray-400 ml-1">({reviewCount} đánh giá)</span>
                )}
            </span>
        </div>
    );
};

/**
 * Star Rating Input - Form input cho rating
 */
export const StarRatingInput = ({ value, onChange, error }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <StarRating
                rating={value}
                onChange={onChange}
                size="xl"
                showText
                editable
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default StarRating;

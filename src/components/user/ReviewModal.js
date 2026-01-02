import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarRatingInput } from '../common/StarRating';
import reviewApi from '../../api/reviewApi';
import uploadApi from '../../api/uploadApi';

/**
 * ========================================
 * Review Modal Component
 * ========================================
 * 
 * Modal để user submit đánh giá sản phẩm
 * Bao gồm: Star rating, comment, upload images
 */

const ReviewModal = ({
    isOpen,
    onClose,
    product,
    orderId,
    onSuccess,
}) => {
    const [formData, setFormData] = useState({
        rating: 0,
        comment: '',
        imageUrls: [],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ rating: 0, comment: '', imageUrls: [] });
            setErrors({});
        }
    }, [isOpen]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.rating || formData.rating < 1) {
            newErrors.rating = 'Vui lòng chọn số sao đánh giá';
        }

        if (!formData.comment?.trim()) {
            newErrors.comment = 'Vui lòng nhập nội dung đánh giá';
        } else if (formData.comment.trim().length < 10) {
            newErrors.comment = 'Nội dung đánh giá phải có ít nhất 10 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Max 5 images
        if (formData.imageUrls.length + files.length > 5) {
            setErrors(prev => ({
                ...prev,
                images: 'Tối đa 5 ảnh cho mỗi đánh giá',
            }));
            return;
        }

        try {
            setUploadingImage(true);

            // Upload each image
            const uploadPromises = files.map(file => uploadApi.uploadImage(file));
            const results = await Promise.all(uploadPromises);

            // Extract URLs
            const newUrls = results.map(result => result.url || result.data?.url || result);

            setFormData(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...newUrls],
            }));

            setErrors(prev => ({ ...prev, images: null }));
        } catch (error) {
            console.error('Upload error:', error);
            setErrors(prev => ({
                ...prev,
                images: 'Không thể upload ảnh. Vui lòng thử lại.',
            }));
        } finally {
            setUploadingImage(false);
        }
    };

    // Remove image
    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }));
    };

    // Submit review
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const reviewData = {
                productId: product.id,
                orderId: orderId,
                rating: formData.rating,
                comment: formData.comment.trim(),
                images: formData.imageUrls, // Backend expects 'images' field, not 'imageUrls'
            };

            await reviewApi.createReview(reviewData);

            // Success
            onSuccess?.();
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể gửi đánh giá';
            setErrors(prev => ({ ...prev, submit: message }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto animate-fade-in">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        Đánh giá sản phẩm
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <img
                            src={product?.imageUrl || product?.image || '/placeholder-product.jpg'}
                            alt={product?.name}
                            className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                            <p className="font-medium text-gray-800 line-clamp-2">
                                {product?.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rating */}
                    <StarRatingInput
                        value={formData.rating}
                        onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                        error={errors.rating}
                    />

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung đánh giá <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none ${errors.comment ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                        {errors.comment && (
                            <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh (tối đa 5 ảnh)
                        </label>

                        <div className="flex flex-wrap gap-3">
                            {/* Uploaded Images */}
                            {formData.imageUrls.map((url, index) => (
                                <div
                                    key={index}
                                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group"
                                >
                                    <img
                                        src={url}
                                        alt={`Review ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <TrashIcon className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            {formData.imageUrls.length < 5 && (
                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage ? (
                                        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                                            <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>

                        {errors.images && (
                            <p className="mt-2 text-sm text-red-500">{errors.images}</p>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang gửi...
                                </span>
                            ) : (
                                'Gửi đánh giá'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;

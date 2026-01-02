import React, { useState } from 'react';
import { getImageUrl } from '../../../utils/imageUrl';

/**
 * ========================================
 * Product Image Gallery Component
 * ========================================
 * 
 * Hiển thị ảnh sản phẩm với:
 * - Ảnh chính lớn
 * - Thumbnails có thể click để chọn
 * - Hiệu ứng zoom khi hover (optional)
 */

const ProductImageGallery = ({ images = [], productName = '' }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Xử lý danh sách ảnh, đảm bảo có ít nhất 1 ảnh
    const processedImages = images.length > 0 
        ? images.map(img => getImageUrl(img))
        : [getImageUrl(null)];

    const mainImage = processedImages[selectedIndex] || processedImages[0];

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 group relative">
                <img
                    src={mainImage}
                    alt={productName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Image counter badge */}
                {processedImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                        {selectedIndex + 1} / {processedImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {processedImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {processedImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`
                                flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 
                                transition-all duration-200 hover:opacity-100
                                ${selectedIndex === index 
                                    ? 'border-pink-500 shadow-lg shadow-pink-500/20 opacity-100' 
                                    : 'border-transparent opacity-70 hover:border-gray-300'
                                }
                            `}
                        >
                            <img 
                                src={img} 
                                alt={`${productName} - ${index + 1}`} 
                                className="w-full h-full object-cover" 
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;

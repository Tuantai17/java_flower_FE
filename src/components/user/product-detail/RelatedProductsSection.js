import React from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../ProductGrid';
import { SparklesIcon } from '@heroicons/react/24/outline';

/**
 * ========================================
 * Related Products Section Component
 * ========================================
 * 
 * Hiển thị danh sách sản phẩm liên quan
 * với tiêu đề và link xem thêm
 */

const RelatedProductsSection = ({ 
    products = [], 
    categoryId,
    categoryName,
    onAddToCart, 
    onToggleFavorite 
}) => {
    // Không hiển thị nếu không có sản phẩm liên quan
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-gray-900">
                            Sản phẩm liên quan
                        </h2>
                        {categoryName && (
                            <p className="text-sm text-gray-500">
                                Cùng danh mục {categoryName}
                            </p>
                        )}
                    </div>
                </div>

                {/* View All Link */}
                {categoryId && (
                    <Link 
                        to={`/category/${categoryId}`}
                        className="hidden sm:flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-medium text-sm group"
                    >
                        Xem tất cả
                        <svg 
                            className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Products Grid */}
            <ProductGrid
                products={products}
                columns={5}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
            />

            {/* Mobile View All Button */}
            {categoryId && (
                <div className="sm:hidden mt-6 text-center">
                    <Link 
                        to={`/category/${categoryId}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-50 text-pink-600 rounded-full font-medium hover:bg-pink-100 transition-colors"
                    >
                        Xem thêm sản phẩm
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}
        </section>
    );
};

export default RelatedProductsSection;

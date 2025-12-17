import React from 'react';
import ProductCard from './ProductCard';
import { SkeletonCard } from '../common/Loading';

const ProductGrid = ({
    products,
    loading = false,
    columns = 5,
    onAddToCart,
    onToggleFavorite,
    favorites = [],
    emptyMessage = 'Không có sản phẩm nào'
}) => {
    const gridClasses = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    };

    if (loading) {
        return (
            <div className={`grid ${gridClasses[columns]} gap-4 md:gap-6`}>
                {Array.from({ length: columns * 2 }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🌻</div>
                <p className="text-gray-500 text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridClasses[columns]} gap-4 md:gap-6`}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={favorites.includes(product.id)}
                />
            ))}
        </div>
    );
};

export default ProductGrid;

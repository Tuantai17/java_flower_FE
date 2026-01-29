import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { SkeletonCard } from '../common/Loading';
import productApi from '../../api/productApi';

const FeaturedProducts = ({
    title = 'BÓ HOA TƯƠI ĐẸP',
    subtitle = 'Những bó hoa được yêu thích nhất',
    limit = 10,
    showViewMore = true
}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productApi.getSale(limit);
                setProducts(data.content || data || []);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                // Không sử dụng mock data - chỉ lấy từ API
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [limit]);

    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="section-title relative inline-block">
                        <span className="relative z-10">{title}</span>
                        <span className="absolute -bottom-2 left-0 right-0 h-3 bg-pink-200/50 -z-0 transform -rotate-1" />
                    </h2>
                    {subtitle && (
                        <p className="section-subtitle mt-4">{subtitle}</p>
                    )}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}


            </div>
        </section>
    );
};

export default FeaturedProducts;

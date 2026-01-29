import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { SkeletonCard } from '../common/Loading';
import productApi from '../../api/productApi';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const FeaturedProducts = ({
    title = 'BÓ HOA TƯƠI ĐẸP',
    subtitle = 'Những bó hoa được yêu thích nhất',
    limit = 10,
    showViewMore = true
}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productApi.getSale(limit);
                setProducts(data.content || data || []);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [limit]);

    // Handle scroll state
    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            return () => container.removeEventListener('scroll', checkScrollButtons);
        }
    }, [products]);

    // Scroll functions
    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

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

                {/* Products Carousel Container */}
                <div 
                    className="relative"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {/* Left Arrow */}
                    {canScrollLeft && (
                        <button
                            onClick={handleScrollLeft}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 -ml-4 transition-all duration-300 hover:scale-110 ${
                                isHovering ? 'opacity-100' : 'opacity-0'
                            }`}
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon className="h-6 w-6 text-rose-500" />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            onClick={handleScrollRight}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 -mr-4 transition-all duration-300 hover:scale-110 ${
                                isHovering ? 'opacity-100' : 'opacity-0'
                            }`}
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon className="h-6 w-6 text-rose-500" />
                        </button>
                    )}

                    {/* Products Scrollable Container */}
                    {loading ? (
                        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-[200px] md:w-[240px]">
                                    <SkeletonCard />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {products.map((product) => (
                                <div key={product.id} className="flex-shrink-0 w-[200px] md:w-[240px]">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Scroll Indicator */}
                <div className="flex justify-center mt-4 gap-1 md:hidden">
                    <span className="text-xs text-gray-400">← Vuốt để xem thêm →</span>
                </div>

                {/* View All Button */}
                {showViewMore && (
                    <div className="text-center mt-8">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Xem tất cả sản phẩm
                            <ArrowRightIcon className="h-5 w-5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Custom CSS for hiding scrollbar */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default FeaturedProducts;



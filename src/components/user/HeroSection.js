import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getActiveBanners } from '../../api/bannerApi';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * HeroSection Component - Fully Clickable Banner
 * Features:
 * - Fixed aspect ratio for consistent sizing
 * - ENTIRE banner is clickable (clicks anywhere → navigate)
 * - Smooth slide transitions with fade effect
 * - Auto-rotation every 5 seconds
 * - Manual navigation
 */
const HeroSection = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [fadeIn, setFadeIn] = useState(true);

    // Fetch banners from API
    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await getActiveBanners();
            if (response.success && response.data.length > 0) {
                setBanners(response.data);
                setError(null);
            } else {
                // If no banners, use default
                setBanners(getDefaultBanner());
            }
        } catch (err) {
            console.error('Error fetching banners:', err);
            setError('Không thể tải banner');
            // Use default banner on error
            setBanners(getDefaultBanner());
        } finally {
            setLoading(false);
        }
    };

    // Default banner if API fails or no banners exist
    const getDefaultBanner = () => [{
        id: 'default',
        title: 'HOA CƯỚI CẦM TAY',
        subtitle: 'Bộ Sưu Tập Mới',
        description: 'FREESHIP & Tặng hoa cài áo cho chú rể. Thiết kế độc quyền, sang trọng cho ngày trọng đại.',
        imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1600&q=80',
        linkUrl: '/shop',
        buttonText: 'Xem Ngay',
        sortOrder: 0,
        active: true
    }];

    // Auto-rotation with fade effect (5.5s interval)
    useEffect(() => {
        if (!isAutoPlaying || banners.length <= 1) return;

        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
                setFadeIn(true);
            }, 300);
        }, 5500);

        return () => clearInterval(interval);
    }, [isAutoPlaying, banners.length]);

    // Navigation functions with fade
    const goToNext = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
            setFadeIn(true);
        }, 300);
    }, [banners.length]);

    const goToPrevious = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
            setFadeIn(true);
        }, 300);
    }, [banners.length]);

    const goToSlide = useCallback((index) => {
        setFadeIn(false);
        setTimeout(() => {
            setCurrentIndex(index);
            setFadeIn(true);
        }, 300);
    }, []);

    if (!banners.length) {
        return null;
    }

    const currentBanner = banners[currentIndex];

    // Banner wrapper component
    const BannerWrapper = ({ children, linkUrl }) => {
        if (linkUrl) {
            return (
                <Link
                    to={linkUrl}
                    className="block relative w-full cursor-pointer group"
                    onClick={() => console.log('Banner clicked, navigating to:', linkUrl)}
                >
                    {children}
                </Link>
            );
        }
        return <div className="relative w-full">{children}</div>;
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white">
            {/* Inline CSS for smooth transitions */}
            <style>{`
                @keyframes bannerFadeSlide {
                    from {
                        opacity: 0;
                        transform: scale(1.02);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .banner-transition {
                    animation: bannerFadeSlide 0.6s ease-out;
                }
            `}</style>

            {/* Banner Container - Full Width, Fixed Height */}
            <div className="relative w-full">
                <BannerWrapper linkUrl={currentBanner.linkUrl}>
                    {/* Fixed height container for consistency */}
                    <div 
                        className={`relative w-full overflow-hidden ${fadeIn ? 'banner-transition' : ''}`}
                        style={{
                            height: '400px', // Fixed height for all banners
                            transition: 'opacity 0.3s ease-in-out',
                            opacity: fadeIn ? 1 : 0,
                        }}
                    >
                        {/* Banner Image - Full width, cover to fill container */}
                        <img
                            key={currentIndex}
                            src={currentBanner.imageUrl}
                            alt={currentBanner.title || 'Banner'}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1600&q=80';
                            }}
                        />

                        {/* Hover effect overlay */}
                        {currentBanner.linkUrl && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        )}
                    </div>
                </BannerWrapper>

                {/* Navigation Controls */}
                {banners.length > 1 && (
                    <>
                        {/* Arrow Navigation */}
                        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    goToPrevious();
                                }}
                                className="pointer-events-auto p-3 md:p-4 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 backdrop-blur-sm"
                                aria-label="Previous banner"
                            >
                                <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    goToNext();
                                }}
                                className="pointer-events-auto p-3 md:p-4 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 backdrop-blur-sm"
                                aria-label="Next banner"
                            >
                                <FiChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                            </button>
                        </div>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20 bg-white/80 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full shadow-xl">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        goToSlide(index);
                                    }}
                                    className={`transition-all ${
                                        index === currentIndex
                                            ? 'w-8 md:w-10 h-3 md:h-4 bg-gradient-to-r from-pink-500 to-rose-500'
                                            : 'w-3 md:w-4 h-3 md:h-4 bg-gray-300 hover:bg-pink-300'
                                    } rounded-full shadow-md`}
                                    aria-label={`Go to banner ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-30">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg shadow-lg z-30 text-sm">
                        {error}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;


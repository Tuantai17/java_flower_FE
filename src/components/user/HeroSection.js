import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getActiveBanners } from '../../api/bannerApi';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * HeroSection Component - Fully Clickable Banner
 * Features:
 * - ENTIRE banner is clickable (clicks anywhere → navigate)
 * - Smooth slide transitions with fade effect
 * - Increased height to prevent bottom crop  
 * - Minimal overlay for clear image display
 * - Hover indicator button (shows on hover)
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

    // Auto-rotation with fade effect (4s interval)
    useEffect(() => {
        if (!isAutoPlaying || banners.length <= 1) return;

        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
                setFadeIn(true);
            }, 300);
        }, 5500); // thoi gian anh chyen dong

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

    // Banner content component (shared between linked and non-linked banners)
    const BannerContent = ({ clickable }) => (
        <>
            {/* Hover effect overlay (only for clickable) */}
            {clickable && (
                <div 
                    className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
            )}

            {/* VERY MINIMAL overlay */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(0deg, 
                        rgba(0,0,0,0.1) 0%, 
                        transparent 20%)`
                }}
            ></div>

            {/* NO TEXT OVERLAYS - Clean image only */}
        </>
    );

    return (
        <section className="relative overflow-hidden">
            {/* Inline CSS for smooth transitions */}
            <style>{`
                @keyframes bannerFadeSlide {
                    from {
                        opacity: 0;
                        transform: translateX(20px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                
                .banner-transition {
                    animation: bannerFadeSlide 0.7s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>

            {/* Full Width Banner - FULLY CLICKABLE if has linkUrl */}
            {currentBanner.linkUrl ? (
                <Link
                    to={currentBanner.linkUrl}
                    className={`block relative min-h-[550px] md:min-h-[650px] cursor-pointer group ${fadeIn ? 'banner-transition' : ''}`}
                    style={{
                        backgroundImage: `url(${currentBanner.imageUrl})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: currentBanner.backgroundColor || '#FFF7ED',
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: fadeIn ? 1 : 0,
                        zIndex: 1
                    }}
                    key={currentIndex}
                    onClick={(e) => {
                        // Allow navigation - don't prevent default
                        console.log('Banner clicked, navigating to:', currentBanner.linkUrl);
                    }}
                >
                    <BannerContent clickable={true} />
                </Link>
            ) : (
                <div 
                    className={`relative min-h-[550px] md:min-h-[650px] ${fadeIn ? 'banner-transition' : ''}`}
                    style={{
                        backgroundImage: `url(${currentBanner.imageUrl})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: currentBanner.backgroundColor || '#FFF7ED',
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: fadeIn ? 1 : 0
                    }}
                    key={currentIndex}
                >
                    <BannerContent clickable={false} />
                </div>
            )}

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
                            className="pointer-events-auto p-4 bg-white/95 hover:bg-white rounded-full shadow-2xl transition-all hover:scale-110"
                            aria-label="Previous banner"
                        >
                            <FiChevronLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                goToNext();
                            }}
                            className="pointer-events-auto p-4 bg-white/95 hover:bg-white rounded-full shadow-2xl transition-all hover:scale-110"
                            aria-label="Next banner"
                        >
                            <FiChevronRight className="w-6 h-6 text-gray-800" />
                        </button>
                    </div>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-xl">
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
                                        ? 'w-10 h-4 bg-gradient-to-r from-pink-600 to-rose-600'
                                        : 'w-4 h-4 bg-gray-300 hover:bg-pink-300'
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
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute top-4 right-4 bg-red-50 border-2 border-red-200 text-red-600 px-6 py-3 rounded-xl shadow-lg z-30">
                    {error}
                </div>
            )}

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-white"/>
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;

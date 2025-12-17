import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden">
            {/* Hero Background */}
            <div className="hero-gradient min-h-[500px] md:min-h-[600px] flex items-center">
                <div className="container-custom w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div className="z-10 animate-slide-up">
                            <span className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-pink-600 font-medium text-sm mb-6 shadow-soft">
                                🌸 Bộ Sưu Tập Mới
                            </span>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-4 leading-tight">
                                <span className="text-gradient">HOA CƯỚI</span>
                                <br />
                                <span className="text-gray-800">CẦM TAY</span>
                            </h1>

                            <p className="text-lg text-gray-600 mb-8 max-w-lg">
                                <strong className="text-rose-600">FREESHIP</strong> & Tặng hoa cài áo cho chú rể.
                                Thiết kế độc quyền, sang trọng cho ngày trọng đại.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/shop" className="btn-primary group">
                                    Xem Ngay
                                    <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                                </Link>
                                <Link to="/about" className="btn-secondary">
                                    Tìm hiểu thêm
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 mt-10">
                                {[
                                    { number: '500+', label: 'Mẫu hoa' },
                                    { number: '10K+', label: 'Khách hàng' },
                                    { number: '4.9', label: 'Đánh giá' },
                                ].map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.number}</div>
                                        <div className="text-sm text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Content - Image Grid */}
                        <div className="relative hidden lg:block">
                            <div className="grid grid-cols-3 gap-3 transform rotate-3">
                                {/* Main Images */}
                                <div className="space-y-3">
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg animate-bounce-soft" style={{ animationDelay: '0s' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400"
                                            alt="Wedding Bouquet"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg animate-bounce-soft" style={{ animationDelay: '0.2s' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400"
                                            alt="Pink Roses"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-8">
                                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg animate-bounce-soft" style={{ animationDelay: '0.4s' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400"
                                            alt="Sunflowers"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg animate-bounce-soft" style={{ animationDelay: '0.6s' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400"
                                            alt="Tulips"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg animate-bounce-soft" style={{ animationDelay: '0.8s' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400"
                                            alt="Mixed Bouquet"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg animate-bounce-soft" style={{ animationDelay: '1s' }}>
                                        <img
                                            src="https://images.unsplash.com/photo-1518882605630-8309f86b0377?w=400"
                                            alt="White Roses"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200/50 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-200/50 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 120L48 108C96 96 192 72 288 66C384 60 480 72 576 78C672 84 768 84 864 78C960 72 1056 60 1152 60C1248 60 1344 72 1392 78L1440 84V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;

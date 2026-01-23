import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    HeartIcon,
    ClockIcon,
    SparklesIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import voucherApi from '../../api/voucherApi';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { user } = useAuth(); // Get current user from context
    
    // Newsletter form state
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');
    const [alreadySubscribed, setAlreadySubscribed] = useState(false);

    // Check if logged-in user's email is already subscribed
    useEffect(() => {
        const checkUserSubscription = async () => {
            // Only check if user is logged in
            if (user?.email) {
                try {
                    const isSubscribed = await voucherApi.checkNewsletterSubscription(user.email);
                    setAlreadySubscribed(isSubscribed);
                } catch (err) {
                    console.error('Error checking subscription:', err);
                    setAlreadySubscribed(false);
                }
            } else {
                // Not logged in - reset state
                setAlreadySubscribed(false);
            }
        };
        
        checkUserSubscription();
    }, [user?.email]);

    // Email validation
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Handle newsletter submit
    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(null);

        // If user is logged in, auto-fill their email
        const emailToUse = user?.email || email.trim();

        if (!emailToUse) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!validateEmail(emailToUse)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const response = await voucherApi.subscribeNewsletter(emailToUse);
            
            setSuccess({
                voucherCode: response.voucherCode,
                email: emailToUse,
                message: response.message || 'Đăng ký thành công!',
                discountPercent: response.discountPercent,
                maxDiscount: response.maxDiscount
            });
            setAlreadySubscribed(true);
            setEmail('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const footerLinks = {
        about: [
            { name: 'Giới thiệu', path: '/gioi-thieu' },
            { name: 'Liên hệ', path: '/lien-he' },
            { name: 'Chính sách bảo mật', path: '/chinh-sach-bao-mat' },
            { name: 'Điều khoản sử dụng', path: '/dieu-khoan-su-dung' },
        ],
        categories: [
            { name: 'Hoa tươi', path: '/shop?category=1' },
            { name: 'Hoa bó', path: '/shop?category=2' },
            { name: 'Hoa giỏ', path: '/shop?category=3' },
            { name: 'Hoa dịp lễ', path: '/shop?category=4' },
            { name: 'Hoa sinh nhật', path: '/shop?category=5' },
            { name: 'Hoa khai trương', path: '/shop?category=6' },
            { name: 'Hoa chậu & cây cảnh', path: '/shop?category=10' },
        ],
        support: [
            { name: 'Hướng dẫn đặt hàng', path: '/huong-dan-dat-hang' },
            { name: 'Chính sách vận chuyển', path: '/chinh-sach-van-chuyen' },
            { name: 'Chính sách đổi trả', path: '/chinh-sach-doi-tra' },
            { name: 'Câu hỏi thường gặp', path: '/cau-hoi-thuong-gap' },
        ],
    };

    const socialLinks = [
        { name: 'Facebook', icon: 'facebook', color: 'hover:bg-blue-600', url: 'https://facebook.com/flowercorner' },
        { name: 'Instagram', icon: 'instagram', color: 'hover:bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500', url: 'https://instagram.com/flowercorner' },
        { name: 'YouTube', icon: 'youtube', color: 'hover:bg-red-600', url: 'https://youtube.com/flowercorner' },
        { name: 'TikTok', icon: 'tiktok', color: 'hover:bg-black', url: 'https://tiktok.com/@flowercorner' },
        { name: 'Zalo', icon: 'zalo', color: 'hover:bg-blue-500', url: 'https://zalo.me/flowercorner' },
    ];

    // Check if should hide newsletter section completely (logged in user who already subscribed)
    const shouldHideNewsletter = user && alreadySubscribed && !success;

    return (
        <footer className="relative overflow-hidden">
            {/* Newsletter Section - Only show if not subscribed or not logged in */}
            {!shouldHideNewsletter && (
            <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 py-16 overflow-hidden">
                {/* Decorative flowers */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <span className="absolute top-4 left-[5%] text-6xl">🌸</span>
                    <span className="absolute top-12 right-[8%] text-5xl">🌺</span>
                    <span className="absolute bottom-8 left-[15%] text-4xl">🌹</span>
                    <span className="absolute bottom-4 right-[20%] text-5xl">💐</span>
                </div>
                
                {/* Glowing orbs */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                <div className="container-custom relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
                            <SparklesIcon className="h-5 w-5" />
                            <span>Ưu đãi độc quyền cho thành viên</span>
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Nhận ngay <span className="text-yellow-300">Voucher 30%</span> 🎁
                        </h3>
                        <p className="text-white/90 mb-8 text-lg max-w-lg mx-auto">
                            Đăng ký email để nhận voucher giảm giá và cập nhật những ưu đãi mới nhất
                        </p>

                        {/* Already Subscribed - Only for logged-in users who subscribed */}
                        {user && alreadySubscribed && !success && (
                            <div className="max-w-md mx-auto bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
                                <div className="flex items-center justify-center gap-3 text-white mb-4">
                                    <div className="w-16 h-16 bg-green-400/30 rounded-full flex items-center justify-center">
                                        <CheckCircleIcon className="h-10 w-10 text-green-300" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">
                                    Cảm ơn bạn đã đăng ký! 🎉
                                </h4>
                                <p className="text-white/80 text-sm mb-4">
                                    Email <span className="font-semibold text-yellow-300">{user.email}</span> đã được đăng ký nhận tin.
                                </p>
                                
                                <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4">
                                    <p className="text-white/90 text-sm">
                                        ✅ Voucher <span className="font-bold text-yellow-300">WELCOME30</span> đã được thêm vào tài khoản, hãy sử dụng khi thanh toán!
                                    </p>
                                </div>
                                
                                <Link 
                                    to="/shop" 
                                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white text-rose-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    <ShoppingBagIcon className="h-5 w-5" />
                                    Mua sắm ngay
                                </Link>
                            </div>
                        )}

                        {/* Success Message - After just subscribing */}
                        {success && (
                            <div className="max-w-md mx-auto mb-6 bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30 animate-fadeIn">
                                <div className="flex items-center justify-center gap-2 text-white mb-4">
                                    <CheckCircleIcon className="h-8 w-8 text-green-300" />
                                    <span className="font-bold text-xl">Chúc mừng!</span>
                                </div>
                                <div className="bg-white rounded-2xl p-5 text-gray-800 shadow-xl">
                                    <p className="text-sm mb-3 text-gray-600">Mã giảm giá {success.discountPercent}% của bạn:</p>
                                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-2xl font-bold py-4 px-8 rounded-xl tracking-widest shadow-lg">
                                        ✨ {success.voucherCode} ✨
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Giảm tối đa {success.maxDiscount} • Có hiệu lực 30 ngày
                                    </p>
                                    {user ? (
                                        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                                            <p className="text-xs text-green-700">
                                                ✅ <strong>Tuyệt vời!</strong> Bạn đã đăng nhập. Voucher đã được thêm vào tài khoản, hãy sử dụng khi thanh toán!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="text-xs text-amber-700">
                                                ⚠️ <strong>Quan trọng:</strong> Hãy lưu lại mã này! Bạn cần đăng nhập với email <span className="font-semibold">{success.email}</span> để sử dụng voucher.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {user ? (
                                    <Link 
                                        to="/shop" 
                                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-yellow-400 text-gray-800 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all"
                                    >
                                        <ShoppingBagIcon className="h-5 w-5" />
                                        Mua sắm ngay
                                    </Link>
                                ) : (
                                    <Link 
                                        to="/login" 
                                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-yellow-400 text-gray-800 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all"
                                    >
                                        Đăng nhập ngay
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Form - Show for guests, or logged-in users who haven't subscribed */}
                        {!success && (!user || !alreadySubscribed) && (
                            <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto">
                                <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Nhập email của bạn..."
                                        className={`flex-1 px-6 py-4 bg-white rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-pink-300 ${
                                            error ? 'ring-2 ring-red-400' : ''
                                        }`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-lg transition-all ${
                                            loading 
                                                ? 'opacity-70 cursor-not-allowed' 
                                                : 'hover:from-yellow-500 hover:to-orange-600 hover:shadow-xl hover:scale-105'
                                        }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang xử lý
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                🎉 Nhận voucher
                                            </span>
                                        )}
                                    </button>
                                </div>
                                
                                {error && (
                                    <div className="flex items-center justify-center gap-2 mt-4 text-white bg-red-500/40 backdrop-blur-sm rounded-full py-2 px-4">
                                        <ExclamationCircleIcon className="h-5 w-5" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* Main Footer */}
            <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
                <div className="container-custom py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                        {/* Brand Info - Larger */}
                        <div className="lg:col-span-2">
                            <Link to="/" className="flex items-center gap-4 mb-6 group">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <span className="text-white text-3xl">🌸</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">FlowerCorner</h2>
                                    <p className="text-pink-400 text-sm italic">Say it with Flowers</p>
                                </div>
                            </Link>
                            
                            <p className="text-gray-400 mb-6 leading-relaxed text-base">
                                FlowerCorner - Cửa hàng hoa tươi cao cấp hàng đầu Việt Nam. 
                                Chúng tôi cam kết mang đến những bó hoa tươi đẹp nhất cho mọi dịp đặc biệt trong cuộc sống của bạn.
                            </p>
                            
                            {/* Contact info with icons */}
                            <div className="space-y-4">
                                <a href="tel:1900633045" className="flex items-center gap-4 text-gray-300 hover:text-pink-400 transition-all group">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-pink-600 transition-colors">
                                        <PhoneIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Hotline 24/7</p>
                                        <span className="font-semibold">1900 633 045</span>
                                    </div>
                                </a>
                                
                                <a href="mailto:contact@flowercorner.vn" className="flex items-center gap-4 text-gray-300 hover:text-pink-400 transition-all group">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-pink-600 transition-colors">
                                        <EnvelopeIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email hỗ trợ</p>
                                        <span className="font-semibold">contact@flowercorner.vn</span>
                                    </div>
                                </a>
                                
                                <div className="flex items-center gap-4 text-gray-300">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                                        <MapPinIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Địa chỉ showroom</p>
                                        <span className="font-semibold">123 Nguyễn Huệ, Q.1, TP.HCM</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-300">
                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                                        <ClockIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Giờ làm việc</p>
                                        <span className="font-semibold">7:00 - 22:00 (Cả T7, CN)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Links */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                                Về chúng tôi
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.about.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="text-gray-400 hover:text-pink-400 transition-all hover:pl-2 duration-300 inline-flex items-center gap-2 group"
                                        >
                                            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Categories */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                                Danh mục hoa
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.categories.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="text-gray-400 hover:text-pink-400 transition-all hover:pl-2 duration-300 inline-flex items-center gap-2 group"
                                        >
                                            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                                Hỗ trợ
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.support.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="text-gray-400 hover:text-pink-400 transition-all hover:pl-2 duration-300 inline-flex items-center gap-2 group"
                                        >
                                            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                            {/* Social Links */}
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 font-medium">Kết nối với chúng tôi:</span>
                                <div className="flex gap-2">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.name}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={social.name}
                                            className={`w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center text-gray-300 hover:text-white ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                                        >
                                            {social.icon === 'facebook' && (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                                            )}
                                            {social.icon === 'instagram' && (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                            )}
                                            {social.icon === 'youtube' && (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                            )}
                                            {social.icon === 'tiktok' && (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                                            )}
                                            {social.icon === 'zalo' && (
                                                <span className="text-sm font-bold">Z</span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 font-medium">Thanh toán:</span>
                                <div className="flex gap-2">
                                    {[
                                        { name: 'COD', label: 'COD' },
                                        { name: 'VISA', label: 'VISA', bg: 'bg-blue-600' },
                                        { name: 'MoMo', label: 'MoMo', bg: 'bg-pink-600' },
                                    ].map((method) => (
                                        <div 
                                            key={method.name}
                                            title={method.name}
                                            className={`w-12 h-8 ${method.bg || 'bg-gray-700'} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                                        >
                                            {method.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="bg-gray-950/50 py-5 border-t border-gray-800/50">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                            <p className="flex items-center gap-1">
                                © {currentYear} FlowerCorner. Made with <HeartIcon className="w-4 h-4 text-pink-500" /> in Vietnam
                            </p>
                            <div className="flex items-center gap-6">
                                <Link to="/chinh-sach-bao-mat" className="hover:text-pink-400 transition-colors">Chính sách</Link>
                                <Link to="/dieu-khoan-su-dung" className="hover:text-pink-400 transition-colors">Điều khoản</Link>
                                <Link to="/lien-he" className="hover:text-pink-400 transition-colors">Liên hệ</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

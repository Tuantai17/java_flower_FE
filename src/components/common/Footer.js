import React from 'react';
import { Link } from 'react-router-dom';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        about: [
            { name: 'Giới thiệu', path: '/about' },
            { name: 'Liên hệ', path: '/contact' },
            { name: 'Chính sách bảo mật', path: '/privacy' },
            { name: 'Điều khoản sử dụng', path: '/terms' },
        ],
        categories: [
            { name: 'Hoa Sinh Nhật', path: '/category/hoa-sinh-nhat' },
            { name: 'Hoa Khai Trương', path: '/category/hoa-khai-truong' },
            { name: 'Lan Hồ Điệp', path: '/category/lan-ho-diep' },
            { name: 'Hoa Tươi', path: '/category/hoa-tuoi' },
        ],
        support: [
            { name: 'Hướng dẫn đặt hàng', path: '/guide' },
            { name: 'Chính sách vận chuyển', path: '/shipping' },
            { name: 'Chính sách đổi trả', path: '/refund' },
            { name: 'Câu hỏi thường gặp', path: '/faq' },
        ],
    };

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-500 py-12">
                <div className="container-custom text-center">
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                        Đăng ký nhận tin khuyến mãi
                    </h3>
                    <p className="text-pink-100 mb-6 max-w-lg mx-auto">
                        Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên khi đăng ký email
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button
                            type="submit"
                            className="px-8 py-3 bg-white text-pink-600 font-semibold rounded-full hover:bg-pink-50 transition-colors shadow-lg"
                        >
                            Đăng ký
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Info */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl">🌸</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold">FlowerCorner</h2>
                                <p className="text-gray-400 text-xs italic">Say it with Flowers</p>
                            </div>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            FlowerCorner - Cửa hàng hoa tươi cao cấp, chuyên cung cấp các loại hoa tươi đẹp
                            cho mọi dịp lễ, sự kiện.
                        </p>
                        <div className="space-y-3">
                            <a href="tel:1900633045" className="flex items-center gap-3 text-gray-300 hover:text-pink-400 transition-colors">
                                <PhoneIcon className="h-5 w-5" />
                                <span>1900 633 045</span>
                            </a>
                            <a href="mailto:contact@flowercorner.vn" className="flex items-center gap-3 text-gray-300 hover:text-pink-400 transition-colors">
                                <EnvelopeIcon className="h-5 w-5" />
                                <span>contact@flowercorner.vn</span>
                            </a>
                            <div className="flex items-start gap-3 text-gray-300">
                                <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>123 Nguyễn Huệ, Q.1, TP. Hồ Chí Minh</span>
                            </div>
                        </div>
                    </div>

                    {/* About Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 relative">
                            Về chúng tôi
                            <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 -mb-2"></span>
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.about.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-pink-400 transition-colors hover:pl-2 duration-300 inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 relative">
                            Danh mục hoa
                            <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 -mb-2"></span>
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.categories.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-pink-400 transition-colors hover:pl-2 duration-300 inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 relative">
                            Hỗ trợ khách hàng
                            <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 -mb-2"></span>
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-pink-400 transition-colors hover:pl-2 duration-300 inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Social Links */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Theo dõi chúng tôi:</span>
                        <div className="flex gap-3">
                            {['facebook', 'instagram', 'youtube', 'tiktok'].map((social) => (
                                <a
                                    key={social}
                                    href={`https://${social}.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 transition-all duration-300"
                                >
                                    <span className="text-lg">
                                        {social === 'facebook' && '📘'}
                                        {social === 'instagram' && '📸'}
                                        {social === 'youtube' && '📺'}
                                        {social === 'tiktok' && '🎵'}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Thanh toán:</span>
                        <div className="flex gap-2">
                            {['💳', '🏦', '📱', '💵'].map((icon, index) => (
                                <span key={index} className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-lg">
                                    {icon}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-gray-950 py-4">
                <div className="container-custom text-center text-gray-500 text-sm">
                    <p>© {currentYear} FlowerCorner. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

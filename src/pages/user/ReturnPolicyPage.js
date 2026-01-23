import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    ArrowPathIcon,
    ClockIcon,
    ShieldCheckIcon,
    PhoneIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    CameraIcon,
    DocumentTextIcon,
    TruckIcon,
    CurrencyDollarIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Trang Chính sách đổi trả - FlowerCorner
 * Giao diện đẹp, chuyên nghiệp, dễ đọc
 */
const ReturnPolicyPage = () => {
    // Điều kiện được đổi trả
    const acceptedReturns = [
        {
            icon: '🥀',
            title: 'Hoa héo, hư hỏng',
            description: 'Hoa bị héo, dập nát hoặc hư hỏng trong quá trình vận chuyển',
        },
        {
            icon: '❌',
            title: 'Sai mẫu sản phẩm',
            description: 'Sản phẩm giao không đúng với mẫu đã đặt hàng',
        },
        {
            icon: '📦',
            title: 'Thiếu sản phẩm',
            description: 'Đơn hàng bị thiếu so với số lượng đã đặt',
        },
        {
            icon: '🔢',
            title: 'Sai số lượng',
            description: 'Số lượng sản phẩm không đúng với đơn đặt hàng',
        },
    ];

    // Điều kiện không được đổi trả
    const notAcceptedReturns = [
        {
            reason: 'Sản phẩm đã qua sử dụng hoặc tự ý thay đổi',
        },
        {
            reason: 'Không có hình ảnh/video chứng minh khi nhận hàng',
        },
        {
            reason: 'Khiếu nại sau 24 giờ kể từ khi nhận hàng',
        },
        {
            reason: 'Hoa héo do người nhận không bảo quản đúng cách',
        },
        {
            reason: 'Thay đổi ý kiến sau khi đã nhận hàng',
        },
        {
            reason: 'Địa chỉ/thông tin người nhận không chính xác dẫn đến giao trễ',
        },
    ];

    // Quy trình đổi trả
    const returnProcess = [
        {
            step: 1,
            icon: CameraIcon,
            title: 'Chụp ảnh/quay video',
            description: 'Ngay khi nhận hàng, chụp ảnh hoặc quay video sản phẩm nếu phát hiện lỗi',
            color: 'from-pink-500 to-rose-500',
        },
        {
            step: 2,
            icon: ChatBubbleLeftRightIcon,
            title: 'Liên hệ CSKH',
            description: 'Gọi hotline hoặc chat để thông báo vấn đề trong vòng 2 giờ',
            color: 'from-orange-500 to-amber-500',
        },
        {
            step: 3,
            icon: DocumentTextIcon,
            title: 'Xác nhận đổi trả',
            description: 'Nhân viên xác nhận và đưa ra phương án giải quyết phù hợp',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            step: 4,
            icon: ArrowPathIcon,
            title: 'Đổi/Hoàn sản phẩm',
            description: 'Nhận sản phẩm mới hoặc hoàn tiền theo thỏa thuận',
            color: 'from-green-500 to-emerald-500',
        },
    ];

    // Phương thức hoàn tiền
    const refundMethods = [
        {
            icon: CurrencyDollarIcon,
            name: 'Hoàn tiền mặt',
            description: 'Hoàn trực tiếp khi shipper thu hồi sản phẩm',
            time: 'Ngay lập tức',
            color: 'from-green-400 to-emerald-500',
        },
        {
            icon: '💳',
            name: 'Chuyển khoản ngân hàng',
            description: 'Hoàn vào tài khoản ngân hàng đã đăng ký',
            time: '1-3 ngày làm việc',
            color: 'from-blue-400 to-indigo-500',
        },
        {
            icon: '🎁',
            name: 'Voucher mua hàng',
            description: 'Nhận voucher có giá trị tương đương để mua hàng lần sau',
            time: 'Ngay lập tức',
            color: 'from-purple-400 to-pink-500',
        },
    ];

    // Cam kết của shop
    const commitments = [
        {
            icon: '⏰',
            title: 'Xử lý nhanh chóng',
            description: 'Phản hồi trong vòng 30 phút, xử lý trong ngày',
        },
        {
            icon: '💯',
            title: 'Hoàn tiền 100%',
            description: 'Hoàn tiền đầy đủ nếu lỗi từ shop',
        },
        {
            icon: '🚚',
            title: 'Giao lại miễn phí',
            description: 'Ship lại sản phẩm mới hoàn toàn miễn phí',
        },
        {
            icon: '❤️',
            title: 'Hỗ trợ tận tình',
            description: 'Đội ngũ CSKH sẵn sàng giải đáp mọi thắc mắc',
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Chính sách đổi trả' }]} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 py-16 lg:py-24">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>
                
                {/* Floating flowers decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute top-20 left-[10%] text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🌸</span>
                    <span className="absolute top-40 right-[15%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🌺</span>
                    <span className="absolute bottom-20 left-[20%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}>💐</span>
                    <span className="absolute bottom-32 right-[25%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s' }}>🌹</span>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
                            <ArrowPathIcon className="h-5 w-5" />
                            <span>Chính sách đổi trả rõ ràng, minh bạch</span>
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Chính Sách Đổi Trả
                        </h1>
                        
                        <p className="text-white/90 text-lg lg:text-xl mb-8 leading-relaxed">
                            FlowerCorner cam kết mang đến trải nghiệm mua hàng tốt nhất. 
                            Nếu có bất kỳ vấn đề nào với sản phẩm, chúng tôi sẵn sàng hỗ trợ bạn!
                        </p>

                        {/* Quick contact */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <a 
                                href="tel:1900633045" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-rose-600 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                            >
                                <PhoneIcon className="h-5 w-5" />
                                1900 633 045
                            </a>
                            <a 
                                href="/contact" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all"
                            >
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                Chat ngay
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cam kết của shop */}
            <section className="py-12 -mt-8 relative z-20">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {commitments.map((item, index) => (
                            <div 
                                key={index}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
                            >
                                <span className="text-4xl mb-4 block">{item.icon}</span>
                                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Điều kiện đổi trả */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Được đổi trả */}
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <CheckCircleIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Được đổi trả khi</h2>
                                        <p className="text-white/80 text-sm">Các trường hợp được chấp nhận</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {acceptedReturns.map((item, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 transition-colors"
                                    >
                                        <span className="text-3xl">{item.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Không được đổi trả */}
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <XCircleIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Không hỗ trợ đổi trả</h2>
                                        <p className="text-white/80 text-sm">Các trường hợp không được chấp nhận</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {notAcceptedReturns.map((item, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100"
                                    >
                                        <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                                        <span className="text-gray-700">{item.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Thời gian khiếu nại */}
            <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                        <ClockIcon className="h-16 w-16 text-white" />
                                    </div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                        Thời Gian Khiếu Nại
                                    </h2>
                                    <div className="space-y-3 text-gray-600">
                                        <p className="flex items-center gap-2 justify-center lg:justify-start">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                            <span>Liên hệ ngay trong <strong className="text-orange-600">2 giờ</strong> sau khi nhận hàng</span>
                                        </p>
                                        <p className="flex items-center gap-2 justify-center lg:justify-start">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                            <span>Gửi hình ảnh/video chứng minh trong <strong className="text-orange-600">24 giờ</strong></span>
                                        </p>
                                        <p className="flex items-center gap-2 justify-center lg:justify-start">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                                            <span>Sau 24 giờ, shop không hỗ trợ giải quyết</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quy trình đổi trả */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                            Quy Trình Đổi Trả
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chỉ cần 4 bước đơn giản, FlowerCorner sẽ hỗ trợ bạn nhanh chóng
                        </p>
                    </div>

                    {/* Cards container with equal height */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {returnProcess.map((item, index) => (
                            <div key={index} className="relative flex">
                                {/* Connector line - only on desktop */}
                                {index < returnProcess.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-[calc(50%+28px)] w-[calc(100%-28px)] h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0"></div>
                                )}
                                
                                {/* Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative z-10 flex flex-col w-full min-h-[220px]">
                                    {/* Step number badge */}
                                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                        {item.step}
                                    </div>
                                    
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg flex-shrink-0`}>
                                        <item.icon className="h-7 w-7 text-white" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Phương thức hoàn tiền */}
            <section className="py-16 bg-gray-100">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                            Phương Thức Hoàn Tiền
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Bạn có thể chọn phương thức hoàn tiền phù hợp nhất
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {refundMethods.map((method, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className={`h-2 bg-gradient-to-r ${method.color}`}></div>
                                <div className="p-6">
                                    <div className="text-4xl mb-4">
                                        {typeof method.icon === 'string' ? method.icon : <method.icon className="h-10 w-10 text-gray-600" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{method.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <ClockIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-500">Thời gian: <strong className="text-gray-700">{method.time}</strong></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lưu ý quan trọng */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 lg:p-12 border border-amber-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-amber-100 rounded-xl">
                                    <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                                    Lưu Ý Quan Trọng
                                </h2>
                            </div>
                            
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Luôn kiểm tra sản phẩm</strong> trước mặt shipper khi nhận hàng
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Chụp ảnh/quay video</strong> ngay khi phát hiện lỗi để làm bằng chứng
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Giữ nguyên sản phẩm</strong> không tự ý chỉnh sửa hoặc sử dụng
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Liên hệ ngay</strong> qua hotline hoặc chat để được hỗ trợ nhanh nhất
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-gradient-to-r from-rose-500 to-pink-500">
                <div className="container-custom">
                    <div className="text-center text-white">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Cần Hỗ Trợ Đổi Trả?
                        </h2>
                        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                            Đội ngũ chăm sóc khách hàng của FlowerCorner sẵn sàng hỗ trợ bạn 24/7
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <a 
                                href="tel:1900633045"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                            >
                                <PhoneIcon className="h-6 w-6" />
                                Gọi ngay: 1900 633 045
                            </a>
                            <Link 
                                to="/shop"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/30 transition-all"
                            >
                                <TruckIcon className="h-6 w-6" />
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Links */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                        Chính sách liên quan
                    </h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            to="/chinh-sach-van-chuyen"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                            📦 Chính sách vận chuyển
                        </Link>
                        <Link 
                            to="/chinh-sach-bao-mat"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                            🔒 Chính sách bảo mật
                        </Link>
                        <Link 
                            to="/huong-dan-mua-hang"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                            🛒 Hướng dẫn mua hàng
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReturnPolicyPage;

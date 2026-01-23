import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    ClipboardDocumentListIcon,
    CreditCardIcon,
    TruckIcon,
    CheckCircleIcon,
    UserIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    GiftIcon,
    StarIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

const OrderGuidePage = () => {
    const steps = [
        {
            number: 1,
            title: 'Tìm kiếm sản phẩm',
            icon: MagnifyingGlassIcon,
            description: 'Tìm kiếm hoa theo tên, danh mục hoặc dịp',
            details: [
                'Sử dụng thanh tìm kiếm ở đầu trang để tìm hoa theo tên',
                'Duyệt qua các danh mục: Hoa Sinh Nhật, Hoa Khai Trương, Hoa Tươi...',
                'Lọc sản phẩm theo giá, mức độ phổ biến hoặc mới nhất',
                'Xem chi tiết sản phẩm bằng cách nhấp vào hình ảnh',
            ],
            tips: 'Bạn có thể sử dụng bộ lọc để thu hẹp kết quả tìm kiếm theo ngân sách của mình.',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50',
        },
        {
            number: 2,
            title: 'Thêm vào giỏ hàng',
            icon: ShoppingCartIcon,
            description: 'Chọn số lượng và thêm sản phẩm vào giỏ',
            details: [
                'Chọn số lượng sản phẩm muốn mua',
                'Nhấn nút "Thêm vào giỏ hàng"',
                'Có thể tiếp tục mua sắm hoặc đi đến giỏ hàng',
                'Xem tổng số sản phẩm trong giỏ ở góc phải màn hình',
            ],
            tips: 'Bạn có thể thêm ghi chú đặc biệt cho từng sản phẩm như lời nhắn trên thiệp.',
            color: 'from-pink-500 to-rose-500',
            bgColor: 'from-pink-50 to-rose-50',
        },
        {
            number: 3,
            title: 'Kiểm tra giỏ hàng',
            icon: ClipboardDocumentListIcon,
            description: 'Xem lại đơn hàng và áp dụng mã giảm giá',
            details: [
                'Nhấp vào biểu tượng giỏ hàng để xem chi tiết',
                'Kiểm tra lại số lượng và loại sản phẩm',
                'Nhập mã giảm giá/voucher nếu có',
                'Xem tổng tiền tạm tính trước khi thanh toán',
            ],
            tips: 'Đăng ký thành viên để nhận voucher giảm giá cho đơn hàng đầu tiên!',
            color: 'from-purple-500 to-indigo-500',
            bgColor: 'from-purple-50 to-indigo-50',
        },
        {
            number: 4,
            title: 'Điền thông tin giao hàng',
            icon: TruckIcon,
            description: 'Nhập địa chỉ và thông tin người nhận',
            details: [
                'Nhập họ tên người nhận hoa',
                'Điền số điện thoại người nhận (rất quan trọng!)',
                'Nhập địa chỉ giao hàng đầy đủ và chính xác',
                'Chọn ngày giờ giao hàng mong muốn',
                'Thêm lời nhắn/thiệp gửi kèm nếu cần',
            ],
            tips: 'Vui lòng kiểm tra kỹ số điện thoại người nhận để shipper có thể liên lạc.',
            color: 'from-orange-500 to-amber-500',
            bgColor: 'from-orange-50 to-amber-50',
        },
        {
            number: 5,
            title: 'Thanh toán đơn hàng',
            icon: CreditCardIcon,
            description: 'Chọn phương thức thanh toán phù hợp',
            details: [
                'Thanh toán khi nhận hàng (COD)',
                'Chuyển khoản ngân hàng',
                'Ví điện tử MoMo',
                'Thẻ ATM/Visa/Mastercard qua VNPay',
            ],
            tips: 'Thanh toán online để được ưu tiên xử lý đơn hàng nhanh hơn!',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'from-green-50 to-emerald-50',
        },
        {
            number: 6,
            title: 'Xác nhận & Theo dõi',
            icon: CheckCircleIcon,
            description: 'Nhận xác nhận và theo dõi đơn hàng',
            details: [
                'Nhận email/SMS xác nhận đơn hàng ngay lập tức',
                'Theo dõi trạng thái đơn hàng trong tài khoản',
                'Nhận thông báo khi đơn hàng được giao',
                'Đánh giá sản phẩm sau khi nhận hàng',
            ],
            tips: 'Tải app FlowerCorner để theo dõi đơn hàng tiện lợi hơn!',
            color: 'from-teal-500 to-cyan-500',
            bgColor: 'from-teal-50 to-cyan-50',
        },
    ];

    const paymentMethods = [
        { name: 'COD', desc: 'Thanh toán khi nhận hàng', icon: '💵' },
        { name: 'Bank Transfer', desc: 'Chuyển khoản ngân hàng', icon: '🏦' },
        { name: 'MoMo', desc: 'Ví điện tử MoMo', icon: '📱' },
        { name: 'VNPay', desc: 'Thẻ ATM/Visa/Master', icon: '💳' },
    ];

    const faqs = [
        {
            question: 'Thời gian giao hàng là bao lâu?',
            answer: 'Nội thành TP.HCM: 2-4 giờ. Ngoại thành: 4-6 giờ. Các tỉnh khác: 1-3 ngày.',
        },
        {
            question: 'Tôi có thể đổi/trả hàng không?',
            answer: 'Có, bạn có thể khiếu nại trong vòng 2 giờ sau khi nhận hàng nếu sản phẩm không đúng hoặc bị hư hỏng.',
        },
        {
            question: 'Làm sao để áp dụng mã giảm giá?',
            answer: 'Nhập mã voucher vào ô "Mã giảm giá" tại trang giỏ hàng trước khi thanh toán.',
        },
        {
            question: 'Tôi có thể giao hoa đến người khác không?',
            answer: 'Hoàn toàn có thể! Chỉ cần nhập thông tin người nhận tại bước điền thông tin giao hàng.',
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Hướng dẫn đặt hàng' }]} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
                            <ShoppingCartIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Hướng Dẫn Đặt Hàng
                        </h1>
                        <p className="text-lg text-pink-100 leading-relaxed mb-8">
                            Chỉ với 6 bước đơn giản, bạn có thể đặt hoa tươi và gửi tặng người thân yêu. 
                            FlowerCorner sẽ giao hoa nhanh chóng đến tận nơi!
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
                                <div className="text-3xl font-bold">6</div>
                                <div className="text-pink-100 text-sm">Bước đơn giản</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
                                <div className="text-3xl font-bold">2-4h</div>
                                <div className="text-pink-100 text-sm">Giao hàng nhanh</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-pink-100 text-sm">Hỗ trợ khách hàng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Overview */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-4">
                        {steps.map((step, index) => (
                            <a
                                key={step.number}
                                href={`#step-${step.number}`}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-pink-50 rounded-full transition-all duration-200 group"
                            >
                                <span className={`w-8 h-8 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                                    {step.number}
                                </span>
                                <span className="text-gray-600 group-hover:text-pink-600 text-sm font-medium">
                                    {step.title}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Steps */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="max-w-5xl mx-auto">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div 
                                    key={step.number}
                                    id={`step-${step.number}`}
                                    className={`mb-12 scroll-mt-24 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                                >
                                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                                        <div className="grid grid-cols-1 lg:grid-cols-5">
                                            {/* Step Number & Icon Side */}
                                            <div className={`lg:col-span-2 bg-gradient-to-br ${step.bgColor} p-8 flex flex-col items-center justify-center text-center`}>
                                                <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-6 shadow-lg`}>
                                                    <Icon className="w-12 h-12 text-white" />
                                                </div>
                                                <div className={`text-7xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent mb-2`}>
                                                    {step.number}
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                                                <p className="text-gray-500 mt-2">{step.description}</p>
                                            </div>

                                            {/* Content Side */}
                                            <div className="lg:col-span-3 p-8">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                    <span className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full`}></span>
                                                    Chi tiết thực hiện
                                                </h4>
                                                
                                                <ul className="space-y-3 mb-6">
                                                    {step.details.map((detail, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <span className={`w-6 h-6 bg-gradient-to-br ${step.bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                                <CheckCircleIcon className={`w-4 h-4 text-gray-600`} />
                                                            </span>
                                                            <span className="text-gray-600">{detail}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Tip Box */}
                                                <div className={`bg-gradient-to-r ${step.bgColor} rounded-2xl p-4 border border-gray-100`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                            <StarIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-gray-800">Mẹo hay: </span>
                                                            <span className="text-gray-600">{step.tips}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow Connector */}
                                    {index < steps.length - 1 && (
                                        <div className="flex justify-center my-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                                                <ArrowRightIcon className="w-5 h-5 text-pink-500 rotate-90" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Payment Methods */}
            <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Phương Thức Thanh Toán</h2>
                        <p className="text-gray-400">Chọn phương thức thanh toán phù hợp với bạn</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {paymentMethods.map((method, index) => (
                            <div 
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 group"
                            >
                                <div className="text-4xl mb-4">{method.icon}</div>
                                <h3 className="text-white font-semibold mb-1">{method.name}</h3>
                                <p className="text-gray-400 text-sm">{method.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
                                ❓ Câu Hỏi Thường Gặp
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900">Bạn Cần Hỗ Trợ?</h2>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div 
                                    key={index}
                                    className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                                >
                                    <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                                        <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm">
                                            Q
                                        </span>
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-600 pl-11">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-pink-500 to-rose-500">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <GiftIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">Sẵn sàng đặt hoa?</h2>
                        <p className="text-pink-100 mb-8">
                            Bắt đầu mua sắm ngay hôm nay và gửi tặng yêu thương đến người bạn quan tâm!
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link 
                                to="/shop"
                                className="px-8 py-4 bg-white text-pink-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                Mua sắm ngay
                            </Link>
                            <a 
                                href="tel:1900633045"
                                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                            >
                                <PhoneIcon className="w-5 h-5" />
                                1900 633 045
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-3xl p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4">
                                        <PhoneIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
                                    <p className="text-pink-600 font-bold text-lg">1900 633 045</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                                        <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                                    <p className="text-gray-600">Hỗ trợ 24/7</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                                        <UserIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Tài khoản</h3>
                                    <Link to="/login" className="text-green-600 hover:underline">Đăng nhập ngay</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OrderGuidePage;

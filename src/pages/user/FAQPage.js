import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    TruckIcon,
    CreditCardIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    GiftIcon,
    ClockIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

/**
 * Trang Câu hỏi thường gặp (FAQ) - FlowerCorner
 * Giao diện đẹp với accordion, search, categories
 */
const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openQuestions, setOpenQuestions] = useState({});

    // Categories
    const categories = [
        { id: 'all', name: 'Tất cả', icon: '📋', color: 'from-gray-500 to-gray-600' },
        { id: 'order', name: 'Đặt hàng', icon: '🛒', color: 'from-blue-500 to-cyan-500' },
        { id: 'shipping', name: 'Vận chuyển', icon: '🚚', color: 'from-green-500 to-emerald-500' },
        { id: 'payment', name: 'Thanh toán', icon: '💳', color: 'from-purple-500 to-pink-500' },
        { id: 'return', name: 'Đổi trả', icon: '🔄', color: 'from-orange-500 to-amber-500' },
        { id: 'product', name: 'Sản phẩm', icon: '🌸', color: 'from-rose-500 to-pink-500' },
    ];

    // FAQ Data
    const faqs = [
        // Đặt hàng
        {
            id: 1,
            category: 'order',
            question: 'Làm thế nào để đặt hàng trên FlowerCorner?',
            answer: `Bạn có thể đặt hàng theo các bước sau:
1. Chọn sản phẩm và thêm vào giỏ hàng
2. Kiểm tra giỏ hàng và nhập thông tin người nhận
3. Chọn phương thức thanh toán
4. Xác nhận đơn hàng
Ngoài ra, bạn cũng có thể đặt hàng nhanh qua Hotline: 1900 633 045`,
        },
        {
            id: 2,
            category: 'order',
            question: 'Tôi có thể đặt hàng cho người khác nhận được không?',
            answer: 'Hoàn toàn có thể! Khi đặt hàng, bạn chỉ cần nhập thông tin người nhận (tên, số điện thoại, địa chỉ) khác với thông tin của bạn. Hoa sẽ được giao đến đúng địa chỉ người nhận.',
        },
        {
            id: 3,
            category: 'order',
            question: 'Tôi có thể đặt hàng trước cho ngày giao hàng cụ thể không?',
            answer: 'Có, bạn có thể đặt hàng trước và chọn ngày giao hàng mong muốn. Chúng tôi khuyến khích đặt trước ít nhất 1 ngày để đảm bảo hoa tươi và giao đúng hẹn, đặc biệt vào các dịp lễ.',
        },
        {
            id: 4,
            category: 'order',
            question: 'Làm sao để hủy hoặc thay đổi đơn hàng?',
            answer: 'Bạn có thể hủy hoặc thay đổi đơn hàng trong vòng 1 giờ sau khi đặt. Vui lòng liên hệ Hotline: 1900 633 045 hoặc chat trực tiếp để được hỗ trợ ngay.',
        },
        
        // Vận chuyển
        {
            id: 5,
            category: 'shipping',
            question: 'FlowerCorner giao hàng ở những khu vực nào?',
            answer: 'Hiện tại FlowerCorner phục vụ giao hàng trong khu vực TP. Hồ Chí Minh và các vùng lân cận. Chúng tôi đang dần mở rộng phạm vi giao hàng.',
        },
        {
            id: 6,
            category: 'shipping',
            question: 'Thời gian giao hàng mất bao lâu?',
            answer: `Thời gian giao hàng tùy thuộc vào khu vực:
• Nội thành TP.HCM: 2-4 giờ
• Ngoại thành TP.HCM: 4-6 giờ
• Giao nhanh (phụ phí 30.000đ): Trong vòng 2 giờ`,
        },
        {
            id: 7,
            category: 'shipping',
            question: 'Phí ship hàng là bao nhiêu?',
            answer: `Phí ship tùy thuộc vào khu vực:
• Nội thành: 25.000đ (Miễn phí đơn từ 500.000đ)
• Ngoại thành: 35.000đ - 45.000đ (Miễn phí đơn từ 700.000đ)
Chi tiết xem tại trang Chính sách vận chuyển.`,
        },
        {
            id: 8,
            category: 'shipping',
            question: 'Tôi có thể theo dõi đơn hàng không?',
            answer: 'Có, sau khi đặt hàng thành công, bạn sẽ nhận được mã đơn hàng qua SMS/Email. Vào mục "Đơn hàng của tôi" trên website hoặc app để theo dõi trạng thái giao hàng.',
        },

        // Thanh toán
        {
            id: 9,
            category: 'payment',
            question: 'FlowerCorner hỗ trợ những phương thức thanh toán nào?',
            answer: `Chúng tôi hỗ trợ nhiều phương thức thanh toán:
• Thanh toán khi nhận hàng (COD)
• Chuyển khoản ngân hàng
• Ví điện tử: MoMo, VNPay, ZaloPay
• Thẻ tín dụng/ghi nợ Visa, Mastercard`,
        },
        {
            id: 10,
            category: 'payment',
            question: 'Thanh toán online có an toàn không?',
            answer: 'Tuyệt đối an toàn! FlowerCorner sử dụng các cổng thanh toán uy tín được mã hóa SSL. Thông tin thanh toán của bạn được bảo mật 100% và không được lưu trữ trên hệ thống.',
        },
        {
            id: 11,
            category: 'payment',
            question: 'Tôi có thể xuất hóa đơn VAT không?',
            answer: 'Có, bạn có thể yêu cầu xuất hóa đơn VAT khi đặt hàng. Vui lòng cung cấp thông tin công ty (tên, mã số thuế, địa chỉ) trong phần ghi chú đơn hàng.',
        },

        // Đổi trả
        {
            id: 12,
            category: 'return',
            question: 'Chính sách đổi trả của FlowerCorner như thế nào?',
            answer: 'Chúng tôi hỗ trợ đổi trả trong các trường hợp: hoa héo/hư hỏng khi nhận, sai mẫu, thiếu sản phẩm. Vui lòng liên hệ trong vòng 2 giờ sau khi nhận hàng kèm hình ảnh/video.',
        },
        {
            id: 13,
            category: 'return',
            question: 'Làm sao để yêu cầu đổi trả sản phẩm?',
            answer: `Bước 1: Chụp ảnh/quay video sản phẩm lỗi ngay khi nhận
Bước 2: Liên hệ Hotline 1900 633 045 hoặc chat trong vòng 2 giờ
Bước 3: Gửi hình ảnh cho nhân viên CSKH
Bước 4: Nhận sản phẩm mới hoặc hoàn tiền`,
        },
        {
            id: 14,
            category: 'return',
            question: 'Thời gian hoàn tiền mất bao lâu?',
            answer: `Thời gian hoàn tiền phụ thuộc phương thức:
• Tiền mặt: Hoàn ngay khi nhận lại sản phẩm
• Chuyển khoản: 1-3 ngày làm việc
• Voucher: Ngay lập tức`,
        },

        // Sản phẩm
        {
            id: 15,
            category: 'product',
            question: 'Hoa của FlowerCorner có tươi lâu không?',
            answer: 'Hoa của chúng tôi được nhập trực tiếp từ vườn, cắt trong ngày nên đảm bảo tươi 100%. Với cách chăm sóc đúng cách, hoa có thể tươi từ 5-7 ngày. Chúng tôi cũng tặng kèm hướng dẫn giữ hoa tươi lâu.',
        },
        {
            id: 16,
            category: 'product',
            question: 'Tôi có thể yêu cầu thiết kế hoa theo ý muốn không?',
            answer: 'Hoàn toàn có thể! Bạn có thể liên hệ Hotline hoặc chat để đặt hoa theo yêu cầu riêng về màu sắc, loại hoa, kích thước. Nhân viên sẽ tư vấn và báo giá chi tiết.',
        },
        {
            id: 17,
            category: 'product',
            question: 'Hoa giao có giống hình trên website không?',
            answer: 'Chúng tôi cam kết hoa giao đúng mẫu đã đặt. Tuy nhiên, một số loại hoa có thể có màu sắc nhạt/đậm hơn một chút do đặc tính tự nhiên. Nếu hoa quá khác biệt, bạn có thể yêu cầu đổi trả.',
        },
        {
            id: 18,
            category: 'product',
            question: 'FlowerCorner có phục vụ hoa cho sự kiện không?',
            answer: 'Có, chúng tôi nhận trang trí hoa cho các sự kiện: đám cưới, sinh nhật, khai trương, hội nghị... Vui lòng liên hệ trước ít nhất 3 ngày để được tư vấn và báo giá.',
        },
    ];

    // Toggle question
    const toggleQuestion = (id) => {
        setOpenQuestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Filter FAQs
    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = searchQuery === '' || 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Câu hỏi thường gặp' }]} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 lg:py-24">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>
                
                {/* Floating icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <span className="absolute top-20 left-[10%] text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>❓</span>
                    <span className="absolute top-40 right-[15%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>💬</span>
                    <span className="absolute bottom-20 left-[20%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}>🌸</span>
                    <span className="absolute bottom-32 right-[25%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s' }}>💡</span>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
                            <QuestionMarkCircleIcon className="h-5 w-5" />
                            <span>Giải đáp mọi thắc mắc của bạn</span>
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Câu Hỏi Thường Gặp
                        </h1>
                        
                        <p className="text-white/90 text-lg lg:text-xl mb-8 leading-relaxed">
                            Tìm câu trả lời nhanh chóng cho những thắc mắc phổ biến về dịch vụ của FlowerCorner
                        </p>

                        {/* Search Box */}
                        <div className="max-w-xl mx-auto">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm câu hỏi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8 -mt-6 relative z-20">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg ${
                                    activeCategory === cat.id
                                        ? `bg-gradient-to-r ${cat.color} text-white`
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-12">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        {filteredFAQs.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                                <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy câu hỏi</h3>
                                <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc liên hệ với chúng tôi</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFAQs.map((faq) => {
                                    const category = categories.find(c => c.id === faq.category);
                                    return (
                                        <div
                                            key={faq.id}
                                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(faq.id)}
                                                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="text-2xl flex-shrink-0">{category?.icon}</span>
                                                    <span className="font-semibold text-gray-800 text-lg">{faq.question}</span>
                                                </div>
                                                <ChevronDownIcon 
                                                    className={`h-6 w-6 text-gray-400 flex-shrink-0 transition-transform ${
                                                        openQuestions[faq.id] ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </button>
                                            
                                            {/* Answer */}
                                            <div className={`overflow-hidden transition-all duration-300 ${
                                                openQuestions[faq.id] ? 'max-h-[500px]' : 'max-h-0'
                                            }`}>
                                                <div className="px-6 pb-5 pt-0">
                                                    <div className="pl-10 border-l-4 border-rose-200 ml-3">
                                                        <p className="text-gray-600 leading-relaxed whitespace-pre-line pl-4">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
                        Có thể bạn quan tâm
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        <Link 
                            to="/huong-dan-dat-hang"
                            className="flex flex-col items-center p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <GiftIcon className="h-7 w-7 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">Hướng dẫn đặt hàng</span>
                        </Link>
                        
                        <Link 
                            to="/chinh-sach-van-chuyen"
                            className="flex flex-col items-center p-6 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <TruckIcon className="h-7 w-7 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">Chính sách vận chuyển</span>
                        </Link>
                        
                        <Link 
                            to="/chinh-sach-doi-tra"
                            className="flex flex-col items-center p-6 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ArrowPathIcon className="h-7 w-7 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">Chính sách đổi trả</span>
                        </Link>
                        
                        <Link 
                            to="/chinh-sach-bao-mat"
                            className="flex flex-col items-center p-6 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors group"
                        >
                            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheckIcon className="h-7 w-7 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">Chính sách bảo mật</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="container-custom">
                    <div className="text-center text-white">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Vẫn chưa tìm được câu trả lời?
                        </h2>
                        <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                            Đội ngũ chăm sóc khách hàng của FlowerCorner sẵn sàng hỗ trợ bạn 24/7
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <a 
                                href="tel:1900633045"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                            >
                                <PhoneIcon className="h-6 w-6" />
                                Gọi ngay: 1900 633 045
                            </a>
                            <a 
                                href="contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/30 transition-all"
                            >
                                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                                Chat với chúng tôi
                            </a>
                        </div>

                        {/* Working hours */}
                        <div className="mt-8 flex items-center justify-center gap-2 text-white/80">
                            <ClockIcon className="h-5 w-5" />
                            <span>Hỗ trợ 24/7 - Kể cả ngày lễ</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQPage;

import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    DocumentTextIcon,
    ScaleIcon,
    ShoppingCartIcon,
    CreditCardIcon,
    TruckIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const TermsOfServicePage = () => {
    const lastUpdated = '20/01/2026';

    const sections = [
        {
            id: 'gioi-thieu',
            icon: DocumentTextIcon,
            title: '1. Giới thiệu',
            content: [
                {
                    text: 'Chào mừng bạn đến với FlowerCorner.vn! Các Điều khoản Sử dụng này ("Điều khoản") chi phối việc bạn sử dụng website FlowerCorner.vn và các dịch vụ liên quan.'
                },
                {
                    text: 'Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các Điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của các Điều khoản, bạn không được sử dụng dịch vụ của chúng tôi.'
                },
                {
                    subtitle: 'Định nghĩa',
                    list: [
                        '"FlowerCorner", "Chúng tôi", "Của chúng tôi" - Công ty TNHH FlowerCorner Việt Nam',
                        '"Người dùng", "Bạn", "Khách hàng" - Cá nhân hoặc tổ chức sử dụng dịch vụ',
                        '"Dịch vụ" - Website, ứng dụng và các dịch vụ liên quan của FlowerCorner',
                        '"Sản phẩm" - Hoa tươi, quà tặng và các mặt hàng bán trên website',
                    ]
                }
            ]
        },
        {
            id: 'tai-khoan',
            icon: CheckBadgeIcon,
            title: '2. Tài khoản người dùng',
            content: [
                {
                    subtitle: 'Đăng ký tài khoản',
                    text: 'Khi tạo tài khoản tại FlowerCorner, bạn cam kết:',
                    list: [
                        'Cung cấp thông tin chính xác, đầy đủ và cập nhật',
                        'Bảo mật thông tin đăng nhập của bạn',
                        'Chịu trách nhiệm về mọi hoạt động dưới tài khoản của bạn',
                        'Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép',
                    ]
                },
                {
                    subtitle: 'Điều kiện sử dụng',
                    list: [
                        'Bạn phải đủ 18 tuổi hoặc được sự đồng ý của phụ huynh',
                        'Mỗi người chỉ được sở hữu một tài khoản',
                        'Không được sử dụng tài khoản cho mục đích bất hợp pháp',
                        'Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản vi phạm',
                    ]
                }
            ]
        },
        {
            id: 'dat-hang',
            icon: ShoppingCartIcon,
            title: '3. Đặt hàng và xác nhận',
            content: [
                {
                    subtitle: 'Quy trình đặt hàng',
                    list: [
                        'Chọn sản phẩm và thêm vào giỏ hàng',
                        'Điền thông tin giao hàng đầy đủ và chính xác',
                        'Chọn phương thức thanh toán phù hợp',
                        'Xác nhận và hoàn tất đơn hàng',
                        'Nhận email/SMS xác nhận đơn hàng',
                    ]
                },
                {
                    subtitle: 'Xác nhận đơn hàng',
                    text: 'Đơn hàng chỉ được xem là hoàn tất khi bạn nhận được email xác nhận từ FlowerCorner. Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong các trường hợp:',
                    list: [
                        'Thông tin đặt hàng không chính xác hoặc không đầy đủ',
                        'Sản phẩm hết hàng hoặc không còn khả dụng',
                        'Nghi ngờ gian lận hoặc lạm dụng',
                        'Lỗi hệ thống về giá hoặc thông tin sản phẩm',
                    ]
                }
            ]
        },
        {
            id: 'thanh-toan',
            icon: CreditCardIcon,
            title: '4. Thanh toán',
            content: [
                {
                    subtitle: 'Phương thức thanh toán',
                    text: 'FlowerCorner chấp nhận các phương thức thanh toán sau:',
                    list: [
                        'Thanh toán khi nhận hàng (COD)',
                        'Chuyển khoản ngân hàng',
                        'Ví điện tử MoMo',
                        'Thanh toán qua VNPay (Thẻ ATM, Visa, Mastercard)',
                    ]
                },
                {
                    subtitle: 'Giá cả',
                    list: [
                        'Tất cả giá đã bao gồm thuế VAT',
                        'Phí vận chuyển được tính riêng tùy theo địa chỉ giao hàng',
                        'Giá có thể thay đổi mà không cần thông báo trước',
                        'Giá áp dụng là giá tại thời điểm đặt hàng',
                    ]
                },
                {
                    subtitle: 'Voucher và khuyến mãi',
                    list: [
                        'Mỗi đơn hàng chỉ áp dụng một mã giảm giá',
                        'Voucher có thời hạn sử dụng và điều kiện áp dụng riêng',
                        'FlowerCorner có quyền thay đổi hoặc hủy chương trình khuyến mãi',
                    ]
                }
            ]
        },
        {
            id: 'van-chuyen',
            icon: TruckIcon,
            title: '5. Giao hàng',
            content: [
                {
                    subtitle: 'Thời gian giao hàng',
                    list: [
                        'Nội thành TP.HCM: 2-4 giờ',
                        'Ngoại thành TP.HCM: 4-6 giờ',
                        'Các tỉnh thành khác: 1-3 ngày làm việc',
                        'Giao hàng theo khung giờ yêu cầu (nếu có)',
                    ]
                },
                {
                    subtitle: 'Lưu ý quan trọng',
                    list: [
                        'Vui lòng cung cấp số điện thoại người nhận chính xác',
                        'FlowerCorner không chịu trách nhiệm nếu địa chỉ sai',
                        'Trong trường hợp người nhận không có mặt, chúng tôi sẽ liên hệ lại',
                        'Hoa tươi được đảm bảo chất lượng tại thời điểm giao hàng',
                    ]
                }
            ]
        },
        {
            id: 'doi-tra',
            icon: ArrowPathIcon,
            title: '6. Đổi trả và hoàn tiền',
            content: [
                {
                    subtitle: 'Điều kiện đổi trả',
                    text: 'FlowerCorner chấp nhận đổi trả trong các trường hợp:',
                    list: [
                        'Sản phẩm giao không đúng như đơn đặt hàng',
                        'Sản phẩm bị hư hỏng trong quá trình vận chuyển',
                        'Chất lượng hoa không đạt yêu cầu',
                    ]
                },
                {
                    subtitle: 'Quy trình đổi trả',
                    list: [
                        'Liên hệ hotline trong vòng 2 giờ sau khi nhận hàng',
                        'Cung cấp hình ảnh sản phẩm và hóa đơn',
                        'Chờ xác nhận từ bộ phận CSKH',
                        'Nhận sản phẩm thay thế hoặc hoàn tiền',
                    ]
                },
                {
                    subtitle: 'Không áp dụng đổi trả',
                    list: [
                        'Thay đổi ý định mua hàng',
                        'Sản phẩm đã sử dụng hoặc làm hư hỏng',
                        'Quá thời hạn khiếu nại 2 giờ',
                    ]
                }
            ]
        },
        {
            id: 'so-huu-tri-tue',
            icon: ScaleIcon,
            title: '7. Sở hữu trí tuệ',
            content: [
                {
                    text: 'Tất cả nội dung trên website FlowerCorner.vn, bao gồm nhưng không giới hạn:',
                    list: [
                        'Logo, thương hiệu và nhãn hiệu',
                        'Hình ảnh sản phẩm',
                        'Nội dung text, bài viết',
                        'Thiết kế giao diện website',
                        'Phần mềm và mã nguồn',
                    ]
                },
                {
                    text: 'Đều thuộc sở hữu của FlowerCorner hoặc được cấp phép sử dụng. Nghiêm cấm sao chép, sử dụng lại mà không có sự đồng ý bằng văn bản.'
                }
            ]
        },
        {
            id: 'gioi-han',
            icon: ExclamationTriangleIcon,
            title: '8. Giới hạn trách nhiệm',
            content: [
                {
                    text: 'FlowerCorner không chịu trách nhiệm về:',
                    list: [
                        'Thiệt hại gián tiếp hoặc do sự cố ngoài tầm kiểm soát',
                        'Gián đoạn dịch vụ do bảo trì hoặc nâng cấp hệ thống',
                        'Nội dung của bên thứ ba liên kết trên website',
                        'Thiệt hại do virus hoặc mã độc từ nguồn ngoài',
                        'Sai sót thông tin do người dùng cung cấp',
                    ]
                },
                {
                    text: 'Trong mọi trường hợp, trách nhiệm bồi thường của FlowerCorner không vượt quá giá trị đơn hàng liên quan.'
                }
            ]
        },
        {
            id: 'thay-doi',
            icon: ChatBubbleLeftRightIcon,
            title: '9. Thay đổi điều khoản',
            content: [
                {
                    text: 'FlowerCorner có quyền sửa đổi các Điều khoản này bất cứ lúc nào. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc chấp nhận các điều khoản mới.'
                },
                {
                    text: 'Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc thông báo trên website. Các tranh chấp phát sinh sẽ được giải quyết theo pháp luật Việt Nam.'
                }
            ]
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Điều khoản sử dụng' }]} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
                            <ScaleIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Điều Khoản Sử Dụng
                        </h1>
                        <p className="text-lg text-purple-100 leading-relaxed">
                            Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ của FlowerCorner. 
                            Việc sử dụng website đồng nghĩa với việc bạn đồng ý tuân thủ các điều khoản dưới đây.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-purple-200 text-sm">
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>Cập nhật lần cuối: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-8 bg-white border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">9</div>
                            <div className="text-gray-500 text-sm">Điều khoản chính</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">24/7</div>
                            <div className="text-gray-500 text-sm">Hỗ trợ khách hàng</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">100%</div>
                            <div className="text-gray-500 text-sm">Bảo vệ quyền lợi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">2h</div>
                            <div className="text-gray-500 text-sm">Thời gian khiếu nại</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="py-6 bg-gray-50 sticky top-0 z-20 border-b border-gray-200 shadow-sm">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-2">
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 border border-transparent hover:border-indigo-200"
                            >
                                {section.title.split('. ')[1]}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        {/* Important Notice */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 mb-12 border border-amber-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Lưu ý quan trọng</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Bằng việc sử dụng website FlowerCorner.vn, bạn xác nhận đã đọc, hiểu và đồng ý 
                                        với tất cả các điều khoản được nêu trong tài liệu này. Nếu bạn có bất kỳ 
                                        thắc mắc nào, vui lòng liên hệ với chúng tôi trước khi sử dụng dịch vụ.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Terms Sections */}
                        <div className="space-y-6">
                            {sections.map((section, index) => {
                                const Icon = section.icon;
                                return (
                                    <div 
                                        key={section.id} 
                                        id={section.id}
                                        className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden scroll-mt-40"
                                    >
                                        {/* Section Header */}
                                        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-8 py-5 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {section.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Section Content */}
                                        <div className="px-8 py-6 space-y-5">
                                            {section.content.map((item, idx) => (
                                                <div key={idx}>
                                                    {item.subtitle && (
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                                            {item.subtitle}
                                                        </h3>
                                                    )}
                                                    {item.text && (
                                                        <p className="text-gray-600 leading-relaxed mb-4">
                                                            {item.text}
                                                        </p>
                                                    )}
                                                    {item.list && (
                                                        <ul className="space-y-2 ml-4">
                                                            {item.list.map((listItem, listIdx) => (
                                                                <li key={listIdx} className="flex items-start gap-3">
                                                                    <span className="w-5 h-5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                                                    </span>
                                                                    <span className="text-gray-600">{listItem}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Acceptance Section */}
                        <div className="mt-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white">
                            <div className="text-center mb-6">
                                <CheckBadgeIcon className="w-16 h-16 mx-auto mb-4 opacity-90" />
                                <h2 className="text-2xl font-bold mb-2">Chấp nhận điều khoản</h2>
                                <p className="text-indigo-100 max-w-2xl mx-auto">
                                    Bằng việc tiếp tục sử dụng dịch vụ, bạn xác nhận đã đọc và đồng ý với 
                                    tất cả các điều khoản trên. FlowerCorner cam kết bảo vệ quyền lợi của bạn.
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link 
                                    to="/shop"
                                    className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    Mua sắm ngay
                                </Link>
                                <Link 
                                    to="/chinh-sach-bao-mat"
                                    className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </div>
                        </div>

                        {/* Contact & Back to Top */}
                        <div className="mt-12 text-center">
                            <p className="text-gray-500 mb-4">
                                Có thắc mắc về điều khoản? Liên hệ hotline: 
                                <span className="text-indigo-600 font-semibold"> 1900 633 045</span>
                            </p>
                            <button 
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200"
                            >
                                ↑ Về đầu trang
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsOfServicePage;

import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    ShieldCheckIcon,
    LockClosedIcon,
    EyeSlashIcon,
    ServerIcon,
    UserGroupIcon,
    DocumentTextIcon,
    PhoneIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';

const PrivacyPolicyPage = () => {
    const lastUpdated = '20/01/2026';

    const sections = [
        {
            id: 'thu-thap',
            icon: DocumentTextIcon,
            title: '1. Thu thập thông tin',
            content: [
                {
                    subtitle: 'Thông tin cá nhân',
                    text: 'Khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi, chúng tôi có thể thu thập các thông tin sau:',
                    list: [
                        'Họ và tên đầy đủ',
                        'Địa chỉ email',
                        'Số điện thoại liên lạc',
                        'Địa chỉ giao hàng',
                        'Thông tin thanh toán (được mã hóa và bảo mật)',
                    ]
                },
                {
                    subtitle: 'Thông tin tự động',
                    text: 'Khi bạn truy cập website, chúng tôi tự động thu thập một số thông tin kỹ thuật:',
                    list: [
                        'Địa chỉ IP',
                        'Loại trình duyệt và thiết bị',
                        'Thời gian truy cập',
                        'Các trang đã xem',
                        'Cookies và dữ liệu phiên làm việc',
                    ]
                }
            ]
        },
        {
            id: 'su-dung',
            icon: ServerIcon,
            title: '2. Sử dụng thông tin',
            content: [
                {
                    text: 'Thông tin thu thập được sử dụng cho các mục đích sau:',
                    list: [
                        'Xử lý và giao hàng đơn đặt hoa của bạn',
                        'Gửi thông báo về tình trạng đơn hàng',
                        'Cung cấp hỗ trợ khách hàng',
                        'Gửi thông tin khuyến mãi và ưu đãi (nếu bạn đồng ý)',
                        'Cải thiện chất lượng dịch vụ và trải nghiệm người dùng',
                        'Phân tích xu hướng và hành vi người dùng để tối ưu website',
                        'Ngăn chặn gian lận và bảo vệ tài khoản người dùng',
                    ]
                }
            ]
        },
        {
            id: 'bao-ve',
            icon: ShieldCheckIcon,
            title: '3. Bảo vệ thông tin',
            content: [
                {
                    text: 'FlowerCorner cam kết bảo vệ thông tin của bạn với các biện pháp bảo mật tiên tiến:',
                    list: [
                        'Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải',
                        'Mã hóa thông tin thanh toán theo chuẩn PCI-DSS',
                        'Hệ thống tường lửa và giám sát 24/7',
                        'Kiểm tra bảo mật định kỳ',
                        'Giới hạn quyền truy cập dữ liệu cho nhân viên',
                        'Đào tạo nhân viên về bảo mật thông tin',
                    ]
                }
            ]
        },
        {
            id: 'chia-se',
            icon: UserGroupIcon,
            title: '4. Chia sẻ thông tin',
            content: [
                {
                    text: 'Chúng tôi cam kết KHÔNG bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ các trường hợp sau:',
                    list: [
                        'Đối tác vận chuyển (chỉ địa chỉ giao hàng)',
                        'Cổng thanh toán (thông tin được mã hóa)',
                        'Khi có yêu cầu từ cơ quan pháp luật',
                        'Để bảo vệ quyền lợi hợp pháp của FlowerCorner',
                        'Với sự đồng ý rõ ràng của bạn',
                    ]
                }
            ]
        },
        {
            id: 'cookies',
            icon: EyeSlashIcon,
            title: '5. Cookies và công nghệ theo dõi',
            content: [
                {
                    subtitle: 'Cookies là gì?',
                    text: 'Cookies là các tập tin nhỏ được lưu trữ trên thiết bị của bạn khi truy cập website. Chúng giúp cải thiện trải nghiệm người dùng.'
                },
                {
                    subtitle: 'Chúng tôi sử dụng cookies để:',
                    list: [
                        'Ghi nhớ thông tin đăng nhập',
                        'Lưu giỏ hàng của bạn',
                        'Phân tích lượt truy cập (Google Analytics)',
                        'Hiển thị quảng cáo phù hợp',
                        'Cải thiện hiệu suất website',
                    ]
                },
                {
                    subtitle: 'Quản lý cookies',
                    text: 'Bạn có thể tắt cookies trong cài đặt trình duyệt. Tuy nhiên, một số tính năng của website có thể không hoạt động đầy đủ.'
                }
            ]
        },
        {
            id: 'quyen',
            icon: LockClosedIcon,
            title: '6. Quyền của bạn',
            content: [
                {
                    text: 'Theo quy định pháp luật, bạn có các quyền sau đối với dữ liệu cá nhân:',
                    list: [
                        'Quyền truy cập: Xem thông tin cá nhân chúng tôi lưu trữ',
                        'Quyền chỉnh sửa: Yêu cầu sửa đổi thông tin không chính xác',
                        'Quyền xóa: Yêu cầu xóa dữ liệu cá nhân',
                        'Quyền hạn chế xử lý: Yêu cầu giới hạn việc sử dụng dữ liệu',
                        'Quyền phản đối: Từ chối nhận email marketing',
                        'Quyền di chuyển dữ liệu: Nhận bản sao dữ liệu của bạn',
                    ]
                },
                {
                    text: 'Để thực hiện các quyền trên, vui lòng liên hệ với chúng tôi qua email hoặc hotline.'
                }
            ]
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Chính sách bảo mật' }]} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
                            <ShieldCheckIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Chính Sách Bảo Mật
                        </h1>
                        <p className="text-lg text-pink-100 leading-relaxed">
                            FlowerCorner cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                            Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-pink-200 text-sm">
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>Cập nhật lần cuối: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Navigation */}
            <section className="py-8 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-3">
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-200"
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
                        {/* Introduction Card */}
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 mb-12 border border-pink-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <LockClosedIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cam kết của chúng tôi</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Tại FlowerCorner, chúng tôi hiểu rằng sự tin tưởng của bạn là vô giá. 
                                        Chúng tôi cam kết tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo 
                                        Luật An ninh mạng Việt Nam và các tiêu chuẩn quốc tế.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Policy Sections */}
                        <div className="space-y-8">
                            {sections.map((section, index) => {
                                const Icon = section.icon;
                                return (
                                    <div 
                                        key={section.id} 
                                        id={section.id}
                                        className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden scroll-mt-32"
                                    >
                                        {/* Section Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-pink-500" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {section.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Section Content */}
                                        <div className="px-8 py-6 space-y-6">
                                            {section.content.map((item, idx) => (
                                                <div key={idx}>
                                                    {item.subtitle && (
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                                            {item.subtitle}
                                                        </h3>
                                                    )}
                                                    {item.text && (
                                                        <p className="text-gray-600 leading-relaxed mb-4">
                                                            {item.text}
                                                        </p>
                                                    )}
                                                    {item.list && (
                                                        <ul className="space-y-2">
                                                            {item.list.map((listItem, listIdx) => (
                                                                <li key={listIdx} className="flex items-start gap-3">
                                                                    <span className="w-2 h-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mt-2 flex-shrink-0"></span>
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

                        {/* Contact Section */}
                        <div className="mt-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">Liên hệ về bảo mật</h2>
                                <p className="text-pink-100">
                                    Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật hoặc muốn thực hiện quyền của mình, 
                                    vui lòng liên hệ với chúng tôi.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <PhoneIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-pink-100 text-sm">Hotline</div>
                                        <div className="text-xl font-bold">1900 633 045</div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <EnvelopeIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-pink-100 text-sm">Email</div>
                                        <div className="text-xl font-bold">privacy@flowercorner.vn</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back to Top & Other Links */}
                        <div className="mt-12 flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                ↑ Về đầu trang
                            </button>
                            <Link 
                                to="/terms"
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Điều khoản sử dụng →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;

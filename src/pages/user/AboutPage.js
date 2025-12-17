import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    HeartIcon,
    SparklesIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

const AboutPage = () => {
    const stats = [
        { number: '10+', label: 'Năm kinh nghiệm' },
        { number: '50K+', label: 'Khách hàng hài lòng' },
        { number: '500+', label: 'Mẫu hoa độc quyền' },
        { number: '24/7', label: 'Hỗ trợ khách hàng' },
    ];

    const values = [
        {
            icon: HeartIcon,
            title: 'Tâm Huyết',
            description: 'Mỗi bó hoa được tạo ra với tất cả tình yêu và sự tận tâm của đội ngũ florist chuyên nghiệp.',
        },
        {
            icon: SparklesIcon,
            title: 'Chất Lượng',
            description: 'Chúng tôi chỉ sử dụng những bông hoa tươi nhất, được tuyển chọn kỹ lưỡng mỗi ngày.',
        },
        {
            icon: TruckIcon,
            title: 'Giao Hàng Nhanh',
            description: 'Cam kết giao hàng trong 2 giờ nội thành, đảm bảo hoa luôn tươi mới khi đến tay bạn.',
        },
        {
            icon: UserGroupIcon,
            title: 'Tận Tình',
            description: 'Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ bạn 24/7, giải đáp mọi thắc mắc.',
        },
    ];

    const team = [
        { name: 'Nguyễn Văn A', role: 'Founder & CEO', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { name: 'Trần Thị B', role: 'Head Florist', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { name: 'Lê Văn C', role: 'Creative Director', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
        { name: 'Phạm Thị D', role: 'Customer Care Lead', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
    ];

    return (
        <div className="bg-white">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Về chúng tôi' }]} />
                </div>
            </div>

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-white py-20 overflow-hidden">
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-6">
                            🌸 Về FlowerCorner
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                            Mang <span className="text-gradient">Vẻ Đẹp Hoa Tươi</span> Đến Mọi Khoảnh Khắc
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            FlowerCorner được thành lập với sứ mệnh mang đến những bó hoa tươi đẹp nhất,
                            giúp bạn gửi gắm yêu thương và truyền tải thông điệp trong mọi dịp đặc biệt của cuộc sống.
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 text-6xl opacity-20">🌷</div>
                <div className="absolute bottom-10 right-10 w-20 h-20 text-6xl opacity-20">🌺</div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-gradient-to-r from-pink-500 to-rose-500">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center text-white">
                                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                                <div className="text-pink-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
                                Câu Chuyện Của Chúng Tôi
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Khởi đầu từ một cửa hàng hoa nhỏ tại Quận 1, TP.HCM vào năm 2013,
                                    FlowerCorner được sinh ra từ niềm đam mê vô tận với vẻ đẹp của hoa tươi
                                    và khát khao mang đến niềm vui cho mọi người.
                                </p>
                                <p>
                                    Qua hơn 10 năm phát triển, chúng tôi tự hào đã phục vụ hơn 50,000 khách hàng,
                                    từ những bó hoa sinh nhật ấm áp đến những lẵng hoa khai trương hoành tráng.
                                </p>
                                <p>
                                    Mỗi sản phẩm tại FlowerCorner đều được thiết kế với sự tỉ mỉ, sáng tạo
                                    và tâm huyết, phản ánh phong cách hiện đại nhưng vẫn giữ nguyên vẻ đẹp
                                    tự nhiên của hoa.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                                alt="Our Story"
                                className="rounded-2xl shadow-xl"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                                <div className="text-4xl font-bold text-pink-500">2013</div>
                                <div className="text-gray-600">Năm thành lập</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                            Giá Trị Cốt Lõi
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Những giá trị định hướng mọi hoạt động của FlowerCorner
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lg transition-shadow duration-300 text-center"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Icon className="h-8 w-8 text-pink-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                            Đội Ngũ Của Chúng Tôi
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Những con người đam mê và tận tâm tạo nên FlowerCorner
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-4 overflow-hidden rounded-2xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-pink-500">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-pink-500 to-rose-500">
                <div className="container-custom text-center text-white">
                    <h2 className="text-3xl font-display font-bold mb-4">
                        Sẵn sàng trải nghiệm FlowerCorner?
                    </h2>
                    <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
                        Khám phá bộ sưu tập hoa tươi đa dạng và đặt hàng ngay hôm nay!
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-pink-600 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                        Khám Phá Ngay
                        <span>→</span>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;

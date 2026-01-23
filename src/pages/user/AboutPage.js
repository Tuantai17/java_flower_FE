import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    HeartIcon,
    SparklesIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

// Import team images
import avatarTai from '../../assets/images/about/anh-avatar-fb-8.jpg';
import avatarVy from '../../assets/images/about/avatar_nu.jpg';
import storeImage from '../../assets/images/about/gioithieuhoa.jpg';

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
        { 
            name: 'Nguyễn Tuấn Tài', 
            role: 'Co-Founder & Developer', 
            image: avatarTai,
            description: 'Chịu trách nhiệm phát triển hệ thống và đảm bảo trải nghiệm người dùng tốt nhất.',
            social: { facebook: '#', linkedin: '#', email: 'tai@flowercorner.vn' }
        },
        { 
            name: 'Nguyễn Quỳnh Thảo Vy', 
            role: 'Co-Founder & Developer', 
            image: avatarVy,
            description: 'Sáng tạo và thiết kế những mẫu hoa độc đáo, mang đến vẻ đẹp tinh tế.',
            social: { facebook: '#', linkedin: '#', email: 'vy@flowercorner.vn' }
        },
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

            {/* Giới thiệu về FlowerCorner */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                            Giới thiệu về <span className="text-gradient">FlowerCorner.vn</span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-10">
                            FlowerCorner.vn là shop hoa tươi uy tín hàng đầu tại Việt Nam. FlowerCorner.vn cung cấp dịch vụ 
                            <span className="text-pink-500 font-medium"> đặt hoa online giao tận nơi trên toàn quốc</span>. 
                            Với hệ thống cửa hàng liên kết trải rộng trên khắp 63 tỉnh - thành phố tại Việt Nam, 
                            shop hoa tươi FlowerCorner.vn có thể giúp bạn dễ dàng gửi hoa cho người thân, bạn bè, 
                            đối tác kinh doanh ở bất cứ đâu và bất cứ khi nào.
                        </p>
                    </div>
                    
                    {/* Shop Image */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                        <img
                            src={storeImage}
                            alt="FlowerCorner Store"
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        

                    </div>
                </div>
            </section>

            {/* Lịch sử hình thành và phát triển */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                            <span className="text-pink-500 font-semibold uppercase tracking-wide text-sm">Về Chúng Tôi</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">
                            Lịch sử hình thành và phát triển
                        </h2>
                        
                        <div className="space-y-6 text-gray-600 leading-relaxed">
                            <p className="text-lg">
                                FlowerCorner được thành lập và chính thức đi vào hoạt động từ năm <span className="text-pink-500 font-bold">2017</span>. 
                                Bắt đầu với mô hình shop hoa tươi online, hiện tại FlowerCorner.vn đã có <span className="font-semibold">2 chi nhánh</span> cửa hàng 
                                tại <span className="font-semibold">TP.HCM và Hà Nội</span>. Trong tương lai, FlowerCorner.vn sẽ tiếp tục mở rộng mạng lưới chi nhánh 
                                tại các tỉnh - thành phố tại Việt Nam để giúp khách hàng có thể dễ dàng gửi tặng hoa tới người thân, đối tác ở Việt Nam.
                            </p>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-pink-500">
                                <p className="text-gray-700">
                                    Sau hơn <span className="text-pink-500 font-bold">5 năm hoạt động</span>, từ một shop hoa nhỏ chỉ hoạt động online, 
                                    FlowerCorner.vn đã trở thành một trong những Công ty cung cấp dịch vụ điện hoa, đặt hoa tươi online hàng đầu 
                                    tại thị trường Việt Nam, và giúp hơn <span className="text-pink-500 font-bold">50.000 khách hàng</span> gửi tặng hoa 
                                    cho những người thân yêu vào những dịp đặc biệt.
                                </p>
                            </div>
                        </div>
                        
                        {/* Timeline */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                                <div className="text-4xl font-bold text-gradient mb-2">2017</div>
                                <div className="text-gray-600">Năm thành lập</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                                <div className="text-4xl font-bold text-gradient mb-2">2</div>
                                <div className="text-gray-600">Chi nhánh cửa hàng</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                                <div className="text-4xl font-bold text-gradient mb-2">50K+</div>
                                <div className="text-gray-600">Khách hàng tin tưởng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tầm nhìn và sứ mệnh */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                            <span className="text-pink-500 font-semibold uppercase tracking-wide text-sm">Định hướng</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">
                            Tầm nhìn và sứ mệnh
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Tầm nhìn */}
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-3xl border border-pink-100">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Tầm nhìn</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    FlowerCorner.vn hướng tới mục tiêu trở thành một trong 
                                    <span className="text-pink-500 font-semibold"> 3 Công ty hàng đầu tại Việt Nam</span> trong lĩnh vực hoa tươi, 
                                    đặt hoa online, và trở thành một lựa chọn đáng tin cậy của người Việt Nam mỗi khi cần gửi hoa 
                                    cho người thân trong những dịp đặc biệt.
                                </p>
                            </div>
                            
                            {/* Sứ mệnh */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl border border-purple-100">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="text-2xl">💝</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Sứ mệnh</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    FlowerCorner.vn theo đuổi là phát triển bền vững, luôn hướng tới khách hàng và mang lại 
                                    <span className="text-purple-500 font-semibold"> những giá trị tốt nhất</span> cho khách hàng khi lựa chọn FlowerCorner.vn.
                                </p>
                            </div>
                        </div>
                        
                        {/* Giá trị cốt lõi */}
                        <div className="mt-10 bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-3xl text-white">
                            <h3 className="text-xl font-bold mb-4">💐 Cam kết của chúng tôi</h3>
                            <p className="leading-relaxed opacity-95">
                                FlowerCorner.vn hiểu rằng, hoa tươi không đơn thuần chỉ là một món quà tặng, 
                                mà còn chứa đựng những thông điệp, tình cảm của người gửi tới người thân, bạn bè của họ. 
                                Chính vì thế, FlowerCorner.vn luôn nỗ lực không ngừng để cải thiện chất lượng dịch vụ và sản phẩm 
                                để mang đến cho khách hàng những trải nghiệm tốt nhất khi sử dụng dịch vụ đặt hoa online giao tận nơi của FlowerCorner.
                            </p>
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
            <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
                            💼 Đội Ngũ Sáng Lập
                        </span>
                        <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                            Gặp Gỡ Chúng Tôi
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Những người trẻ đam mê công nghệ và yêu thích vẻ đẹp của hoa tươi
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
                        {team.map((member, index) => (
                            <div 
                                key={index} 
                                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden w-full sm:w-80 lg:w-96"
                            >
                                {/* Card Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Image Container */}
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                                    
                                    {/* Name & Role on Image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                                        <p className="text-pink-300 font-medium">{member.role}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative p-6">
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {member.description}
                                    </p>
                                    
                                    {/* Social Links */}
                                    <div className="flex items-center gap-4">
                                        <a 
                                            href={member.social.facebook} 
                                            className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center text-pink-500 hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300"
                                            title="Facebook"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                                            </svg>
                                        </a>
                                        <a 
                                            href={member.social.linkedin} 
                                            className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center text-pink-500 hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300"
                                            title="LinkedIn"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/>
                                            </svg>
                                        </a>
                                        <a 
                                            href={`mailto:${member.social.email}`}
                                            className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center text-pink-500 hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300"
                                            title="Email"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                {/* Decorative Element */}
                                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
                            </div>
                        ))}
                    </div>

                    {/* Team Quote */}
                    <div className="mt-16 text-center">
                        <div className="inline-block bg-white rounded-2xl shadow-lg px-8 py-6 max-w-2xl">
                            <p className="text-gray-600 italic text-lg">
                                "Chúng tôi tin rằng mỗi bông hoa đều mang một thông điệp đặc biệt, 
                                và sứ mệnh của chúng tôi là giúp bạn truyền tải thông điệp đó một cách hoàn hảo nhất."
                            </p>
                            <div className="mt-4 text-pink-500 font-semibold">— Đội ngũ FlowerCorner</div>
                        </div>
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

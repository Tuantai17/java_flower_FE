import React, { useState } from 'react';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

        // Reset after 3 seconds
        setTimeout(() => setSubmitted(false), 3000);
    };

    const contactInfo = [
        {
            icon: PhoneIcon,
            title: 'Hotline',
            details: ['1900 633 045', '0865 160 360'],
            action: 'tel:1900633045',
        },
        {
            icon: EnvelopeIcon,
            title: 'Email',
            details: ['contact@flowercorner.vn', 'support@flowercorner.vn'],
            action: 'mailto:contact@flowercorner.vn',
        },
        {
            icon: MapPinIcon,
            title: 'Địa chỉ',
            details: ['123 Nguyễn Huệ, P. Bến Nghé', 'Quận 1, TP. Hồ Chí Minh'],
            action: '#',
        },
        {
            icon: ClockIcon,
            title: 'Giờ làm việc',
            details: ['Thứ 2 - Chủ Nhật', '7:00 - 22:00'],
            action: '#',
        },
    ];

    return (
        <div className="bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Liên hệ' }]} />
                </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-16">
                <div className="container-custom text-center text-white">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Liên Hệ Với Chúng Tôi
                    </h1>
                    <p className="text-pink-100 max-w-2xl mx-auto">
                        Bạn có câu hỏi hoặc cần tư vấn? Đội ngũ FlowerCorner luôn sẵn sàng hỗ trợ bạn!
                    </p>
                </div>
            </div>

            <div className="container-custom py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                            Thông Tin Liên Hệ
                        </h2>

                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <a
                                    key={index}
                                    href={info.action}
                                    className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow duration-300 group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-pink-500 group-hover:to-rose-500 transition-all duration-300">
                                        <Icon className="h-6 w-6 text-pink-500 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                                        {info.details.map((detail, i) => (
                                            <p key={i} className="text-gray-600 text-sm">{detail}</p>
                                        ))}
                                    </div>
                                </a>
                            );
                        })}

                        {/* Social Media */}
                        <div className="pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
                            <div className="flex gap-3">
                                {['facebook', 'instagram', 'youtube', 'tiktok'].map((social) => (
                                    <a
                                        key={social}
                                        href={`https://${social}.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 transition-all duration-300 group"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">
                                            {social === 'facebook' && '📘'}
                                            {social === 'instagram' && '📸'}
                                            {social === 'youtube' && '📺'}
                                            {social === 'tiktok' && '🎵'}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-soft p-8">
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                                Gửi Tin Nhắn
                            </h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Cảm ơn bạn đã liên hệ!
                                    </h3>
                                    <p className="text-gray-600">
                                        Chúng tôi sẽ phản hồi sớm nhất có thể.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập họ và tên"
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="example@email.com"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="0123 456 789"
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chủ đề
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="input-field"
                                            >
                                                <option value="">Chọn chủ đề</option>
                                                <option value="order">Đặt hàng</option>
                                                <option value="support">Hỗ trợ</option>
                                                <option value="feedback">Góp ý</option>
                                                <option value="partnership">Hợp tác</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            placeholder="Nhập nội dung tin nhắn..."
                                            className="input-field resize-none"
                                        />
                                    </div>

                                    <button type="submit" className="btn-primary w-full md:w-auto">
                                        Gửi Tin Nhắn
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="mt-16">
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                        Bản Đồ
                    </h2>
                    <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-soft aspect-[16/6]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4469754868974!2d106.70232191526045!3d10.776879992321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f40bb9f1c1b%3A0x9e8c1c5f5c5c5c5c!2zMTIzIE5ndXnhu4VuIEh14buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="FlowerCorner Location"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;

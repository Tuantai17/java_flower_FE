import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import { createTicket } from '../../api/contactApi';
import uploadApi from '../../api/uploadApi';
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    CheckCircleIcon,
    TicketIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Map subject to category
            const categoryMap = {
                'order': 'ORDER',
                'support': 'SUPPORT',
                'feedback': 'FEEDBACK',
                'partnership': 'PARTNERSHIP',
                'other': 'OTHER',
                '': 'OTHER'
            };

            const requestData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                subject: formData.subject ? getCategoryDisplayName(formData.subject) : 'Liên hệ chung',
                category: categoryMap[formData.subject] || 'OTHER',
                message: formData.message,
                images: images.length > 0 ? images : null,
            };

            const response = await createTicket(requestData);

            if (response.success) {
                setTicketCode(response.data.ticketCode);
                setSubmitted(true);
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                setImages([]);
            } else {
                setError(response.message || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length + files.length > 5) {
            alert('Tối đa 5 ảnh');
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const result = await uploadApi.uploadProductImage(file);
                return uploadApi.extractUrl(result);
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            const validUrls = uploadedUrls.filter(url => url);
            setImages(prev => [...prev, ...validUrls]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Lỗi upload ảnh');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const getCategoryDisplayName = (value) => {
        const names = {
            'order': 'Đặt hàng',
            'support': 'Hỗ trợ',
            'feedback': 'Góp ý',
            'partnership': 'Hợp tác',
            'other': 'Khác'
        };
        return names[value] || 'Liên hệ chung';
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

                        {/* My Tickets Link */}
                        <Link
                            to="/my-tickets"
                            className="flex items-start gap-4 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <TicketIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Ticket của tôi</h3>
                                <p className="text-gray-600 text-sm">Xem lịch sử và theo dõi yêu cầu hỗ trợ</p>
                            </div>
                        </Link>

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
                                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircleIcon className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Cảm ơn bạn đã liên hệ!
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Chúng tôi sẽ phản hồi sớm nhất có thể.
                                    </p>
                                    {ticketCode && (
                                        <div className="bg-pink-50 rounded-xl p-4 inline-block">
                                            <p className="text-sm text-gray-600 mb-1">Mã ticket của bạn:</p>
                                            <p className="text-xl font-bold text-pink-600">{ticketCode}</p>
                                        </div>
                                    )}
                                    <div className="mt-6 space-x-4">
                                        <button
                                            onClick={() => {
                                                setSubmitted(false);
                                                setTicketCode('');
                                            }}
                                            className="btn-secondary"
                                        >
                                            Gửi yêu cầu khác
                                        </button>
                                        <Link to="/my-tickets" className="btn-primary">
                                            Xem ticket của tôi
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                            {error}
                                        </div>
                                    )}

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
                                            rows={4}
                                            placeholder="Nhập nội dung tin nhắn..."
                                            className="input-field resize-none"
                                        />
                                    </div>

                                    {/* Image Upload Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ảnh đính kèm (tối đa 5 ảnh)
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {/* Preview images */}
                                            {images.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {/* Add image button */}
                                            {images.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-pink-400 hover:text-pink-500 transition-colors"
                                                >
                                                    {uploading ? (
                                                        <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <PhotoIcon className="h-6 w-6" />
                                                            <span className="text-xs mt-1">Thêm ảnh</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || uploading}
                                        className={`btn-primary w-full md:w-auto ${loading || uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang gửi...
                                            </span>
                                        ) : 'Gửi Tin Nhắn'}
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

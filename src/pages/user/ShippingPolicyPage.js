import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    TruckIcon,
    ClockIcon,
    MapPinIcon,
    ShieldCheckIcon,
    PhoneIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    RocketLaunchIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const ShippingPolicyPage = () => {
    const deliveryZones = [
        {
            zone: 'Nội thành TP.HCM',
            time: '2 - 4 giờ',
            fee: 'Miễn phí',
            feeNote: 'Đơn từ 500K',
            feeBelow: '25.000đ',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
            icon: RocketLaunchIcon,
            areas: ['Quận 1, 3, 5, 10, 11', 'Quận Bình Thạnh, Phú Nhuận', 'Quận Tân Bình, Gò Vấp', 'Quận 4, 7, 8'],
        },
        {
            zone: 'Ngoại thành TP.HCM',
            time: '4 - 6 giờ',
            fee: 'Miễn phí',
            feeNote: 'Đơn từ 700K',
            feeBelow: '35.000đ',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
            icon: TruckIcon,
            areas: ['Quận 12, TP. Thủ Đức, Bình Tân', 'Huyện Hóc Môn, Củ Chi', 'Huyện Bình Chánh, Nhà Bè', 'Huyện Cần Giờ'],
        },
    ];

    const shippingMethods = [
        {
            name: 'Giao hàng tiêu chuẩn',
            icon: TruckIcon,
            description: 'Giao hàng trong ngày với đội ngũ shipper chuyên nghiệp',
            features: ['Đóng gói cẩn thận', 'Bảo quản hoa tươi', 'Gọi điện trước khi giao'],
            color: 'from-pink-500 to-rose-500',
        },
        {
            name: 'Giao hàng nhanh',
            icon: RocketLaunchIcon,
            description: 'Giao trong vòng 2 giờ cho khách hàng cần gấp',
            features: ['Ưu tiên xử lý', 'Giao nhanh nhất có thể', 'Phụ phí: 30.000đ'],
            color: 'from-orange-500 to-red-500',
        },
        {
            name: 'Giao theo lịch hẹn',
            icon: CalendarDaysIcon,
            description: 'Đặt trước và chọn thời gian giao hàng mong muốn',
            features: ['Chọn ngày giờ cụ thể', 'Phù hợp dịp đặc biệt', 'Không phụ phí'],
            color: 'from-indigo-500 to-purple-500',
        },
    ];

    const guarantees = [
        {
            icon: '🌸',
            title: 'Hoa tươi 100%',
            description: 'Cam kết hoa tươi mới, được cắt trong ngày',
        },
        {
            icon: '📦',
            title: 'Đóng gói chuyên nghiệp',
            description: 'Hộp giữ nhiệt, bảo quản hoa trong điều kiện tốt nhất',
        },
        {
            icon: '🚚',
            title: 'Giao đúng giờ',
            description: 'Cam kết giao hàng đúng thời gian đã hẹn',
        },
        {
            icon: '💯',
            title: 'Đúng mẫu đặt hàng',
            description: 'Sản phẩm giao đúng với hình ảnh và mô tả',
        },
    ];

    const notes = [
        {
            title: 'Thông tin người nhận',
            content: 'Vui lòng cung cấp số điện thoại người nhận chính xác để shipper có thể liên lạc.',
            type: 'warning',
        },
        {
            title: 'Địa chỉ giao hàng',
            content: 'Địa chỉ cần ghi rõ số nhà, tên đường, phường/xã, quận/huyện để tránh giao nhầm.',
            type: 'info',
        },
        {
            title: 'Người nhận vắng mặt',
            content: 'Nếu người nhận không có mặt, shipper sẽ liên hệ và chờ tối đa 15 phút.',
            type: 'warning',
        },
        {
            title: 'Khu vực phục vụ',
            content: 'Hiện tại FlowerCorner chỉ phục vụ giao hàng trong khu vực TP. Hồ Chí Minh.',
            type: 'info',
        },
    ];

    // Chi tiết quận huyện TP.HCM
    const hcmDistricts = {
        inner: [
            { name: 'Quận 1', time: '2-3 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 3', time: '2-3 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 5', time: '2-3 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 10', time: '2-3 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 11', time: '2-3 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận Phú Nhuận', time: '2-3 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận Bình Thạnh', time: '2-4 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận Tân Bình', time: '2-4 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận Gò Vấp', time: '2-4 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 4', time: '2-4 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 7', time: '2-4 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
            { name: 'Quận 8', time: '3-4 giờ', fee: '25.000đ', freeFrom: '500.000đ' },
        ],
        outer: [
            { name: 'Quận 12', time: '4-5 giờ', fee: '35.000đ', freeFrom: '700.000đ' },
            { name: 'TP. Thủ Đức', time: '4-5 giờ', fee: '35.000đ', freeFrom: '700.000đ' },
            { name: 'Quận Bình Tân', time: '4-5 giờ', fee: '35.000đ', freeFrom: '700.000đ' },
            { name: 'Quận Tân Phú', time: '3-4 giờ', fee: '30.000đ', freeFrom: '700.000đ' },
            { name: 'Huyện Hóc Môn', time: '5-6 giờ', fee: '40.000đ', freeFrom: '700.000đ' },
            { name: 'Huyện Củ Chi', time: '5-6 giờ', fee: '45.000đ', freeFrom: '700.000đ' },
            { name: 'Huyện Bình Chánh', time: '5-6 giờ', fee: '40.000đ', freeFrom: '700.000đ' },
            { name: 'Huyện Nhà Bè', time: '5-6 giờ', fee: '40.000đ', freeFrom: '700.000đ' },
            { name: 'Huyện Cần Giờ', time: '1 ngày', fee: '60.000đ', freeFrom: '700.000đ' },
        ],
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Chính sách vận chuyển' }]} />
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 py-16 overflow-hidden">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
                            <TruckIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Chính Sách Vận Chuyển
                        </h1>
                        <p className="text-lg text-teal-100 leading-relaxed mb-8">
                            FlowerCorner cam kết giao hoa tươi đến tận nơi một cách nhanh chóng và an toàn. 
                            Chúng tôi phục vụ giao hàng trên toàn bộ khu vực <span className="font-bold text-white">TP. Hồ Chí Minh</span>.
                        </p>
                        
                        {/* Quick Features */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                                <ClockIcon className="w-5 h-5" />
                                <span>Giao nhanh 2-4h</span>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5" />
                                <span>Toàn TP.HCM</span>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5" />
                                <span>Đảm bảo chất lượng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delivery Zones - 2 Cards */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-2 bg-teal-100 text-teal-600 rounded-full text-sm font-medium mb-4">
                            🚚 Khu Vực Giao Hàng
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Thời Gian & Phí Vận Chuyển</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi cung cấp dịch vụ giao hàng nhanh chóng với mức phí hợp lý tại TP. Hồ Chí Minh
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {deliveryZones.map((zone, index) => {
                            const Icon = zone.icon;
                            return (
                                <div 
                                    key={index}
                                    className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                                >
                                    {/* Header */}
                                    <div className={`bg-gradient-to-r ${zone.color} p-8 text-white`}>
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">{zone.zone}</h3>
                                        <div className="flex items-center gap-2 text-white/90">
                                            <ClockIcon className="w-5 h-5" />
                                            <span className="text-lg">{zone.time}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        {/* Fee Info */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <div className="text-3xl font-bold text-green-600">{zone.fee}</div>
                                                    <div className="text-gray-500">{zone.feeNote}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Đơn dưới {zone.feeNote.replace('Đơn từ ', '')}</div>
                                                    <div className="text-xl font-bold text-gray-900">{zone.feeBelow}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Areas */}
                                        <h4 className="font-semibold text-gray-900 mb-3">Khu vực áp dụng:</h4>
                                        <div className="space-y-2">
                                            {zone.areas.map((area, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-gray-600">
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span>{area}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* TP.HCM Detailed Table */}
            <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="container-custom">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-4">
                                📍 Chi Tiết Từng Quận/Huyện
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bảng Phí Giao Hàng TP.HCM</h2>
                            <p className="text-gray-600">Chi tiết thời gian và phí vận chuyển cho từng quận/huyện</p>
                        </div>

                        {/* Nội thành */}
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <RocketLaunchIcon className="w-6 h-6" />
                                    Nội Thành TP.HCM - Miễn phí từ 500.000đ
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-green-50">
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quận/Huyện</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thời gian</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Phí vận chuyển</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Miễn phí từ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {hcmDistricts.inner.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-green-50/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 text-gray-600">
                                                        <ClockIcon className="w-4 h-4" />
                                                        {item.time}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="font-semibold text-gray-900">{item.fee}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-green-600 font-semibold">{item.freeFrom}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Ngoại thành */}
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <TruckIcon className="w-6 h-6" />
                                    Ngoại Thành TP.HCM - Miễn phí từ 700.000đ
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-blue-50">
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quận/Huyện</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Thời gian</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Phí vận chuyển</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Miễn phí từ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {hcmDistricts.outer.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 text-gray-600">
                                                        <ClockIcon className="w-4 h-4" />
                                                        {item.time}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="font-semibold text-gray-900">{item.fee}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-blue-600 font-semibold">{item.freeFrom}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                                <h4 className="font-bold text-lg mb-2">🏙️ Nội thành TP.HCM</h4>
                                <p className="text-green-100 mb-3">12 Quận nội thành</p>
                                <div className="text-2xl font-bold">Miễn phí từ 500.000đ</div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                                <h4 className="font-bold text-lg mb-2">🌆 Ngoại thành TP.HCM</h4>
                                <p className="text-blue-100 mb-3">9 Quận/Huyện ngoại thành</p>
                                <div className="text-2xl font-bold">Miễn phí từ 700.000đ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shipping Methods */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
                            📦 Phương Thức Giao Hàng
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Chọn Cách Giao Phù Hợp</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {shippingMethods.map((method, index) => {
                            const Icon = method.icon;
                            return (
                                <div 
                                    key={index}
                                    className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                                >
                                    <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-6`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{method.name}</h3>
                                    <p className="text-gray-600 mb-6">{method.description}</p>
                                    
                                    <ul className="space-y-2">
                                        {method.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className={`w-1.5 h-1.5 bg-gradient-to-r ${method.color} rounded-full`}></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Guarantees */}
            <section className="py-16 bg-gradient-to-r from-teal-500 to-cyan-500">
                <div className="container-custom">
                    <div className="text-center mb-12 text-white">
                        <h2 className="text-3xl font-bold mb-4">Cam Kết Của Chúng Tôi</h2>
                        <p className="text-teal-100">Mỗi đơn hàng đều được chúng tôi chăm sóc tận tâm</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {guarantees.map((item, index) => (
                            <div 
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white hover:bg-white/20 transition-all duration-300"
                            >
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="font-bold mb-2">{item.title}</h3>
                                <p className="text-teal-100 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Important Notes */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-600 rounded-full text-sm font-medium mb-4">
                                ⚠️ Lưu Ý Quan Trọng
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900">Thông Tin Cần Biết</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {notes.map((note, index) => (
                                <div 
                                    key={index}
                                    className={`rounded-2xl p-6 border-l-4 ${
                                        note.type === 'warning' 
                                            ? 'bg-amber-50 border-amber-500' 
                                            : 'bg-blue-50 border-blue-500'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            note.type === 'warning' 
                                                ? 'bg-amber-500' 
                                                : 'bg-blue-500'
                                        }`}>
                                            <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
                                            <p className="text-gray-600 text-sm">{note.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Notes */}
                        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Lưu ý về thời gian giao hàng</h4>
                                    <ul className="text-gray-600 text-sm space-y-1">
                                        <li>• Thời gian giao hàng tính từ lúc đơn hàng được xác nhận</li>
                                        <li>• Các ngày lễ, Tết có thể phát sinh phí phụ thu và thời gian giao lâu hơn</li>
                                        <li>• Đơn đặt sau 17h sẽ được giao vào ngày hôm sau</li>
                                        <li>• Giao hàng nhanh trong 2h phụ thu thêm 30.000đ</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-teal-500 to-cyan-500">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <TruckIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">Sẵn sàng đặt hoa tại TP.HCM?</h2>
                        <p className="text-teal-100 mb-8">
                            Đặt hàng ngay hôm nay và chúng tôi sẽ giao hoa tươi đến tận nơi!
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link 
                                to="/shop"
                                className="px-8 py-4 bg-white text-teal-600 font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Đặt hoa ngay
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

            {/* Related Links */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-gray-500 mb-4">Xem thêm các chính sách khác</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link 
                                to="/chinh-sach-doi-tra"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all duration-300"
                            >
                                Chính sách đổi trả →
                            </Link>
                            <Link 
                                to="/huong-dan-dat-hang"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all duration-300"
                            >
                                Hướng dẫn đặt hàng →
                            </Link>
                            <Link 
                                to="/cau-hoi-thuong-gap"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-teal-50 hover:text-teal-600 transition-all duration-300"
                            >
                                Câu hỏi thường gặp →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ShippingPolicyPage;

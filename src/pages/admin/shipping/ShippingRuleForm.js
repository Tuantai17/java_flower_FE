import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    TruckIcon,
    ArrowLeftIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import shippingRulesApi from '../../../api/shippingRulesApi';

/**
 * Form tạo/sửa Shipping Rule - Light Theme
 */
const ShippingRuleForm = ({ mode = 'create' }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = mode === 'edit';

    // State
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [zones, setZones] = useState([]);
    const [deliveryTypes, setDeliveryTypes] = useState([]);

    const [formData, setFormData] = useState({
        city: 'TPHCM',
        district: '',
        deliveryType: 'STANDARD',
        baseFee: '',
        peakFee: '',
        freeShipThreshold: '500000',
        estimatedTime: '2-4 giờ',
        holidayMultiplier: '1.0',
        zone: 'INNER',
        active: true,
    });

    // Fetch options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [zonesData, typesData] = await Promise.all([
                    shippingRulesApi.getZones(),
                    shippingRulesApi.getDeliveryTypes(),
                ]);
                setZones(zonesData || []);
                setDeliveryTypes(typesData || []);
            } catch (err) {
                console.error('Error fetching options:', err);
            }
        };
        fetchOptions();
    }, []);

    // Fetch rule if editing
    useEffect(() => {
        if (isEdit && id) {
            fetchRule();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    const fetchRule = async () => {
        setLoading(true);
        try {
            const rule = await shippingRulesApi.getById(id);
            setFormData({
                city: rule.city || 'TPHCM',
                district: rule.district || '',
                deliveryType: rule.deliveryType || 'STANDARD',
                baseFee: rule.baseFee?.toString() || '',
                peakFee: rule.peakFee?.toString() || '',
                freeShipThreshold: rule.freeShipThreshold?.toString() || '500000',
                estimatedTime: rule.estimatedTime || '',
                holidayMultiplier: rule.holidayMultiplier?.toString() || '1.0',
                zone: rule.zone || 'INNER',
                active: rule.active ?? true,
            });
        } catch (err) {
            showNotification('error', 'Lỗi khi tải thông tin quy tắc');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.city.trim()) {
            newErrors.city = 'Vui lòng nhập thành phố';
        }
        if (!formData.district.trim()) {
            newErrors.district = 'Vui lòng nhập quận/huyện';
        }
        if (!formData.baseFee || parseFloat(formData.baseFee) < 0) {
            newErrors.baseFee = 'Phí cơ bản phải >= 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const submitData = {
                city: formData.city.trim(),
                district: formData.district.trim(),
                deliveryType: formData.deliveryType,
                baseFee: parseFloat(formData.baseFee) || 0,
                peakFee: parseFloat(formData.peakFee) || null,
                freeShipThreshold: parseFloat(formData.freeShipThreshold) || null,
                estimatedTime: formData.estimatedTime.trim() || null,
                holidayMultiplier: parseFloat(formData.holidayMultiplier) || null,
                zone: formData.zone,
                active: formData.active,
            };

            if (isEdit) {
                await shippingRulesApi.update(id, submitData);
                showNotification('success', 'Cập nhật quy tắc thành công!');
            } else {
                await shippingRulesApi.create(submitData);
                showNotification('success', 'Tạo quy tắc thành công!');
            }

            setTimeout(() => navigate('/admin/shipping-rules'), 1500);
        } catch (err) {
            showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    const zoneLabels = {
        INNER: 'Nội thành',
        OUTER: 'Ngoại thành',
        SUBURBAN: 'Vùng ven',
        REMOTE: 'Vùng xa',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Notification */}
            {notification.show && (
                <div className={`p-4 rounded-lg border ${
                    notification.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/shipping-rules')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                        <TruckIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {isEdit ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc mới'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEdit ? 'Cập nhật thông tin phí vận chuyển' : 'Thêm quận/huyện và phí vận chuyển'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-6 shadow-sm border border-gray-200">
                {/* City & District */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thành phố <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="VD: TPHCM"
                            className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 ${
                                errors.city ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quận/Huyện <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="VD: Quận 1"
                            className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 ${
                                errors.district ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                    </div>
                </div>

                {/* Zone & Delivery Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vùng giao hàng
                        </label>
                        <select
                            name="zone"
                            value={formData.zone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            {zones.length > 0 ? (
                                zones.map(zone => (
                                    <option key={zone} value={zone}>
                                        {zoneLabels[zone] || zone}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="INNER">Nội thành</option>
                                    <option value="OUTER">Ngoại thành</option>
                                    <option value="SUBURBAN">Vùng ven</option>
                                    <option value="REMOTE">Vùng xa</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại giao hàng
                        </label>
                        <select
                            name="deliveryType"
                            value={formData.deliveryType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            {deliveryTypes.length > 0 ? (
                                deliveryTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))
                            ) : (
                                <>
                                    <option value="STANDARD">STANDARD</option>
                                    <option value="EXPRESS">EXPRESS</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Fees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phí cơ bản (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="baseFee"
                            value={formData.baseFee}
                            onChange={handleChange}
                            placeholder="VD: 25000"
                            min="0"
                            step="1000"
                            className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 ${
                                errors.baseFee ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        {errors.baseFee && <p className="text-red-500 text-sm mt-1">{errors.baseFee}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phí giờ cao điểm (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="peakFee"
                            value={formData.peakFee}
                            onChange={handleChange}
                            placeholder="VD: 35000"
                            min="0"
                            step="1000"
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Miễn phí ship từ (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="freeShipThreshold"
                            value={formData.freeShipThreshold}
                            onChange={handleChange}
                            placeholder="VD: 500000"
                            min="0"
                            step="10000"
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Time & Multiplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thời gian giao ước tính
                        </label>
                        <input
                            type="text"
                            name="estimatedTime"
                            value={formData.estimatedTime}
                            onChange={handleChange}
                            placeholder="VD: 2-4 giờ"
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hệ số ngày lễ
                        </label>
                        <input
                            type="number"
                            name="holidayMultiplier"
                            value={formData.holidayMultiplier}
                            onChange={handleChange}
                            placeholder="VD: 1.5"
                            min="1"
                            step="0.1"
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-gray-500 text-xs mt-1">1.0 = bình thường, 1.5 = tăng 50%</p>
                    </div>
                </div>

                {/* Active */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        name="active"
                        id="active"
                        checked={formData.active}
                        onChange={handleChange}
                        className="w-5 h-5 border-gray-300 rounded text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-gray-700">
                        Kích hoạt (cho phép giao hàng đến khu vực này)
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/shipping-rules')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 shadow-md"
                    >
                        {submitting ? (
                            'Đang xử lý...'
                        ) : (
                            <>
                                <CheckIcon className="h-5 w-5" />
                                {isEdit ? 'Cập nhật' : 'Tạo mới'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShippingRuleForm;

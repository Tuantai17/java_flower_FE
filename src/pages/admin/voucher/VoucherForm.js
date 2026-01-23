import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    TicketIcon,
    ArrowLeftIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import voucherApi from '../../../api/voucherApi';
import Loading from '../../../components/common/Loading';

/**
 * VoucherForm Component
 * Dùng cho cả Create và Edit voucher
 */
const VoucherForm = ({ mode = 'create' }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        voucherType: 'ORDER', // ORDER: Giảm đơn hàng, SHIPPING: Giảm phí ship
        isPercent: true,
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
    });

    // Fetch voucher data if editing
    useEffect(() => {
        if (isEdit && id) {
            fetchVoucher();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    const fetchVoucher = async () => {
        setLoading(true);
        try {
            // Sử dụng getActiveVouchers vì getAllVouchers có thể không hoạt động đúng
            const vouchers = await voucherApi.getActiveVouchers();
            console.log('Fetched vouchers for edit:', vouchers);

            if (!Array.isArray(vouchers)) {
                throw new Error('Invalid response format');
            }

            const voucher = vouchers.find(v => v.id === parseInt(id));
            console.log('Found voucher:', voucher);

            if (voucher) {
                setFormData({
                    code: voucher.code || '',
                    description: voucher.description || '',
                    voucherType: voucher.voucherType || voucher.voucher_type || 'ORDER',
                    isPercent: voucher.isPercent ?? voucher.is_percent ?? true,
                    discountValue: voucher.discountValue ?? voucher.discount_value ?? '',
                    minOrderValue: voucher.minOrderValue ?? voucher.min_order_value ?? '',
                    maxDiscount: voucher.maxDiscount ?? voucher.max_discount ?? '',
                    usageLimit: voucher.usageLimit ?? voucher.usage_limit ?? '',
                    startDate: (voucher.startDate ?? voucher.start_date) ? (voucher.startDate ?? voucher.start_date).split('T')[0] : '',
                    endDate: (voucher.endDate ?? voucher.end_date) ? (voucher.endDate ?? voucher.end_date).split('T')[0] : '',
                });
            } else {
                showNotification('error', `Không tìm thấy voucher với ID: ${id}`);
            }
        } catch (err) {
            console.error('Error fetching voucher:', err);
            showNotification('error', 'Lỗi khi tải thông tin voucher: ' + err.message);
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
        // Clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Vui lòng nhập mã voucher';
        } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
            newErrors.code = 'Mã chỉ được chứa chữ cái và số';
        }

        if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
            newErrors.discountValue = 'Vui lòng nhập giá trị giảm hợp lệ';
        }

        if (formData.isPercent && parseFloat(formData.discountValue) > 100) {
            newErrors.discountValue = 'Phần trăm giảm không được quá 100%';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
        }

        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            // Format dates với time component cho Java LocalDateTime
            // Backend yêu cầu format: "2025-12-21T00:00:00"
            const formatStartDate = formData.startDate ? `${formData.startDate}T00:00:00` : null;
            const formatEndDate = formData.endDate ? `${formData.endDate}T23:59:59` : null;

            const submitData = {
                code: formData.code.toUpperCase().trim(),
                description: formData.description,
                voucherType: formData.voucherType,
                isPercent: formData.isPercent,
                discountValue: parseFloat(formData.discountValue),
                minOrderValue: parseFloat(formData.minOrderValue) || 0,
                maxDiscount: formData.isPercent ? parseFloat(formData.maxDiscount) || null : null,
                usageLimit: parseInt(formData.usageLimit) || null,
                startDate: formatStartDate,
                endDate: formatEndDate,
            };

            console.log('Submitting voucher data:', submitData);

            if (isEdit) {
                await voucherApi.updateVoucher(id, submitData);
                showNotification('success', 'Cập nhật voucher thành công!');
            } else {
                await voucherApi.createVoucher(submitData);
                showNotification('success', 'Tạo voucher thành công!');
            }

            setTimeout(() => navigate('/admin/vouchers'), 1500);
        } catch (err) {
            console.error('Submit error:', err);
            showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    if (loading) return <Loading text="Đang tải..." />;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Notification */}
            {notification.show && (
                <div className={`p-4 rounded-lg border ${notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/vouchers')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TicketIcon className="h-7 w-7 text-rose-500" />
                        {isEdit ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEdit ? 'Cập nhật thông tin mã giảm giá' : 'Thêm mã giảm giá mới vào hệ thống'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                {/* Code & Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã Voucher <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="VD: FLOWER20, WELCOME2024"
                            className={`input-field uppercase ${errors.code ? 'border-red-500' : ''}`}
                            disabled={isEdit}
                        />
                        {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        {isEdit && <p className="text-gray-400 text-xs mt-1">Không thể thay đổi mã voucher</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="VD: Giảm 20% cho đơn hàng từ 200k"
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Loại Voucher */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại voucher <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="voucherType"
                            value={formData.voucherType}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="ORDER">🛒 Giảm giá đơn hàng</option>
                            <option value="SHIPPING">🚚 Giảm phí vận chuyển</option>
                        </select>
                        <p className="text-gray-400 text-xs mt-1">
                            {formData.voucherType === 'ORDER' 
                                ? 'Voucher sẽ giảm tiền sản phẩm' 
                                : 'Voucher sẽ giảm phí vận chuyển'}
                        </p>
                    </div>
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại giảm giá
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isPercent"
                                    checked={formData.isPercent === true}
                                    onChange={() => setFormData(prev => ({ ...prev, isPercent: true }))}
                                    className="text-rose-500 focus:ring-rose-500"
                                />
                                <span>Phần trăm (%)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isPercent"
                                    checked={formData.isPercent === false}
                                    onChange={() => setFormData(prev => ({ ...prev, isPercent: false }))}
                                    className="text-rose-500 focus:ring-rose-500"
                                />
                                <span>Số tiền (VNĐ)</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá trị giảm <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                placeholder={formData.isPercent ? "VD: 20" : "VD: 50000"}
                                min="0"
                                step={formData.isPercent ? "1" : "1000"}
                                className={`input-field ${errors.discountValue ? 'border-red-500' : ''}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {formData.isPercent ? '%' : 'đ'}
                            </span>
                        </div>
                        {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>}
                    </div>

                    {formData.isPercent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giảm tối đa
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    placeholder="VD: 100000"
                                    min="0"
                                    step="1000"
                                    className="input-field"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Min Order & Usage Limit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đơn hàng tối thiểu
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                placeholder="VD: 200000"
                                min="0"
                                step="1000"
                                className="input-field"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới hạn lượt sử dụng
                        </label>
                        <input
                            type="number"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleChange}
                            placeholder="Không giới hạn nếu để trống"
                            min="0"
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                        />
                        {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
                        />
                        {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/vouchers')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                        {submitting ? (
                            'Đang xử lý...'
                        ) : (
                            <>
                                <CheckIcon className="h-5 w-5" />
                                {isEdit ? 'Cập nhật' : 'Tạo Voucher'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VoucherForm;

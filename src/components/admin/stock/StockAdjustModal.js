import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import stockApi, { STOCK_REASON_INFO } from '../../../api/stockApi';
import {
    PlusIcon,
    MinusIcon,
    ArchiveBoxIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Modal điều chỉnh tồn kho
 * Cho phép Admin nhập/xuất/điều chỉnh số lượng kho
 */
const StockAdjustModal = ({
    isOpen,
    onClose,
    product, // { id, name, thumbnail, stockQuantity }
    onSuccess
}) => {
    const [adjustType, setAdjustType] = useState('add'); // 'add' | 'subtract' | 'set'
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('ADMIN_ADJUST');
    const [note, setNote] = useState('');
    // Khởi tạo với danh sách mặc định để tránh array rỗng
    const [reasons, setReasons] = useState(() => Object.keys(STOCK_REASON_INFO));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load reasons khi modal mở
    useEffect(() => {
        if (isOpen) {
            loadReasons();
            resetForm();
        }
    }, [isOpen]);

    const loadReasons = async () => {
        // Sử dụng danh sách mặc định từ STOCK_REASON_INFO
        // Đảm bảo luôn là array of strings
        const defaultReasons = Object.keys(STOCK_REASON_INFO);

        try {
            const data = await stockApi.getReasons();

            // Kiểm tra và xử lý dữ liệu từ API
            if (Array.isArray(data) && data.length > 0) {
                const normalizedReasons = data.map((item, idx) => {
                    // Nếu item là string, giữ nguyên
                    if (typeof item === 'string') {
                        return item;
                    }
                    // Nếu item là object, lấy code hoặc name
                    if (typeof item === 'object' && item !== null) {
                        return item.code || item.name || `REASON_${idx}`;
                    }
                    // Fallback
                    return `REASON_${idx}`;
                });

                // Chỉ set nếu có dữ liệu valid
                if (normalizedReasons.length > 0 && normalizedReasons.every(r => typeof r === 'string')) {
                    setReasons(normalizedReasons);
                    return;
                }
            }

            // Fallback to default
            setReasons(defaultReasons);
        } catch (err) {
            console.warn('Error loading reasons, using defaults:', err);
            setReasons(defaultReasons);
        }
    };

    const resetForm = () => {
        setAdjustType('add');
        setQuantity('');
        setReason('ADMIN_ADJUST');
        setNote('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            setError('Vui lòng nhập số lượng hợp lệ (> 0)');
            return;
        }

        // Tính số lượng thay đổi dựa trên loại điều chỉnh
        let changeQuantity;
        if (adjustType === 'add') {
            changeQuantity = qty;
            // Nếu thêm và chưa chọn reason, mặc định là IMPORT
            if (reason === 'ADMIN_ADJUST') setReason('IMPORT');
        } else if (adjustType === 'subtract') {
            changeQuantity = -qty;
            // Kiểm tra không được trừ nhiều hơn số lượng hiện có
            if (qty > (product?.stockQuantity || 0)) {
                setError(`Không thể xuất ${qty} sản phẩm. Kho chỉ còn ${product?.stockQuantity || 0} sản phẩm.`);
                return;
            }
        } else {
            // Set: tính delta từ giá trị hiện tại
            changeQuantity = qty - (product?.stockQuantity || 0);
        }

        setLoading(true);
        try {
            await stockApi.adjustStock({
                productId: product.id,
                changeQuantity,
                reason: adjustType === 'add' ? (reason || 'IMPORT') : (reason || 'EXPORT'),
                note
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error adjusting stock:', err);
            const errorMessage = err.response?.data?.message
                || err.message
                || 'Không thể điều chỉnh tồn kho. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán số lượng mới sau điều chỉnh (để preview)
    const calcNewStock = () => {
        const qty = parseInt(quantity, 10) || 0;
        const current = product?.stockQuantity || 0;

        switch (adjustType) {
            case 'add':
                return current + qty;
            case 'subtract':
                return Math.max(0, current - qty);
            case 'set':
                return qty;
            default:
                return current;
        }
    };

    if (!product) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Điều chỉnh tồn kho"
            size="default"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {product.thumbnail ? (
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ArchiveBoxIcon className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">
                            Tồn kho hiện tại: <span className="font-bold text-gray-900">{product.stockQuantity}</span>
                        </p>
                    </div>
                </div>

                {/* Adjust Type Tabs */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setAdjustType('add')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${adjustType === 'add'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <PlusIcon className="w-5 h-5" />
                        Nhập kho
                    </button>
                    <button
                        type="button"
                        onClick={() => setAdjustType('subtract')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${adjustType === 'subtract'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <MinusIcon className="w-5 h-5" />
                        Xuất kho
                    </button>
                    <button
                        type="button"
                        onClick={() => setAdjustType('set')}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${adjustType === 'set'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <ArchiveBoxIcon className="w-5 h-5" />
                        Đặt số lượng
                    </button>
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {adjustType === 'set' ? 'Số lượng mới' : 'Số lượng'}
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder={adjustType === 'set' ? 'Nhập số lượng tồn kho mới' : 'Nhập số lượng...'}
                        className="input-field"
                        required
                    />
                </div>

                {/* Reason Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lý do
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="input-field"
                    >
                        {reasons.map((r, index) => {
                            // Đảm bảo reasonCode luôn là string
                            let reasonCode = '';
                            if (typeof r === 'string') {
                                reasonCode = r;
                            } else if (typeof r === 'object' && r !== null) {
                                reasonCode = r.code || r.name || '';
                            }

                            // Fallback nếu vẫn không có code
                            if (!reasonCode) {
                                reasonCode = `REASON_${index}`;
                            }

                            const info = STOCK_REASON_INFO[reasonCode];
                            const displayLabel = info?.label || reasonCode;
                            const displayIcon = info?.icon || '📋';

                            return (
                                <option key={`reason-${index}-${reasonCode}`} value={reasonCode}>
                                    {displayIcon} {displayLabel}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Note */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú..."
                        rows={3}
                        className="input-field resize-none"
                    />
                </div>

                {/* Preview */}
                {quantity && (
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Tồn kho sau điều chỉnh:</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {calcNewStock()}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {adjustType === 'add' && `+${quantity} sản phẩm`}
                            {adjustType === 'subtract' && `-${quantity} sản phẩm`}
                            {adjustType === 'set' && `Thay đổi ${calcNewStock() - (product?.stockQuantity || 0)} sản phẩm`}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !quantity}
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${adjustType === 'add'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : adjustType === 'subtract'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } ${loading || !quantity ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : (
                            'Xác nhận'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default StockAdjustModal;

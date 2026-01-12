import React, { useState } from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Danh sách các lý do hủy đơn hàng có sẵn
 */
const CANCEL_REASONS = [
    "Cần thay đổi phương thức thanh toán",
    "Chiết khấu không như mong đợi",
    "Đơn đặt hàng được tạo do có sự nhầm lẫn",
    "Phí giao hàng cao",
    "Có giá tốt hơn ở nơi khác",
    "Thông tin giao hàng không chính xác",
    "Sản phẩm không được vận chuyển đúng thời hạn",
    "Không còn nhu cầu mua hàng",
];

/**
 * Cancel Order Modal Component
 * Modal cho phép chọn lý do hủy đơn hàng từ danh sách có sẵn hoặc nhập lý do khác
 */
const CancelOrderModal = ({ isOpen, orderCode, cancelling, onClose, onConfirm }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [isOther, setIsOther] = useState(false);

    if (!isOpen) return null;

    const handleReasonSelect = (reason) => {
        setSelectedReason(reason);
        setIsOther(false);
        setOtherReason('');
    };

    const handleOtherSelect = () => {
        setSelectedReason('');
        setIsOther(true);
    };

    const handleConfirm = () => {
        const finalReason = isOther ? otherReason.trim() : selectedReason;
        if (!finalReason) {
            alert('Vui lòng chọn hoặc nhập lý do hủy đơn hàng');
            return;
        }
        onConfirm(finalReason);
    };

    const isValid = isOther ? otherReason.trim().length > 0 : selectedReason.length > 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-800">
                        Cho chúng tôi biết lý do bạn hủy
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Order Code */}
                <div className="px-5 py-3 bg-gray-50 border-b">
                    <p className="text-sm text-gray-600">
                        Đơn hàng: <span className="font-semibold text-gray-800">{orderCode}</span>
                    </p>
                </div>

                {/* Reason List */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-1">
                        {CANCEL_REASONS.map((reason, index) => (
                            <label
                                key={index}
                                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                    selectedReason === reason
                                        ? 'border-rose-500 bg-rose-50'
                                        : 'border-transparent hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-gray-700">{reason}</span>
                                <div className="relative">
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={() => handleReasonSelect(reason)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedReason === reason
                                            ? 'border-rose-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedReason === reason && (
                                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}

                        {/* Lý do khác */}
                        <label
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                isOther
                                    ? 'border-rose-500 bg-rose-50'
                                    : 'border-transparent hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-gray-700">Khác</span>
                            <div className="relative">
                                <input
                                    type="radio"
                                    name="cancelReason"
                                    value="other"
                                    checked={isOther}
                                    onChange={handleOtherSelect}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isOther
                                        ? 'border-rose-500'
                                        : 'border-gray-300'
                                }`}>
                                    {isOther && (
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                    )}
                                </div>
                            </div>
                        </label>

                        {/* TextArea cho lý do khác */}
                        {isOther && (
                            <div className="mt-3 pl-4">
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Vui lòng cho chúng tôi biết lý do của bạn..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                    rows={3}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-white">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={cancelling || !isValid}
                            className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;

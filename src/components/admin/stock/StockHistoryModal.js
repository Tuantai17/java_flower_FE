import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../common/Modal';
import Pagination from '../../common/Pagination';
import stockApi, { getReasonLabel, getReasonBadgeColor, formatChangeQuantity } from '../../../api/stockApi';
import {
    ClockIcon,
    ArchiveBoxIcon,
    UserIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

/**
 * Modal hiển thị lịch sử biến động tồn kho
 */
const StockHistoryModal = ({
    isOpen,
    onClose,
    product // { id, name, thumbnail, stockQuantity }
}) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    const fetchHistory = useCallback(async () => {
        if (!product?.id) return;

        setLoading(true);
        setError('');

        try {
            const response = await stockApi.getHistory(product.id, pagination.page, pagination.size);

            // Handle different response formats
            if (response?.content && Array.isArray(response.content)) {
                // Spring Boot Page format
                setHistory(response.content);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.totalPages || 1,
                    totalElements: response.totalElements || response.content.length
                }));
            } else if (Array.isArray(response)) {
                // Direct array
                setHistory(response);
                setPagination(prev => ({
                    ...prev,
                    totalPages: Math.ceil(response.length / prev.size),
                    totalElements: response.length
                }));
            } else {
                setHistory([]);
            }
        } catch (err) {
            console.error('Error fetching stock history:', err);
            setError('Không thể tải lịch sử tồn kho. Vui lòng thử lại.');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [product?.id, pagination.page, pagination.size]);

    useEffect(() => {
        if (isOpen && product?.id) {
            fetchHistory();
        }
    }, [isOpen, product?.id, fetchHistory]);

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    if (!product) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Lịch sử tồn kho"
            size="large"
        >
            <div className="space-y-6">
                {/* Product Info Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    {product.thumbnail ? (
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
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
                        <h4 className="font-semibold text-gray-900 text-lg">{product.name}</h4>
                        <p className="text-sm text-gray-500">
                            Tồn kho hiện tại: <span className="font-bold text-pink-600 text-lg">{product.stockQuantity}</span>
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="loader" />
                            <span className="text-gray-500">Đang tải lịch sử...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchHistory}
                            className="btn-primary text-sm"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && history.length === 0 && (
                    <div className="text-center py-12">
                        <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Chưa có lịch sử</h4>
                        <p className="text-gray-500">Sản phẩm này chưa có biến động tồn kho nào.</p>
                    </div>
                )}

                {/* History Table */}
                {!loading && !error && history.length > 0 && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Thời gian
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Lý do
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Thay đổi
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tồn cuối
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Người thực hiện
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Ghi chú
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((item, index) => {
                                        const changeInfo = formatChangeQuantity(item.changeQuantity || item.change_quantity);
                                        return (
                                            <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <ClockIcon className="w-4 h-4 text-gray-400" />
                                                        {formatDateTime(item.createdAt || item.created_at || item.timestamp)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getReasonBadgeColor(item.reason)}`}>
                                                        {getReasonLabel(item.reason)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className={changeInfo.className}>
                                                        {changeInfo.text}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className="font-semibold text-gray-900">
                                                        {item.newQuantity ?? item.new_quantity ?? item.stockAfter ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                        {item.performedBy || item.performed_by || item.createdBy || item.created_by || 'Admin'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px]">
                                                    {item.note ? (
                                                        <div className="flex items-start gap-2">
                                                            <DocumentTextIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                            <span className="truncate" title={item.note}>
                                                                {item.note}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pt-4 border-t border-gray-100">
                                <Pagination
                                    currentPage={pagination.page + 1}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.totalElements}
                                    pageSize={pagination.size}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default StockHistoryModal;

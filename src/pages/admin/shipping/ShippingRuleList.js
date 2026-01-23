import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TruckIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import shippingRulesApi from '../../../api/shippingRulesApi';

/**
 * Trang quản lý Shipping District Rules - Light Theme
 */
const ShippingRuleList = () => {
    const navigate = useNavigate();
    
    // State
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
    });

    // Fetch danh sách rules
    const fetchRules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await shippingRulesApi.getAll({
                page: pagination.currentPage,
                size: 20,
                city: selectedCity,
                keyword: searchKeyword,
            });
            setRules(response.content || []);
            setPagination({
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalItems: response.totalItems,
            });
        } catch (err) {
            setError('Không thể tải danh sách quy tắc vận chuyển');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, selectedCity, searchKeyword]);

    // Fetch danh sách cities
    const fetchCities = useCallback(async () => {
        try {
            const data = await shippingRulesApi.getCities();
            setCities(data || []);
        } catch (err) {
            console.error('Error fetching cities:', err);
        }
    }, []);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 0 }));
        fetchRules();
    };

    const handleToggleActive = async (id) => {
        try {
            await shippingRulesApi.toggleActive(id);
            fetchRules();
        } catch (err) {
            alert('Lỗi khi thay đổi trạng thái');
        }
    };

    const handleDelete = async (id, district) => {
        if (!window.confirm(`Bạn có chắc muốn xóa quy tắc cho "${district}"?`)) {
            return;
        }
        try {
            await shippingRulesApi.delete(id);
            fetchRules();
        } catch (err) {
            alert('Lỗi khi xóa quy tắc');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    };

    const getZoneBadge = (zone) => {
        const colors = {
            INNER: 'bg-green-100 text-green-700 border-green-200',
            OUTER: 'bg-blue-100 text-blue-700 border-blue-200',
            SUBURBAN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            REMOTE: 'bg-red-100 text-red-700 border-red-200',
        };
        const labels = {
            INNER: 'Nội thành',
            OUTER: 'Ngoại thành',
            SUBURBAN: 'Vùng ven',
            REMOTE: 'Vùng xa',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[zone] || 'bg-gray-100 text-gray-700'}`}>
                {labels[zone] || zone}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <TruckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Phí vận chuyển</h1>
                        <p className="text-gray-500">
                            Tổng cộng {pagination.totalItems} quy tắc vận chuyển
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/shipping-rules/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm quy tắc
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm theo quận/huyện..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        value={selectedCity}
                        onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setPagination(prev => ({ ...prev, currentPage: 0 }));
                        }}
                        className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả thành phố</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        Tìm kiếm
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchKeyword('');
                            setSelectedCity('');
                            setPagination(prev => ({ ...prev, currentPage: 0 }));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        Reset
                    </button>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                        Đang tải...
                    </div>
                ) : rules.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Không có quy tắc vận chuyển nào
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thành phố
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Quận/Huyện
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Vùng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Phí cơ bản
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Miễn phí từ
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-700">
                                            {rule.city}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">
                                            {rule.district}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getZoneBadge(rule.zone)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-medium">
                                            {formatPrice(rule.baseFee)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatPrice(rule.freeShipThreshold)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">
                                            {rule.estimatedTime || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {/* Click để toggle trạng thái */}
                                            <button
                                                onClick={() => handleToggleActive(rule.id)}
                                                className="transition-transform hover:scale-105"
                                                title="Click để thay đổi trạng thái"
                                            >
                                                {(rule.active === true || rule.active === null) ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium cursor-pointer hover:bg-green-200">
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200">
                                                        <XCircleIcon className="h-4 w-4" />
                                                        Đã tắt
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/shipping-rules/edit/${rule.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule.id, rule.district)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Trang {pagination.currentPage + 1} / {pagination.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                disabled={pagination.currentPage === 0}
                                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                disabled={pagination.currentPage >= pagination.totalPages - 1}
                                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingRuleList;

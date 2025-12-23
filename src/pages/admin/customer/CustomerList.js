import React, { useState, useEffect, useCallback } from 'react';
import { CustomerTable, CustomerDetailModal } from '../../../components/admin/customer';
import Pagination from '../../../components/common/Pagination';
import { ConfirmModal } from '../../../components/common/Modal';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import customerApi from '../../../api/customerApi';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    UserPlusIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';

/**
 * Trang quản lý khách hàng cho Admin
 */
const CustomerList = () => {
    // State
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        role: '',
        isActive: ''
    });
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    // Stats
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalAdmins: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        newThisMonth: 0
    });

    // Modal states
    const [detailModal, setDetailModal] = useState({ isOpen: false, customer: null });
    const [statusModal, setStatusModal] = useState({ isOpen: false, customer: null });

    // Notification
    const { toasts, notify, removeToast } = useNotification();

    // Fetch customers
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                keyword: searchQuery,
                page: pagination.page,
                size: pagination.size,
                sortBy: 'createdAt',
                sortDir: 'desc'
            };

            // Add filters
            if (filters.role) params.role = filters.role;
            if (filters.isActive !== '') {
                params.isActive = filters.isActive === 'true';
            }

            const response = await customerApi.getAll(params);

            // Handle response
            let customersData = [];
            let totalPages = 1;
            let totalElements = 0;

            if (response?.content && Array.isArray(response.content)) {
                // Spring Boot Page format
                customersData = response.content;
                totalPages = response.totalPages || 1;
                totalElements = response.totalElements || customersData.length;
            } else if (Array.isArray(response)) {
                customersData = response;
                totalElements = customersData.length;
                totalPages = Math.ceil(totalElements / pagination.size);
            }

            setCustomers(customersData);
            setPagination(prev => ({
                ...prev,
                totalPages,
                totalElements
            }));

        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối backend.');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters, pagination.page, pagination.size]);

    // Fetch stats - nếu API không có, tính từ customers list
    const fetchStats = useCallback(async () => {
        try {
            const data = await customerApi.getStats();
            if (data && (data.totalCustomers > 0 || data.totalAdmins > 0 || data.activeCustomers > 0)) {
                setStats(data);
                return;
            }
        } catch (err) {
            console.warn('Stats API not available, will calculate from customers list');
        }
    }, []);

    // Tính stats từ customers list (fallback khi API không có)
    const calculateStatsFromCustomers = useCallback(() => {
        if (customers.length === 0 && stats.totalCustomers > 0) return; // Đã có stats từ API

        const totalCustomers = pagination.totalElements || customers.length;
        // Nhận diện ADMIN (cả ADMIN và có thể các role quản trị khác)
        const totalAdmins = customers.filter(c =>
            c.role === 'ADMIN' || c.role === 'MANAGER' || c.role === 'STAFF'
        ).length;
        const activeCustomers = customers.filter(c => (c.isActive ?? c.active ?? true)).length;
        const inactiveCustomers = customers.filter(c => !(c.isActive ?? c.active ?? true)).length;

        setStats(prev => ({
            ...prev,
            totalCustomers: totalCustomers || prev.totalCustomers,
            totalAdmins: totalAdmins || prev.totalAdmins,
            activeCustomers: activeCustomers || prev.activeCustomers,
            inactiveCustomers: inactiveCustomers || prev.inactiveCustomers
        }));
    }, [customers, pagination.totalElements, stats.totalCustomers]);

    // Effects
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Tính stats từ customers sau khi fetch xong
    useEffect(() => {
        if (!loading && customers.length > 0) {
            calculateStatsFromCustomers();
        }
    }, [loading, customers, calculateStatsFromCustomers]);

    // Handlers
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, page: 0 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 0 }));
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setFilters({ role: '', isActive: '' });
        setPagination(prev => ({ ...prev, page: 0 }));
    };

    const handleViewDetail = (customer) => {
        setDetailModal({ isOpen: true, customer });
    };

    const handleToggleStatus = (customer) => {
        setStatusModal({ isOpen: true, customer });
    };

    const confirmToggleStatus = async () => {
        const customer = statusModal.customer;
        if (!customer) return;

        const isActive = customer.isActive ?? customer.active ?? true;

        try {
            await customerApi.updateStatus(customer.id, !isActive);
            notify.success(
                isActive
                    ? 'Đã khóa tài khoản thành công!'
                    : 'Đã mở khóa tài khoản thành công!',
                'Thành công'
            );
            fetchCustomers();
            fetchStats();
        } catch (err) {
            console.error('Error updating status:', err);
            notify.error('Không thể cập nhật trạng thái tài khoản.', 'Lỗi');
        } finally {
            setStatusModal({ isOpen: false, customer: null });
        }
    };

    const hasActiveFilters = searchQuery || filters.role || filters.isActive !== '';

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <UsersIcon className="w-8 h-8 text-pink-500" />
                            Quản lý khách hàng
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Quản lý thông tin và tài khoản khách hàng
                        </p>
                    </div>
                    <button
                        onClick={() => { fetchCustomers(); fetchStats(); }}
                        className="btn-secondary flex items-center gap-2"
                        disabled={loading}
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Customers */}
                    <div className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                                <UserGroupIcon className="w-6 h-6 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng khách hàng</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.totalCustomers || pagination.totalElements || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admins */}
                    <div className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                                <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Quản trị viên</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalAdmins || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Active */}
                    <div className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                                <UserPlusIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeCustomers || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Locked */}
                    <div className="stat-card">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl">
                                <NoSymbolIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Đã khóa</p>
                                <p className="text-2xl font-bold text-red-600">{stats.inactiveCustomers || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-soft p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email, SĐT..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="USER">Khách hàng (USER)</option>
                            <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Đã khóa</option>
                        </select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                            >
                                <FunnelIcon className="h-5 w-5" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-red-700 mb-2">Lỗi kết nối API</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={fetchCustomers} className="btn-primary">
                            🔄 Thử lại
                        </button>
                    </div>
                )}

                {/* Customer Table */}
                {!error && (
                    <CustomerTable
                        customers={customers}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        onToggleStatus={handleToggleStatus}
                    />
                )}

                {/* Pagination */}
                {!error && customers.length > 0 && (
                    <Pagination
                        currentPage={pagination.page + 1}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalElements}
                        pageSize={pagination.size}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Customer Detail Modal */}
                <CustomerDetailModal
                    isOpen={detailModal.isOpen}
                    onClose={() => setDetailModal({ isOpen: false, customer: null })}
                    customer={detailModal.customer}
                />

                {/* Toggle Status Confirmation Modal */}
                <ConfirmModal
                    isOpen={statusModal.isOpen}
                    onClose={() => setStatusModal({ isOpen: false, customer: null })}
                    onConfirm={confirmToggleStatus}
                    title={
                        (statusModal.customer?.isActive ?? statusModal.customer?.active ?? true)
                            ? 'Khóa tài khoản'
                            : 'Mở khóa tài khoản'
                    }
                    message={
                        (statusModal.customer?.isActive ?? statusModal.customer?.active ?? true)
                            ? `Bạn có chắc chắn muốn KHÓA tài khoản "${statusModal.customer?.username}"? Người dùng này sẽ không thể đăng nhập.`
                            : `Bạn có chắc chắn muốn MỞ KHÓA tài khoản "${statusModal.customer?.username}"?`
                    }
                    confirmText={
                        (statusModal.customer?.isActive ?? statusModal.customer?.active ?? true)
                            ? 'Khóa'
                            : 'Mở khóa'
                    }
                    variant={
                        (statusModal.customer?.isActive ?? statusModal.customer?.active ?? true)
                            ? 'danger'
                            : 'success'
                    }
                />
            </div>
        </>
    );
};

export default CustomerList;

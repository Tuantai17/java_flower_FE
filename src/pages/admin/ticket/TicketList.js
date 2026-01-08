import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, getTicketStats } from '../../../api/contactApi';
import ticketWebSocketService from '../../../services/ticketWebSocketService';
import {
    TicketIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InboxIcon,
    BellAlertIcon,
} from '@heroicons/react/24/outline';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [newTicketAlert, setNewTicketAlert] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadStats();
        
        // Subscribe to admin notifications for new tickets
        ticketWebSocketService.subscribeToAdminNotifications(
            // On new ticket
            (notification) => {
                console.log('🎫 New ticket notification:', notification);
                setNewTicketAlert(notification);
                loadStats(); // Refresh stats
                loadTickets(); // Refresh list
                
                // Auto hide after 5 seconds
                setTimeout(() => setNewTicketAlert(null), 5000);
            },
            // On new message
            (notification) => {
                console.log('💬 New message notification:', notification);
                loadTickets(); // Refresh list to show updated ticket
            }
        );
    }, []);

    useEffect(() => {
        loadTickets();
    }, [page, filterStatus, filterCategory, search]);

    const loadStats = async () => {
        try {
            const response = await getTicketStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const loadTickets = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                size: 10,
                sortBy: 'createdAt',
                sortDir: 'desc',
            };
            if (filterStatus) params.status = filterStatus;
            if (filterCategory) params.category = filterCategory;
            if (search) params.search = search;

            console.log('Loading tickets with params:', params);
            const response = await getAllTickets(params);
            console.log('Tickets response:', response);
            console.log('Response data:', response.data);
            
            if (response.success && response.data) {
                // Handle both paginated and non-paginated response
                const ticketData = response.data.content || response.data;
                const pages = response.data.totalPages || 1;
                
                console.log('Ticket data:', ticketData);
                console.log('Total pages:', pages);
                
                setTickets(Array.isArray(ticketData) ? ticketData : []);
                setTotalPages(pages);
            } else {
                console.error('Failed to load tickets:', response);
                setTickets([]);
            }
        } catch (err) {
            console.error('Error loading tickets:', err);
            console.error('Error response:', err.response?.data);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        loadTickets();
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': 'bg-blue-100 text-blue-700',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-700',
            'RESOLVED': 'bg-green-100 text-green-700',
            'CLOSED': 'bg-gray-100 text-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-6">
            {/* New Ticket Alert */}
            {newTicketAlert && (
                <div className="fixed top-4 right-4 z-50 animate-pulse">
                    <div 
                        className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-green-600 transition-colors"
                        onClick={() => {
                            if (newTicketAlert.url) navigate(newTicketAlert.url);
                            setNewTicketAlert(null);
                        }}
                    >
                        <BellAlertIcon className="h-6 w-6" />
                        <div>
                            <p className="font-bold">{newTicketAlert.title}</p>
                            <p className="text-sm opacity-90">{newTicketAlert.content}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Ticket Liên hệ</h1>
                <p className="text-gray-600">Xem và xử lý yêu cầu hỗ trợ từ khách hàng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.open || 0}</p>
                            <p className="text-sm text-gray-600">Mới</p>
                        </div>
                        <ExclamationCircleIcon className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.inProgress || 0}</p>
                            <p className="text-sm text-gray-600">Đang xử lý</p>
                        </div>
                        <ClockIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.resolved || 0}</p>
                            <p className="text-sm text-gray-600">Đã giải quyết</p>
                        </div>
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-400">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                            <p className="text-sm text-gray-600">Tổng cộng</p>
                        </div>
                        <TicketIcon className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo mã, tên, email, tiêu đề..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="OPEN">Mới</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="RESOLVED">Đã giải quyết</option>
                        <option value="CLOSED">Đã đóng</option>
                    </select>
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="">Tất cả phân loại</option>
                        <option value="ORDER">Đặt hàng</option>
                        <option value="SUPPORT">Hỗ trợ</option>
                        <option value="FEEDBACK">Góp ý</option>
                        <option value="PARTNERSHIP">Hợp tác</option>
                        <option value="OTHER">Khác</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                        <FunnelIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600 mt-4">Đang tải...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <InboxIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Không có ticket nào</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Mã ticket</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Phân loại</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-pink-600 bg-pink-50 px-2 py-1 rounded text-sm">
                                                    #{ticket.ticketCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{ticket.name}</p>
                                                    <p className="text-sm text-gray-500">{ticket.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900 line-clamp-1 max-w-[200px]">{ticket.subject}</p>
                                                {ticket.lastMessage && (
                                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                                                        {ticket.lastMessage}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{ticket.categoryDisplayName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                    {ticket.statusDisplayName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{formatDate(ticket.createdAt)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                                                    className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <p className="text-sm text-gray-600">
                                    Trang {page + 1} / {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(Math.max(0, page - 1))}
                                        disabled={page === 0}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TicketList;

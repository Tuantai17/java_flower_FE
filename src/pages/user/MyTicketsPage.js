import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyTickets } from '../../api/contactApi';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    TicketIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            console.log('Loading my tickets...');
            const response = await getMyTickets();
            console.log('My tickets response:', response);
            if (response.success) {
                setTickets(response.data || []);
            } else {
                console.error('Failed to load tickets:', response.message);
                setError(response.message || 'Không thể tải danh sách ticket');
            }
        } catch (err) {
            console.error('Error loading tickets:', err);
            console.error('Error response:', err.response?.data);
            if (err.response?.status === 401) {
                setError('Vui lòng đăng nhập để xem ticket của bạn');
            } else {
                setError('Có lỗi xảy ra khi tải danh sách ticket');
            }
        } finally {
            setLoading(false);
        }
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

    const getStatusIcon = (status) => {
        const icons = {
            'OPEN': ExclamationCircleIcon,
            'IN_PROGRESS': ClockIcon,
            'RESOLVED': CheckCircleIcon,
            'CLOSED': CheckCircleIcon,
        };
        return icons[status] || TicketIcon;
    };

    const filteredTickets = filterStatus === 'ALL'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[{ label: 'Liên hệ', path: '/contact' }, { label: 'Ticket của tôi' }]} />
                </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
                <div className="container-custom text-center text-white">
                    <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                        Ticket Của Tôi
                    </h1>
                    <p className="text-pink-100">
                        Theo dõi và xem lịch sử yêu cầu hỗ trợ
                    </p>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'ALL', label: 'Tất cả' },
                            { value: 'OPEN', label: 'Mới' },
                            { value: 'IN_PROGRESS', label: 'Đang xử lý' },
                            { value: 'RESOLVED', label: 'Đã giải quyết' },
                            { value: 'CLOSED', label: 'Đã đóng' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilterStatus(tab.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    filterStatus === tab.value
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                                {tab.value !== 'ALL' && (
                                    <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                                        {tickets.filter(t => t.status === tab.value).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                        <ExclamationCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Link to="/login" className="btn-primary">
                            Đăng nhập
                        </Link>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                        <InboxIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Chưa có ticket nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filterStatus === 'ALL'
                                ? 'Bạn chưa gửi yêu cầu hỗ trợ nào'
                                : 'Không có ticket nào với trạng thái này'}
                        </p>
                        <Link to="/contact" className="btn-primary">
                            Gửi yêu cầu mới
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTickets.map((ticket) => {
                            const StatusIcon = getStatusIcon(ticket.status);
                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="bg-white rounded-xl shadow-soft p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-pink-500"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-mono text-pink-600 bg-pink-50 px-2 py-1 rounded">
                                                    #{ticket.ticketCode}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {ticket.statusDisplayName}
                                                </span>
                                                {ticket.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                        {ticket.unreadCount} mới
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {ticket.subject}
                                            </h3>
                                            {ticket.lastMessage && (
                                                <p className="text-sm text-gray-600 line-clamp-1">
                                                    {ticket.lastMessage}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right text-sm text-gray-500">
                                                <p>{formatDate(ticket.createdAt)}</p>
                                                <p className="text-xs">{ticket.categoryDisplayName}</p>
                                            </div>
                                            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTicketsPage;

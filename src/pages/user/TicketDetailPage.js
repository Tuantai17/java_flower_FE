import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketDetail, sendTicketMessage } from '../../api/contactApi';
import ticketWebSocketService from '../../services/ticketWebSocketService';
import Breadcrumb from '../../components/user/Breadcrumb';
import {
    ArrowLeftIcon,
    PaperAirplaneIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';

const TicketDetailPage = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadTicket();
    }, [id]);

    // WebSocket realtime subscription
    useEffect(() => {
        if (!id) return;

        // Subscribe to ticket channel for realtime messages
        ticketWebSocketService.subscribeToTicket(id, (payload) => {
            console.log('🔔 Realtime payload received:', payload);
            
            if (payload.type === 'MESSAGE') {
                // Thêm message mới realtime (không reload)
                setTicket(prev => {
                    if (!prev) return prev;
                    // Kiểm tra message đã tồn tại chưa
                    const exists = prev.messages?.some(m => m.id === payload.data.id);
                    if (exists) return prev;
                    
                    return {
                        ...prev,
                        messages: [...(prev.messages || []), payload.data]
                    };
                });
            } else if (payload.type === 'STATUS') {
                // Cập nhật status realtime
                setTicket(prev => prev ? {
                    ...prev,
                    status: payload.data.status,
                    statusDisplayName: payload.data.statusDisplayName
                } : prev);
            }
        });

        // Cleanup khi unmount
        return () => {
            ticketWebSocketService.unsubscribeFromTicket(id);
        };
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadTicket = async () => {
        try {
            setLoading(true);
            const response = await getTicketDetail(id);
            if (response.success) {
                setTicket(response.data);
            } else {
                setError(response.message || 'Không thể tải thông tin ticket');
            }
        } catch (err) {
            console.error('Error loading ticket:', err);
            setError('Có lỗi xảy ra khi tải thông tin ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            const response = await sendTicketMessage(id, newMessage.trim());
            if (response.success) {
                setNewMessage('');
                // Không cần reload - WebSocket sẽ tự thêm message
            }
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': 'bg-blue-100 text-blue-700 border-blue-200',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'RESOLVED': 'bg-green-100 text-green-700 border-green-200',
            'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

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

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link to="/my-tickets" className="btn-primary">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom">
                    <Breadcrumb items={[
                        { label: 'Liên hệ', path: '/contact' },
                        { label: 'Ticket của tôi', path: '/my-tickets' },
                        { label: `#${ticket.ticketCode}` }
                    ]} />
                </div>
            </div>

            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="container-custom py-4">
                    <div className="flex items-center gap-4 mb-3">
                        <Link
                            to="/my-tickets"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-pink-600 bg-pink-50 px-2 py-1 rounded text-sm">
                                    #{ticket.ticketCode}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                    {ticket.statusDisplayName}
                                </span>
                            </div>
                            <h1 className="font-semibold text-gray-900 mt-1">{ticket.subject}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 pl-11">
                        <span>Phân loại: <strong>{ticket.categoryDisplayName}</strong></span>
                        <span>Tạo lúc: <strong>{formatDate(ticket.createdAt)}</strong></span>
                        {ticket.assignedAdminName && (
                            <span>Người xử lý: <strong>{ticket.assignedAdminName}</strong></span>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="container-custom py-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {ticket.messages?.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${
                                    message.senderType === 'USER'
                                        ? 'bg-pink-500 text-white rounded-2xl rounded-br-md'
                                        : message.senderType === 'SYSTEM'
                                            ? 'bg-gray-100 text-gray-600 rounded-xl text-center w-full max-w-full'
                                            : 'bg-white shadow-soft rounded-2xl rounded-bl-md'
                                } p-4`}>
                                    {message.senderType !== 'USER' && message.senderType !== 'SYSTEM' && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheckIcon className="h-4 w-4 text-pink-500" />
                                            <span className="text-sm font-medium text-pink-600">
                                                {message.senderName || 'Hỗ trợ viên'}
                                            </span>
                                        </div>
                                    )}
                                    {message.senderType === 'SYSTEM' && (
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-xs font-medium text-gray-500">Thông báo hệ thống</span>
                                        </div>
                                    )}
                                    <p className={`whitespace-pre-wrap ${message.senderType === 'SYSTEM' ? 'text-sm' : ''}`}>
                                        {message.content}
                                    </p>
                                    <p className={`text-xs mt-2 ${
                                        message.senderType === 'USER' ? 'text-pink-200' : 'text-gray-400'
                                    }`}>
                                        {formatTime(message.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input */}
            {ticket.status !== 'CLOSED' && (
                <div className="bg-white border-t shadow-lg">
                    <div className="container-custom py-4">
                        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Nhập nội dung tin nhắn..."
                                        rows={1}
                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className={`p-3 rounded-xl transition-all ${
                                        newMessage.trim() && !sending
                                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {sending ? (
                                        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <PaperAirplaneIcon className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {ticket.status === 'CLOSED' && (
                <div className="bg-gray-100 border-t py-4">
                    <div className="container-custom">
                        <p className="text-center text-gray-600">
                            Ticket này đã được đóng. <Link to="/contact" className="text-pink-600 font-medium hover:underline">Tạo ticket mới</Link>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetailPage;

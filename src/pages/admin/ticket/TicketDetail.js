import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketForAdmin, replyToTicket, updateTicketStatus, assignTicket } from '../../../api/contactApi';
import uploadApi from '../../../api/uploadApi';
import ticketWebSocketService from '../../../services/ticketWebSocketService';
import {
    ArrowLeftIcon,
    PaperAirplaneIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon,
    CheckBadgeIcon,
    PhotoIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [replyImages, setReplyImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

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
            const response = await getTicketForAdmin(id);
            if (response.success) {
                setTicket(response.data);
            }
        } catch (err) {
            console.error('Error loading ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || sending) return;

        try {
            setSending(true);
            console.log('Sending reply:', { content: replyContent.trim(), images: replyImages });
            const response = await replyToTicket(id, { 
                content: replyContent.trim(),
                images: replyImages.length > 0 ? replyImages : null
            });
            console.log('Reply response:', response);
            if (response.success) {
                setReplyContent('');
                setReplyImages([]);
                await loadTicket();
            } else {
                console.error('Reply failed:', response.message);
                alert(response.message || 'Gửi phản hồi thất bại');
            }
        } catch (err) {
            console.error('Error sending reply:', err);
            console.error('Error response:', err.response?.data);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi');
        } finally {
            setSending(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (replyImages.length + files.length > 5) {
            alert('Tối đa 5 ảnh');
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const result = await uploadApi.uploadProductImage(file);
                return uploadApi.extractUrl(result);
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            const validUrls = uploadedUrls.filter(url => url);
            setReplyImages(prev => [...prev, ...validUrls]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Lỗi upload ảnh');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index) => {
        setReplyImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            await updateTicketStatus(id, newStatus);
            await loadTicket();
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAssign = async () => {
        try {
            await assignTicket(id);
            await loadTicket();
        } catch (err) {
            console.error('Error assigning ticket:', err);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': 'bg-blue-100 text-blue-700 border-blue-300',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'RESOLVED': 'bg-green-100 text-green-700 border-green-300',
            'CLOSED': 'bg-gray-100 text-gray-700 border-gray-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
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
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">Không tìm thấy ticket</p>
                <button onClick={() => navigate('/admin/tickets')} className="btn-primary">
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex">
            {/* Main Content - Messages */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/tickets')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
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
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {ticket.messages?.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${
                                    message.senderType === 'ADMIN'
                                        ? 'bg-pink-500 text-white rounded-2xl rounded-br-md'
                                        : message.senderType === 'SYSTEM'
                                            ? 'bg-gray-200 text-gray-600 rounded-xl text-center w-full max-w-full'
                                            : 'bg-white shadow-sm rounded-2xl rounded-bl-md'
                                } p-4`}>
                                    {message.senderType === 'USER' && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserCircleIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">
                                                {message.senderName || ticket.name}
                                            </span>
                                        </div>
                                    )}
                                    {message.senderType === 'ADMIN' && (
                                        <div className="flex items-center gap-2 mb-2 text-pink-200">
                                            <ShieldCheckIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {message.senderName || 'Admin'}
                                            </span>
                                        </div>
                                    )}
                                    {message.senderType === 'SYSTEM' && (
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                                            <span className="text-xs font-medium text-gray-500">Hệ thống</span>
                                        </div>
                                    )}
                                    <p className={`whitespace-pre-wrap ${message.senderType === 'SYSTEM' ? 'text-sm' : ''}`}>
                                        {message.content}
                                    </p>
                                    {/* Message Images */}
                                    {message.images && message.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {message.images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt={`Attachment ${idx + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className={`text-xs mt-2 ${
                                        message.senderType === 'ADMIN' ? 'text-pink-200' : 'text-gray-400'
                                    }`}>
                                        {formatTime(message.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Reply Input */}
                {ticket.status !== 'CLOSED' && (
                    <div className="bg-white border-t p-4">
                        <form onSubmit={handleReply} className="max-w-3xl mx-auto">
                            {/* Image Preview */}
                            {replyImages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {replyImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Preview ${index + 1}`}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-3">
                                {/* Image Upload Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading || replyImages.length >= 5}
                                    className="p-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    title="Đính kèm ảnh"
                                >
                                    {uploading ? (
                                        <div className="h-6 w-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <PhotoIcon className="h-6 w-6" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Nhập phản hồi..."
                                    rows={2}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReply(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!replyContent.trim() || sending || uploading}
                                    className={`p-4 rounded-xl transition-all ${
                                        replyContent.trim() && !sending && !uploading
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
                )}
            </div>

            {/* Sidebar - Ticket Info */}
            <div className="w-80 bg-white border-l overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{ticket.name}</p>
                                    {ticket.userId && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                            Thành viên
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <EnvelopeIcon className="h-4 w-4" />
                                <span>{ticket.email}</span>
                            </div>
                            {ticket.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <PhoneIcon className="h-4 w-4" />
                                    <span>{ticket.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Thông tin ticket</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phân loại:</span>
                                <span className="font-medium">{ticket.categoryDisplayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ngày tạo:</span>
                                <span className="font-medium">{formatDate(ticket.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cập nhật:</span>
                                <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                            </div>
                            {ticket.assignedAdminName && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Người xử lý:</span>
                                    <span className="font-medium">{ticket.assignedAdminName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Thao tác</h3>
                        <div className="space-y-3">
                            {!ticket.assignedAdminId && (
                                <button
                                    onClick={handleAssign}
                                    className="w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckBadgeIcon className="h-5 w-5" />
                                    Nhận xử lý
                                </button>
                            )}

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Cập nhật trạng thái:</label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updatingStatus}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="OPEN">Mới</option>
                                    <option value="IN_PROGRESS">Đang xử lý</option>
                                    <option value="RESOLVED">Đã giải quyết</option>
                                    <option value="CLOSED">Đã đóng</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quick Replies */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Mẫu phản hồi nhanh</h3>
                        <div className="space-y-2">
                            {[
                                'Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được yêu cầu và sẽ phản hồi trong thời gian sớm nhất.',
                                'Vấn đề của bạn đã được giải quyết. Nếu còn thắc mắc, vui lòng liên hệ lại.',
                                'Xin lỗi vì sự bất tiện này. Chúng tôi đang xử lý và sẽ cập nhật sớm.',
                            ].map((template, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setReplyContent(template)}
                                    className="w-full text-left p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors line-clamp-2"
                                >
                                    {template}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;

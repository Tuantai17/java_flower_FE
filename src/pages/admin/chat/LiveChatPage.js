import React from 'react';
import AdminChatPanel from '../../../components/admin/AdminChatPanel';

/**
 * Live Chat Page for Admin
 * Manages customer conversations
 */
const LiveChatPage = () => {
    return (
        <div className="p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">💬 Live Chat - Hỗ trợ khách hàng</h1>
                <p className="text-gray-600">Quản lý và trả lời tin nhắn từ khách hàng</p>
            </div>
            <AdminChatPanel />
        </div>
    );
};

export default LiveChatPage;

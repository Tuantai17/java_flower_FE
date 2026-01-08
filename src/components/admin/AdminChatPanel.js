import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    getActiveSessionsForAdmin, 
    getAdminStatusInfo,
    sendAdminMessage as sendRestAdminMessage,
    toggleChatMode as toggleChatModeApi,
    getSessionForAdmin
} from '../../api/liveChatApi';
import webSocketService from '../../services/webSocketService';
import './AdminChatPanel.css';

/**
 * Admin Chat Panel Component
 * Manages live chat conversations with customers
 */
const AdminChatPanel = () => {
    // State
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [userTyping, setUserTyping] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [chatMode, setChatMode] = useState('BOT'); // BOT or STAFF
    const [error, setError] = useState(null); // Error state for auth/API errors


    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);
    const loadSessionsTimeoutRef = useRef(null);
    const lastLoadTimeRef = useRef(0);
    const wsCleanupRef = useRef([]);
    const isLoadingSessionsRef = useRef(false);
    const sessionSubscribedRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Initial load
    useEffect(() => {
        isMountedRef.current = true;
        
        loadSessions();
        connectAdminWebSocket();
        
        // Refresh sessions every 30 seconds (increased from original)
        const interval = setInterval(() => {
            if (isMountedRef.current) {
                loadSessions();
            }
        }, 30000);
        
        return () => {
            isMountedRef.current = false;
            clearInterval(interval);
            
            // Clear any pending timeouts
            if (loadSessionsTimeoutRef.current) {
                clearTimeout(loadSessionsTimeoutRef.current);
            }
            
            // Cleanup WebSocket subscriptions
            wsCleanupRef.current.forEach(cleanup => cleanup && cleanup());
            wsCleanupRef.current = [];
            
            // Don't disconnect WebSocket on component unmount - it's shared
            // webSocketService.disconnect();
        };
    }, []);

    // Load session messages when selected
    useEffect(() => {
        if (selectedSession?.id) {
            loadSessionMessages(selectedSession.id);
            subscribeToSession(selectedSession.id);
            
            // Mark as read
            webSocketService.markAsRead(selectedSession.id, 'ADMIN');
            
            // Update chat mode based on session status
            const mode = selectedSession.status === 'ACTIVE' ? 'BOT' : 'STAFF';
            setChatMode(mode);
        }
    }, [selectedSession?.id, selectedSession?.status]);

    // Focus input when session selected
    useEffect(() => {
        if (selectedSession && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedSession]);

    // ==================== Data Loading ====================

    const loadSessions = async (force = false) => {
        // Prevent duplicate calls using ref
        if (isLoadingSessionsRef.current) {
            console.log('[AdminChat] Already loading sessions, skipping...');
            return;
        }
        
        // Debounce: minimum 2 seconds between calls (unless forced or first load)
        const now = Date.now();
        const isFirstLoad = lastLoadTimeRef.current === 0;
        if (!force && !isFirstLoad && now - lastLoadTimeRef.current < 2000) {
            console.log('[AdminChat] Debouncing loadSessions, too soon since last call');
            return;
        }
        
        try {
            isLoadingSessionsRef.current = true;
            lastLoadTimeRef.current = now;
            
            if (!isMountedRef.current) return;
            
            setIsLoading(true);
            setError(null);
            
            console.log('[AdminChat] === Loading sessions from server ===');

            // Load sessions - handle error with specific messages
            let sessionsData = [];
            let statusData = { unreadCount: 0, onlineUsers: [] };
            
            try {
                console.log('[AdminChat] Loading sessions...');
                sessionsData = await getActiveSessionsForAdmin();
                console.log('[AdminChat] Sessions loaded:', sessionsData?.length || 0, 'items');
            } catch (e) {
                console.error('[AdminChat] Error loading sessions:', e);
                // Check if it's an auth error
                if (e.response?.status === 401) {
                    if (isMountedRef.current) {
                        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    }
                    return;
                }
                if (e.response?.status === 403) {
                    if (isMountedRef.current) {
                        setError('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin.');
                    }
                    return;
                }
            }
            
            try {
                statusData = await getAdminStatusInfo();
                console.log('[AdminChat] Status loaded:', statusData);
            } catch (e) {
                console.error('[AdminChat] Error loading status:', e);
            }
            
            if (!isMountedRef.current) return;
            
            // Ensure sessionsData is an array
            const finalSessions = Array.isArray(sessionsData) ? sessionsData : [];
            console.log('[AdminChat] Setting sessions:', finalSessions.length, 'items');
            
            setSessions(finalSessions);
            setUnreadTotal(statusData?.unreadCount || 0);
            setOnlineUsers(statusData?.onlineUsers || []);
        } catch (error) {
            console.error('[AdminChat] Error in loadSessions:', error);
            if (isMountedRef.current) {
                setError('Không thể tải danh sách hội thoại. Vui lòng thử lại.');
            }
        } finally {
            isLoadingSessionsRef.current = false;
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const loadSessionMessages = async (sessionId) => {
        try {
            setIsLoading(true);
            console.log('[AdminChat] Loading messages for session:', sessionId);
            const sessionData = await getSessionForAdmin(sessionId);
            console.log('[AdminChat] Session data loaded:', sessionData?.messages?.length || 0, 'messages');
            setMessages(sessionData.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            // Try to use messages from selected session if available
            if (selectedSession?.messages) {
                setMessages(selectedSession.messages);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ==================== WebSocket ====================

    const connectAdminWebSocket = async () => {
        try {
            // Use adminToken for admin WebSocket connection
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            
            if (!token) {
                console.warn('No admin token found for WebSocket connection');
                setWsConnected(false);
                return;
            }

            console.log('[AdminChat] Connecting WebSocket...');
            await webSocketService.connect({ token });
            setWsConnected(true);
            console.log('[AdminChat] WebSocket connected successfully');

            // Subscribe to admin notifications (new sessions, new messages)
            subscribeToAdminNotifications();

            // Handle connection status changes
            webSocketService.onConnection((status) => {
                console.log('[AdminChat] Connection status changed:', status.status);
                const isConnected = status.status === 'connected';
                setWsConnected(isConnected);
                
                // Re-subscribe if reconnected
                if (isConnected) {
                    subscribeToAdminNotifications();
                }
            });

        } catch (error) {
            console.error('[AdminChat] WebSocket connection failed:', error);
            setWsConnected(false);
            
            // Retry connection after 5 seconds
            setTimeout(() => {
                if (isMountedRef.current) {
                    console.log('[AdminChat] Retrying WebSocket connection...');
                    connectAdminWebSocket();
                }
            }, 5000);
        }
    };

    const subscribeToAdminNotifications = () => {
        // Subscribe to admin notifications - receive new sessions and messages
        const unsubNotifications = webSocketService.subscribeToAdminNotifications((notification) => {
            if (!isMountedRef.current) return;
            
            console.log('[AdminChat] Received admin notification:', notification);
            
            // Handle NEW_SESSION notification
            if (notification.type === 'NEW_SESSION' && notification.session) {
                console.log('[AdminChat] New session received:', notification.sessionId);
                setSessions(prev => {
                    // Check if session already exists
                    if (prev.some(s => s.id === notification.sessionId)) {
                        return prev;
                    }
                    // Add new session at the beginning
                    return [notification.session, ...prev];
                });
            }

            // Handle NEW_MESSAGE notification
            if (notification.type === 'NEW_MESSAGE' && notification.message) {
                console.log('[AdminChat] New message notification:', notification.sessionId);
                
                // Update session in list (move to top, update preview)
                setSessions(prev => {
                    const sessionIndex = prev.findIndex(s => s.id === notification.sessionId);
                    if (sessionIndex >= 0) {
                        const updatedSessions = [...prev];
                        const session = { ...updatedSessions[sessionIndex] };
                        session.title = notification.message.content?.substring(0, 50) || session.title;
                        session.updatedAt = new Date().toISOString();
                        session.unreadCount = (session.unreadCount || 0) + 1;
                        updatedSessions.splice(sessionIndex, 1);
                        return [session, ...updatedSessions];
                    }
                    return prev;
                });
                
                // If viewing this session, add message
                if (selectedSession?.id === notification.sessionId) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === notification.message.id)) return prev;
                        return [...prev, notification.message];
                    });
                    
                    // Mark as read since admin is viewing
                    webSocketService.markAsRead(notification.sessionId, 'ADMIN');
                }
            }
        });
        wsCleanupRef.current.push(unsubNotifications);

        // Subscribe to new message notifications from session topics
        const unsubMessage = webSocketService.onMessage((message) => {
            if (!isMountedRef.current) return;
            
            console.log('[AdminChat] Received WebSocket message notification:', message?.sessionId);
            
            // Only update current session's messages if viewing that session
            if (selectedSession?.id === message.sessionId) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                
                // Mark as read since admin is viewing
                webSocketService.markAsRead(message.sessionId, 'ADMIN');
            }
            
            // Update session list - schedule a delayed refresh only if we don't already have realtime updates
            // This is now only a fallback since we get realtime updates from admin notifications
        });
        wsCleanupRef.current.push(unsubMessage);

        // Subscribe to online status updates
        const unsubAdminStatus = webSocketService.onAdminStatus((status) => {
            if (!isMountedRef.current) return;
            
            if (status.userType === 'USER') {
                setOnlineUsers(prev => {
                    if (status.online) {
                        const exists = prev.some(u => 
                            u.userId === status.userId || u.guestId === status.guestId
                        );
                        if (!exists) return [...prev, status];
                        return prev;
                    } else {
                        return prev.filter(u => 
                            u.userId !== status.userId && u.guestId !== status.guestId
                        );
                    }
                });
            }
        });
        wsCleanupRef.current.push(unsubAdminStatus);
    };

    const subscribeToSession = (sessionId) => {
        // Prevent duplicate subscriptions to same session
        if (sessionSubscribedRef.current === sessionId) {
            console.log('[AdminChat] Already subscribed to session:', sessionId);
            return;
        }
        
        sessionSubscribedRef.current = sessionId;
        console.log('[AdminChat] Subscribing to session:', sessionId);
        
        webSocketService.subscribeToSession(sessionId, (message) => {
            if (!isMountedRef.current) return;
            
            console.log('[AdminChat] Received message from session:', message);
            
            setMessages(prev => {
                // Check if message already exists (by id)
                if (message.id && prev.some(m => m.id === message.id)) {
                    return prev;
                }
                
                // If this is our own message coming back from server, 
                // replace temp message with real one
                if (message.senderType === 'ADMIN' || message.senderType === 'STAFF') {
                    // Find and remove temp message, add real message
                    const filtered = prev.filter(m => !String(m.id).startsWith('temp_'));
                    return [...filtered, message];
                }
                
                // Message from USER - add to messages
                return [...prev, message];
            });
            
            // Update typing status
            if (message.senderType === 'USER') {
                setUserTyping(false);
            }
        });

        // Subscribe to typing indicator for this session
        const unsubTyping = webSocketService.onTyping((indicator) => {
            if (!isMountedRef.current) return;
            
            if (indicator.sessionId === sessionId && indicator.userType === 'USER') {
                setUserTyping(indicator.typing);
            }
        });
        wsCleanupRef.current.push(unsubTyping);
    };

    // ==================== Message Handling ====================

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !selectedSession) return;

        const content = inputValue.trim();
        setInputValue('');

        // Add admin message immediately (optimistic update)
        const tempId = `temp_${Date.now()}`;
        const tempMessage = {
            id: tempId,
            senderType: 'ADMIN',
            content: content,
            sentAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            if (wsConnected && webSocketService.isConnected()) {
                // Send via WebSocket
                console.log('[Admin] Sending via WebSocket...');
                const sent = webSocketService.sendMessage({
                    sessionId: selectedSession.id,
                    senderType: 'ADMIN',
                    content: content,
                    messageType: 'TEXT'
                });
                
                if (!sent) {
                    // WebSocket send failed, fallback to REST
                    console.log('[Admin] WebSocket send failed, using REST...');
                    const message = await sendRestAdminMessage(selectedSession.id, content);
                    setMessages(prev => {
                        const filtered = prev.filter(m => m.id !== tempId);
                        return [...filtered, message];
                    });
                }
            } else {
                // Fallback to REST
                console.log('[Admin] WebSocket not connected, using REST...');
                const message = await sendRestAdminMessage(selectedSession.id, content);
                setMessages(prev => {
                    const filtered = prev.filter(m => m.id !== tempId);
                    return [...filtered, message];
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setInputValue(content); // Restore input on error
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove temp message
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);

        // Send typing indicator
        if (wsConnected && selectedSession?.id) {
            webSocketService.sendTyping(selectedSession.id, true, 'ADMIN', 'Nhân viên');

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                webSocketService.sendTyping(selectedSession.id, false, 'ADMIN', 'Nhân viên');
            }, 2000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    /**
     * Toggle between AI Bot mode and Manual Staff mode
     */
    const handleToggleChatMode = async () => {
        if (!selectedSession?.id) return;
        
        const newMode = chatMode === 'BOT' ? 'STAFF' : 'BOT';
        
        try {
            const result = await toggleChatModeApi(selectedSession.id, newMode);
            setChatMode(result.mode);
            
            // Update selected session status
            setSelectedSession(prev => ({
                ...prev,
                status: result.status
            }));
            
            // Refresh sessions list
            loadSessions();
            
            console.log(`Chat mode toggled to: ${result.mode}`);
        } catch (error) {
            console.error('Error toggling chat mode:', error);
        }
    };

    // ==================== Utility ====================

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        return date.toLocaleDateString('vi-VN');
    };

    const isUserOnline = (session) => {
        return onlineUsers.some(u => 
            (session.userId && u.userId === session.userId) ||
            (session.guestId && u.guestId === session.guestId)
        );
    };

    const filteredSessions = sessions.filter(session => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            session.userName?.toLowerCase().includes(search) ||
            session.title?.toLowerCase().includes(search) ||
            session.guestId?.toLowerCase().includes(search)
        );
    });

    // ==================== Render ====================

    return (
        <div className="admin-chat-panel">
            {/* Sidebar - Session List */}
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2>💬 Live Chat</h2>
                    <div className="flex items-center gap-2">
                        <span className={`status-indicator ${wsConnected ? 'online' : 'offline'}`}>
                            {wsConnected ? '🟢' : '🔴'}
                        </span>
                        {unreadTotal > 0 && (
                            <span className="unread-badge">{unreadTotal}</span>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="sidebar-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Session List */}
                <div className="session-list">
                    {error ? (
                        <div className="error-state" style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            margin: '10px'
                        }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>⚠️</span>
                            <p style={{ marginBottom: '10px' }}>{error}</p>
                            <button 
                                onClick={() => { setError(null); loadSessions(); }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : isLoading && sessions.length === 0 ? (
                        <div className="loading-state" style={{
                            padding: '40px',
                            textAlign: 'center'
                        }}>
                            <div className="spinner" style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #e0e0e0',
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 20px'
                            }}></div>
                            <p style={{ color: '#888' }}>Đang tải...</p>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="empty-state">
                            <span>📭</span>
                            <p>Chưa có cuộc hội thoại</p>
                        </div>
                    ) : (
                        filteredSessions.map(session => (
                            <div
                                key={session.id}
                                className={`session-item ${selectedSession?.id === session.id ? 'active' : ''}`}
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="session-avatar">
                                    <span>{session.userId ? '👤' : '👻'}</span>
                                    {isUserOnline(session) && (
                                        <span className="online-dot"></span>
                                    )}
                                </div>
                                <div className="session-info">
                                    <div className="session-name">
                                        {session.userName || `Khách #${session.guestId?.substring(0, 6)}`}
                                    </div>
                                    <div className="session-preview">
                                        {session.title || 'Cuộc trò chuyện mới'}
                                    </div>
                                </div>
                                <div className="session-meta">
                                    <span className="session-time">
                                        {formatDate(session.updatedAt)}
                                    </span>
                                    {session.unreadCount > 0 && (
                                        <span className="session-unread">{session.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                {selectedSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <div className="chat-header-avatar">
                                    <span>{selectedSession.userId ? '👤' : '👻'}</span>
                                    {isUserOnline(selectedSession) && (
                                        <span className="online-dot"></span>
                                    )}
                                </div>
                                <div>
                                    <h3>
                                        {selectedSession.userName || 
                                         `Khách #${selectedSession.guestId?.substring(0, 8)}`}
                                    </h3>
                                    <span className={`status-text ${isUserOnline(selectedSession) ? 'online' : ''}`}>
                                        {isUserOnline(selectedSession) ? '🟢 Đang online' : '⚪ Offline'}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                {/* Toggle AI/Staff Mode Button */}
                                <button 
                                    className={`toggle-mode-btn ${chatMode.toLowerCase()}`}
                                    onClick={handleToggleChatMode}
                                    title={chatMode === 'BOT' 
                                        ? 'Đang ở chế độ AI Bot. Click để chuyển sang Nhân viên.' 
                                        : 'Đang ở chế độ Nhân viên. Click để chuyển sang AI Bot.'}
                                >
                                    {chatMode === 'BOT' ? (
                                        <>
                                            <span className="mode-icon">🤖</span>
                                            <span className="mode-text">AI Bot</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="mode-icon">👨‍💼</span>
                                            <span className="mode-text">Nhân viên</span>
                                        </>
                                    )}
                                    <span className="toggle-arrow">⇄</span>
                                </button>
                                
                                <span className={`session-status ${selectedSession.status.toLowerCase()}`}>
                                    {selectedSession.status === 'ACTIVE' ? '🤖 Bot' :
                                     selectedSession.status === 'WAITING_STAFF' ? '⏳ Chờ' :
                                     selectedSession.status === 'WITH_STAFF' ? '👨‍💼 Staff' : '✅ Đóng'}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message, index) => {
                                        const isAdmin = message.senderType === 'ADMIN' || 
                                                       message.senderType === 'STAFF';
                                        const isSystem = message.senderType === 'SYSTEM';
                                        const isBot = message.senderType === 'BOT';
                                        
                                        // Determine message class
                                        let messageClass = 'user';
                                        if (isAdmin) messageClass = 'admin';
                                        if (isSystem) messageClass = 'system';
                                        
                                        return (
                                            <div
                                                key={message.id || index}
                                                className={`message ${messageClass}`}
                                            >
                                                <div className="message-content">
                                                    {!isSystem && (
                                                        <div className="message-sender">
                                                            {isBot ? '🤖 Bot' :
                                                             isAdmin ? '👨‍💼 Bạn' : '👤 Khách'}
                                                        </div>
                                                    )}
                                                    <div className={`message-bubble ${message.senderType.toLowerCase()}`}>
                                                        {message.content}
                                                    </div>
                                                    {!isSystem && (
                                                        <div className="message-time">
                                                            {formatTime(message.sentAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {userTyping && (
                                        <div className="message user">
                                            <div className="message-content">
                                                <div className="message-sender">👤 Khách</div>
                                                <div className="message-bubble user typing">
                                                    <span className="dot"></span>
                                                    <span className="dot"></span>
                                                    <span className="dot"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <div className="chat-input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-session">
                        <span className="icon">💬</span>
                        <h3>Chọn cuộc hội thoại</h3>
                        <p>Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu chat</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatPanel;

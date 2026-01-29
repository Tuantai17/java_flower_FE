import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    createOrGetSession, 
    sendMessage, 
    requestStaffSupport,
    getGuestId,
    saveSessionId,
    getSavedSessionId
} from '../../api/chatApi';

/**
 * ProductSuggestionCard Component
 * Renders inline product card in chat messages - compact horizontal carousel style
 */
const ProductSuggestionCard = ({ product }) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    
    const getImageUrl = (thumbnail) => {
        if (!thumbnail) return '/placeholder-flower.jpg';
        if (thumbnail.startsWith('http')) return thumbnail;
        return `${API_BASE_URL}${thumbnail}`;
    };

    return (
        <Link 
            to={`/product/${product.slug}`}
            className="block bg-white rounded-lg border border-gray-100 overflow-hidden 
                hover:shadow-md hover:border-pink-200 transition-all duration-200 group"
        >
            {/* Product Image - square ratio */}
            <div className="w-full aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                <img 
                    src={getImageUrl(product.thumbnail)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = '/placeholder-flower.jpg';
                    }}
                />
            </div>
            
            {/* Product Info - compact */}
            <div className="p-2 bg-white">
                <h4 className="text-[11px] font-medium text-gray-700 line-clamp-2 leading-tight min-h-[28px]">
                    {product.name}
                </h4>
                <div className="mt-1">
                    {product.salePrice ? (
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-rose-500">
                                {product.salePrice}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                                {product.price}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs font-bold text-rose-500">
                            {product.price}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

/**
 * ChatWidget Component
 * A floating chat widget for customer support with AI chatbot
 */
const ChatWidget = () => {
    // State
    const [isOpen, setIsOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [quickReplies, setQuickReplies] = useState([]);
    const [error, setError] = useState(null);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Initialize session when widget opens
    useEffect(() => {
        if (isOpen && !session) {
            initializeSession();
        }
    }, [isOpen, session]);

    // Focus input when widget opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Initialize or restore chat session
    const initializeSession = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const guestId = getGuestId();
            const sessionData = await createOrGetSession(guestId);
            
            setSession(sessionData);
            setMessages(sessionData.messages || []);
            saveSessionId(sessionData.id);

            // Set default quick replies
            setQuickReplies([
                'Giá hoa hồng?',
                'Thời gian giao hàng?',
                'Cách đặt hàng?',
                'Liên hệ cửa hàng'
            ]);
        } catch (err) {
            console.error('Error initializing session:', err);
            setError('Không thể kết nối. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    // Send message
    const handleSendMessage = async (content = inputValue.trim()) => {
        if (!content || isLoading) return;

        try {
            setIsLoading(true);
            setIsTyping(true);
            setInputValue('');
            setError(null);

            // Add user message immediately
            const tempUserMessage = {
                id: Date.now(),
                senderType: 'USER',
                content: content,
                sentAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempUserMessage]);

            // Send to API
            const response = await sendMessage({
                sessionId: session?.id,
                guestId: getGuestId(),
                content: content
            });

            // Update with real messages
            setMessages(prev => {
                // Remove temp message and add real ones
                const filtered = prev.filter(m => m.id !== tempUserMessage.id);
                return [...filtered, response.userMessage, response.botMessage];
            });

            // Update quick replies if provided
            if (response.quickReplies) {
                setQuickReplies(response.quickReplies);
            }

            // Update session ID if new
            if (response.sessionId && !session?.id) {
                setSession(prev => ({ ...prev, id: response.sessionId }));
                saveSessionId(response.sessionId);
            }

        } catch (err) {
            console.error('Error sending message:', err);
            setError('Gửi tin nhắn thất bại. Vui lòng thử lại.');
            // Remove the temp message on error
            setMessages(prev => prev.filter(m => m.id !== Date.now()));
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    // Handle quick reply click
    const handleQuickReply = (reply) => {
        handleSendMessage(reply);
    };

    // Handle staff support request
    const handleRequestStaff = async () => {
        if (!session?.id) return;

        try {
            setIsLoading(true);
            const updatedSession = await requestStaffSupport(session.id);
            setSession(updatedSession);
            setMessages(updatedSession.messages || []);
        } catch (err) {
            console.error('Error requesting staff:', err);
            setError('Không thể gửi yêu cầu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Get sender display info
    const getSenderInfo = (senderType) => {
        switch (senderType) {
            case 'BOT':
                return { name: 'Trợ lý', color: 'bg-gradient-to-r from-pink-500 to-rose-500', icon: '🌸' };
            case 'STAFF':
                return { name: 'Nhân viên', color: 'bg-gradient-to-r from-blue-500 to-indigo-500', icon: '👨‍💼' };
            case 'SYSTEM':
                return { name: 'Hệ thống', color: 'bg-gray-400', icon: '⚙️' };
            default:
                return { name: 'Bạn', color: 'bg-gradient-to-r from-emerald-500 to-teal-500', icon: '' };
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl 
                    flex items-center justify-center transition-all duration-300 
                    hover:scale-110 focus:outline-none focus:ring-4 focus:ring-pink-300
                    ${isOpen 
                        ? 'bg-gray-600 rotate-0' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 animate-bounce hover:animate-none'
                    }`}
                aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
            >
                {isOpen ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <span className="text-3xl">💬</span>
                )}
            </button>

            {/* Chat Window */}
            <div 
                className={`fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] 
                    bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden
                    transition-all duration-300 transform origin-bottom-right
                    ${isOpen 
                        ? 'scale-100 opacity-100 translate-y-0' 
                        : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
                    }`}
                style={{ height: 'min(600px, calc(100vh - 12rem))' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🌸</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Flower Shop</h3>
                                <p className="text-xs text-pink-100">
                                    {session?.status === 'WAITING_STAFF' 
                                        ? '⏳ Đang chờ nhân viên...' 
                                        : session?.status === 'WITH_STAFF'
                                        ? '👨‍💼 Đang chat với nhân viên'
                                        : '🤖 Trợ lý ảo đang hỗ trợ bạn'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ height: 'calc(100% - 180px)' }}>
                    {isLoading && messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                        </div>
                    ) : error && messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <span className="text-4xl mb-2">😔</span>
                            <p className="text-gray-600">{error}</p>
                            <button 
                                onClick={initializeSession}
                                className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-full text-sm hover:bg-pink-600 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <>
                            {messages.map((message, index) => {
                                const isUser = message.senderType === 'USER';
                                const senderInfo = getSenderInfo(message.senderType);
                                
                                return (
                                    <div 
                                        key={message.id || index}
                                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
                                            {/* Sender info for non-user messages */}
                                            {!isUser && (
                                                <div className="flex items-center space-x-1 mb-1 ml-1">
                                                    <span className="text-xs">{senderInfo.icon}</span>
                                                    <span className="text-xs text-gray-500 font-medium">{senderInfo.name}</span>
                                                </div>
                                            )}
                                            
                                            {/* Message bubble */}
                                            <div 
                                                className={`px-4 py-2.5 rounded-2xl shadow-sm
                                                    ${isUser 
                                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md' 
                                                        : message.senderType === 'SYSTEM'
                                                        ? 'bg-gray-200 text-gray-700 rounded-bl-md italic text-sm'
                                                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                            </div>
                                            
                                            {/* Product Suggestion Cards - horizontal scrollable carousel */}
                                            {!isUser && message.metadata && message.messageType === 'PRODUCT' && (() => {
                                                try {
                                                    const products = JSON.parse(message.metadata);
                                                    if (Array.isArray(products) && products.length > 0) {
                                                        return (
                                                            <div 
                                                                className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide"
                                                                style={{ 
                                                                    scrollbarWidth: 'none', 
                                                                    msOverflowStyle: 'none',
                                                                    WebkitOverflowScrolling: 'touch'
                                                                }}
                                                            >
                                                                {products.slice(0, 6).map((product) => (
                                                                    <div 
                                                                        key={product.id} 
                                                                        className="flex-shrink-0"
                                                                        style={{ width: '120px' }}
                                                                    >
                                                                        <ProductSuggestionCard product={product} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                } catch (e) {
                                                    console.error('Failed to parse product metadata:', e);
                                                }
                                                return null;
                                            })()}
                                            
                                            {/* Time */}
                                            <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                                                {formatTime(message.sentAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Quick Replies */}
                {quickReplies.length > 0 && !isLoading && (
                    <div className="px-4 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-2">
                        {quickReplies.slice(0, 4).map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="px-3 py-1.5 text-xs bg-pink-50 text-pink-600 rounded-full 
                                    hover:bg-pink-100 transition-colors border border-pink-200 truncate max-w-[45%]"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm
                                focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white
                                transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full
                                hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-pink-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>

                    {/* Staff Support Button */}
                    {session?.status === 'ACTIVE' && (
                        <button
                            onClick={handleRequestStaff}
                            disabled={isLoading}
                            className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-pink-600 
                                transition-colors flex items-center justify-center space-x-1"
                        >
                            <span>🙋</span>
                            <span>Cần nhân viên hỗ trợ trực tiếp</span>
                        </button>
                    )}

                    {/* Error message */}
                    {error && messages.length > 0 && (
                        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatWidget;

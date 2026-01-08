import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * WebSocket Service for Live Chat
 * Handles STOMP over SockJS connection for real-time messaging
 */

// WebSocket URL should NOT include /api - it connects directly to /ws/chat
const getWebSocketUrl = () => {
    // Remove /api suffix if present in the API URL
    let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    baseUrl = baseUrl.replace(/\/api$/, ''); // Remove trailing /api
    return `${baseUrl}/ws/chat`;
};

const WS_URL = getWebSocketUrl();

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.isConnecting = false;
        this.subscriptions = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageHandlers = [];
        this.connectionHandlers = [];
        this.typingHandlers = [];
        this.adminStatusHandlers = [];
    }

    /**
     * Connect to WebSocket server
     * @param {Object} options - Connection options
     * @param {string} options.token - JWT token for authentication
     * @param {string} options.guestId - Guest ID for anonymous users
     * @param {Long} options.sessionId - Current chat session ID
     */
    connect(options = {}) {
        return new Promise((resolve, reject) => {
            // Already connected - resolve immediately
            if (this.connected && this.client?.active) {
                console.log('[WS] Already connected, skipping connection');
                resolve();
                return;
            }

            // Already connecting - wait for connection
            if (this.isConnecting) {
                console.log('[WS] Connection in progress, waiting...');
                // Wait for existing connection
                const checkInterval = setInterval(() => {
                    if (this.connected && this.client?.active) {
                        clearInterval(checkInterval);
                        resolve();
                    } else if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        // Try again
                        this.connect(options).then(resolve).catch(reject);
                    }
                }, 500);
                return;
            }

            this.isConnecting = true;

            try {
                // Create SockJS connection
                const socket = new SockJS(WS_URL);

                this.client = new Client({
                    webSocketFactory: () => socket,
                    debug: (str) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[WS Debug]', str);
                        }
                    },
                    reconnectDelay: this.reconnectDelay,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                });

                // On connect
                this.client.onConnect = (frame) => {
                    console.log('[WS] WebSocket connected successfully');
                    this.connected = true;
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;

                    // Store token in session if provided
                    if (options.token) {
                        this.client.connectHeaders = { 
                            Authorization: `Bearer ${options.token}` 
                        };
                    }

                    // Notify connection handlers
                    this.connectionHandlers.forEach(handler => 
                        handler({ status: 'connected', frame })
                    );

                    // Send connect message to server
                    this.sendConnect(options);

                    resolve();
                };

                // On disconnect
                this.client.onDisconnect = (frame) => {
                    console.log('[WS] WebSocket disconnected');
                    this.connected = false;
                    this.isConnecting = false;
                    this.connectionHandlers.forEach(handler => 
                        handler({ status: 'disconnected', frame })
                    );
                };

                // On error
                this.client.onStompError = (frame) => {
                    console.error('[WS] WebSocket STOMP error:', frame);
                    this.isConnecting = false;
                    this.connectionHandlers.forEach(handler => 
                        handler({ status: 'error', error: frame })
                    );
                    reject(new Error(frame.body || 'STOMP Error'));
                };

                // On WebSocket close
                this.client.onWebSocketClose = (event) => {
                    console.log('[WS] WebSocket closed');
                    this.connected = false;
                    this.isConnecting = false;
                    
                    // Auto reconnect
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        console.log(`[WS] Reconnecting... attempt ${this.reconnectAttempts}`);
                    }
                };

                // Activate connection
                this.client.activate();

            } catch (error) {
                console.error('[WS] WebSocket connection error:', error);
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.client) {
            // Unsubscribe all
            Object.keys(this.subscriptions).forEach(key => {
                if (this.subscriptions[key]) {
                    this.subscriptions[key].unsubscribe();
                }
            });
            this.subscriptions = {};

            // Deactivate client
            this.client.deactivate();
            this.connected = false;
            console.log('WebSocket disconnected');
        }
    }

    /**
     * Send connect message to register with server
     */
    sendConnect(options) {
        if (!this.connected || !this.client) return;

        this.client.publish({
            destination: '/app/chat.connect',
            body: JSON.stringify({
                guestId: options.guestId,
                sessionId: options.sessionId
            })
        });
    }

    /**
     * Subscribe to a chat session
     * @param {Long} sessionId - Session ID to subscribe
     * @param {Function} messageCallback - Callback for new messages
     */
    subscribeToSession(sessionId, messageCallback) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return null;
        }

        const topic = `/topic/chat/${sessionId}`;
        
        // Unsubscribe if already subscribed
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
        }

        // Subscribe to session topic
        this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
            const data = JSON.parse(message.body);
            console.log('[WS] Received message:', data);
            
            // Call message handlers
            this.messageHandlers.forEach(handler => handler(data));
            
            // Call specific callback
            if (messageCallback) {
                messageCallback(data);
            }
        });

        // Subscribe to typing indicator
        const typingTopic = `/topic/chat/${sessionId}/typing`;
        this.subscriptions[typingTopic] = this.client.subscribe(typingTopic, (message) => {
            const data = JSON.parse(message.body);
            this.typingHandlers.forEach(handler => handler(data));
        });

        console.log(`Subscribed to session ${sessionId}`);
        return this.subscriptions[topic];
    }

    /**
     * Subscribe to admin status updates
     */
    subscribeToAdminStatus(callback) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return null;
        }

        const topic = '/topic/admin-status';
        
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
        }

        this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
            const data = JSON.parse(message.body);
            this.adminStatusHandlers.forEach(handler => handler(data));
            if (callback) callback(data);
        });

        return this.subscriptions[topic];
    }

    /**
     * Subscribe to admin notifications (new sessions, new messages)
     * This is the main channel for realtime admin updates
     */
    subscribeToAdminNotifications(callback) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return null;
        }

        const topic = '/topic/admin/notifications';
        
        if (this.subscriptions[topic]) {
            this.subscriptions[topic].unsubscribe();
        }

        console.log('[WS] Subscribing to admin notifications:', topic);
        
        this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('[WS] Admin notification received:', data.type);
                if (callback) callback(data);
            } catch (e) {
                console.error('[WS] Error parsing admin notification:', e);
            }
        });

        // Also subscribe to /topic/admin/online-status for online user updates
        const onlineStatusTopic = '/topic/admin/online-status';
        if (!this.subscriptions[onlineStatusTopic]) {
            this.subscriptions[onlineStatusTopic] = this.client.subscribe(onlineStatusTopic, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    this.adminStatusHandlers.forEach(handler => handler(data));
                } catch (e) {
                    console.error('[WS] Error parsing online status:', e);
                }
            });
        }

        return () => {
            if (this.subscriptions[topic]) {
                this.subscriptions[topic].unsubscribe();
                delete this.subscriptions[topic];
            }
        };
    }

    /**
     * Send a chat message
     * @param {Object} message - Message object
     */
    sendMessage(message) {
        if (!this.connected || !this.client) {
            console.error('WebSocket not connected');
            return false;
        }

        this.client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({
                sessionId: message.sessionId,
                senderType: message.senderType || 'USER',
                senderName: message.senderName,
                content: message.content,
                messageType: message.messageType || 'TEXT',
                guestId: message.guestId,
                metadata: message.metadata
            })
        });

        console.log('[WS] Sent message:', message);
        return true;
    }

    /**
     * Send typing indicator
     * @param {Long} sessionId - Session ID
     * @param {boolean} isTyping - Is user typing
     */
    sendTyping(sessionId, isTyping, userType = 'USER', displayName = 'User') {
        if (!this.connected || !this.client) return;

        this.client.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({
                sessionId,
                userType,
                displayName,
                typing: isTyping
            })
        });
    }

    /**
     * Mark messages as read
     * @param {Long} sessionId - Session ID
     * @param {string} readerType - USER or ADMIN
     */
    markAsRead(sessionId, readerType = 'USER') {
        if (!this.connected || !this.client) return;

        this.client.publish({
            destination: '/app/chat.read',
            body: JSON.stringify({ sessionId, readerType })
        });
    }

    // ==================== Event Handlers ====================

    /**
     * Add message handler
     */
    onMessage(handler) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Add connection handler
     */
    onConnection(handler) {
        this.connectionHandlers.push(handler);
        return () => {
            this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Add typing handler
     */
    onTyping(handler) {
        this.typingHandlers.push(handler);
        return () => {
            this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Add admin status handler
     */
    onAdminStatus(handler) {
        this.adminStatusHandlers.push(handler);
        return () => {
            this.adminStatusHandlers = this.adminStatusHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected && this.client?.active;
    }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;

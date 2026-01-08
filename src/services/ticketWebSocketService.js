import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws/chat';

let stompClient = null;
let isConnecting = false;
const subscriptions = new Map();
const connectionCallbacks = [];

/**
 * Ticket WebSocket Service
 * Quản lý kết nối STOMP để realtime chat
 */
const ticketWebSocketService = {
    /**
     * Kết nối WebSocket
     */
    connect: (onConnectedCallback) => {
        if (stompClient?.connected) {
            console.log('🔌 WebSocket already connected');
            if (onConnectedCallback) onConnectedCallback();
            return;
        }

        if (isConnecting) {
            console.log('🔌 WebSocket is connecting...');
            if (onConnectedCallback) connectionCallbacks.push(onConnectedCallback);
            return;
        }

        isConnecting = true;
        console.log('🔌 Connecting to WebSocket:', WS_URL);

        stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    // console.log('STOMP Debug:', str);
                }
            },
            onConnect: () => {
                console.log('✅ WebSocket connected');
                isConnecting = false;
                
                // Call all pending callbacks
                if (onConnectedCallback) onConnectedCallback();
                connectionCallbacks.forEach(cb => cb());
                connectionCallbacks.length = 0;
            },
            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame.headers['message']);
                isConnecting = false;
            },
            onDisconnect: () => {
                console.log('🔌 WebSocket disconnected');
                isConnecting = false;
            },
        });

        stompClient.activate();
    },

    /**
     * Ngắt kết nối
     */
    disconnect: () => {
        if (stompClient) {
            console.log('🔌 Disconnecting WebSocket...');
            stompClient.deactivate();
            stompClient = null;
            subscriptions.clear();
        }
    },

    /**
     * Subscribe vào ticket channel để nhận messages realtime
     */
    subscribeToTicket: (ticketId, onMessage) => {
        const destination = `/topic/tickets/${ticketId}`;
        
        if (subscriptions.has(destination)) {
            console.log(`Already subscribed to ${destination}`);
            return;
        }

        const doSubscribe = () => {
            if (!stompClient?.connected) {
                console.warn('Cannot subscribe - not connected');
                return;
            }

            console.log(`📡 Subscribing to ${destination}`);
            const subscription = stompClient.subscribe(destination, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log(`📨 Received message for ticket ${ticketId}:`, payload);
                    if (onMessage) onMessage(payload);
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            });

            subscriptions.set(destination, subscription);
        };

        if (stompClient?.connected) {
            doSubscribe();
        } else {
            ticketWebSocketService.connect(doSubscribe);
        }
    },

    /**
     * Unsubscribe khỏi ticket channel
     */
    unsubscribeFromTicket: (ticketId) => {
        const destination = `/topic/tickets/${ticketId}`;
        const subscription = subscriptions.get(destination);
        
        if (subscription) {
            console.log(`📡 Unsubscribing from ${destination}`);
            subscription.unsubscribe();
            subscriptions.delete(destination);
        }
    },

    /**
     * Subscribe vào admin notifications (ticket mới, tin nhắn mới, đơn hàng mới, đánh giá mới)
     */
    subscribeToAdminNotifications: (onNewTicket, onNewMessage, onNewOrder, onNewReview) => {
        const doSubscribe = () => {
            if (!stompClient?.connected) {
                console.warn('Cannot subscribe - not connected');
                return;
            }

            // Subscribe to new tickets
            const ticketDest = '/topic/admin/tickets/new';
            if (!subscriptions.has(ticketDest)) {
                console.log(`📡 Subscribing to ${ticketDest}`);
                const sub1 = stompClient.subscribe(ticketDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('🎫 New ticket notification:', payload);
                        if (onNewTicket) onNewTicket(payload);
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(ticketDest, sub1);
            }

            // Subscribe to new messages
            const msgDest = '/topic/admin/tickets/message';
            if (!subscriptions.has(msgDest)) {
                console.log(`📡 Subscribing to ${msgDest}`);
                const sub2 = stompClient.subscribe(msgDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('💬 New message notification:', payload);
                        if (onNewMessage) onNewMessage(payload);
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(msgDest, sub2);
            }

            // Subscribe to new orders
            const orderDest = '/topic/admin/orders/new';
            if (!subscriptions.has(orderDest)) {
                console.log(`📡 Subscribing to ${orderDest}`);
                const sub3 = stompClient.subscribe(orderDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('🛒 New order notification:', payload);
                        if (onNewOrder) onNewOrder(payload);
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(orderDest, sub3);
            }

            // Subscribe to order cancellations
            const cancelDest = '/topic/admin/orders/cancelled';
            if (!subscriptions.has(cancelDest)) {
                console.log(`📡 Subscribing to ${cancelDest}`);
                const sub4 = stompClient.subscribe(cancelDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('❌ Order cancelled notification:', payload);
                        if (onNewOrder) onNewOrder(payload); // Use same handler
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(cancelDest, sub4);
            }

            // Subscribe to payments
            const paymentDest = '/topic/admin/orders/payment';
            if (!subscriptions.has(paymentDest)) {
                console.log(`📡 Subscribing to ${paymentDest}`);
                const sub5 = stompClient.subscribe(paymentDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('💰 Payment notification:', payload);
                        if (onNewOrder) onNewOrder(payload); // Use same handler
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(paymentDest, sub5);
            }

            // Subscribe to new reviews
            const reviewDest = '/topic/admin/reviews/new';
            if (!subscriptions.has(reviewDest)) {
                console.log(`📡 Subscribing to ${reviewDest}`);
                const sub6 = stompClient.subscribe(reviewDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('⭐ New review notification:', payload);
                        if (onNewReview) onNewReview(payload);
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(reviewDest, sub6);
            }

            // Subscribe to review updates (status changes, replies)
            const reviewUpdateDest = '/topic/admin/reviews/update';
            if (!subscriptions.has(reviewUpdateDest)) {
                console.log(`📡 Subscribing to ${reviewUpdateDest}`);
                const sub7 = stompClient.subscribe(reviewUpdateDest, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('⭐ Review update notification:', payload);
                        if (onNewReview) onNewReview(payload);
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(reviewUpdateDest, sub7);
            }
        };

        if (stompClient?.connected) {
            doSubscribe();
        } else {
            ticketWebSocketService.connect(doSubscribe);
        }
    },

    /**
     * Subscribe vào user notifications
     */
    subscribeToUserNotifications: (userId, onNotification) => {
        if (!userId) return;

        const destination = `/topic/user/${userId}/notifications`;

        const doSubscribe = () => {
            if (!stompClient?.connected) {
                console.warn('Cannot subscribe - not connected');
                return;
            }

            if (!subscriptions.has(destination)) {
                console.log(`📡 Subscribing to ${destination}`);
                const sub = stompClient.subscribe(destination, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('🔔 User notification:', payload);
                        if (onNotification) onNotification(payload);
                    } catch (err) {
                        console.error('Error parsing notification:', err);
                    }
                });
                subscriptions.set(destination, sub);
            }
        };

        if (stompClient?.connected) {
            doSubscribe();
        } else {
            ticketWebSocketService.connect(doSubscribe);
        }
    },

    /**
     * Subscribe vào product reviews để realtime update
     */
    subscribeToProductReviews: (productId, onReviewUpdate) => {
        if (!productId) return;

        const destination = `/topic/products/${productId}/reviews`;

        const doSubscribe = () => {
            if (!stompClient?.connected) {
                console.warn('Cannot subscribe - not connected');
                return;
            }

            if (!subscriptions.has(destination)) {
                console.log(`📡 Subscribing to ${destination}`);
                const sub = stompClient.subscribe(destination, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        console.log('⭐ Product review update:', payload);
                        if (onReviewUpdate) onReviewUpdate(payload);
                    } catch (err) {
                        console.error('Error parsing review update:', err);
                    }
                });
                subscriptions.set(destination, sub);
            }
        };

        if (stompClient?.connected) {
            doSubscribe();
        } else {
            ticketWebSocketService.connect(doSubscribe);
        }
    },

    /**
     * Unsubscribe khỏi product reviews
     */
    unsubscribeFromProductReviews: (productId) => {
        const destination = `/topic/products/${productId}/reviews`;
        const subscription = subscriptions.get(destination);
        
        if (subscription) {
            console.log(`📡 Unsubscribing from ${destination}`);
            subscription.unsubscribe();
            subscriptions.delete(destination);
        }
    },

    /**
     * Check trạng thái kết nối
     */
    isConnected: () => stompClient?.connected || false,
};

export default ticketWebSocketService;

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import AuthService from '../../../../api/services/AuthService';
import { ApiConfig } from '../../../../api/apiConfig/apiConfig';

// Socket URL - should match your backend socket server
const SOCKET_URL = ApiConfig.baseUrl?.replace('/api/', '').replace('/api', '') || window.location.origin;

export const useP2PChat = (orderId, currentUserId, onOrderStatusChange = null) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [counterparty, setCounterparty] = useState(null);
    const [counterpartyTyping, setCounterpartyTyping] = useState(false);
    const [counterpartyOnline, setCounterpartyOnline] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);

    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const onOrderStatusChangeRef = useRef(onOrderStatusChange);
    const token = localStorage.getItem('token');
    
    // Keep ref updated
    useEffect(() => {
        onOrderStatusChangeRef.current = onOrderStatusChange;
    }, [onOrderStatusChange]);

    // Initialize socket and fetch history
    useEffect(() => {
        if (!orderId || !token) return;

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        const socket = socketRef.current;

        // =====================================================================
        // SOCKET EVENT LISTENERS (matching backend exactly)
        // =====================================================================

        // Connection established
        socket.on('connect', () => {
            // Join the P2P chat room with orderId and token
            socket.emit('p2p:join', { orderId, token });
        });

        // Successfully joined the chat room
        // Response: { orderId, role, orderStatus, messagesMarkedRead, message }
        socket.on('p2p:joined', (data) => {
            setIsConnected(true);
            setUserRole(data.role);
            setOrderInfo(prev => ({ ...prev, status: data.orderStatus }));
            setError(null);
            
            // If messages were auto-marked as read on join, update local state
            if (data.messagesMarkedRead > 0) {
                // Update all incoming messages to READ status since backend already marked them
                // But skip system messages - they don't need read status
                setMessages(prev => prev.map(msg =>
                    !msg.isOwn && msg.status !== 'READ' && msg.messageType !== 'SYSTEM'
                        ? { ...msg, status: 'READ', readAt: new Date() }
                        : msg
                ));
            }
        });

        // Error from socket
        // Response: { message }
        socket.on('p2p:error', (data) => {
            console.error('❌ Socket error:', data);
            setError(data.message);
        });

        // New message received
        // Response: { _id, orderId, senderId, senderName, senderAvatar, receiverId, messageType, message, status, createdAt }
        socket.on('p2p:new_message', (message) => {
            setMessages(prev => {
                // Check if message already exists (prevent duplicates)
                if (prev.find(m => m._id === message._id)) return prev;
                return [...prev, {
                    ...message,
                    isOwn: message.senderId === currentUserId
                }];
            });
        });

        // System message received
        // Response: { _id, orderId, messageType, message, action, metadata, createdAt }
        socket.on('p2p:system_message', (message) => {
            setMessages(prev => {
                if (prev.find(m => m._id === message._id)) return prev;
                return [...prev, { 
                    ...message, 
                    isOwn: false,
                    messageType: 'SYSTEM',
                    // System messages don't have read/unread status
                    status: undefined
                }];
            });

            // Trigger order refresh on status change actions
            const statusChangeActions = ['PAYMENT_MARKED', 'CRYPTO_RELEASED', 'ORDER_CANCELLED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'ORDER_EXPIRED'];
            if (message.action && statusChangeActions.includes(message.action)) {
                if (onOrderStatusChangeRef.current) {
                    onOrderStatusChangeRef.current(message.action, message.metadata);
                }
            }
        });

        // Order status updated (direct status update event)
        // Response: { orderId, status, previousStatus, updatedAt, metadata }
        socket.on('p2p:order_updated', (data) => {
            setOrderStatus(data.status);
            setOrderInfo(prev => ({ ...prev, status: data.status }));
            
            // Notify parent component to refresh order details
            if (onOrderStatusChangeRef.current) {
                onOrderStatusChangeRef.current(data.status, data);
            }
        });

        // User is typing
        // Response: { oderId, isTyping, role } (note: backend uses "oderId" not "userId")
        socket.on('p2p:user_typing', (data) => {
            // Only show typing if it's not the current user
            if (data.oderId !== currentUserId) {
                setCounterpartyTyping(data.isTyping);
            }
        });

        // Message delivered
        // Response: { messageId, deliveredAt }
        socket.on('p2p:message_delivered', (data) => {
            setMessages(prev => prev.map(msg =>
                msg._id === data.messageId
                    ? { ...msg, status: 'DELIVERED', deliveredAt: data.deliveredAt }
                    : msg
            ));
        });

        // Messages marked as read
        // Response: { orderId, readBy, readAt, count }
        socket.on('p2p:messages_read', (data) => {
            // Update messages that the current user sent (they've been read by counterparty)
            // Skip system messages - they don't have read status
            setMessages(prev => prev.map(msg =>
                msg.senderId === currentUserId && msg.status !== 'READ' && msg.messageType !== 'SYSTEM'
                    ? { ...msg, status: 'READ', readAt: data.readAt }
                    : msg
            ));
        });

        // User joined the chat room
        // Response: { oderId, userName, role, timestamp }
        socket.on('p2p:user_joined', (data) => {
            if (data.oderId !== currentUserId) {
                setCounterpartyOnline(true);
                setCounterparty(prev => ({
                    ...prev,
                    userName: data.userName
                }));
            }
        });

        // User left the chat room
        // Response: { oderId, role, timestamp }
        socket.on('p2p:user_left', (data) => {
            if (data.oderId !== currentUserId) {
                setCounterpartyOnline(false);
            }
        });

        // User went offline (disconnected)
        // Response: { oderId, role, timestamp }
        socket.on('p2p:user_offline', (data) => {
            if (data.oderId !== currentUserId) {
                setCounterpartyOnline(false);
                setCounterpartyTyping(false);
            }
        });

        // Socket disconnected
        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Socket reconnected
        socket.on('reconnect', () => {
            socket.emit('p2p:join', { orderId, token });
        });

        // Fetch initial chat history
        fetchChatHistory();

        // Cleanup on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Leave the room before disconnecting
            socket.emit('p2p:leave', { orderId });
            socket.disconnect();
        };
    }, [orderId, token, currentUserId]);

    // Fetch chat history from REST API
    const fetchChatHistory = async (before = null) => {
        try {
            setLoading(true);
            const params = { limit: 50 };
            if (before) params.before = before;

            const response = await AuthService.getChatHistory(orderId, params);

            if (response?.success) {
                const { messages: newMessages, counterparty: cp, order, role, pagination } = response.data;

                // Process messages - filter out system messages from read status
                const processedMessages = (newMessages || []).map(msg => ({
                    ...msg,
                    isOwn: msg.senderId === currentUserId || msg.isOwn,
                    // System messages don't need read status
                    status: msg.messageType === 'SYSTEM' ? undefined : msg.status
                }));

                if (before) {
                    // Prepend older messages
                    setMessages(prev => [...processedMessages, ...prev]);
                } else {
                    setMessages(processedMessages);
                }

                setCounterparty(cp);
                setOrderInfo(order);
                setUserRole(role);
                setHasMore(pagination?.hasMore || false);
                
                // Set counterparty online status from API response if available
                if (cp?.isOnline !== undefined) {
                    setCounterpartyOnline(cp.isOnline);
                }
            }
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
            setError(err?.response?.data?.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    // Load more (older) messages
    const loadMore = useCallback(() => {
        if (messages.length > 0 && hasMore && !loading) {
            fetchChatHistory(messages[0]._id);
        }
    }, [messages, hasMore, loading]);

    // Send text message via Socket
    // Event: p2p:send_message - { orderId, message, messageType }
    const sendMessage = useCallback((text) => {
        return new Promise((resolve, reject) => {
            if (!text?.trim()) {
                reject(new Error('Message cannot be empty'));
                return;
            }

            if (!socketRef.current?.connected) {
                reject(new Error('Not connected to chat'));
                return;
            }

            setSending(true);

            // Send via socket - backend will save and broadcast via p2p:new_message
            socketRef.current.emit('p2p:send_message', {
                orderId,
                message: text.trim(),
                messageType: 'TEXT'
            });

            // Stop typing indicator
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            socketRef.current.emit('p2p:typing', { orderId, isTyping: false });

            // Reset sending state after a brief moment
            setTimeout(() => {
                setSending(false);
                resolve();
            }, 100);
        });
    }, [orderId]);

    // Upload image via REST API + notify via socket
    const uploadImage = useCallback(async (file) => {
        if (!file) return;

        try {
            setUploading(true);

            // Optimistic update with preview
            const tempId = `temp_${Date.now()}`;
            const previewUrl = URL.createObjectURL(file);
            const optimisticMessage = {
                _id: tempId,
                orderId,
                senderId: currentUserId,
                messageType: 'IMAGE',
                imageUrl: previewUrl,
                status: 'UPLOADING',
                isOwn: true,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, optimisticMessage]);

            // Upload via REST API
            const response = await AuthService.uploadChatImage(orderId, file);

            if (response?.success) {
                // Revoke preview URL
                URL.revokeObjectURL(previewUrl);

                // Replace optimistic message with real one
                setMessages(prev => prev.map(msg =>
                    msg._id === tempId ? { ...response.data, isOwn: true } : msg
                ));

                // Notify socket to broadcast to other users
                // Event: p2p:image_uploaded - { orderId, messageData }
                if (socketRef.current?.connected) {
                    socketRef.current.emit('p2p:image_uploaded', {
                        orderId,
                        messageData: response.data
                    });
                }

                return response.data;
            } else {
                // Remove failed message
                setMessages(prev => prev.filter(msg => msg._id !== tempId));
                URL.revokeObjectURL(previewUrl);
                throw new Error(response?.message || 'Failed to upload image');
            }
        } catch (err) {
            console.error('Failed to upload image:', err);
            throw err;
        } finally {
            setUploading(false);
        }
    }, [orderId, currentUserId]);

    // Send typing indicator
    // Event: p2p:typing - { orderId, isTyping }
    const sendTyping = useCallback((isTyping) => {
        if (!socketRef.current?.connected) return;

        socketRef.current.emit('p2p:typing', { orderId, isTyping });

        // Auto-stop typing after 3 seconds of inactivity
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('p2p:typing', { orderId, isTyping: false });
            }, 3000);
        }
    }, [orderId]);

    // Mark messages as read via socket only
    // Event: p2p:mark_read - { orderId }
    const markAsRead = useCallback(() => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('p2p:mark_read', { orderId });
        }
    }, [orderId]);

    // Delete message
    const deleteMessage = useCallback(async (messageId) => {
        try {
            const response = await AuthService.deleteChatMessage(messageId);
            if (response?.success) {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            }
            return response;
        } catch (err) {
            console.error('Failed to delete message:', err);
            throw err;
        }
    }, []);

    return {
        messages,
        isConnected,
        counterparty,
        counterpartyTyping,
        counterpartyOnline,
        orderInfo,
        orderStatus,
        userRole,
        loading,
        error,
        hasMore,
        sending,
        uploading,
        sendMessage,
        uploadImage,
        sendTyping,
        markAsRead,
        loadMore,
        deleteMessage,
        refetch: () => fetchChatHistory()
    };
};

export default useP2PChat;

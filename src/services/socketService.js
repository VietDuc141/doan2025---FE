import { io } from 'socket.io-client';

let socket = null;
let onlineStatusChangeCallback = null;

const log = {
    info: (...args) => console.log('[Socket]', ...args),
    error: (...args) => console.error('[Socket]', ...args),
    warn: (...args) => console.warn('[Socket]', ...args),
    debug: (...args) => console.debug('[Socket]', ...args)
};

export const initializeSocket = (userId) => {
    if (!socket) {
        log.info('Initializing socket connection...', { userId });

        // Replace with your actual backend WebSocket URL
        socket = io('http://localhost:3001', {
            autoConnect: true,
            reconnection: true,
        });

        socket.on('connect', () => {
            log.info('Connected to WebSocket server', { socketId: socket.id });
            socket.emit('user-connect', { userId });
            log.info('Sent user-connect event', { userId });

            if (onlineStatusChangeCallback) {
                onlineStatusChangeCallback('connect');
            }
        });

        socket.on('connect_error', (error) => {
            log.error('WebSocket connection error:', error.message);
        });

        socket.on('disconnect', (reason) => {
            log.warn('Disconnected from WebSocket server', { reason });
            if (onlineStatusChangeCallback) {
                onlineStatusChangeCallback('disconnect');
            }
        });

        socket.on('online-users-update', (data) => {
            log.debug('Received online users update', data);
            if (onlineStatusChangeCallback) {
                onlineStatusChangeCallback('update', data);
            }
        });

        // Content related events
        socket.on('content-update', (content) => {
            log.info('Received content update', { contentId: content?.id });
        });

        socket.on('settings-update', (settings) => {
            log.info('Received settings update', settings);
        });

        socket.on('player-status-change', (data) => {
            log.info('Player status changed', data);
        });

        // Start heartbeat
        setInterval(() => {
            if (socket.connected) {
                log.debug('Sending heartbeat');
                socket.emit('heartbeat');
            }
        }, 30000);
    }

    return socket;
};

export const getSocket = () => socket;

export const setOnlineStatusChangeCallback = (callback) => {
    onlineStatusChangeCallback = callback;
    log.debug('Online status change callback set');
};

export const disconnectSocket = () => {
    if (socket) {
        log.info('Disconnecting socket');
        socket.disconnect();
        socket = null;
    }
};

// Add helper methods for emitting events with logging
export const emitContentUpdate = (deviceId, content) => {
    if (socket && socket.connected) {
        log.info('Sending content update', { deviceId, contentId: content?.id });
        socket.emit('update-content', { deviceId, content });
    } else {
        log.warn('Cannot send content update - socket not connected');
    }
};

export const emitSettingsUpdate = (deviceId, settings) => {
    if (socket && socket.connected) {
        log.info('Sending settings update', { deviceId, settings });
        socket.emit('update-settings', { deviceId, settings });
    } else {
        log.warn('Cannot send settings update - socket not connected');
    }
};

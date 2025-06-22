import { io } from 'socket.io-client';

let socket = null;
let onlineStatusChangeCallback = null;

export const initializeSocket = (userId) => {
    if (!socket) {
        // Replace with your actual backend WebSocket URL
        socket = io('http://localhost:3001', {
            autoConnect: true,
            reconnection: true,
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            socket.emit('user-connect', { userId });
            if (onlineStatusChangeCallback) {
                onlineStatusChangeCallback('connect');
            }
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            if (onlineStatusChangeCallback) {
                onlineStatusChangeCallback('disconnect');
            }
        });

        socket.on('online-users-update', (data) => {
            if (onlineStatusChangeCallback) {
                onlineStatusChangeCallback('update', data);
            }
        });

        // Start heartbeat
        setInterval(() => {
            if (socket.connected) {
                socket.emit('heartbeat');
            }
        }, 30000);
    }

    return socket;
};

export const getSocket = () => socket;

export const setOnlineStatusChangeCallback = (callback) => {
    onlineStatusChangeCallback = callback;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

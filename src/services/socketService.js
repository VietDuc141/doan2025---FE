import { io } from 'socket.io-client';

let socket = null;

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
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
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

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

import { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '~/services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Khôi phục user từ localStorage khi khởi động
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    console.log("%c 1 --> Line: 8||useAuth.js\n user: ","color:#f0f;", user);
    const [userStatuses, setUserStatuses] = useState({});

    useEffect(() => {
        // Listen for user status changes when the socket is available
        const socket = getSocket();
        if (socket && user) {
            socket.on('user-status-change', (data) => {
                setUserStatuses(prev => ({
                    ...prev,
                    [data.userId]: {
                        isOnline: data.isOnline,
                        lastActive: data.lastActive
                    }
                }));
            });
        }

        return () => {
            if (socket) {
                socket.off('user-status-change');
            }
        };
    }, [user]);

    const login = (userData) => {
        // Chỉ set state, không lưu vào localStorage vì đã được xử lý trong loginMutation
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        setUserStatuses({});
        // Không cần xóa localStorage vì đã được xử lý trong useLogout mutation
    };

    const getUserStatus = (userId) => {
        return userStatuses[userId] || { isOnline: false, lastActive: null };
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, getUserStatus, userStatuses }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

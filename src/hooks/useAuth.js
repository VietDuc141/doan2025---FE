import { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '~/services/socketService';
import { useGetMe } from '~/api/queries/authQueries';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [userStatuses, setUserStatuses] = useState({});

    // Sử dụng useGetMe để fetch user info
    const { data: userData, isError } = useGetMe({
        enabled: !!localStorage.getItem('token'), // Chỉ fetch khi có token
        retry: 1,
        onError: () => {
            // Nếu fetch thất bại (token hết hạn hoặc không hợp lệ)
            logout();
        },
    });

    // Cập nhật user state khi userData thay đổi
    useEffect(() => {
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }, [userData]);

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
        setUser(userData);
        // Invalidate và refetch user info sau khi login
        queryClient.invalidateQueries(['me']);
    };

    const logout = () => {
        setUser(null);
        setUserStatuses({});
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        queryClient.clear(); // Clear all queries from cache
    };

    const getUserStatus = (userId) => {
        return userStatuses[userId] || { isOnline: false, lastActive: null };
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            getUserStatus,
            userStatuses,
            isLoading: !user && !!localStorage.getItem('token'),
            isAuthenticated: !!user
        }}>
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

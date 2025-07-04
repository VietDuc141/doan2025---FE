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

    const token = localStorage.getItem('token');
    const { data: userData } = useGetMe();

    // Chỉ cập nhật user state khi thực sự có thay đổi
    useEffect(() => {
        if (!userData) return; // Không làm gì nếu không có userData

        const currentUserStr = JSON.stringify(user);
        const newUserStr = JSON.stringify(userData);

        if (currentUserStr !== newUserStr) {
            setUser(userData);
            localStorage.setItem('user', newUserStr);
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

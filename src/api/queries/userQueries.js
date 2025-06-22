import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import instance from '../axios';  // Sửa import cho đúng
import { useEffect } from 'react';
import { setOnlineStatusChangeCallback } from '~/services/socketService'; // Giả sử bạn có một file socket.js để quản lý socket

// Query keys
export const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    list: (filters) => [...userKeys.lists(), { ...filters }],
    details: () => [...userKeys.all, 'detail'],
    detail: (id) => [...userKeys.details(), id],
    onlineCount: () => [...userKeys.all, 'online-count'],
};

// GET all users
export const useUsers = (filters) => {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: async () => {
            const { data } = await instance.get('/users', { params: filters });
            return data;
        },
    });
};

// GET single user
export const useUser = (id) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const { data } = await instance.get(`/users/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

// CREATE user
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData) => {
            const { data } = await instance.post('/users', userData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

// UPDATE user
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, userData }) => {
            const { data } = await instance.put(`/users/${id}`, userData);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

// DELETE user
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await instance.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

/**
 * Get count of online users
 * @route GET /api/users/online/count
 */
export const useOnlineUsersCount = () => {
    const queryClient = useQueryClient();

    // Đăng ký callback để lắng nghe sự thay đổi từ socket
    useEffect(() => {
        const handleOnlineStatusChange = (event, data) => {
            // Invalidate và refetch query khi có thay đổi
            queryClient.invalidateQueries({ queryKey: userKeys.onlineCount() });
        };

        // Đăng ký callback với socketService
        setOnlineStatusChangeCallback(handleOnlineStatusChange);

        // Cleanup when component unmounts
        return () => setOnlineStatusChangeCallback(null);
    }, [queryClient]);

    return useQuery({
        queryKey: userKeys.onlineCount(),
        queryFn: async () => {
            const response = await instance.get('/users/online/count');
            return response.data;
        },
        // Giảm refetchInterval xuống để đồng bộ tốt hơn với socket
        refetchInterval: 30 * 1000,
        // Tăng staleTime để tránh fetch không cần thiết
        staleTime: 10 * 1000,
    });
};

export const useActiveUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const response = await instance.put(`/users/${id}/status`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate contents query to refetch
            queryClient.invalidateQueries(userKeys.lists());
        },
    });
};

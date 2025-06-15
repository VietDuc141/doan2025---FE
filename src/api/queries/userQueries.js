import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axios';

// Query keys
export const userKeys = {
    all: ['users'],
    lists: () => [...userKeys.all, 'list'],
    list: (filters) => [...userKeys.lists(), { ...filters }],
    details: () => [...userKeys.all, 'detail'],
    detail: (id) => [...userKeys.details(), id],
};

// GET all users
export const useUsers = (filters) => {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: async () => {
            const { data } = await axiosInstance.get('/users', { params: filters });
            return data;
        },
    });
};

// GET single user
export const useUser = (id) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/users/${id}`);
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
            const { data } = await axiosInstance.post('/users', userData);
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
            const { data } = await axiosInstance.put(`/users/${id}`, userData);
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
            await axiosInstance.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

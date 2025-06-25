import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '../axios';
import { toast } from 'react-toastify';

export const planKeys = {
    all: ['plans'],
    lists: () => [...planKeys.all, 'list'],
    list: (filters) => [...planKeys.lists(), { ...filters }],
    details: () => [...planKeys.all, 'detail'],
    detail: (id) => [...planKeys.details(), id],
};

export const usePlans = (filters = {}) => {
    // Remove empty filters
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''));

    return useQuery({
        queryKey: planKeys.list(cleanFilters),
        queryFn: async () => {
            const response = await instance.get('/plans', {
                params: cleanFilters,
            });
            return response.data;
        },
    });
};

export const useUploadplan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const response = await instance.post('/plans', payload);
            console.log('response.data:', response.data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate các query campaign để reload lại danh sách
            queryClient.invalidateQueries({ queryKey: planKeys.lists?.() || ['plans'] });
            toast.success('Tạo lịch thành công!');
        },
        onError: () => {
            toast.error('Tạo lịch thất bại!');
        },
    });
};

export const useDeleteplan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (planID) => {
            const response = await instance.delete(`/plans/${planID}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate contents query to refetch
            queryClient.invalidateQueries(planKeys.lists());
        },
    });
};

export const useCampaignList = () => {
    return useQuery({
        queryKey: ['content-list', 'campaign'],
        queryFn: async () => {
            const response = await instance.get('/campaigns', {});
            return response.data;
        },
    });
};

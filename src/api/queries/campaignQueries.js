import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '../axios';
import { toast } from 'react-toastify';

export const campaignKeys = {
    all: ['campaigns'],
    lists: () => [...campaignKeys.all, 'list'],
    list: (filters) => [...campaignKeys.lists(), { ...filters }],
    details: () => [...campaignKeys.all, 'detail'],
    detail: (id) => [...campaignKeys.details(), id],
};

export const useCampaigns = (filters = {}) => {
    // Remove empty filters
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''));

    return useQuery({
        queryKey: campaignKeys.list(cleanFilters),
        queryFn: async () => {
            const response = await instance.get('/campaigns', {
                params: cleanFilters,
            });
            return response.data;
        },
    });
};
export const useContentList = () => {
    return useQuery({
        queryKey: ['content-list', 'content'],
        queryFn: async () => {
            const response = await instance.get('/content', {});
            return response.data;
        },
    });
};

export const useUploadCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const response = await instance.post('/campaigns', payload);
            console.log('response.data:', response.data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate các query campaign để reload lại danh sách
            queryClient.invalidateQueries({ queryKey: campaignKeys.lists?.() || ['campaigns'] });
            // toast.success('Tạo đợi phát thành công!');
        },
        onError: () => {
            console.error('Tạo đợt phát thất bại!');
        },
    });
};

export const useDeleteCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (campaignId) => {
            const response = await instance.delete(`/campaigns/${campaignId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate contents query to refetch
            queryClient.invalidateQueries(campaignKeys.lists());
        },
    });
};

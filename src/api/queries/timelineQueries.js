import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '../axios';
import { toast } from 'react-toastify';

export const timelineKeys = {
    all: ['timelines'],
    lists: () => [...timelineKeys.all, 'list'],
    list: (filters) => [...timelineKeys.lists(), { ...filters }],
    details: () => [...timelineKeys.all, 'detail'],
    detail: (id) => [...timelineKeys.details(), id],
};

export const useTimelines = (filters = {}) => {
    // Remove empty filters
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''));

    return useQuery({
        queryKey: timelineKeys.list(cleanFilters),
        queryFn: async () => {
            const response = await instance.get('/timelines', {
                params: cleanFilters,
            });
            return response.data;
        },
    });
};

export const useUploadTimeline = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const response = await instance.post('/timelines', payload);
            console.log('response.data:', response.data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate các query campaign để reload lại danh sách
            queryClient.invalidateQueries({ queryKey: timelineKeys.lists?.() || ['timelines'] });
            toast.success('Tạo khung giờ phát thành công!');
        },
        onError: () => {
            toast.error('Tạo khung giờ phát thất bại!');
        },
    });
};

export const useDeleteTimeline = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (timelineID) => {
            const response = await instance.delete(`/timelines/${timelineID}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate contents query to refetch
            queryClient.invalidateQueries(timelineKeys.lists());
        },
    });
};

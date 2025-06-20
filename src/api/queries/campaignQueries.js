import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import instance from '../axios';

export const getCampaignsList = async () => {
    const response = await instance.get('/campaigns');
    return response.data;
};

export const contentKeys = {
    all: ['campaigns'],
    lists: () => [...contentKeys.all, 'list'],
    list: (filters) => [...contentKeys.lists(), { ...filters }],
    details: () => [...contentKeys.all, 'detail'],
    detail: (id) => [...contentKeys.details(), id],
};

export const useCampaigns = (filters = {}) => {
    // Remove empty filters
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''));

    return useQuery({
        queryKey: contentKeys.list(cleanFilters),
        queryFn: async () => {
            const response = await instance.get('/campaigns', {
                params: cleanFilters,
            });
            return response.data;
        },
    });
};

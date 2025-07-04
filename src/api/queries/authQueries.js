import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../axios';

export const useLogin = () => {
    return useMutation({
        mutationFn: async (credentials) => {
            const { data } = await axiosInstance.post('/auth/login', credentials);
            const dataRes = data.data;
            console.log('Login response data:', data);

            // Lưu token vào localStorage
            if (dataRes.token) {
                console.log('Saving token to localStorage:', dataRes.token);
                localStorage.setItem('token', dataRes.token);
                localStorage.setItem('user', JSON.stringify(dataRes.user));

                // Verify if dataRes was saved
                const savedToken = localStorage.getItem('token');
                const savedUser = localStorage.getItem('user');
                console.log('Verified saved token:', savedToken);
                console.log('Verified saved user:', savedUser);
            } else {
                console.warn('No token received in response');
            }
            return dataRes;
        },
    });
};

export const useLogout = () => {
    return useMutation({
        mutationFn: async () => {
            try {
                // Gọi API logout nếu backend có endpoint này
                await axiosInstance.post('/auth/logout');
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                // Luôn xóa token và user info kể cả khi API fails
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
    });
};

export const useGetMe = () => {
    const token = localStorage.getItem('token');

    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/auth/me');
            return data.data.user;
        },
        enabled: !!token, // Chỉ gọi API khi có token
        staleTime: 1000 * 60 * 5, // Data được coi là fresh trong 5 phút
        cacheTime: 1000 * 60 * 30, // Cache được giữ trong 30 phút
        refetchOnWindowFocus: false, // Không refetch khi focus lại window
        refetchOnMount: false, // Không refetch khi component được mount lại
    });
};

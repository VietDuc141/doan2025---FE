import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../axios';

export const useLogin = () => {
    return useMutation({
        mutationFn: async (credentials) => {
            const { data } = await axiosInstance.post('/auth/login', credentials);
            // Lưu token vào localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
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
        }
    });
};

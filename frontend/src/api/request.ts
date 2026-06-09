import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

// Request interceptor for Auth
api.interceptors.request.use((config: any) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        config.headers = config.headers || {};
        config.headers['X-User-Role'] = user.role;
        config.headers['X-User-Name'] = user.username;
    }
    return config;
});

// Response interceptor for unified error handling
api.interceptors.response.use(
    (response: any) => {
        const res = response.data;
        if (res.code !== 200) {
            message.error(res.message || '操作失败');
            return Promise.reject(new Error(res.message || 'Error'));
        }
        return res.data;
    },
    (error: any) => {
        message.error(error.message || '网络错误');
        return Promise.reject(error);
    }
);

export default api;

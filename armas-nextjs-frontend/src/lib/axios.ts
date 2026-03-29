import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
let isRedirectingToLogin = false;

declare module 'axios' {
    export interface AxiosRequestConfig<D = any> {
        skipAuthRedirect?: boolean;
    }

    export interface InternalAxiosRequestConfig {
        skipAuthRedirect?: boolean;
    }
}

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const shouldSkipRedirect = error.config?.skipAuthRedirect;
            Cookies.remove('token');
            Cookies.remove('userRole');
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('armas_current_user_cache');
            }

            if (!shouldSkipRedirect && typeof window !== 'undefined' && window.location.pathname !== '/login' && !isRedirectingToLogin) {
                isRedirectingToLogin = true;
                console.error('Unauthorized access. Redirecting to login.');
                window.location.assign('/login');
            }
        } else {
            console.error('API Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

import axios from 'axios';

// Create axios instance with custom config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token, logging, etc.
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage if exists
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [${response.status}] ${response.config.url}`);
        }

        return response;
    },
    (error) => {
        const { response } = error;

        // Handle different error status codes
        if (response) {
            switch (response.status) {
                case 401:
                    // Unauthorized - redirect to login or clear token
                    localStorage.removeItem('accessToken');
                    console.error('Unauthorized - Please login again');
                    break;
                case 403:
                    console.error('Forbidden - You do not have permission');
                    break;
                case 404:
                    console.error('Not Found - Resource does not exist');
                    break;
                case 500:
                    console.error('Server Error - Please try again later');
                    break;
                default:
                    console.error(`Error: ${response.status} - ${response.statusText}`);
            }
        } else if (error.request) {
            // Network error
            console.error('Network Error - Please check your connection');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

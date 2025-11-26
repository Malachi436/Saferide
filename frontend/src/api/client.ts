/**
 * API Client
 * Base Axios client configuration for all API requests
 */

import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../state/authStore';

// Get API URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    if (state.user?.accessToken) {
      config.headers.set('Authorization', `Bearer ${state.user.accessToken}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
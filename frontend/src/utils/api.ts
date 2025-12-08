import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API configuration
// Use your computer's IP address for physical devices or emulators
// For local development, change 192.168.1.X to your computer's actual IP
const API_BASE_URL = 'http://192.168.100.3:3000';

interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    console.log('[API Client] Initializing with base URL:', API_BASE_URL);
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        console.log('[API Client] Making request to:', config.url || 'unknown');
        const token = await AsyncStorage.getItem('access_token');
        console.log('[API Client] Token exists:', !!token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('[API Client] Response received from:', response.config.url);
        console.log('[API Client] Response status:', response.status);
        console.log('[API Client] Response data:', JSON.stringify(response.data).substring(0, 200));
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        console.log('[API Client] Response error:', error.code, error.message);
        console.log('[API Client] Error status:', error.response?.status);

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            originalRequest._retry = true;

            try {
              const refreshToken = await AsyncStorage.getItem('refresh_token');
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }

              const response = await this.axiosInstance.post<{ access_token: string }>(
                '/auth/refresh',
                { refreshToken }
              );

              const { access_token } = response.data;
              await AsyncStorage.setItem('access_token', access_token);

              // Update authorization header
              originalRequest.headers.Authorization = `Bearer ${access_token}`;

              // Retry original request
              this.isRefreshing = false;
              this.onRefreshed(access_token);

              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              // Clear tokens and redirect to login
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('refresh_token');
              throw refreshError;
            }
          } else {
            // Wait for token refresh
            return new Promise((resolve) => {
              this.subscribeTokenRefresh((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  async setTokens(tokens: AuthTokens) {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
  }

  async clearTokens() {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  }

  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

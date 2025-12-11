import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.13:3000';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  async get<T>(path: string, config = {}) {
    const response = await this.client.get<T>(path, config);
    return response.data;
  }

  async post<T>(path: string, data?: any, config = {}) {
    const response = await this.client.post<T>(path, data, config);
    return response.data;
  }

  async put<T>(path: string, data?: any, config = {}) {
    const response = await this.client.put<T>(path, data, config);
    return response.data;
  }

  async patch<T>(path: string, data?: any, config = {}) {
    const response = await this.client.patch<T>(path, data, config);
    return response.data;
  }

  async delete<T>(path: string, config = {}) {
    const response = await this.client.delete<T>(path, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

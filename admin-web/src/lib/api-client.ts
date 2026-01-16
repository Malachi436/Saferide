import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

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
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return this.client(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

          if (!storedRefreshToken) {
            // No refresh token, logout
            this.handleLogout();
            return Promise.reject(error);
          }

          try {
            // Try to refresh the token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: storedRefreshToken
            });

            const { access_token } = response.data;
            
            if (access_token) {
              // Update token
              this.setToken(access_token);
              if (typeof window !== 'undefined') {
                localStorage.setItem('token', access_token);
              }

              // Process queued requests
              this.failedQueue.forEach(({ resolve }) => resolve(access_token));
              this.failedQueue = [];

              // Retry original request
              originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
              return this.client(originalRequest);
            } else {
              throw new Error('No access token received');
            }
          } catch (refreshError) {
            // Refresh failed, logout
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
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

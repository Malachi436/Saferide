/**
 * Authentication Service
 * Handles user login, refresh, and authentication state
 */

import apiClient from './client';
import { User, UserRole } from '../types/models';
import { useAuthStore } from '../state/authStore';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  role: UserRole;
  companyId: string | null;
  userId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<User & { accessToken: string; refreshToken: string }> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const { access_token, refresh_token, role, companyId, userId } = response.data;
      
      // Create user object with tokens
      const user: User & { accessToken: string; refreshToken: string } = {
        id: userId,
        name: '', // Will be fetched from user endpoint
        email: credentials.email,
        phone: '',
        role,
        accessToken: access_token,
        refreshToken: refresh_token,
      };
      
      return user;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Logout user and clear auth state
   */
  async logout(): Promise<void> {
    useAuthStore.getState().logout();
  }
}

export default new AuthService();
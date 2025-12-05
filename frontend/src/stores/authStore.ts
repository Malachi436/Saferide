import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, LoginCredentials, SignUpData } from '../types';
import { apiClient } from '../utils/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: SignUpData) => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        console.log('[AuthStore] Login called with email:', credentials.email);
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<any>('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          console.log('[AuthStore] Login response:', response);
          // Store tokens
          await apiClient.setTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
          });

          // Set user state
          const user: User = {
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            email: response.user.email,
            phone: response.user.phone || '',
            role: response.user.role === 'PARENT' ? 'parent' : 'driver',
          };

          console.log('[AuthStore] Setting user state:', user);
          set({
            user,
            isAuthenticated: true,
            role: user.role,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.log('[AuthStore] Login error:', error);
          console.log('[AuthStore] Error response:', error.response);
          const errorMessage =
            error.response?.data?.message || error.message || 'Login failed. Please try again.';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      logout: async () => {
        await apiClient.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          error: null,
        });
        // Force clear the persisted storage
        await AsyncStorage.removeItem('auth-storage');
      },

      register: async (data: SignUpData) => {
        set({ isLoading: true, error: null });
        try {
          const nameParts = (data.name || '').split(' ');
          const response = await apiClient.post<any>('/auth/signup', {
            email: data.email,
            password: data.password,
            firstName: nameParts[0] || 'User',
            lastName: nameParts[1] || '',
            phone: data.phone,
          });

          // Store tokens
          await apiClient.setTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
          });

          // Set user state
          const user: User = {
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName}`,
            email: response.user.email,
            phone: response.user.phone || '',
            role: 'parent',
          };

          set({
            user,
            isAuthenticated: true,
            role: 'parent',
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Registration failed. Please try again.';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true, role: user.role });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

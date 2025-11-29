import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, LoginCredentials, SignUpData } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: SignUpData) => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          // Mock login - in production, this would call your backend API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: credentials.email.split('@')[0],
            email: credentials.email,
            phone: '+1234567890',
            role: credentials.role,
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            role: credentials.role,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          role: null,
        });
      },

      register: async (data: SignUpData) => {
        set({ isLoading: true });
        try {
          // Mock registration - in production, this would call your backend API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: 'parent',
          };

          set({
            user: newUser,
            isAuthenticated: true,
            role: 'parent',
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true, role: user.role });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

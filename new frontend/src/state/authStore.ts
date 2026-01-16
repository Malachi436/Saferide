/**
 * Auth Store
 * Manages authentication state and current user
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserRole, Parent, Driver } from "../types/models";

type User = Parent | Driver;

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (user) =>
        set({
          user,
          role: user.role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "rosago-auth",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

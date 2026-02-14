export type UserRole = 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'DRIVER' | 'PARENT' | 'platform_admin' | 'school_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  role: string;
  schoolId?: string;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

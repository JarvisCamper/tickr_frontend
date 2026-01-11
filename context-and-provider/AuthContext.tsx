'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';

// ============ Types ============
interface User {
  id: number;
  email: string;
  username: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  is_admin?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, userData?: User | null) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

// ============ Context ============
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ Provider ============
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Get authentication headers with bearer token
   */
  const getAuthHeaders = (): HeadersInit => {
    const token = Cookies.get('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  /**
   * Fetch current user information from API
   */
  const fetchUser = async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { getApiUrl } = await import('@/constant/apiendpoints');
      const response = await fetch(getApiUrl('/api/user/'), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Store authentication tokens in cookies
   */
  const login = (accessToken: string, refreshToken: string, userData?: User | null) => {
    Cookies.set('access_token', accessToken, { expires: 7, sameSite: 'lax' });
    Cookies.set('refresh_token', refreshToken, { expires: 7, sameSite: 'lax' });

    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      fetchUser();
    }
  };

  /**
   * Clear authentication tokens and user data
   */
  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Initialize auth and listen for auth changes
  useEffect(() => {
    fetchUser();

    const handleAuthChange = () => {
      fetchUser();
    };

    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ Hooks ============
/**
 * Hook to access authentication context
 * @throws {Error} if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============ Utilities ============
/**
 * Get authentication headers with bearer token
 */
export function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
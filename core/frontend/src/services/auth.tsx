import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from './api';
import { initializeUserStorage } from '../lib/localFileStorage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          
          // Initialize user storage for existing session
          try {
            initializeUserStorage();
            console.log(`Existing user storage initialized for: ${userData.username} (ID: ${userData.id})`);
          } catch (error) {
            console.warn('Failed to initialize existing user storage:', error);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    // Initialize user-specific storage directories
    try {
      initializeUserStorage();
      console.log(`User storage initialized for: ${user.username} (ID: ${user.id})`);
    } catch (error) {
      console.warn('Failed to initialize user storage:', error);
    }
    
    return response.data;
  };

  const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  };

  const logout = (): void => {
    // Clear authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    
    // Clear user-specific storage (optional - keeps files for next login)
    // Note: Files are user-specific so they'll only be accessible to the same user
    console.log('User logged out - files remain in user-specific storage');
    
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Legacy functions for backwards compatibility
export const legacyLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  const { token, user } = response.data;
  
  // Store token and user data
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return response.data;
};

export const legacyRegister = async (userData: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', userData);
  return response.data;
};

export const legacyLogout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  window.location.href = '/login';
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

// Get user profile from API
export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

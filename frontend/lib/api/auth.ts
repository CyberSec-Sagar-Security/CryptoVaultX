import { API_BASE_URL, API_ENDPOINTS, createAuthHeaders } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    is_active?: boolean;
    created_at?: string;
  };
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

class AuthAPI {
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
        },
      });
      
      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      throw new Error('Network error occurred');
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Login failed',
        };
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Registration failed',
        };
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  static async verify(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await this.makeRequest(API_ENDPOINTS.AUTH.VERIFY, {
        method: 'GET',
        headers: createAuthHeaders(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        return {
          success: false,
          error: data.message || 'Token verification failed',
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      };
    }
  }

  static async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: createAuthHeaders(token),
        });
      }

      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Still clear local storage even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      return { success: true, message: 'Logged out locally' };
    }
  }

  static async getUsers(): Promise<{ success: boolean; users?: User[]; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await this.makeRequest(API_ENDPOINTS.AUTH.USERS, {
        method: 'GET',
        headers: createAuthHeaders(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to fetch users',
        };
      }

      return {
        success: true,
        users: data.users,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      };
    }
  }

  static getCurrentUser(): User | null {
    try {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export default AuthAPI;

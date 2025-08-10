// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    USERS: '/api/auth/users',
  },
  
  // File Management
  FILES: {
    LIST: '/api/files',
    UPLOAD: '/api/upload',
    DOWNLOAD: (fileId: string) => `/api/files/${fileId}/download`,
    DELETE: (fileId: string) => `/api/files/${fileId}`,
  },
  
  // Upload
  UPLOAD: {
    STATUS: '/api/upload/status',
    HEALTH: '/api/upload/health',
  },
  
  // System
  HEALTH: '/api/health',
  STATS: '/api/stats',
};

// Request configuration
export const createAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

export const createFileUploadHeaders = (token?: string) => ({
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

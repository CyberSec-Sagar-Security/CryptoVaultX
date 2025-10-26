import axios from 'axios';

// API Base URL constant
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Generic API request function
 */
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorData;
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : { message: 'Unknown error' };
    } catch {
      errorData = { message: 'Server error' };
    }
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new Error('Invalid response format');
  }
};

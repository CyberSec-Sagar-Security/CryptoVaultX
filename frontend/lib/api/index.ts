// Export all API modules
export { default as AuthAPI } from './auth';
export { default as FileAPI } from './files';  
export { default as SystemAPI } from './system';

// Export types
export type { LoginCredentials, RegisterData, AuthResponse, User } from './auth';
export type { FileMetadata, UploadProgress, UploadResponse, FileListResponse } from './files';
export type { HealthStatus, SystemStats } from './system';

// Export configuration
export { API_BASE_URL, API_ENDPOINTS } from './config';

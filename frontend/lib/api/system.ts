import { API_BASE_URL, API_ENDPOINTS } from './config';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  database?: 'connected' | 'disconnected';
  uptime?: string;
}

export interface SystemStats {
  total_files: number;
  total_users: number;
  total_storage_used: number;
  total_uploads_today: number;
  average_file_size: number;
  most_uploaded_file_type: string;
}

class SystemAPI {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      return response;
    } catch (error) {
      console.error('System API Request failed:', error);
      throw new Error('Network error occurred');
    }
  }

  static async getHealth(): Promise<{ success: boolean; data?: HealthStatus; error?: string }> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.HEALTH, {
        method: 'GET',
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Health check failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          ...data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  static async getStats(): Promise<{ success: boolean; data?: SystemStats; error?: string }> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.STATS, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Failed to fetch stats',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.stats || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      };
    }
  }

  static async getUploadStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.UPLOAD.STATUS, {
        method: 'GET',
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Upload status check failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload status check failed',
      };
    }
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static async checkBackendConnection(): Promise<boolean> {
    try {
      const result = await this.getHealth();
      return result.success;
    } catch {
      return false;
    }
  }
}

export default SystemAPI;

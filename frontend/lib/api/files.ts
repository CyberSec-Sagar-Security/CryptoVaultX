import { API_BASE_URL, API_ENDPOINTS, createAuthHeaders, createFileUploadHeaders } from './config';

export interface FileMetadata {
  id: string;
  filename: string;
  original_filename: string;
  size: number;
  content_type: string;
  encryption_key_hash: string;
  upload_date: string;
  uploader_id: string;
  is_shared: boolean;
  share_token?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  success: boolean;
  file?: FileMetadata;
  message?: string;
  error?: string;
}

export interface FileListResponse {
  success: boolean;
  files?: FileMetadata[];
  total?: number;
  error?: string;
}

class FileAPI {
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
      console.error('File API Request failed:', error);
      throw new Error('Network error occurred');
    }
  }

  static async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const formData = new FormData();
      formData.append('file', file);
      
      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          try {
            const data = JSON.parse(xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                success: true,
                file: data.file,
                message: data.message,
              });
            } else {
              resolve({
                success: false,
                error: data.message || 'Upload failed',
              });
            }
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to parse server response',
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Network error during upload',
          });
        });

        xhr.open('POST', `${API_BASE_URL}${API_ENDPOINTS.FILES.UPLOAD}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  static async getFiles(): Promise<FileListResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await this.makeRequest(API_ENDPOINTS.FILES.LIST, {
        method: 'GET',
        headers: createAuthHeaders(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to fetch files',
        };
      }

      return {
        success: true,
        files: data.files || [],
        total: data.total || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch files',
      };
    }
  }

  static async downloadFile(fileId: string): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await this.makeRequest(API_ENDPOINTS.FILES.DOWNLOAD(fileId), {
        method: 'GET',
        headers: createAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Failed to download file',
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        blob,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download file',
      };
    }
  }

  static async deleteFile(fileId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await this.makeRequest(API_ENDPOINTS.FILES.DELETE(fileId), {
        method: 'DELETE',
        headers: createAuthHeaders(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to delete file',
        };
      }

      return {
        success: true,
        message: data.message || 'File deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      };
    }
  }

  static getFileDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}${API_ENDPOINTS.FILES.DOWNLOAD(fileId)}`;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(contentType: string): string {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎥';
    if (contentType.startsWith('audio/')) return '🎵';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('document') || contentType.includes('word')) return '📝';
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return '📊';
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return '📽️';
    if (contentType.includes('zip') || contentType.includes('archive')) return '🗜️';
    return '📁';
  }
}

export default FileAPI;

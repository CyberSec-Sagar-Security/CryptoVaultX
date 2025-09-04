import api from './api';
import { encryptFile, decryptFile, generateKey, exportKey, importKey } from '../utils/crypto';

export interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  upload_date: string;
  file_type: string;
  is_shared: boolean;
  shared_count?: number;
}

export interface SharedFile {
  id: string;
  filename: string;
  size: number;
  shared_by: string;
  shared_at: string;
  expires_at?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileService {
  // Get user's files
  async getFiles(): Promise<FileMetadata[]> {
    const response = await api.get('/files');
    return response.data.files;
  }

  // Get shared files
  async getSharedFiles(): Promise<SharedFile[]> {
    const response = await api.get('/shared');
    return response.data.files;
  }

  // Upload file with encryption
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    try {
      // Generate or get encryption key
      let encryptionKey = localStorage.getItem('encryption_key');
      let cryptoKey: CryptoKey;

      if (encryptionKey) {
        cryptoKey = await importKey(encryptionKey);
      } else {
        cryptoKey = await generateKey();
        encryptionKey = await exportKey(cryptoKey);
        localStorage.setItem('encryption_key', encryptionKey);
      }

      // Encrypt file
      const { encryptedData, iv } = await encryptFile(file, cryptoKey);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', new Blob([encryptedData]), file.name);
      formData.append('filename', file.name);
      formData.append('size', file.size.toString());
      formData.append('file_type', file.type);
      formData.append('iv', btoa(String.fromCharCode(...new Uint8Array(iv))));

      // Upload with progress tracking
      const response = await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      });

      return response.data.file;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Download and decrypt file
  async downloadFile(fileId: string, filename: string): Promise<void> {
    try {
      const encryptionKey = localStorage.getItem('encryption_key');
      if (!encryptionKey) {
        throw new Error('Encryption key not found');
      }

      const cryptoKey = await importKey(encryptionKey);

      // Download encrypted file
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'arraybuffer',
      });

      // Get IV from headers
      const ivBase64 = response.headers['x-file-iv'];
      if (!ivBase64) {
        throw new Error('File IV not found');
      }

      const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));

      // Decrypt file
      const decryptedData = await decryptFile(response.data, cryptoKey, iv.buffer);

      // Create download link
      const blob = new Blob([decryptedData]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/files/${fileId}`);
  }

  // Share file
  async shareFile(fileId: string, expiresAt?: string): Promise<{ share_url: string }> {
    const response = await api.post(`/files/${fileId}/share`, {
      expires_at: expiresAt,
    });
    return response.data;
  }

  // Get file analytics
  async getAnalytics(): Promise<{
    total_files: number;
    total_size: number;
    file_types: { [key: string]: number };
    upload_activity: { date: string; count: number }[];
  }> {
    const response = await api.get('/analytics');
    return response.data;
  }
}

export default new FileService();

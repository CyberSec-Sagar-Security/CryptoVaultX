/**
 * SharedFiles Page - View files shared with/by the user
 * Path: src/pages/shared/SharedFiles.tsx
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Download,
  File,
  Calendar,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Send,
  Inbox,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { getSharedWithMe, getSharedByMe, SharedFile } from '../../services/shareApi';
import { FileViewerModal } from '../../components/viewer/FileViewerModal';
import { base64ToArrayBuffer, decryptFile, getSessionKey } from '../../lib/crypto';

type ViewMode = 'received' | 'sent';

const SharedFiles: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('received');
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  
  // File viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<SharedFile | null>(null);

  useEffect(() => {
    loadSharedFiles();
  }, [viewMode, page]);

  const loadSharedFiles = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Loading files for viewMode:', viewMode);
      
      const response = viewMode === 'received'
        ? await getSharedWithMe(page, 20)
        : await getSharedByMe(page, 20);

      console.log('📊 API Response:', {
        viewMode,
        responseView: response.view,
        filesCount: response.shared_files.length,
        firstFile: response.shared_files[0]
      });

      setSharedFiles(response.shared_files);
      setTotalPages(response.pagination.pages);
      setTotalFiles(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load shared files');
      console.error('Error loading shared files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
      
      console.log('⬇️ Starting download for:', filename);
      
      // Fetch encrypted file with headers
      const response = await fetch(`${apiUrl}/api/files/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Download failed');
      }

      // Get decryption metadata from headers
      const ivBase64 = response.headers.get('X-File-IV');
      let algo = response.headers.get('X-File-Algo') || 'HIGH';
      
      // Map algorithm names to encryption levels
      let encryptionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
      algo = algo.toUpperCase();
      
      if (algo.includes('AES-256') || algo === 'HIGH') {
        encryptionLevel = 'HIGH';
      } else if (algo.includes('AES-192') || algo === 'MEDIUM') {
        encryptionLevel = 'MEDIUM';
      } else if (algo.includes('AES-128') || algo === 'LOW') {
        encryptionLevel = 'LOW';
      } else {
        console.warn(`Unknown encryption algo: ${algo}, defaulting to HIGH`);
        encryptionLevel = 'HIGH';
      }

      console.log('📦 Download metadata - IV:', ivBase64, 'Algo:', algo, '→ Level:', encryptionLevel);

      if (!ivBase64) {
        throw new Error('Missing encryption metadata (IV)');
      }

      // Get encrypted data
      const encryptedData = await response.arrayBuffer();
      console.log('📥 Encrypted data size:', encryptedData.byteLength, 'bytes');
      
      // Decrypt file
      console.log('🔓 Decrypting file...');
      const sessionKey = await getSessionKey(encryptionLevel);
      const ivBuffer = base64ToArrayBuffer(ivBase64);
      
      const decryptedData = await decryptFile(
        encryptedData,
        ivBuffer,
        sessionKey,
        encryptionLevel
      );
      
      console.log('✅ Decryption successful! Size:', decryptedData.byteLength, 'bytes');

      // Download decrypted file
      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('🎉 File downloaded:', filename);
    } catch (err: any) {
      console.error('❌ Download error:', err);
      alert('Failed to download file: ' + err.message);
    }
  };

  const handleView = (file: SharedFile) => {
    setViewingFile(file);
    setIsViewerOpen(true);
  };

  const handleFileAction = (file: SharedFile) => {
    const permission = file.permission.toLowerCase();
    
    // Full access permission: can both view and download, prefer view
    if (permission === 'full_access') {
      handleView(file);
    }
    // View permission: can only view
    else if (permission === 'view') {
      handleView(file);
    }
    // Download permission: download only
    else if (permission === 'download') {
      handleDownload(file.file_id, file.filename);
    }
    else {
      // Default to download for unknown permissions
      handleDownload(file.file_id, file.filename);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const getPermissionBadgeColor = (permission: string) => {
    switch (permission) {
      case 'write':
      case 'edit':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'read':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Shared Files</h1>
              <p className="text-gray-400">View and manage files shared with or by you</p>
            </div>
            <Users className="w-12 h-12 text-blue-400" />
          </div>
        </motion.div>

        {/* View Mode Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => {
              setViewMode('received');
              setPage(1);
            }}
            variant={viewMode === 'received' ? 'default' : 'outline'}
            className={`flex items-center gap-2 ${
              viewMode === 'received'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-400'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Shared With Me
          </Button>
          <Button
            onClick={() => {
              setViewMode('sent');
              setPage(1);
            }}
            variant={viewMode === 'sent' ? 'default' : 'outline'}
            className={`flex items-center gap-2 ${
              viewMode === 'sent'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-400'
            }`}
          >
            <Send className="w-4 h-4" />
            Files I Shared
          </Button>
        </div>

        {/* Content */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewMode === 'received' ? 'Files Shared With You' : 'Files You Shared'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error}
              </div>
            ) : sharedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <File className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">
                  {viewMode === 'received'
                    ? 'No files have been shared with you yet'
                    : 'You haven\'t shared any files yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedFiles.map((file) => (
                  <motion.div
                    key={file.share_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <h3 className="font-medium text-white truncate">{file.filename}</h3>
                          <Badge className={getPermissionBadgeColor(file.permission)}>
                            {file.permission}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <File className="w-4 h-4" />
                            {formatFileSize(file.size_bytes)}
                          </div>

                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatDate(file.shared_at)}
                          </div>

                          {viewMode === 'received' && file.shared_by && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <User className="w-4 h-4" />
                              @{file.shared_by.username}
                            </div>
                          )}

                          {viewMode === 'sent' && file.shared_with && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <User className="w-4 h-4" />
                              @{file.shared_with.username}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-gray-400">
                            <Shield className="w-4 h-4" />
                            Encrypted
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* View Button (for full_access and view permissions) */}
                        {(file.permission === 'full_access' || file.permission === 'view') && (
                          <Button
                            onClick={() => handleView(file)}
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50 hover:bg-blue-500/20 text-blue-400"
                            title="View file"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Download Button (for full_access and download permissions) */}
                        {(file.permission === 'full_access' || file.permission === 'download') && (
                          <Button
                            onClick={() => handleDownload(file.file_id, file.filename)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Info for view-only files */}
                        {file.permission === 'view' && (
                          <span className="text-xs text-gray-500 ml-2">No download</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-800">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  variant="outline"
                  size="sm"
                  className="border-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>

                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  variant="outline"
                  size="sm"
                  className="border-gray-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewerModal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setViewingFile(null);
          }}
          fileId={viewingFile.file_id}
          fileName={viewingFile.filename}
          contentType={viewingFile.content_type}
          permission={viewingFile.permission as 'full_access' | 'view' | 'download'}
        />
      )}
    </div>
  );
};

export default SharedFiles;

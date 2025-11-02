/**
 * FilesPage - CryptoVaultX Files Management
 * Path: src/pages/dashboard/FilesPage.tsx
 * Complete file management with secure download functionality
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Download, 
  Shield, 
  Search,
  Grid,
  List,
  MoreVertical,
  Eye,
  Share2,
  Trash2,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Folder,
  Image,
  Video,
  Music,
  Archive,
  Code,
  CheckSquare,
  Square
} from 'lucide-react';

// API Base URL constant
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { apiRequest } from '../../services/api';
import { 
  decryptFile,
  getSessionKey,
  base64ToArrayBuffer,
  arrayBufferToBase64
} from '../../lib/crypto';
import {
  listLocalFiles,
  downloadFileLocally,
  deleteFileLocally
} from '../../lib/localFileStorage';
import { downloadFileEnhanced } from '../../lib/enhancedDownload';
import { ShareFileModal } from '../../components/sharing/ShareFileModal';

interface FileItem {
  id: string;
  filename: string;
  size: number;
  algo?: string;
  content_type?: string;
  is_encrypted: boolean;
  folder: string;
  created_at: string;
  updated_at?: string;
  iv?: string;
  tag?: string;
  errorMessage?: string;
}

interface DownloadProgress {
  fileId: string;
  progress: number;
  status: 'starting' | 'downloading' | 'processing' | 'decrypting' | 'saving' | 'completed' | 'error';
  error?: string;
}

const FilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());
  
  // Bulk selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [bulkOperationProgress, setBulkOperationProgress] = useState<string>('');
  
  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFilesForShare, setSelectedFilesForShare] = useState<{ id: string; filename: string }[]>([]);
  
  // Timestamp refresh state - forces re-render of relative times every minute
  const [, setTimestampTick] = useState(0);

  // Fetch files from backend API
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Fetching files from backend...');
      
      // Get files from backend API (apiRequest returns parsed JSON data)
      const data = await apiRequest('/files/list');
      console.log('📋 Received data:', data);
      console.log('📋 Files count:', data.files?.length || 0);
      
      const apiFiles = data.files || [];
      
      // Convert API response to FileItem format
      const formattedFiles: FileItem[] = apiFiles.map((file: any) => ({
        id: file.id,
        filename: file.original_filename,
        size: file.size_bytes,
        created_at: file.created_at,
        content_type: file.content_type,
        storage: 'backend',
        encryption: {
          level: 'HIGH', // Default since backend uses AES-256-GCM
          iv: file.iv,
          algorithm: file.algo
        }
      }));
      
      console.log('✅ Formatted files:', formattedFiles);
      setFiles(formattedFiles);
    } catch (err) {
      console.error('❌ Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // NO AUTO-REFRESH - User can manually refresh if needed
  // Auto-refresh was causing downloads to fail and page to flicker

  // Listen for file upload events to refresh the list
  useEffect(() => {
    const handleFileUploaded = () => {
      console.log('📤 File uploaded event detected, refreshing list...');
      fetchFiles(); // Refresh the files list when a new file is uploaded
    };

    window.addEventListener('fileUploaded', handleFileUploaded);
    
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  // Update timestamps every minute to show accurate relative times
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampTick(tick => tick + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter files based on search query
  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get file icon based on content type or filename
  const getFileIcon = (file: FileItem) => {
    const contentType = file.content_type || '';
    const filename = file.filename.toLowerCase();
    
    if (contentType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|svg)$/.test(filename)) {
      return <Image className="w-6 h-6 text-blue-400" />;
    }
    if (contentType.startsWith('video/') || /\.(mp4|avi|mov|mkv|webm)$/.test(filename)) {
      return <Video className="w-6 h-6 text-purple-400" />;
    }
    if (contentType.startsWith('audio/') || /\.(mp3|wav|ogg|flac)$/.test(filename)) {
      return <Music className="w-6 h-6 text-green-400" />;
    }
    if (/\.(zip|rar|7z|tar|gz)$/.test(filename)) {
      return <Archive className="w-6 h-6 text-orange-400" />;
    }
    if (/\.(js|ts|py|java|cpp|html|css)$/.test(filename)) {
      return <Code className="w-6 h-6 text-cyan-400" />;
    }
    if (file.is_encrypted) {
      return <Lock className="w-6 h-6 text-yellow-400" />;
    }
    return <FileText className="w-6 h-6 text-gray-400" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      // Calculate time difference
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Return formatted relative time
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      
      // For older dates, show full date
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Recently';
    }
  };

  // Download and decrypt file from backend with REAL-TIME PROGRESS
  const downloadFile = async (file: FileItem) => {
    const progressKey = file.id;
    
    try {
      console.log('📥 Starting download for:', file.filename, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Initialize progress
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'starting'
      })));
      
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authentication token found');
      
      // Start fetching
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 5,
        status: 'downloading'
      })));
      
      console.log('📥 Fetching encrypted file from backend...');
      const response = await fetch(`${API_BASE_URL}/files/${file.id}/download`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Get metadata from headers
      const fileName = response.headers.get('X-File-Name') || file.filename;
      const ivBase64 = response.headers.get('X-File-IV');
      const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
      
      if (!ivBase64) {
        throw new Error('Missing encryption IV in response headers');
      }
      
      console.log('📥 File metadata - Name:', fileName, 'Size:', contentLength, 'bytes');
      
      // Read response with REAL-TIME progress tracking using ReadableStream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }
      
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Update REAL-TIME progress (10% to 60% during download)
        const downloadProgress = contentLength > 0 
          ? 10 + Math.floor((receivedLength / contentLength) * 50)
          : 10 + Math.min(Math.floor((receivedLength / file.size) * 50), 50);
        
        setDownloadProgress(prev => new Map(prev.set(progressKey, {
          fileId: file.id,
          progress: downloadProgress,
          status: 'downloading'
        })));
      }
      
      console.log('📥 Downloaded:', receivedLength, 'bytes in', chunks.length, 'chunks');
      
      // Combine chunks into single ArrayBuffer
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 65,
        status: 'processing'
      })));
      
      const encryptedData = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        encryptedData.set(chunk, position);
        position += chunk.length;
      }
      
      console.log('📦 Encrypted data assembled:', encryptedData.byteLength, 'bytes');
      
      // Decrypt file
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 70,
        status: 'decrypting'
      })));
      
      console.log('🔓 Decrypting file...');
      const sessionKey = await getSessionKey('HIGH');
      const ivBuffer = base64ToArrayBuffer(ivBase64);
      
      const decryptedData = await decryptFile(
        encryptedData.buffer,
        ivBuffer,
        sessionKey,
        'HIGH'
      );
      
      console.log('✅ Decryption successful! Size:', decryptedData.byteLength, 'bytes');
      
      // Save file
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 90,
        status: 'saving'
      })));
      
      const blob = new Blob([decryptedData], { type: file.content_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Complete
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 100,
        status: 'completed'
      })));
      
      console.log('🎉 File downloaded and decrypted:', fileName);

      // Clear progress after 3 seconds
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(progressKey);
          return newMap;
        });
      }, 3000);

    } catch (error) {
      console.error('❌ Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'error'
      })));
      
      // Show user-friendly error notification
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, errorMessage: errorMessage }
          : f
      ));
      
      // Remove error after delay
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(progressKey);
          return newMap;
        });
        
        // Clear error message from file
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, errorMessage: undefined }
            : f
        ));
      }, 8000);
    }
  };

  // Delete file (local or remote)
  const deleteFile = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting file:', file.filename, '(ID:', file.id, ')');
      
      // Check if file is stored locally
      if ((file as any).storage_type === 'local') {
        await deleteFileLocally(file.id);
        console.log('✅ File deleted locally');
      } else {
        await apiRequest(`/files/${file.id}`, { method: 'DELETE' });
        console.log('✅ File deleted from backend');
      }
      
      // Remove from UI immediately
      setFiles(prev => prev.filter(f => f.id !== file.id));
      console.log('✅ File removed from UI');
      
      // Dispatch event to notify dashboard and other components
      window.dispatchEvent(new CustomEvent('fileDeleted', { 
        detail: { fileId: file.id, filename: file.filename }
      }));
      window.dispatchEvent(new CustomEvent('storageChanged'));
      console.log('📡 File deletion event dispatched');
      
      // Refresh list to ensure synchronization
      await fetchFiles();
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };
  
  // Open share modal for a single file
  const handleShareFile = (file: FileItem) => {
    setSelectedFilesForShare([{ id: file.id, filename: file.filename }]);
    setIsShareModalOpen(true);
  };
  
  // Handle share completion
  const handleShareComplete = () => {
    console.log('✅ File(s) shared successfully');
    // Optionally refresh the file list or show a success notification
    fetchFiles();
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedFiles(new Set());
  };

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  // Select all filtered files
  const selectAll = () => {
    const allFileIds = new Set(filteredFiles.map(f => f.id));
    setSelectedFiles(allFileIds);
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  // Bulk Download
  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) {
      setError('No files selected for download');
      return;
    }

    setIsBulkOperating(true);
    setBulkOperationProgress('Starting bulk download...');
    
    try {
      const selectedFilesList = Array.from(selectedFiles);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < selectedFilesList.length; i++) {
        const fileId = selectedFilesList[i];
        const file = files.find(f => f.id === fileId);
        
        if (!file) continue;

        setBulkOperationProgress(`Downloading ${i + 1}/${selectedFilesList.length}: ${file.filename}`);
        
        try {
          await downloadFile(file);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Failed to download ${file.filename}:`, err);
          failCount++;
        }
      }

      setBulkOperationProgress(`Download complete: ${successCount} succeeded, ${failCount} failed`);
      setTimeout(() => {
        setIsBulkOperating(false);
        setBulkOperationProgress('');
        setSelectedFiles(new Set());
        setIsSelectMode(false);
      }, 3000);
    } catch (err) {
      console.error('Bulk download error:', err);
      setError(err instanceof Error ? err.message : 'Bulk download failed');
      setIsBulkOperating(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) {
      setError('No files selected for deletion');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)? This action cannot be undone.`)) {
      return;
    }

    setIsBulkOperating(true);
    setBulkOperationProgress('Starting bulk delete...');
    
    try {
      const response = await apiRequest('/files/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({
          file_ids: Array.from(selectedFiles)
        })
      });

      if (response.success) {
        setBulkOperationProgress(`Deleted ${response.deleted_count} file(s) successfully`);
        
        // Dispatch events to notify other components (Dashboard)
        window.dispatchEvent(new CustomEvent('fileDeleted'));
        window.dispatchEvent(new CustomEvent('storageChanged'));
        
        setTimeout(() => {
          setIsBulkOperating(false);
          setBulkOperationProgress('');
          setSelectedFiles(new Set());
          setIsSelectMode(false);
          fetchFiles();
        }, 2000);
      } else {
        throw new Error(response.message || 'Bulk delete failed');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError(err instanceof Error ? err.message : 'Bulk delete failed');
      setIsBulkOperating(false);
    }
  };

  // Bulk Share
  const handleBulkShare = () => {
    if (selectedFiles.size === 0) {
      setError('No files selected for sharing');
      return;
    }
    
    const selectedFilesList = files.filter(f => selectedFiles.has(f.id));
    setSelectedFilesForShare(selectedFilesList.map(f => ({ id: f.id, filename: f.filename })));
    setIsShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-white text-lg">Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">My Files</h1>
                <p className="text-xs text-gray-400">Secure • Encrypted • Private</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleSelectMode}
              variant={isSelectMode ? 'default' : 'ghost'}
              size="sm"
              className={isSelectMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-gray-400 hover:text-white'}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {isSelectMode ? 'Exit Select' : 'Select'}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-gray-400 hover:text-white"
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-gray-400 hover:text-white"
            >
              <Grid size={16} />
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {isSelectMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-indigo-600/20 border-indigo-500/30 backdrop-blur-xl">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">
                      {selectedFiles.size} file(s) selected
                    </span>
                    {selectedFiles.size > 0 && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleBulkDownload}
                          disabled={isBulkOperating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleBulkShare}
                          disabled={isBulkOperating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={isBulkOperating}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={selectAll}
                      className="text-white hover:text-white/80"
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={deselectAll}
                      className="text-white hover:text-white/80"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                
                {isBulkOperating && (
                  <div className="mt-4">
                    <p className="text-white text-sm mb-2">{bulkOperationProgress}</p>
                    <Progress value={50} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Files List */}
        {filteredFiles.length === 0 ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Files Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'No files match your search criteria.' : 'Upload your first file to get started.'}
              </p>
              <Button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Files ({filteredFiles.length})</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your encrypted files and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredFiles.map((file, index) => {
                    const progress = downloadProgress.get(file.id);
                    const isSelected = selectedFiles.has(file.id);
                    
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => isSelectMode && toggleFileSelection(file.id)}
                        style={{ cursor: isSelectMode ? 'pointer' : 'default' }}
                      >
                        <div className="flex items-center gap-4">
                          {isSelectMode && (
                            <div onClick={(e) => e.stopPropagation()}>
                              {isSelected ? (
                                <CheckSquare className="w-6 h-6 text-indigo-400" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          )}
                          {getFileIcon(file)}
                          <div>
                            <h4 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                              {file.filename}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <Clock size={12} />
                              <span>{formatDate(file.created_at)}</span>
                              {file.is_encrypted && (
                                <>
                                  <Lock size={12} />
                                  <span>Encrypted</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {file.is_encrypted && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Lock className="w-3 h-3 mr-1" />
                              Encrypted
                            </Badge>
                          )}
                          
                          {progress && (
                            <div className="flex items-center gap-2 min-w-[120px]">
                              {progress.status === 'error' ? (
                                <span className="text-red-400 text-sm">{progress.error}</span>
                              ) : (
                                <>
                                  <Progress value={progress.progress} className="h-2 flex-1" />
                                  <span className="text-xs text-gray-400">{progress.progress}%</span>
                                </>
                              )}
                            </div>
                          )}
                          
                          {!isSelectMode && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                onClick={() => downloadFile(file)}
                                disabled={!!progress && progress.status !== 'error'}
                              >
                                <Download size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                onClick={() => handleShareFile(file)}
                                title="Share file"
                              >
                                <Share2 size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                                onClick={() => deleteFile(file)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Share File Modal */}
      <ShareFileModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedFilesForShare([]);
        }}
        fileIds={selectedFilesForShare.map(f => f.id)}
        fileNames={selectedFilesForShare.map(f => f.filename)}
        onShareComplete={handleShareComplete}
      />
    </div>
  );
};

export default FilesPage;

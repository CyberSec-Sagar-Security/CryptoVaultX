/**
 * BulkFilesPage - CryptoVaultX Bulk File Operations
 * Path: src/pages/dashboard/BulkFilesPage.tsx
 * Multiple file selection with checkbox for bulk delete, share, and download
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
  Square,
  XCircle
} from 'lucide-react';

// API Base URL constant
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { apiRequest } from '../../services/api';
import { 
  decryptFile,
  getSessionKey,
  base64ToArrayBuffer,
  arrayBufferToBase64
} from '../../lib/crypto';
import { downloadFileEnhanced } from '../../lib/enhancedDownload';
import { BulkShareModal } from '../../components/sharing/BulkShareModal';

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

const BulkFilesPage: React.FC = () => {
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
  
  // Bulk operations state
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [bulkOperationProgress, setBulkOperationProgress] = useState<string>('');
  
  // Share modal state
  const [isBulkShareModalOpen, setIsBulkShareModalOpen] = useState(false);

  // Fetch files from backend API
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Fetching files from backend...');
      
      const data = await apiRequest('/files/list');
      console.log('📋 Received data:', data);
      
      const apiFiles = data.files || [];
      
      const formattedFiles: FileItem[] = apiFiles.map((file: any) => ({
        id: file.id,
        filename: file.original_filename,
        size: file.size_bytes,
        created_at: file.created_at,
        content_type: file.content_type,
        is_encrypted: true,
        folder: '',
        iv: file.iv,
        algo: file.algo
      }));
      
      setFiles(formattedFiles);
    } catch (err) {
      console.error('❌ Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Listen for file upload events
  useEffect(() => {
    const handleFileUploaded = () => {
      fetchFiles();
    };
    window.addEventListener('fileUploaded', handleFileUploaded);
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  // Filter files based on search query
  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Format date - consistent with FilesPage
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
        day: 'numeric' 
      });
    } catch (error) {
      return 'Recently';
    }
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
          // Add delay between downloads to prevent overwhelming the system
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

  // Download single file (used by bulk download)
  const downloadFile = async (file: FileItem) => {
    const progressKey = file.id;
    
    try {
      console.log('📥 Starting download for:', file.filename);
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'starting'
      })));
      
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authentication token found');
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 5,
        status: 'downloading'
      })));
      
      const response = await fetch(`${API_BASE_URL}/files/${file.id}/download`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const fileName = response.headers.get('X-File-Name') || file.filename;
      const ivBase64 = response.headers.get('X-File-IV');
      const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
      
      if (!ivBase64) {
        throw new Error('Missing encryption IV');
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');
      
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        const downloadProgress = contentLength > 0 
          ? 10 + Math.floor((receivedLength / contentLength) * 50)
          : 10 + Math.min(Math.floor((receivedLength / file.size) * 50), 50);
        
        setDownloadProgress(prev => new Map(prev.set(progressKey, {
          fileId: file.id,
          progress: downloadProgress,
          status: 'downloading'
        })));
      }
      
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
      
      console.log('📥 Assembled encrypted data:', encryptedData.byteLength, 'bytes');
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 70,
        status: 'decrypting'
      })));
      
      const sessionKey = await getSessionKey('HIGH');
      const ivBuffer = base64ToArrayBuffer(ivBase64);
      
      const decryptedData = await decryptFile(
        encryptedData.buffer,
        ivBuffer,
        sessionKey,
        'HIGH'
      );
      
      console.log('✅ Decrypted data:', decryptedData.byteLength, 'bytes');
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 90,
        status: 'saving'
      })));
      
      const blob = new Blob([decryptedData], { type: file.content_type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 100,
        status: 'completed'
      })));
      
      console.log('✅ File downloaded successfully:', fileName);
      
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(progressKey);
          return newMap;
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed'
      })));
      throw error;
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
        setTimeout(() => {
          setIsBulkOperating(false);
          setBulkOperationProgress('');
          setSelectedFiles(new Set());
          setIsSelectMode(false);
          fetchFiles(); // Refresh the list
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
    setIsBulkShareModalOpen(true);
  };

  const handleShareComplete = () => {
    setIsBulkShareModalOpen(false);
    setSelectedFiles(new Set());
    setIsSelectMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bulk File Operations
            </h1>
            <p className="text-gray-400">
              Select multiple files to download, share, or delete
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/files')}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Back to Files
            </Button>
            <Button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button
              onClick={fetchFiles}
              variant="ghost"
              className="text-gray-400 hover:text-white"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleSelectMode}
              variant={isSelectMode ? 'default' : 'ghost'}
              className={isSelectMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-gray-400 hover:text-white'}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {isSelectMode ? 'Exit Select Mode' : 'Select Files'}
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
                          Download Selected
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleBulkShare}
                          disabled={isBulkOperating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Selected
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={isBulkOperating}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected
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
                      Clear Selection
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
                {isSelectMode ? 'Select files for bulk operations' : 'Manage your encrypted files'}
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
      
      {/* Bulk Share Modal */}
      <BulkShareModal
        isOpen={isBulkShareModalOpen}
        onClose={() => setIsBulkShareModalOpen(false)}
        fileIds={Array.from(selectedFiles)}
        fileNames={files.filter(f => selectedFiles.has(f.id)).map(f => f.filename)}
        onShareComplete={handleShareComplete}
      />
    </div>
  );
};

export default BulkFilesPage;

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
  Code
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

  // Auto-refresh files every 10 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing files list...');
      fetchFiles();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Download and decrypt file from backend
  const downloadFile = async (file: FileItem) => {
    const progressKey = file.id;
    
    try {
      console.log('📥 Starting download for:', file.filename);
      
      // Set initial progress
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'starting'
      })));
      
      // Step 1: Download encrypted file from backend using direct fetch
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 20,
        status: 'downloading'
      })));
      
      console.log('📥 Fetching encrypted file from backend...');
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/files/${file.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file from server: ${response.status} ${response.statusText}`);
      }
      
      // Step 2: Get file data and metadata from headers
      const encryptedData = await response.arrayBuffer();
      const fileName = response.headers.get('X-File-Name') || file.filename;
      const iv = response.headers.get('X-File-IV');
      const algo = response.headers.get('X-File-Algo') || 'AES-256-GCM';
      
      console.log('📥 Downloaded encrypted data:', encryptedData.byteLength, 'bytes');
      console.log('📥 File metadata - Name:', fileName, 'IV:', iv, 'Algo:', algo);
      
      if (!iv) {
        throw new Error('Missing encryption metadata (IV not found in response headers)');
      }
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 50,
        status: 'decrypting'
      })));
      
      // Step 3: Decrypt file using session key
      console.log('🔓 Decrypting file...');
      const sessionKey = await getSessionKey('HIGH');
      const decryptedData = await decryptFile(
        encryptedData,
        base64ToArrayBuffer(iv),
        sessionKey,
        'HIGH'
      );
      
      console.log('✅ Decryption successful! Size:', decryptedData.byteLength, 'bytes');
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 80,
        status: 'saving'
      })));
      
      // Step 4: Create and download file with original name and format
      const blob = new Blob([decryptedData], { type: file.content_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Original filename (e.g., document.pdf)
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 100,
        status: 'completed'
      })));
      
      console.log(`✅ File downloaded and decrypted: ${fileName}`);

      // Remove progress after delay
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
      
      // Refresh list to ensure synchronization
      await fetchFiles();
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
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
                    
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
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
    </div>
  );
};

export default FilesPage;

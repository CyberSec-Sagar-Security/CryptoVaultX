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
}

interface DownloadProgress {
  fileId: string;
  progress: number;
  status: 'downloading' | 'decrypting' | 'completed' | 'error';
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

  // Fetch files from local storage
  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get files from local storage
      const localFiles = await listLocalFiles();
      
      // Try to get files from API as fallback/additional source
      let apiFiles: any[] = [];
      try {
        const response = await apiRequest('/files');
        apiFiles = response.files || [];
      } catch (apiError) {
        console.warn('API not available, using local files only:', apiError);
      }
      
      // Combine local and API files, prioritizing local files
      const allFiles = [
        ...localFiles,
        ...apiFiles.filter(apiFile => !localFiles.some(localFile => localFile.filename === apiFile.filename))
      ];
      
      setFiles(allFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Listen for file upload events to refresh the list
  useEffect(() => {
    const handleFileUploaded = () => {
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

  // Download and decrypt file (local or remote)
  const downloadFile = async (file: FileItem) => {
    const progressKey = file.id;
    
    try {
      // Initialize progress tracking
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'downloading'
      })));

      // Check if file is stored locally
      if ((file as any).storage_type === 'local') {
        // Use local download
        setDownloadProgress(prev => new Map(prev.set(progressKey, {
          fileId: file.id,
          progress: 50,
          status: 'decrypting'
        })));
        
        await downloadFileLocally(file.id);
        
        setDownloadProgress(prev => new Map(prev.set(progressKey, {
          fileId: file.id,
          progress: 100,
          status: 'completed'
        })));
      } else {
        // Use remote download from backend API
        const response = await fetch(`/api/files/${file.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }

        setDownloadProgress(prev => new Map(prev.set(progressKey, {
          fileId: file.id,
          progress: 30,
          status: 'downloading'
        })));

        // Get metadata from response headers
        const metadataHeader = response.headers.get('X-File-Metadata');
        const metadata = metadataHeader ? JSON.parse(metadataHeader) : {};
        
        const fileBlob = await response.blob();

        setDownloadProgress(prev => new Map(prev.set(progressKey, {
          fileId: file.id,
          progress: 50,
          status: file.is_encrypted ? 'decrypting' : 'completed'
        })));

        if (file.is_encrypted) {
          // Get session key for decryption (session-based encryption)
          const sessionKey = await getSessionKey();

          // Get the IV from metadata or file record
          const ivBase64 = metadata.iv || file.iv;
          if (!ivBase64) {
            throw new Error('Encryption IV not found. File may not be properly encrypted.');
          }

          console.log(`Starting decryption for file: ${file.filename}, IV: ${ivBase64.substring(0, 16)}...`);

          setDownloadProgress(prev => new Map(prev.set(progressKey, {
            fileId: file.id,
            progress: 70,
            status: 'decrypting'
          })));

          // Convert IV from base64 to ArrayBuffer
          const ivBuffer = base64ToArrayBuffer(ivBase64);

          // Get encrypted file data as ArrayBuffer
          const encryptedBuffer = await fileBlob.arrayBuffer();

          setDownloadProgress(prev => new Map(prev.set(progressKey, {
            fileId: file.id,
            progress: 90,
            status: 'decrypting'
          })));

          // Decrypt file using session key
          const decryptedBuffer = await decryptFile(encryptedBuffer, ivBuffer, sessionKey);
          
          console.log(`Decryption complete for file: ${file.filename}, decrypted size: ${decryptedBuffer.byteLength} bytes`);
          
          // Create blob and download decrypted file
          const decryptedBlob = new Blob([decryptedBuffer], {
            type: file.content_type || 'application/octet-stream'
          });
          
          const url = URL.createObjectURL(decryptedBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = metadata.filename || file.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // Direct download for unencrypted files
          const url = URL.createObjectURL(fileBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = metadata.filename || file.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }

      // Remove progress after delay
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(progressKey);
          return newMap;
        });
      }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadProgress(prev => new Map(prev.set(progressKey, {
        fileId: file.id,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed'
      })));
      
      // Remove error after delay
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(progressKey);
          return newMap;
        });
      }, 5000);
    }
  };

  // Delete file (local or remote)
  const deleteFile = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      return;
    }

    try {
      // Check if file is stored locally
      if ((file as any).storage_type === 'local') {
        await deleteFileLocally(file.id);
      } else {
        await apiRequest(`/files/${file.id}`, { method: 'DELETE' });
      }
      
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error) {
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

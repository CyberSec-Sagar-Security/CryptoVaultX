/**
 * Upload Page - CryptoVaultX File Upload Interface
 * Path: src/pages/upload/Upload.tsx
 * Secure file upload with client-side encryption
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  Shield, 
  File, 
  X, 
  Lock,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Image,
  FileText,
  Archive,
  Music,
  Video,
  Code,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { 
  encryptFileForUpload,
  EncryptionMetadata,
  EncryptionLevel
} from '../../lib/crypto';
import { 
  uploadFileLocally,
  getUserPreferences,
  saveUserPreferences,
  initializeLocalStorage
} from '../../lib/localFileStorage';
import { apiRequest } from '../../services/api';

// API Base URL constant
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Define encryption constants locally
const ENCRYPTION_STATUS = {
  ENCRYPTED: 'encrypted',
  DECRYPTED: 'decrypted',
  PROCESSING: 'processing',
  ERROR: 'error',
  NONE: 'none'
} as const;

const STATUS_COLORS = {
  encrypted: 'bg-green-500/20 text-green-400 border-green-500/30',
  decrypted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  none: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
} as const;

const SECURITY_LEVELS = {
  LOW: { label: 'Low Security', description: 'Basic encryption' },
  MEDIUM: { label: 'Medium Security', description: 'Standard encryption' },
  HIGH: { label: 'High Security', description: 'Maximum encryption' }
} as const;

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'encrypting' | 'uploading' | 'completed' | 'error';
  encryptionLevel: EncryptionLevel;
  autoEncrypt: boolean;
  error?: string;
}

interface UploadSettings {
  defaultEncryption: EncryptionLevel;
  autoEncrypt: boolean;
  deleteAfterUpload: boolean;
  maxFileSize: number;
}

const Upload: React.FC = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    defaultEncryption: 'HIGH',
    autoEncrypt: true,
    deleteAfterUpload: false,
    maxFileSize: 512 // MB - Updated to 512MB limit
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Initialize local storage and load user preferences
  useEffect(() => {
    initializeLocalStorage();
    
    const preferences = getUserPreferences();
    setUploadSettings(prev => ({
      ...prev,
      defaultEncryption: preferences.encryptionLevel,
      autoEncrypt: preferences.autoEncrypt,
      deleteAfterUpload: preferences.deleteAfterUpload
    }));
  }, []);

  // Save preferences when settings change
  useEffect(() => {
    saveUserPreferences({
      encryptionLevel: uploadSettings.defaultEncryption,
      autoEncrypt: uploadSettings.autoEncrypt,
      deleteAfterUpload: uploadSettings.deleteAfterUpload
    });
  }, [uploadSettings]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-6 h-6" />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText className="w-6 h-6" />;
    if (fileType.includes('javascript') || fileType.includes('json')) return <Code className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check storage quota before upload
  const checkStorageQuota = async (filesToUpload: FileUpload[]): Promise<boolean> => {
    try {
      const response = await apiRequest('/files/quota');
      const storageInfo = response.storage_info || {};
      const usedBytes = storageInfo.used_bytes || 0;
      const quotaBytes = storageInfo.quota_bytes || 536870912; // 512 MB
      const availableBytes = quotaBytes - usedBytes;
      
      // Calculate total size of files to upload
      const totalUploadSize = filesToUpload.reduce((sum, f) => sum + f.file.size, 0);
      
      if (totalUploadSize > availableBytes) {
        const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
        const quotaMB = (quotaBytes / (1024 * 1024)).toFixed(0);
        const availableMB = (availableBytes / (1024 * 1024)).toFixed(2);
        const uploadMB = (totalUploadSize / (1024 * 1024)).toFixed(2);
        
        alert(
          `❌ Storage Limit Exceeded!\n\n` +
          `Current Usage: ${usedMB} MB / ${quotaMB} MB\n` +
          `Available Space: ${availableMB} MB\n` +
          `Upload Size: ${uploadMB} MB\n\n` +
          `Please delete some files to free up space before uploading.`
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check storage quota:', error);
      // Allow upload if quota check fails (to not block users)
      return true;
    }
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newFiles: FileUpload[] = Array.from(selectedFiles).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
      encryptionLevel: uploadSettings.defaultEncryption,
      autoEncrypt: uploadSettings.autoEncrypt,
    }));

    // Check file size limits (512MB per file)
    const validFiles = newFiles.filter(fileUpload => {
      const fileSizeMB = fileUpload.file.size / (1024 * 1024);
      return fileSizeMB <= uploadSettings.maxFileSize;
    });

    const invalidFiles = newFiles.filter(fileUpload => {
      const fileSizeMB = fileUpload.file.size / (1024 * 1024);
      return fileSizeMB > uploadSettings.maxFileSize;
    });

    // Check storage quota before adding files
    if (validFiles.length > 0) {
      const hasSpace = await checkStorageQuota(validFiles);
      if (!hasSpace) {
        // Don't add files if storage quota exceeded
        console.warn('❌ Upload blocked: Storage quota exceeded');
        return;
      }
    }

    if (invalidFiles.length > 0) {
      // Show detailed error for oversized files
      invalidFiles.forEach(fileUpload => {
        const fileSizeMB = (fileUpload.file.size / (1024 * 1024)).toFixed(2);
        console.error(`File "${fileUpload.file.name}" (${fileSizeMB}MB) exceeds the 512MB size limit`);
      });
      
      // Add error files to show in UI
      const errorFiles = invalidFiles.map(fileUpload => ({
        ...fileUpload,
        status: 'error' as const,
        error: `File size (${(fileUpload.file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 512MB limit`
      }));
      
      setFiles(prev => [...prev, ...validFiles, ...errorFiles]);
    } else {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [uploadSettings]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const performUpload = async (fileUpload: FileUpload) => {
    const updateFile = (updates: Partial<FileUpload>) => {
      setFiles(prev => prev.map(f => 
        f.id === fileUpload.id ? { ...f, ...updates } : f
      ));
    };

    try {
      if (!fileUpload.autoEncrypt) {
        throw new Error('Only encrypted uploads are supported in this implementation');
      }

      // Step 1: Client-side encryption
      updateFile({ status: 'encrypting', progress: 10 });
      console.log(`🔐 Starting encryption for file: ${fileUpload.file.name} (${fileUpload.file.size} bytes)`);
      
      const encryptedData = await encryptFileForUpload(fileUpload.file, fileUpload.encryptionLevel);
      console.log(`✅ Encryption complete. Ciphertext size: ${encryptedData.ciphertextBlob.size} bytes`);
      updateFile({ progress: 30 });
      
      // Step 2: Upload to backend
      updateFile({ status: 'uploading', progress: 50 });
      
      // Prepare form data
      const formData = new FormData();
      
      // Add encrypted file
      formData.append('file', encryptedData.ciphertextBlob, `${fileUpload.file.name}.enc`);
      
      // Add metadata
      const metadata = {
        originalFilename: encryptedData.metadata.originalFilename,
        ivBase64: encryptedData.metadata.ivBase64,
        algo: encryptedData.metadata.algo,
        encryptionLevel: encryptedData.metadata.encryptionLevel
      };
      formData.append('metadata', JSON.stringify(metadata));
      
      console.log(`📤 Uploading to backend:`, {
        filename: metadata.originalFilename,
        size: encryptedData.ciphertextBlob.size,
        iv: metadata.ivBase64,
        algo: metadata.algo
      });
      
      // Upload to backend API using direct fetch for FormData
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const uploadUrl = `${API_BASE_URL}/files`;
      console.log(`📤 Uploading to: ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set multipart/form-data boundary
        },
        body: formData
      });
      
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      
      updateFile({ progress: 90 });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error(`❌ Upload failed:`, errorData);
        throw new Error(errorData.error || errorData.message || `Upload failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`✅ Backend upload successful. File ID: ${result.id}`);

      updateFile({ progress: 95 });
      await new Promise(resolve => setTimeout(resolve, 500));
      updateFile({ status: 'completed', progress: 100 });

      // Dispatch custom events to notify other components about successful upload
      window.dispatchEvent(new CustomEvent('fileUploaded', { 
        detail: { fileId: result.id, filename: result.original_filename, storage: 'backend' } 
      }));
      window.dispatchEvent(new CustomEvent('storageChanged'));
      console.log('📡 File upload events dispatched');

    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error(`❌ Error details:`, {
        message: errorMessage,
        type: error instanceof TypeError ? 'Network/CORS Error' : 'Unknown Error',
        file: fileUpload.file.name
      });
      
      updateFile({ 
        status: 'error', 
        error: errorMessage
      });
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    // Process uploads in parallel
    await Promise.all(pendingFiles.map(performUpload));
    
    setIsUploading(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileSettings = (fileId: string, updates: Partial<FileUpload>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'encrypting': return 'text-yellow-400';
      case 'uploading': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <File className="w-4 h-4" />;
      case 'encrypting': return <Lock className="w-4 h-4 animate-pulse" />;
      case 'uploading': return <UploadIcon className="w-4 h-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

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
                <h1 className="text-xl font-bold text-white">Upload Files</h1>
                <p className="text-xs text-gray-400">Secure • Encrypted • Private</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drag & Drop Zone */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-0">
                <motion.div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  animate={{
                    borderColor: isDragOver ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    backgroundColor: isDragOver ? 'rgba(99,102,241,0.1)' : 'transparent'
                  }}
                  className={`
                    relative border-2 border-dashed rounded-lg p-12 text-center transition-all
                    ${isDragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <motion.div
                    animate={{ scale: isDragOver ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isDragOver ? 'Drop files here' : 'Upload your files'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Drag and drop files here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      browse files
                    </button>
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      AES-256 Encryption
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      Client-side Security
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
                      Zero-knowledge
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      Privacy First
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Files ({files.length})</CardTitle>
                      <CardDescription className="text-gray-400">
                        Ready for secure upload
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || files.every(f => f.status !== 'pending')}
                      className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
                    >
                      {isUploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        />
                      ) : (
                        <UploadIcon className="w-4 h-4 mr-2" />
                      )}
                      {isUploading ? 'Uploading...' : 'Start Upload'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {files.map((fileUpload) => (
                        <motion.div
                          key={fileUpload.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getFileIcon(fileUpload.file.type)}
                              <div>
                                <h4 className="text-white font-medium">{fileUpload.file.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {formatFileSize(fileUpload.file.size)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusColor(fileUpload.status)} bg-opacity-20`}>
                                <span className="mr-1">{getStatusIcon(fileUpload.status)}</span>
                                {fileUpload.status}
                              </Badge>
                              
                              {fileUpload.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(fileUpload.id)}
                                  className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                                >
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          {fileUpload.progress > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">
                                  {fileUpload.status === 'encrypting' ? 'Encrypting...' : 
                                   fileUpload.status === 'uploading' ? 'Uploading...' : 
                                   fileUpload.status === 'completed' ? 'Completed' : ''}
                                </span>
                                <span className="text-gray-400">{fileUpload.progress}%</span>
                              </div>
                              <Progress value={fileUpload.progress} className="h-2" />
                            </div>
                          )}
                          
                          {/* File Settings */}
                          {fileUpload.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-gray-400">Encryption Level</Label>
                                <Select
                                  value={fileUpload.encryptionLevel}
                                  onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                                    updateFileSettings(fileUpload.id, { encryptionLevel: value })
                                  }
                                >
                                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(SECURITY_LEVELS).map(([key, level]) => (
                                      <SelectItem key={key} value={key}>
                                        {level.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`auto-encrypt-${fileUpload.id}`}
                                  checked={fileUpload.autoEncrypt}
                                  onCheckedChange={(checked: boolean) => 
                                    updateFileSettings(fileUpload.id, { autoEncrypt: checked })
                                  }
                                />
                                <Label 
                                  htmlFor={`auto-encrypt-${fileUpload.id}`}
                                  className="text-sm text-gray-400"
                                >
                                  Auto-encrypt
                                </Label>
                              </div>
                            </div>
                          )}
                          
                          {fileUpload.error && (
                            <Alert className="mt-3 border-red-500/20 bg-red-500/10">
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription className="text-red-400">
                                {fileUpload.error}
                              </AlertDescription>
                            </Alert>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings size={20} />
                  Upload Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Default Encryption</Label>
                  <Select
                    value={uploadSettings.defaultEncryption}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                      setUploadSettings(prev => ({ ...prev, defaultEncryption: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SECURITY_LEVELS).map(([key, level]) => (
                        <SelectItem key={key} value={key}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Auto-encrypt files</Label>
                  <Switch
                    checked={uploadSettings.autoEncrypt}
                    onCheckedChange={(checked: boolean) => 
                      setUploadSettings(prev => ({ ...prev, autoEncrypt: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Delete after upload</Label>
                  <Switch
                    checked={uploadSettings.deleteAfterUpload}
                    onCheckedChange={(checked: boolean) => 
                      setUploadSettings(prev => ({ ...prev, deleteAfterUpload: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">Security Notice</h4>
                    <p className="text-sm text-gray-300">
                      All files are encrypted on your device before upload. We never see your unencrypted data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;

/*
Usage in routing:
import Upload from './pages/upload/Upload';

<Route path="/upload" component={Upload} />
*/
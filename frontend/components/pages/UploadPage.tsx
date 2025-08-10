import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File,
  Lock,
  Unlock,
  X,
  Check,
  Shield,
  Folder,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  encrypted: boolean;
}

export function UploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [encryptByDefault, setEncryptByDefault] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return Image;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return Video;
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension || '')) {
      return Music;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return Archive;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return FileText;
    }
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
      encrypted: encryptByDefault
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const startUpload = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' } : f
    ));

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadFiles(prev => prev.map(f => {
        if (f.id === fileId && f.status === 'uploading') {
          const newProgress = Math.min(f.progress + Math.random() * 15, 100);
          const newStatus = newProgress >= 100 ? 'completed' : 'uploading';
          return { ...f, progress: newProgress, status: newStatus };
        }
        return f;
      }));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setUploadFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f
      ));
    }, 3000);
  };

  const uploadAll = () => {
    uploadFiles.forEach(file => {
      if (file.status === 'pending') {
        startUpload(file.id);
      }
    });
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const toggleFileEncryption = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, encrypted: !f.encrypted } : f
    ));
  };

  const totalFiles = uploadFiles.length;
  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length;
  const uploadingFiles = uploadFiles.filter(f => f.status === 'uploading').length;
  const totalSize = uploadFiles.reduce((acc, f) => acc + f.file.size, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Upload Files</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Securely upload and encrypt your files
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Shield className="h-3 w-3 mr-1" />
            AES-256 Encryption
          </Badge>
        </div>
      </div>

      {/* Upload Settings */}
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardHeader>
          <CardTitle>Upload Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="folder">Destination Folder</Label>
              <div className="relative">
                <Folder className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="pl-10"
                  placeholder="Select or create folder"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/20 dark:border-gray-800/20">
              <div className="flex items-center space-x-3">
                {encryptByDefault ? (
                  <Lock className="h-5 w-5 text-green-600" />
                ) : (
                  <Unlock className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <Label htmlFor="encrypt">Encrypt by Default</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Files will be encrypted before upload
                  </p>
                </div>
              </div>
              <Switch
                id="encrypt"
                checked={encryptByDefault}
                onCheckedChange={setEncryptByDefault}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardContent className="p-0">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Support for all file types • Max 100MB per file
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadFiles.length > 0 && (
        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Upload Queue</span>
                <Badge variant="secondary">
                  {totalFiles} files • {formatFileSize(totalSize)}
                </Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {uploadingFiles > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    {uploadingFiles} uploading
                  </Badge>
                )}
                {completedFiles > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {completedFiles} completed
                  </Badge>
                )}
                <Button
                  onClick={uploadAll}
                  disabled={uploadFiles.every(f => f.status !== 'pending')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Upload All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {uploadFiles.map((uploadFile) => {
                  const Icon = getFileIcon(uploadFile.file.name);
                  return (
                    <motion.div
                      key={uploadFile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30"
                    >
                      <div className="p-2 rounded bg-gray-100 dark:bg-gray-800">
                        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">{uploadFile.file.name}</h4>
                          <div className="flex items-center space-x-2">
                            {uploadFile.status === 'completed' && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatFileSize(uploadFile.file.size)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {uploadFile.status !== 'pending' && (
                            <div className="flex-1">
                              <Progress 
                                value={uploadFile.progress} 
                                className="h-2"
                              />
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {uploadFile.progress.toFixed(0)}% • {uploadFile.status}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFileEncryption(uploadFile.id)}
                              disabled={uploadFile.status === 'uploading' || uploadFile.status === 'completed'}
                              className={`h-8 px-2 ${uploadFile.encrypted ? 'text-green-600' : 'text-orange-600'}`}
                            >
                              {uploadFile.encrypted ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {uploadFile.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => startUpload(uploadFile.id)}
                                className="h-8 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                              >
                                Upload
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadFile.id)}
                              disabled={uploadFile.status === 'uploading'}
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Upload Tips */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Files are encrypted on your device before upload. 
          Even we cannot access your unencrypted data. Enable 2FA in settings for additional security.
        </AlertDescription>
      </Alert>
    </div>
  );
}
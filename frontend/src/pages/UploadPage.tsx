import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Upload, ArrowLeft, Shield, Lock, AlertCircle } from 'lucide-react';
import authService from '../services/auth';
import fileService from '../services/fileService';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      await fileService.uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress.percentage);
      });
      
      setUploadSuccess(true);
      setSelectedFile(null);
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">CryptoVault</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Upload File</h2>
          <p className="text-gray-300">Securely upload and encrypt your files</p>
        </div>

        <div className="space-y-6">
          {/* Upload Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="w-5 h-5 mr-2 text-purple-400" />
                Upload Encrypted File
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* File Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragOver 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <span className="text-lg font-medium text-white hover:text-purple-300 transition-colors">
                        Choose a file
                      </span>
                      <span className="text-gray-400"> or drag and drop</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    Any file type up to 10MB
                  </p>
                </div>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <h4 className="text-sm font-medium text-white mb-3">Selected File:</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-200 font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-6">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Encrypting and Uploading...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Upload Encrypted File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300 mb-2">
                    End-to-End Encryption
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      🔒 Your file will be encrypted using AES-256-GCM before upload
                    </p>
                    <p>
                      🔑 Only you will have access to the encryption key
                    </p>
                    <p>
                      🛡️ Zero-knowledge architecture - we cannot access your files
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress (if uploading) */}
          {uploading && (
            <Card className="glass-card border-purple-500/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-200">
                      {uploadProgress < 10 ? 'Encrypting file...' : 'Uploading encrypted file...'}
                    </span>
                    <span className="text-gray-400">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="gradient-primary h-2 rounded-full transition-all duration-300 glow-purple"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Please keep this tab open until upload completes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <Card className="glass-card border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-300 mb-1">
                      File uploaded successfully!
                    </h3>
                    <p className="text-sm text-gray-300">
                      Your file has been encrypted and stored securely. You can view it in your dashboard.
                    </p>
                    <div className="mt-3 flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                      >
                        View Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadSuccess(false);
                        }}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        Upload Another
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {uploadError && (
            <Card className="glass-card border-red-500/20 bg-red-500/5">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-300 mb-1">
                      Upload failed
                    </h3>
                    <p className="text-sm text-gray-300">
                      {uploadError}
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadError(null)}
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

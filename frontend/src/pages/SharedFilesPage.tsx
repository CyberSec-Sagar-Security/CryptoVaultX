import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share, Users, Clock, FileText, AlertCircle } from 'lucide-react';
import authService from '../services/auth';

interface SharedFile {
  id: string;
  filename: string;
  size: number;
  sharedBy: string;
  sharedAt: string;
  expiresAt?: string;
}

const SharedFilesPage: React.FC = () => {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [yourSharedFiles, setYourSharedFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchSharedFiles();
  }, [navigate]);

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement actual API calls when share endpoints are available
      // For now, we'll set empty arrays since the API endpoints aren't implemented yet
      setSharedFiles([]);
      setYourSharedFiles([]);
      
      // Example of what the API calls would look like:
      // const [receivedFiles, sentFiles] = await Promise.all([
      //   fileService.getSharedFiles(), // Files shared with you
      //   fileService.getYourSharedFiles() // Files you've shared
      // ]);
      // setSharedFiles(receivedFiles);
      // setYourSharedFiles(sentFiles);
      
    } catch (error: any) {
      console.error('Error fetching shared files:', error);
      setError('Failed to load shared files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      // TODO: Implement file download when share download endpoint is available
      console.log('Downloading shared file:', fileId);
      // await fileService.downloadSharedFile(fileId);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Share className="h-7 w-7 text-purple-300" />
                  Shared Files
                </h1>
                <p className="text-purple-200 text-sm mt-1">Manage files shared with you and by you</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="glass-card px-4 py-2 border border-purple-400/30">
                <div className="flex items-center space-x-2 text-purple-200">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{sharedFiles.length} files</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Files Shared With You */}
        <div className="glass-card p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-300" />
              Files Shared With You
            </h3>
            <div className="glass-card px-3 py-1 border border-purple-400/30">
              <span className="text-sm text-purple-200">{sharedFiles.length} files</span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300">{error}</p>
                <button
                  onClick={fetchSharedFiles}
                  className="ml-auto text-red-300 hover:text-red-200 underline text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="mt-4 text-purple-200">Loading shared files...</p>
            </div>
          ) : sharedFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-card p-8 border border-purple-400/30 inline-block rounded-full mb-6">
                <FileText className="h-12 w-12 text-purple-300" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No shared files</h3>
              <p className="text-purple-200 mb-6">
                No files have been shared with you yet. File sharing features will be available once the backend sharing endpoints are implemented.
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="glass-button text-white font-medium px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30"
              >
                Upload Your First File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="glass-card p-4 border border-purple-400/30 hover:border-purple-300/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="glass-card p-3 border border-purple-400/30 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{file.filename}</h4>
                        <div className="flex items-center space-x-4 text-sm text-purple-200 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Shared by {file.sharedBy}</span>
                          <span>•</span>
                          <span>{formatDate(file.sharedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {file.expiresAt && (
                        <div className="flex items-center space-x-1 text-sm text-purple-200">
                          <Clock className="h-4 w-4" />
                          <span>Expires {formatDate(file.expiresAt)}</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="glass-button text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Shared Files Section */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Share className="h-5 w-5 text-purple-300" />
              Files You've Shared
            </h3>
            <div className="glass-card px-3 py-1 border border-purple-400/30">
              <span className="text-sm text-purple-200">{yourSharedFiles.length} files</span>
            </div>
          </div>

          {yourSharedFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-card p-8 border border-purple-400/30 inline-block rounded-full mb-6">
                <Share className="h-12 w-12 text-purple-300" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No shared files</h3>
              <p className="text-purple-200 mb-6">
                You haven't shared any files yet. File sharing features will be available once the backend sharing endpoints are implemented.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/upload')}
                  className="glass-button text-white font-medium px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Upload and Share File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {yourSharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="glass-card p-4 border border-purple-400/30 hover:border-purple-300/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="glass-card p-3 border border-purple-400/30 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{file.filename}</h4>
                        <div className="flex items-center space-x-4 text-sm text-purple-200 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Shared {formatDate(file.sharedAt)}</span>
                          {file.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires {formatDate(file.expiresAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        className="glass-button text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30"
                        title="Manage sharing"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SharedFilesPage;

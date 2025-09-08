/**
 * File Detail Page
 * Shows detailed information about a specific file including shares and metadata
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Trash2, 
  Edit3, 
  Shield, 
  Eye, 
  Calendar, 
  User,
  Users,
  Clock,
  FileText,
  Lock,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ShareModal } from '../../components/shared/ShareModal';
import { apiRequest } from '../../services/api';
import { getFileShares, revokeFileShare } from '../../services/shareApi';
import { unwrapKey, decryptFile, downloadDecryptedFile, getPrivateKeyFromSession } from '../../services/crypto';

interface FileDetail {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  wrappedKey: string;
  isEncrypted: boolean;
  downloadCount: number;
  lastAccessed?: string;
  metadata?: {
    originalSize: number;
    checksum: string;
  };
}

interface FileShare {
  id: string;
  fileId: string;
  recipientId: string;
  wrappedKey: string;
  accessLevel: string;
  createdAt: string;
  expiryDate?: string;
  // Additional properties for display
  recipientEmail?: string;
  sharedAt?: string;
  accessCount?: number;
}

export const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<FileDetail | null>(null);
  const [shares, setShares] = useState<FileShare[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fileId) {
      fetchFileDetails();
      fetchFileShares();
    }
  }, [fileId]);

  const fetchFileDetails = async () => {
    try {
      const response = await apiRequest(`/files/${fileId}`);
      setFile(response);
    } catch (error) {
      console.error('Failed to fetch file details:', error);
      setError('Failed to load file details');
    }
  };

  const fetchFileShares = async () => {
    try {
      const sharesData = await getFileShares(fileId!);
      setShares(sharesData);
    } catch (error) {
      console.error('Failed to fetch file shares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    setIsDownloading(true);
    try {
      // Get user's private key
      const privateKey = await getPrivateKeyFromSession();
      if (!privateKey) {
        throw new Error('Private key not found. Please log in again.');
      }

      // Unwrap the file key
      const fileKey = await unwrapKey(file.wrappedKey, privateKey);

      // Download encrypted file
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/files/${fileId}/blob`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const encryptedData = await response.arrayBuffer();
      
      // For now, assume the encrypted data contains IV + ciphertext
      // In a real implementation, you'd need to properly handle the encryption format
      const iv = encryptedData.slice(0, 12); // First 12 bytes for IV
      const ciphertext = encryptedData.slice(12);

      // Decrypt the file
      const decryptedData = await decryptFile(
        {
          ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
          iv: btoa(String.fromCharCode(...new Uint8Array(iv)))
        },
        fileKey
      );

      // Download the decrypted file
      downloadDecryptedFile(decryptedData, file.originalName, file.mimeType);

    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRevokeShare = async (shareId: string, recipientEmail: string) => {
    try {
      await revokeFileShare(fileId!, shareId);
      setShares(shares.filter(s => s.id !== shareId));
    } catch (error) {
      console.error('Failed to revoke share:', error);
      setError('Failed to revoke file share');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'view': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'download': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'edit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading file details...</div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">File Not Found</h1>
          <Button onClick={() => navigate('/files')} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Files
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => navigate('/files')}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Files
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{file.originalName}</h1>
            <p className="text-gray-400">File Details & Sharing</p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* File Details Card */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText size={20} />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">File Name</Label>
                    <p className="text-white font-medium">{file.originalName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">File Size</Label>
                    <p className="text-white font-medium">{formatFileSize(file.size)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Type</Label>
                    <p className="text-white font-medium">{file.mimeType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Uploaded</Label>
                    <p className="text-white font-medium">{formatDate(file.uploadedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Downloads</Label>
                    <p className="text-white font-medium">{file.downloadCount}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Last Accessed</Label>
                    <p className="text-white font-medium">
                      {file.lastAccessed ? formatDate(file.lastAccessed) : 'Never'}
                    </p>
                  </div>
                </div>

                {file.isEncrypted && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <Shield size={16} className="text-green-400" />
                    <span className="text-green-400 font-medium">End-to-end encrypted</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Shares */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users size={20} />
                    Shared With ({shares.length})
                  </CardTitle>
                  <Button
                    onClick={() => setIsShareModalOpen(true)}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-500"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {shares.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">This file hasn't been shared yet</p>
                    <Button
                      onClick={() => setIsShareModalOpen(true)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Share Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-sm">
                              {share.recipientEmail?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{share.recipientEmail || 'Unknown'}</p>
                            <p className="text-gray-400 text-sm">
                              Shared {share.sharedAt ? formatDate(share.sharedAt) : formatDate(share.createdAt)}
                              {share.accessCount && share.accessCount > 0 && ` • ${share.accessCount} accesses`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getAccessLevelColor(share.accessLevel)}>
                            {share.accessLevel}
                          </Badge>
                          <Button
                            onClick={() => handleRevokeShare(share.id, share.recipientEmail || '')}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  <Download size={16} className="mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                
                <Button
                  onClick={() => setIsShareModalOpen(true)}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Share2 size={16} className="mr-2" />
                  Share File
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete File
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock size={16} />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Encryption</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    AES-256-GCM
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Key Wrapping</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    RSA-OAEP
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  This file is protected with end-to-end encryption. Only you and users you share with can access the content.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          fileId={fileId!}
          fileName={file.originalName}
          onShareSuccess={() => {
            fetchFileShares();
            setIsShareModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

// Helper component for labels
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-sm font-medium ${className}`}>{children}</div>
);

export default FileDetailPage;

/**
 * Dashboard Page - CryptoVaultX Main Interface
 * Path: src/pages/dashboard/Dashboard.tsx
 * Main dashboard with file overview, recent activity, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Shield, 
  File, 
  Users, 
  Lock, 
  TrendingUp, 
  Search,
  Plus,
  Grid,
  List,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Clock,
  HardDrive,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import ProfileDropdown from '../../components/ui/profile-dropdown';
import { apiRequest } from '../../services/api';
import { getFileStatistics, listLocalFiles } from '../../lib/localFileStorage';

// Define encryption status constants locally
const ENCRYPTION_STATUS = {
  ENCRYPTED: 'encrypted',
  DECRYPTED: 'decrypted',
  PROCESSING: 'processing',
  ERROR: 'error',
  NONE: 'none'
} as const;

type StatusKey = keyof typeof STATUS_COLORS;

const STATUS_COLORS = {
  encrypted: 'bg-green-500/20 text-green-400 border-green-500/30',
  decrypted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  none: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
} as const;

const STATUS_LABELS = {
  encrypted: 'Encrypted',
  decrypted: 'Decrypted',
  processing: 'Processing',
  error: 'Error',
  none: 'Unencrypted'
} as const;

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  encrypted: boolean;
  status: StatusKey;
  lastModified: string;
  sharedWith: number;
}

interface DashboardStats {
  totalFiles: number;
  encryptedFiles: number;
  totalSize: string;
  sharedFiles: number;
}

interface StorageInfo {
  usedBytes: number;
  quotaBytes: number;
  usagePercentage: number;
  usedFormatted: string;
  quotaFormatted: string;
}

interface SharingStats {
  filesSharedByYou: number;
  filesSharedWithYou: number;
  usersYouSharedWith: number;
  usersWhoSharedWithYou: number;
}

interface SharedFilePreview {
  id: string;
  filename: string;
  permission: string;
  sharedAt: string;
  sharedBy?: string;
  sharedWith?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    encryptedFiles: 0,
    totalSize: '0 B',
    sharedFiles: 0
  });
  const [sharingStats, setSharingStats] = useState<SharingStats>({
    filesSharedByYou: 0,
    filesSharedWithYou: 0,
    usersYouSharedWith: 0,
    usersWhoSharedWithYou: 0
  });
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    usedBytes: 0,
    quotaBytes: 536870912, // 512 MB default
    usagePercentage: 0,
    usedFormatted: '0 B',
    quotaFormatted: '512 MB'
  });
  const [recentSharedWithMe, setRecentSharedWithMe] = useState<SharedFilePreview[]>([]);
  const [recentSharedByMe, setRecentSharedByMe] = useState<SharedFilePreview[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timestamp refresh state - forces re-render of relative times every minute
  const [, setTimestampTick] = useState(0);
  
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'JD';
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch dashboard data from API (fully dynamic with parallel requests for speed)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      // Format file size helper
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
      };

      // Fetch all data in parallel for faster loading
      const [filesResponse, sharingResponse, storageResponse, sharedWithMeResponse, sharedByMeResponse] = await Promise.allSettled([
        apiRequest('/files/list'),
        apiRequest('/shares/stats'),
        apiRequest('/files/quota'),
        apiRequest('/shared?view=received&page=1&per_page=2'),
        apiRequest('/shared?view=sent&page=1&per_page=2')
      ]);

      console.log('📦 API Responses:', {
        files: filesResponse.status,
        sharing: sharingResponse.status,
        storage: storageResponse.status,
        sharedWithMe: sharedWithMeResponse.status,
        sharedByMe: sharedByMeResponse.status
      });

      // Process files data
      let allFiles: any[] = [];
      let ownedFilesCount = 0;
      let totalBytes = 0;
      let encryptedCount = 0;
      
      if (filesResponse.status === 'fulfilled') {
        const ownedFiles = filesResponse.value.owned_files || [];
        const sharedFiles = filesResponse.value.shared_files || [];
        allFiles = [...ownedFiles, ...sharedFiles];
        ownedFilesCount = ownedFiles.length; // Track owned files count separately
        totalBytes = filesResponse.value.owned_storage?.total_size || 0;
        encryptedCount = ownedFiles.filter((f: any) => f.algo && f.algo !== 'none').length;
        
        console.log('📂 Files Data:', {
          ownedFiles: ownedFiles.length,
          sharedFiles: sharedFiles.length,
          totalFiles: allFiles.length,
          totalBytes: totalBytes,
          encryptedCount: encryptedCount
        });
      } else if (filesResponse.status === 'rejected') {
        console.error('❌ Files API failed:', filesResponse.reason);
      }

      // Process sharing statistics
      let sharedFilesCount = 0;
      if (sharingResponse.status === 'fulfilled') {
        const stats = sharingResponse.value.stats || {};
        setSharingStats({
          filesSharedByYou: stats.files_you_shared || 0,
          filesSharedWithYou: stats.files_shared_with_you || 0,
          usersYouSharedWith: stats.users_you_shared_with || 0,
          usersWhoSharedWithYou: stats.users_who_shared_with_you || 0
        });
        sharedFilesCount = (stats.files_you_shared || 0) + (stats.files_shared_with_you || 0);
        
        console.log('🔗 Sharing Stats:', {
          sharedByYou: stats.files_you_shared || 0,
          sharedWithYou: stats.files_shared_with_you || 0,
          total: sharedFilesCount
        });
      } else if (sharingResponse.status === 'rejected') {
        console.error('❌ Sharing API failed:', sharingResponse.reason);
      }

      // Process storage quota (512 MB limit with alert)
      if (storageResponse.status === 'fulfilled') {
        const info = storageResponse.value.storage_info || {};
        const usedBytes = info.used_bytes || 0;
        const quotaBytes = info.quota_bytes || 536870912; // 512 MB
        const usagePercentage = info.usage_percentage || 0;
        
        console.log('💾 Storage Info:', {
          usedBytes: usedBytes,
          quotaBytes: quotaBytes,
          usagePercentage: usagePercentage,
          usedFormatted: formatFileSize(usedBytes),
          quotaFormatted: formatFileSize(quotaBytes)
        });
        
        setStorageInfo({
          usedBytes: usedBytes,
          quotaBytes: quotaBytes,
          usagePercentage: usagePercentage,
          usedFormatted: formatFileSize(usedBytes),
          quotaFormatted: formatFileSize(quotaBytes)
        });
        
        // Check if storage limit is reached or exceeded
        const STORAGE_LIMIT_MB = 512;
        const usedMB = usedBytes / (1024 * 1024);
        
        if (usedBytes >= quotaBytes) {
          console.warn('⚠️ Storage limit reached!');
          alert(`⚠️ Storage Limit Reached!\n\nYou have used ${formatFileSize(usedBytes)} of your ${STORAGE_LIMIT_MB} MB limit.\n\nPlease delete some files to free up space before uploading more files.`);
        } else if (usagePercentage >= 90) {
          console.warn('⚠️ Storage almost full!');
          // Show warning when 90% full (optional - only once per session)
          const warningShown = sessionStorage.getItem('storageWarningShown');
          if (!warningShown) {
            alert(`⚠️ Storage Almost Full!\n\nYou have used ${usagePercentage.toFixed(1)}% (${formatFileSize(usedBytes)}) of your ${STORAGE_LIMIT_MB} MB limit.\n\nConsider deleting some files to free up space.`);
            sessionStorage.setItem('storageWarningShown', 'true');
          }
        }
      } else if (storageResponse.status === 'rejected') {
        console.error('❌ Storage API failed:', storageResponse.reason);
      }

      // Process shared with me files
      if (sharedWithMeResponse.status === 'fulfilled') {
        const sharedFiles = sharedWithMeResponse.value.shared_files || [];
        setRecentSharedWithMe(sharedFiles.map((file: any) => ({
          id: file.file_id,
          filename: file.filename,
          permission: file.permission,
          sharedAt: file.shared_at,
          sharedBy: file.shared_by?.username
        })));
      } else {
        setRecentSharedWithMe([]);
      }

      // Process shared by me files
      if (sharedByMeResponse.status === 'fulfilled') {
        const sharedFiles = sharedByMeResponse.value.shared_files || [];
        setRecentSharedByMe(sharedFiles.map((file: any) => ({
          id: file.file_id,
          filename: file.filename,
          permission: file.permission,
          sharedAt: file.shared_at,
          sharedWith: file.shared_with?.username
        })));
      } else {
        setRecentSharedByMe([]);
      }

      // Set stats (consolidated - removed duplicate)
      // Note: totalFiles now shows OWNED files only, not including shared files
      const finalStats = {
        totalFiles: ownedFilesCount,  // Changed from allFiles.length to show only owned files
        encryptedFiles: encryptedCount,
        totalSize: formatFileSize(totalBytes),
        sharedFiles: sharedFilesCount
      };
      
      console.log('📊 Final Stats:', finalStats);
      setStats(finalStats);

      // Set recent files (limit to 4 most recent) from owned files
      const ownedFiles = allFiles.filter((f: any) => f.access_type === 'owner');
      const sortedFiles = ownedFiles
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4)
        .map((file: any) => ({
          id: file.id,
          name: file.original_filename,
          type: getFileTypeFromName(file.original_filename),
          size: formatFileSize(file.size_bytes || 0),
          encrypted: file.algo && file.algo !== 'none',
          status: (file.algo && file.algo !== 'none') ? ENCRYPTION_STATUS.ENCRYPTED : ENCRYPTION_STATUS.NONE,
          lastModified: getRelativeTime(file.created_at),
          sharedWith: 0 // Will be updated if we have sharing data
        }));

      setRecentFiles(sortedFiles);
      console.log('✅ Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Failed to fetch dashboard data:', err);
      // Keep default/empty data on error
      setStats({
        totalFiles: 0,
        encryptedFiles: 0,
        totalSize: '0 B',
        sharedFiles: 0
      });
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 h-24"></div>
        ))}
      </div>
      
      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 h-32"></div>
        ))}
      </div>
      
      {/* Content Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-64"></div>
    </div>
  );

  // Helper function to get file type from filename
  const getFileTypeFromName = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'default';
    
    const typeMap: Record<string, string> = {
      pdf: 'pdf',
      fig: 'design',
      docx: 'document',
      doc: 'document',
      pptx: 'presentation',
      ppt: 'presentation',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
      mp4: 'video',
      avi: 'video',
      mov: 'video',
      mp3: 'audio',
      wav: 'audio'
    };
    
    return typeMap[ext] || 'default';
  };

  // Helper function to get relative time (fixed for accurate timestamps)
  const getRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      // Calculate difference in milliseconds
      const diffMs = now.getTime() - date.getTime();
      
      // Handle future dates (shouldn't happen, but just in case)
      if (diffMs < 0) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      // Return appropriate relative time
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
      if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
      
      // For dates older than a year, show full date
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Recently';
    }
  };

  // Load dashboard data on component mount (no auto-polling to prevent constant refreshes)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for file upload, delete, and share events to refresh the dashboard in real-time
  useEffect(() => {
    const handleFileUploaded = () => {
      console.log('📤 File uploaded - refreshing dashboard...');
      fetchDashboardData();
    };
    
    const handleFileDeleted = () => {
      console.log('🗑️ File deleted - refreshing dashboard...');
      fetchDashboardData();
    };
    
    const handleFileShared = () => {
      console.log('🔗 File shared - refreshing dashboard...');
      fetchDashboardData();
    };
    
    const handleStorageChange = () => {
      console.log('💾 Storage changed - refreshing dashboard...');
      fetchDashboardData();
    };

    // Listen to multiple events
    window.addEventListener('fileUploaded', handleFileUploaded);
    window.addEventListener('fileDeleted', handleFileDeleted);
    window.addEventListener('fileShared', handleFileShared);
    window.addEventListener('storageChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
      window.removeEventListener('fileDeleted', handleFileDeleted);
      window.removeEventListener('fileShared', handleFileShared);
      window.removeEventListener('storageChanged', handleStorageChange);
    };
  }, []);

  // Update timestamps every minute to show accurate relative times
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestampTick(tick => tick + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  const getFileIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      pdf: '📄',
      design: '🎨',
      document: '📝',
      presentation: '📊',
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      default: '📁'
    };
    return iconMap[type] || iconMap.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">CryptoVaultX</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
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

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchDashboardData();
                }}
                className="text-gray-400 hover:text-white"
                title="Refresh dashboard data"
              >
                <RefreshCw size={18} />
              </Button>
              <ProfileDropdown 
                userInitials={userInitials}
                username={user?.username}
                profilePhoto={user?.profile_photo}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || user?.name || 'User'}
          </h2>
          <p className="text-gray-400">Your files are secure and encrypted. Here's what's happening.</p>
        </motion.div>

        {/* Show loading skeleton or actual content */}
        {loading ? renderLoadingSkeleton() : (
          <>
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">My Files</p>
                  <p className="text-2xl font-bold text-white">{stats.totalFiles.toLocaleString()}</p>
                </div>
                <File className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{storageInfo.usedFormatted}</p>
                </div>
                <HardDrive className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{stats.totalFiles} files</span>
                  <span>{storageInfo.usedFormatted} / {storageInfo.quotaFormatted}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(storageInfo.usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Shared Files</p>
                  <p className="text-2xl font-bold text-white">{stats.sharedFiles}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card 
            className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-400/40 transition-all cursor-pointer group"
            onClick={() => navigate('/upload')}
          >
            <CardContent className="p-6 text-center">
              <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Upload Files</h3>
              <p className="text-sm text-gray-400">Drag & drop or browse files to encrypt</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-400/40 transition-all cursor-pointer group"
            onClick={() => navigate('/shared')}
          >
            <CardContent className="p-6 text-center">
              <Share2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Share Securely</h3>
              <p className="text-sm text-gray-400">Share encrypted files with others</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group"
            onClick={() => navigate('/files')}
          >
            <CardContent className="p-6 text-center">
              <File className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">My Files</h3>
              <p className="text-sm text-gray-400">View and manage all your files</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shared Files Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Shared Files</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/shared')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              View All Shared Files
              <Share2 size={16} className="ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Recent Shared Files - Dynamic Data */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-white text-lg">Shared With Me</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSharedWithMe.length > 0 ? (
                    <>
                      {recentSharedWithMe.map((file) => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => navigate('/shared')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getFileIcon(getFileTypeFromName(file.filename))}</div>
                            <div>
                              <p className="text-white font-medium text-sm truncate max-w-[200px]">{file.filename}</p>
                              <p className="text-gray-400 text-xs">
                                From @{file.sharedBy} • {getRelativeTime(file.sharedAt)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${
                            file.permission === 'full_access' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            file.permission === 'view' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          } text-xs`}>
                            {file.permission === 'full_access' ? 'Full Access' : 
                             file.permission === 'view' ? 'View' : 'Download'}
                          </Badge>
                        </div>
                      ))}
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/shared')}
                      >
                        View All Received Files
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No files shared with you yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Files I've Shared - Dynamic Data */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <CardTitle className="text-white text-lg">Files I've Shared</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSharedByMe.length > 0 ? (
                    <>
                      {recentSharedByMe.map((file) => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => navigate('/shared')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getFileIcon(getFileTypeFromName(file.filename))}</div>
                            <div>
                              <p className="text-white font-medium text-sm truncate max-w-[200px]">{file.filename}</p>
                              <p className="text-gray-400 text-xs">
                                Shared with @{file.sharedWith} • {getRelativeTime(file.sharedAt)}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            {file.permission === 'full_access' ? 'Full Access' : 
                             file.permission === 'view' ? 'View' : 'Download'}
                          </Badge>
                        </div>
                      ))}
                      <Button 
                        variant="info" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/shared')}
                      >
                        View All Sent Files
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Share2 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Share more files securely</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Share Action */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Share Files Securely</h4>
                    <p className="text-sm text-gray-400">End-to-end encrypted file sharing with access controls</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white font-medium">{stats.sharedFiles}</p>
                    <p className="text-gray-400 text-sm">Files Shared</p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
                    onClick={() => navigate('/shared')}
                  >
                    Share Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Files Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Recent Files</CardTitle>
                  <CardDescription className="text-gray-400">Your recently accessed files</CardDescription>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      <div>
                        <h4 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{file.size}</span>
                          <Clock size={12} />
                          <span>{file.lastModified}</span>
                          {file.sharedWith > 0 && (
                            <>
                              <Users size={12} />
                              <span>{file.sharedWith} shared</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge 
                        className={`${STATUS_COLORS[file.status]} bg-opacity-20 border-current`}
                      >
                        {STATUS_LABELS[file.status]}
                      </Badge>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          onClick={() => navigate('/files')}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          onClick={() => navigate('/files')}
                        >
                          <Download size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          onClick={() => navigate('/shared')}
                        >
                          <Share2 size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                          <MoreVertical size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  className="text-indigo-400 hover:text-indigo-300"
                  onClick={() => navigate('/files')}
                >
                  View All Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

/*
Usage in routing:
import Dashboard from './pages/dashboard/Dashboard';

<Route path="/dashboard" component={Dashboard} />
*/
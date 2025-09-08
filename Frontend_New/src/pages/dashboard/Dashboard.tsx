/**
 * Dashboard Page - CryptoVaultX Main Interface
 * Path: src/pages/dashboard/Dashboard.tsx
 * Main dashboard with file overview, recent activity, and quick actions
 */

import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import ProfileDropdown from '../../components/ui/profile-dropdown';

// Define encryption status constants locally
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
  status: string;
  lastModified: string;
  sharedWith: number;
}

interface DashboardStats {
  totalFiles: number;
  encryptedFiles: number;
  totalSize: string;
  sharedFiles: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'JD';
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Mock data - replace with actual API calls
  const stats: DashboardStats = {
    totalFiles: 1247,
    encryptedFiles: 1198,
    totalSize: '156.3 GB',
    sharedFiles: 23
  };

  const recentFiles: FileItem[] = [
    {
      id: '1',
      name: 'Financial_Report_2024.pdf',
      type: 'pdf',
      size: '2.4 MB',
      encrypted: true,
      status: ENCRYPTION_STATUS.ENCRYPTED,
      lastModified: '2 hours ago',
      sharedWith: 3
    },
    {
      id: '2',
      name: 'Product_Mockups.fig',
      type: 'design',
      size: '15.7 MB',
      encrypted: true,
      status: ENCRYPTION_STATUS.ENCRYPTED,
      lastModified: '5 hours ago',
      sharedWith: 0
    },
    {
      id: '3',
      name: 'Contract_Draft_v3.docx',
      type: 'document',
      size: '890 KB',
      encrypted: true,
      status: ENCRYPTION_STATUS.ENCRYPTED,
      lastModified: '1 day ago',
      sharedWith: 2
    },
    {
      id: '4',
      name: 'Presentation_Slides.pptx',
      type: 'presentation',
      size: '45.2 MB',
      encrypted: false,
      status: ENCRYPTION_STATUS.NONE,
      lastModified: '3 days ago',
      sharedWith: 5
    }
  ];

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
              <ProfileDropdown 
                userInitials={userInitials}
                username={user?.username}
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Files</p>
                  <p className="text-2xl font-bold text-white">{stats.totalFiles.toLocaleString()}</p>
                </div>
                <File className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Encrypted</p>
                  <p className="text-2xl font-bold text-green-400">{stats.encryptedFiles.toLocaleString()}</p>
                </div>
                <Lock className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSize}</p>
                </div>
                <HardDrive className="w-8 h-8 text-cyan-400" />
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
            onClick={() => navigate('/dashboard/upload')}
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
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-400/40 transition-all cursor-pointer group"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">View Analytics</h3>
              <p className="text-sm text-gray-400">Track usage and security metrics</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Analytics Overview</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/analytics')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              View Full Analytics
              <TrendingUp size={16} className="ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Score */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-white">Security Score</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Excellent</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Overall Score</span>
                    <span className="text-white font-medium">94%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">7 threats prevented this month</p>
                </div>
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-white">Storage Usage</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">156.3 GB</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used / Total</span>
                    <span className="text-white font-medium">156.3 / 500 GB</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: '31%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">31% of total capacity used</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">Recent Activity</span>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">This Month</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uploads</span>
                    <span className="text-white font-medium">89 files</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Downloads</span>
                    <span className="text-white font-medium">234 files</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Files Shared</span>
                    <span className="text-white font-medium">23 shares</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
            {/* Recent Shared Files */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-white text-lg">Shared With Me</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="text-white font-medium text-sm">Q4_Financial_Report.pdf</p>
                        <p className="text-gray-400 text-xs">From Sarah Johnson • 2 hours ago</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">View</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎨</div>
                      <div>
                        <p className="text-white font-medium text-sm">Product_Roadmap_2024.figma</p>
                        <p className="text-gray-400 text-xs">From Michael Chen • 1 day ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Download</Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                    onClick={() => navigate('/shared')}
                  >
                    View All Received Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Files I've Shared */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <CardTitle className="text-white text-lg">Files I've Shared</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📝</div>
                      <div>
                        <p className="text-white font-medium text-sm">Contract_Template_v2.docx</p>
                        <p className="text-gray-400 text-xs">Shared with 3 people • 5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Edit</Badge>
                      <span className="text-gray-400 text-xs">12 views</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="text-center w-full py-4">
                      <Share2 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Share more files securely</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                    onClick={() => navigate('/shared')}
                  >
                    View All Sent Files
                  </Button>
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
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                          <Download size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
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
                <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                  View All Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
/**
 * Analytics Page - CryptoVaultX Usage Analytics
 * Path: src/pages/analytics/Analytics.tsx  
 * Security metrics, usage statistics, and insights dashboard
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  PieChart, 
  Users, 
  Download, 
  Upload,
  Lock,
  Eye,
  Share2,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface AnalyticsData {
  totalFiles: number;
  encryptedFiles: number;
  totalStorage: number;
  storageLimit: number;
  monthlyUploads: number;
  monthlyDownloads: number;
  sharedFiles: number;
  activeShares: number;
  securityScore: number;
  threatsPrevented: number;
}

interface ActivityLog {
  id: string;
  action: 'upload' | 'download' | 'share' | 'encrypt' | 'access';
  fileName: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data - replace with real API calls
  const analyticsData: AnalyticsData = {
    totalFiles: 1247,
    encryptedFiles: 1198,
    totalStorage: 156.3, // GB
    storageLimit: 500, // GB
    monthlyUploads: 89,
    monthlyDownloads: 234,
    sharedFiles: 23,
    activeShares: 18,
    securityScore: 94,
    threatsPrevented: 7
  };

  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      action: 'upload',
      fileName: 'Financial_Report_Q4.pdf',
      timestamp: '2 hours ago',
      status: 'success',
      details: 'File encrypted and uploaded successfully'
    },
    {
      id: '2', 
      action: 'share',
      fileName: 'Project_Proposal.docx',
      timestamp: '4 hours ago',
      status: 'success',
      details: 'Shared with 3 team members'
    },
    {
      id: '3',
      action: 'access',
      fileName: 'Sensitive_Data.xlsx',
      timestamp: '6 hours ago',
      status: 'warning',
      details: 'Unusual access pattern detected'
    },
    {
      id: '4',
      action: 'encrypt',
      fileName: 'Client_Contracts.zip',
      timestamp: '1 day ago',
      status: 'success',
      details: 'AES-256 encryption applied'
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      case 'encrypt': return <Lock className="w-4 h-4" />;
      case 'access': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const storagePercentage = (analyticsData.totalStorage / analyticsData.storageLimit) * 100;
  const encryptionPercentage = (analyticsData.encryptedFiles / analyticsData.totalFiles) * 100;

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
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-xs text-gray-400">Security insights & usage metrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Filter size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Security Score</h2>
                  <p className="text-green-400 mb-4">Your vault security is excellent</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{analyticsData.encryptedFiles} files encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>{analyticsData.threatsPrevented} threats blocked</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#10B981"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${analyticsData.securityScore * 0.628} 62.8`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-400">{analyticsData.securityScore}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Security Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-8 h-8 text-indigo-400" />
                <Badge className="bg-indigo-500/20 text-indigo-400">
                  {storagePercentage.toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-sm text-gray-400 mb-1">Storage Used</h3>
              <p className="text-2xl font-bold text-white mb-2">
                {analyticsData.totalStorage} GB
              </p>
              <Progress value={storagePercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {analyticsData.storageLimit - analyticsData.totalStorage} GB remaining
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Lock className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400">
                  {encryptionPercentage.toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-sm text-gray-400 mb-1">Encryption Rate</h3>
              <p className="text-2xl font-bold text-white mb-2">
                {analyticsData.encryptedFiles}
              </p>
              <Progress value={encryptionPercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                of {analyticsData.totalFiles} files encrypted
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  +{analyticsData.monthlyUploads}
                </Badge>
              </div>
              <h3 className="text-sm text-gray-400 mb-1">Monthly Uploads</h3>
              <p className="text-2xl font-bold text-white mb-2">
                {analyticsData.monthlyUploads}
              </p>
              <p className="text-xs text-green-400">
                +12% vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">
                  {analyticsData.activeShares}
                </Badge>
              </div>
              <h3 className="text-sm text-gray-400 mb-1">Active Shares</h3>
              <p className="text-2xl font-bold text-white mb-2">
                {analyticsData.sharedFiles}
              </p>
              <p className="text-xs text-purple-400">
                {analyticsData.activeShares} currently active
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 text-white">
                <BarChart3 size={16} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white/10 text-white">
                <Activity size={16} className="mr-2" />
                Activity Log
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-white/10 text-white">
                <Shield size={16} className="mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Upload Trends</CardTitle>
                    <CardDescription className="text-gray-400">
                      File upload activity over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for chart - would use recharts in real implementation */}
                    <div className="h-48 bg-white/5 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Upload trends chart</p>
                        <p className="text-xs">Would integrate with recharts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">File Types</CardTitle>
                    <CardDescription className="text-gray-400">
                      Distribution of encrypted file types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'Documents', count: 456, percentage: 36.6 },
                        { type: 'Images', count: 321, percentage: 25.7 },
                        { type: 'Archives', count: 234, percentage: 18.8 },
                        { type: 'Videos', count: 156, percentage: 12.5 },
                        { type: 'Other', count: 80, percentage: 6.4 }
                      ].map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <span className="text-gray-300">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-medium">{item.count}</span>
                            <span className="text-gray-400 text-sm ml-2">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest actions in your secure vault
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                      >
                        <div className={`p-2 rounded-lg ${getStatusColor(log.status)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium capitalize">{log.action}</h4>
                            <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                              {log.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-1">{log.fileName}</p>
                          <p className="text-gray-500 text-xs">{log.details}</p>
                        </div>
                        
                        <div className="text-right text-gray-400 text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {log.timestamp}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Security Status
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Current security posture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Encryption Enabled</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Two-Factor Auth</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400">Backup Recovery</span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Setup Needed</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Threat Prevention</CardTitle>
                    <CardDescription className="text-gray-400">
                      Security incidents blocked this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-6">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          {analyticsData.threatsPrevented}
                        </div>
                        <p className="text-gray-300 mb-4">Threats Blocked</p>
                        <p className="text-sm text-gray-400">
                          Your files remain secure with our advanced threat detection
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold text-blue-400">3</div>
                          <div className="text-xs text-gray-400">Malware Blocked</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold text-purple-400">4</div>
                          <div className="text-xs text-gray-400">Intrusion Attempts</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
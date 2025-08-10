import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Files, 
  HardDrive, 
  Users, 
  Shield, 
  Upload, 
  FolderPlus, 
  Share2, 
  FileText,
  Image,
  Archive,
  Video,
  Music,
  Lock,
  Activity,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const overviewStats = [
    {
      title: 'Total Files',
      value: '1,247',
      change: '+12%',
      icon: Files,
      color: 'text-blue-600'
    },
    {
      title: 'Storage Used',
      value: '47.2 GB',
      change: '+8%',
      icon: HardDrive,
      color: 'text-green-600'
    },
    {
      title: 'Shared Files',
      value: '89',
      change: '+24%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Security Level',
      value: 'High',
      change: 'AES-256',
      icon: Shield,
      color: 'text-red-600'
    }
  ];

  const quickActions = [
    {
      title: 'Upload Files',
      description: 'Add new files to your vault',
      icon: Upload,
      color: 'from-blue-500 to-blue-600',
      primary: true
    },
    {
      title: 'Create Folder',
      description: 'Organize your files',
      icon: FolderPlus,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Share Files',
      description: 'Collaborate securely',
      icon: Share2,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentFiles = [
    {
      name: 'Project Proposal.pdf',
      type: 'PDF',
      size: '2.4 MB',
      modified: '2 hours ago',
      encrypted: true,
      icon: FileText,
      shared: false
    },
    {
      name: 'Design Assets.zip',
      type: 'Archive',
      size: '15.8 MB',
      modified: '4 hours ago',
      encrypted: true,
      icon: Archive,
      shared: true
    },
    {
      name: 'Presentation.pptx',
      type: 'Presentation',
      size: '8.2 MB',
      modified: '1 day ago',
      encrypted: true,
      icon: FileText,
      shared: false
    },
    {
      name: 'Team Photo.jpg',
      type: 'Image',
      size: '3.1 MB',
      modified: '2 days ago',
      encrypted: true,
      icon: Image,
      shared: true
    },
    {
      name: 'Demo Video.mp4',
      type: 'Video',
      size: '45.2 MB',
      modified: '3 days ago',
      encrypted: true,
      icon: Video,
      shared: false
    }
  ];

  const fileCategories = [
    { name: 'Documents', count: 642, icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    { name: 'Images', count: 234, icon: Image, color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
    { name: 'Videos', count: 89, icon: Video, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
    { name: 'Audio', count: 156, icon: Music, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
    { name: 'Archives', count: 126, icon: Archive, color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400' }
  ];

  const activityFeed = [
    { action: 'Uploaded', file: 'Project Proposal.pdf', time: '2 hours ago', user: 'You' },
    { action: 'Shared', file: 'Design Assets.zip', time: '4 hours ago', user: 'You' },
    { action: 'Downloaded', file: 'Presentation.pptx', time: '6 hours ago', user: 'John Doe' },
    { action: 'Encrypted', file: 'Team Photo.jpg', time: '1 day ago', user: 'System' },
    { action: 'Created folder', file: 'Q1 Reports', time: '2 days ago', user: 'You' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your files.
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          🔐 End-to-End Encrypted
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`h-auto p-6 flex flex-col items-center space-y-3 w-full border-white/20 dark:border-gray-800/20 hover:shadow-lg transition-all duration-300 ${
                      action.primary ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-200 dark:border-purple-800' : ''
                    }`}
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Files */}
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Files
                <Badge variant="secondary" className="text-xs">
                  {recentFiles.length} files
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFiles.map((file, index) => {
                  const Icon = file.icon;
                  return (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="p-2 rounded bg-gray-100 dark:bg-gray-800">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{file.type}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.modified}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.encrypted && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <Lock className="h-3 w-3 mr-1" />
                            Encrypted
                          </Badge>
                        )}
                        {file.shared && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Categories */}
          <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
            <CardHeader>
              <CardTitle>File Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fileCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${category.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>47.2 GB used</span>
                  <span className="text-gray-600 dark:text-gray-400">of 100 GB</span>
                </div>
                <Progress value={47.2} className="h-2" />
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>+2.1 GB this month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Avatar className="h-6 w-6 mt-1">
                      <AvatarFallback className="text-xs">
                        {activity.user === 'You' ? 'U' : activity.user === 'System' ? 'S' : activity.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <p>
                        <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                        <span className="font-medium">{activity.file}</span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
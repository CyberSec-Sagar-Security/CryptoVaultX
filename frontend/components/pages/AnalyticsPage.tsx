import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Upload, 
  Download, 
  Users, 
  HardDrive,
  FileText,
  Image,
  Video,
  Archive,
  Shield,
  Activity,
  Calendar,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

export function AnalyticsPage() {
  // Sample data for charts
  const uploadActivityData = [
    { month: 'Jan', uploads: 45, downloads: 120 },
    { month: 'Feb', uploads: 52, downloads: 98 },
    { month: 'Mar', uploads: 61, downloads: 135 },
    { month: 'Apr', uploads: 48, downloads: 142 },
    { month: 'May', uploads: 67, downloads: 158 },
    { month: 'Jun', uploads: 73, downloads: 164 },
    { month: 'Jul', uploads: 69, downloads: 181 },
    { month: 'Aug', uploads: 82, downloads: 197 },
    { month: 'Sep', uploads: 78, downloads: 203 },
    { month: 'Oct', uploads: 89, downloads: 218 },
    { month: 'Nov', uploads: 94, downloads: 234 },
    { month: 'Dec', uploads: 102, downloads: 251 }
  ];

  const fileTypeData = [
    { name: 'Documents', value: 642, color: '#3B82F6' },
    { name: 'Images', value: 234, color: '#10B981' },
    { name: 'Videos', value: 89, color: '#8B5CF6' },
    { name: 'Audio', value: 156, color: '#F59E0B' },
    { name: 'Archives', value: 126, color: '#6B7280' }
  ];

  const storageData = [
    { month: 'Jan', storage: 12.5 },
    { month: 'Feb', storage: 15.2 },
    { month: 'Mar', storage: 18.7 },
    { month: 'Apr', storage: 22.1 },
    { month: 'May', storage: 26.8 },
    { month: 'Jun', storage: 31.2 },
    { month: 'Jul', storage: 35.9 },
    { month: 'Aug', storage: 40.1 },
    { month: 'Sep', storage: 43.7 },
    { month: 'Oct', storage: 47.2 },
    { month: 'Nov', storage: 49.8 },
    { month: 'Dec', storage: 52.3 }
  ];

  const securityData = [
    { day: 'Mon', encrypted: 45, shared: 12 },
    { day: 'Tue', encrypted: 52, shared: 18 },
    { day: 'Wed', encrypted: 38, shared: 15 },
    { day: 'Thu', encrypted: 61, shared: 22 },
    { day: 'Fri', encrypted: 73, shared: 28 },
    { day: 'Sat', encrypted: 28, shared: 8 },
    { day: 'Sun', encrypted: 31, shared: 10 }
  ];

  const keyMetrics = [
    {
      title: 'Total Uploads',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Upload,
      color: 'text-blue-600'
    },
    {
      title: 'Total Downloads',
      value: '3,842',
      change: '+8.3%',
      trend: 'up',
      icon: Download,
      color: 'text-green-600'
    },
    {
      title: 'Active Shares',
      value: '89',
      change: '+24.1%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Storage Growth',
      value: '+2.1 GB',
      change: '+5.2%',
      trend: 'up',
      icon: HardDrive,
      color: 'text-orange-600'
    }
  ];

  const securityMetrics = [
    { title: 'Encrypted Files', value: '100%', icon: Shield, color: 'text-green-600' },
    { title: 'Active Sessions', value: '3', icon: Activity, color: 'text-blue-600' },
    { title: '2FA Enabled', value: 'Yes', icon: Shield, color: 'text-purple-600' },
    { title: 'Last Backup', value: '2h ago', icon: Calendar, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insights into your file usage and security metrics
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <Shield className="h-3 w-3 mr-1" />
          Real-time Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className="flex items-center space-x-1 text-sm">
                        <TrendIcon className={`h-3 w-3 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {metric.change}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">vs last month</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="filetypes">File Types</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
            <CardHeader>
              <CardTitle>Upload & Download Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uploadActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="uploads" fill="#8B5CF6" name="Uploads" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="downloads" fill="#3B82F6" name="Downloads" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
            <CardHeader>
              <CardTitle>Storage Usage Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={storageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="storage" 
                      stroke="#10B981" 
                      fill="url(#storageGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filetypes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
              <CardHeader>
                <CardTitle>File Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fileTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {fileTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
              <CardHeader>
                <CardTitle>File Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fileTypeData.map((type, index) => {
                    const icons = {
                      'Documents': FileText,
                      'Images': Image,
                      'Videos': Video,
                      'Audio': Upload,
                      'Archives': Archive
                    };
                    const Icon = icons[type.name as keyof typeof icons] || FileText;
                    
                    return (
                      <motion.div
                        key={type.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/30 dark:bg-gray-900/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded" style={{ backgroundColor: `${type.color}20` }}>
                            <Icon className="h-5 w-5" style={{ color: type.color }} />
                          </div>
                          <div>
                            <p className="font-medium">{type.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {type.value} files
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{((type.value / 1247) * 100).toFixed(1)}%</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">of total</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
              <CardHeader>
                <CardTitle>Security Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={securityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="day" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                          border: '1px solid rgba(75, 85, 99, 0.3)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="encrypted" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Files Encrypted"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="shared" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        name="Files Shared"
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityMetrics.map((metric, index) => {
                      const Icon = metric.icon;
                      return (
                        <div key={metric.title} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                              <Icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                            <span className="text-sm font-medium">{metric.title}</span>
                          </div>
                          <span className="text-sm font-semibold">{metric.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
                <CardHeader>
                  <CardTitle>Security Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={`${(95 / 100) * 201.06} 201.06`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">95%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Excellent security posture
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
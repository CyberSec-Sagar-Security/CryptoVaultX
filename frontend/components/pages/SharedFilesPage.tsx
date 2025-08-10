import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Share2, 
  Users, 
  Link, 
  FileText, 
  Image, 
  Video, 
  Archive,
  Download,
  Eye,
  Edit,
  Copy,
  Calendar,
  Shield,
  Globe,
  Lock,
  Mail,
  Settings,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface SharedFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'archive';
  size: string;
  sharedWith: string[];
  permissions: 'view' | 'download' | 'edit';
  shareType: 'email' | 'link';
  expiresAt?: string;
  createdAt: string;
  downloads: number;
  views: number;
}

export function SharedFilesPage() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [shareForm, setShareForm] = useState({
    email: '',
    permission: 'view',
    message: '',
    expiration: ''
  });

  const sharedFiles: SharedFile[] = [
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'document',
      size: '2.4 MB',
      sharedWith: ['john@company.com', 'sarah@company.com'],
      permissions: 'download',
      shareType: 'email',
      expiresAt: '2025-02-15',
      createdAt: '2025-01-05',
      downloads: 12,
      views: 24
    },
    {
      id: '2',
      name: 'Design Assets.zip',
      type: 'archive',
      size: '15.8 MB',
      sharedWith: ['team@company.com'],
      permissions: 'view',
      shareType: 'link',
      expiresAt: '2025-01-20',
      createdAt: '2025-01-03',
      downloads: 8,
      views: 15
    },
    {
      id: '3',
      name: 'Team Photo.jpg',
      type: 'image',
      size: '3.1 MB',
      sharedWith: ['alice@company.com', 'bob@company.com', 'charlie@company.com'],
      permissions: 'download',
      shareType: 'email',
      createdAt: '2025-01-01',
      downloads: 5,
      views: 18
    },
    {
      id: '4',
      name: 'Demo Video.mp4',
      type: 'video',
      size: '45.2 MB',
      sharedWith: ['client@external.com'],
      permissions: 'view',
      shareType: 'link',
      expiresAt: '2025-01-15',
      createdAt: '2024-12-28',
      downloads: 3,
      views: 42
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'archive': return Archive;
      default: return FileText;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'view': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'download': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'edit': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleShare = () => {
    // Simulate sharing process
    toast.success('File shared successfully!');
    setIsShareDialogOpen(false);
    setShareForm({ email: '', permission: 'view', message: '', expiration: '' });
  };

  const copyShareLink = (fileId: string) => {
    const link = `https://cryptovault.app/shared/${fileId}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard!');
  };

  const revokeAccess = (fileId: string, email: string) => {
    toast.success(`Access revoked for ${email}`);
  };

  const totalShares = sharedFiles.length;
  const totalViews = sharedFiles.reduce((acc, file) => acc + file.views, 0);
  const totalDownloads = sharedFiles.reduce((acc, file) => acc + file.downloads, 0);
  const expiringFiles = sharedFiles.filter(file => 
    file.expiresAt && new Date(file.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shared Files</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your shared files and permissions
          </p>
        </div>
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Share2 className="h-4 w-4 mr-2" />
              Share New File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareForm.email}
                  onChange={(e) => setShareForm({ ...shareForm, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permission">Permission Level</Label>
                <Select value={shareForm.permission} onValueChange={(value) => setShareForm({ ...shareForm, permission: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="download">View & Download</SelectItem>
                    <SelectItem value="edit">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={shareForm.expiration}
                  onChange={(e) => setShareForm({ ...shareForm, expiration: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Input
                  id="message"
                  placeholder="Add a personal message"
                  value={shareForm.message}
                  onChange={(e) => setShareForm({ ...shareForm, message: e.target.value })}
                />
              </div>
              
              <Button onClick={handleShare} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                Share File
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Shares', value: totalShares, icon: Share2, color: 'text-blue-600' },
          { title: 'Total Views', value: totalViews, icon: Eye, color: 'text-green-600' },
          { title: 'Downloads', value: totalDownloads, icon: Download, color: 'text-purple-600' },
          { title: 'Expiring Soon', value: expiringFiles, icon: Calendar, color: 'text-orange-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Shared Files List */}
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardHeader>
          <CardTitle>Shared Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="email">Email Shares</TabsTrigger>
              <TabsTrigger value="link">Link Shares</TabsTrigger>
              <TabsTrigger value="expiring">Expiring</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {sharedFiles.map((file, index) => {
                const Icon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                      <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold truncate">{file.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={getPermissionColor(file.permissions)}>
                            {file.permissions}
                          </Badge>
                          {file.shareType === 'link' ? (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
                              <Link className="h-3 w-3 mr-1" />
                              Link
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{file.size}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{file.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{file.downloads}</span>
                          </div>
                          {file.expiresAt && (
                            <>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Expires {new Date(file.expiresAt).toLocaleDateString()}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {file.shareType === 'link' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyShareLink(file.id)}
                              className="h-8 px-2"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {file.sharedWith.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Shared with:</span>
                          <div className="flex items-center space-x-2">
                            {file.sharedWith.slice(0, 3).map((email, i) => (
                              <div key={i} className="flex items-center space-x-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {email.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {email.split('@')[0]}
                                </span>
                              </div>
                            ))}
                            {file.sharedWith.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{file.sharedWith.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="email">
              <div className="space-y-4">
                {sharedFiles.filter(file => file.shareType === 'email').map((file, index) => (
                  <div key={file.id} className="p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{file.name}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        <Mail className="h-3 w-3 mr-1" />
                        Email Share
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="link">
              <div className="space-y-4">
                {sharedFiles.filter(file => file.shareType === 'link').map((file, index) => (
                  <div key={file.id} className="p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{file.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
                          <Link className="h-3 w-3 mr-1" />
                          Link Share
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyShareLink(file.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="expiring">
              <div className="space-y-4">
                {sharedFiles.filter(file => file.expiresAt).map((file, index) => (
                  <div key={file.id} className="p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{file.name}</h3>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expires {new Date(file.expiresAt!).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
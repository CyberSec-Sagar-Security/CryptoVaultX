/**
 * SharedFiles Page - CryptoVaultX Shared Files Management
 * Path: src/pages/sharedFiles/SharedFiles.tsx
 * View and manage files shared with you and by you
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Share2, 
  Shield, 
  Users, 
  Clock, 
  Eye, 
  Download, 
  Link,
  X,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Calendar,
  Lock,
  Mail
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';

interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  sharedBy: {
    name: string;
    email: string;
    avatar?: string;
  };
  sharedWith: {
    name: string;
    email: string;
    avatar?: string;
  }[];
  shareDate: string;
  expiryDate?: string;
  accessLevel: 'view' | 'download' | 'edit';
  isEncrypted: boolean;
  lastAccessed?: string;
  accessCount: number;
  isOwner: boolean;
}

const SharedFiles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Mock data - replace with actual API calls
  const receivedFiles: SharedFile[] = [
    {
      id: '1',
      name: 'Q4_Financial_Report.pdf',
      type: 'pdf',
      size: '3.2 MB',
      sharedBy: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        avatar: undefined
      },
      sharedWith: [],
      shareDate: '2024-01-15',
      expiryDate: '2024-02-15',
      accessLevel: 'view',
      isEncrypted: true,
      lastAccessed: '2 hours ago',
      accessCount: 3,
      isOwner: false
    },
    {
      id: '2',
      name: 'Product_Roadmap_2024.figma',
      type: 'design',
      size: '12.1 MB',
      sharedBy: {
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        avatar: undefined
      },
      sharedWith: [],
      shareDate: '2024-01-12',
      accessLevel: 'download',
      isEncrypted: true,
      lastAccessed: '1 day ago',
      accessCount: 7,
      isOwner: false
    }
  ];

  const sentFiles: SharedFile[] = [
    {
      id: '3',
      name: 'Contract_Template_v2.docx',
      type: 'document',
      size: '1.8 MB',
      sharedBy: {
        name: 'You',
        email: 'you@company.com',
        avatar: undefined
      },
      sharedWith: [
        { name: 'Alice Cooper', email: 'alice@company.com', avatar: undefined },
        { name: 'Bob Wilson', email: 'bob@company.com', avatar: undefined },
        { name: 'Charlie Davis', email: 'charlie@company.com', avatar: undefined }
      ],
      shareDate: '2024-01-10',
      expiryDate: '2024-02-10',
      accessLevel: 'edit',
      isEncrypted: true,
      lastAccessed: '5 hours ago',
      accessCount: 12,
      isOwner: true
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
      default: '📁'
    };
    return iconMap[type] || iconMap.default;
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'view': return 'bg-blue-500/20 text-blue-400';
      case 'download': return 'bg-green-500/20 text-green-400';
      case 'edit': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredReceivedFiles = receivedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.sharedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSentFiles = sentFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="text-xl font-bold text-white">Shared Files</h1>
                <p className="text-xs text-gray-400">Collaborate securely</p>
              </div>
            </div>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400">
                  <Share2 size={16} className="mr-2" />
                  Share File
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-white/10 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Share File Securely</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Share encrypted files with team members
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Recipients</Label>
                    <Input
                      placeholder="Enter email addresses..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Access Level</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['view', 'download', 'edit'].map(level => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10 capitalize"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Message (Optional)</Label>
                    <Textarea
                      placeholder="Add a message..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Set expiry date</Label>
                    <Switch />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsShareDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500">
                    Share
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search shared files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="received" className="data-[state=active]:bg-white/10 text-white">
                Received ({receivedFiles.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:bg-white/10 text-white">
                Sent ({sentFiles.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Files Shared With You</CardTitle>
                  <CardDescription className="text-gray-400">
                    Files that others have shared with you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReceivedFiles.map((file, index) => (
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
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white">{file.name}</h4>
                              {file.isEncrypted && <Lock className="w-4 h-4 text-green-400" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{file.size}</span>
                              <div className="flex items-center gap-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarFallback className="text-xs bg-indigo-600">
                                    {file.sharedBy.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{file.sharedBy.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{file.shareDate}</span>
                              </div>
                              {file.lastAccessed && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Accessed {file.lastAccessed}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={getAccessLevelColor(file.accessLevel)}>
                            {file.accessLevel}
                          </Badge>
                          
                          {file.expiryDate && (
                            <Badge className="bg-yellow-500/20 text-yellow-400">
                              Expires {file.expiryDate}
                            </Badge>
                          )}
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                              <Download size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                              <MoreHorizontal size={14} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {filteredReceivedFiles.length === 0 && (
                      <div className="text-center py-12">
                        <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No shared files</h3>
                        <p className="text-gray-400">Files shared with you will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Files You've Shared</CardTitle>
                  <CardDescription className="text-gray-400">
                    Files you've shared with others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSentFiles.map((file, index) => (
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
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white">{file.name}</h4>
                              {file.isEncrypted && <Lock className="w-4 h-4 text-green-400" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{file.size}</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{file.sharedWith.length} recipients</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{file.accessCount} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Shared {file.shareDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {file.sharedWith.slice(0, 3).map((user, userIndex) => (
                              <Avatar key={userIndex} className="w-6 h-6 border-2 border-slate-800">
                                <AvatarFallback className="text-xs bg-indigo-600">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {file.sharedWith.length > 3 && (
                              <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-slate-800 flex items-center justify-center">
                                <span className="text-xs text-white">+{file.sharedWith.length - 3}</span>
                              </div>
                            )}
                          </div>
                          
                          <Badge className={getAccessLevelColor(file.accessLevel)}>
                            {file.accessLevel}
                          </Badge>
                          
                          {file.expiryDate && (
                            <Badge className="bg-yellow-500/20 text-yellow-400">
                              Expires {file.expiryDate}
                            </Badge>
                          )}
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                              <Link size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                              <UserCheck size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                              <MoreHorizontal size={14} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {filteredSentFiles.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No shared files</h3>
                        <p className="text-gray-400">Files you share will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default SharedFiles;
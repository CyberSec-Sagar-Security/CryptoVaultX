/**
 * Share Card Component
 * Display card for shared file items
 */

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { 
  Download, 
  Eye, 
  Edit3, 
  Clock, 
  Shield, 
  Users,
  MoreHorizontal,
  Calendar
} from 'lucide-react';

interface ShareCardProps {
  file: {
    id: string;
    name: string;
    size: string;
    mimeType: string;
    sharedBy?: {
      name: string;
      email: string;
      avatar?: string;
    };
    sharedWith?: Array<{
      name: string;
      email: string;
      avatar?: string;
    }>;
    accessLevel: 'view' | 'download' | 'edit';
    sharedAt: string;
    expiryDate?: string;
    isEncrypted: boolean;
    lastAccessed?: string;
    accessCount?: number;
    isOwner?: boolean;
  };
  onDownload?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onManage?: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  file,
  onDownload,
  onView,
  onEdit,
  onManage,
}) => {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈';
    return '📁';
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view': return <Eye size={14} />;
      case 'download': return <Download size={14} />;
      case 'edit': return <Edit3 size={14} />;
      default: return <Eye size={14} />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'view': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'download': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'edit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isExpiringSoon = () => {
    if (!file.expiryDate) return false;
    const expiryDate = new Date(file.expiryDate);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = () => {
    if (!file.expiryDate) return false;
    return new Date(file.expiryDate) < new Date();
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm truncate">{file.name}</h3>
              <p className="text-gray-400 text-xs">{file.size}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {file.isEncrypted && (
              <div title="End-to-end encrypted">
                <Shield size={14} className="text-green-400" />
              </div>
            )}
            <Badge className={`text-xs ${getAccessLevelColor(file.accessLevel)}`}>
              <span className="flex items-center gap-1">
                {getAccessLevelIcon(file.accessLevel)}
                {file.accessLevel}
              </span>
            </Badge>
            {onManage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onManage}
                className="w-6 h-6 p-0 text-gray-400 hover:text-white"
              >
                <MoreHorizontal size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Sharing Info */}
        <div className="space-y-2 mb-3">
          {file.sharedBy && !file.isOwner && (
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={file.sharedBy.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-xs">
                  {file.sharedBy.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-400 text-xs">
                Shared by {file.sharedBy.name}
              </span>
            </div>
          )}

          {file.sharedWith && file.isOwner && (
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-400" />
              <span className="text-gray-400 text-xs">
                Shared with {file.sharedWith.length} user{file.sharedWith.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Timing Info */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-gray-400" />
            <span className="text-gray-400 text-xs">
              Shared {formatDate(file.sharedAt)}
            </span>
          </div>

          {file.expiryDate && (
            <div className="flex items-center gap-2">
              <Calendar size={12} className={isExpired() ? 'text-red-400' : isExpiringSoon() ? 'text-yellow-400' : 'text-gray-400'} />
              <span className={`text-xs ${isExpired() ? 'text-red-400' : isExpiringSoon() ? 'text-yellow-400' : 'text-gray-400'}`}>
                {isExpired() ? 'Expired' : `Expires ${formatDate(file.expiryDate)}`}
              </span>
            </div>
          )}

          {file.lastAccessed && (
            <div className="flex items-center gap-2">
              <Eye size={12} className="text-gray-400" />
              <span className="text-gray-400 text-xs">
                Last accessed {formatDate(file.lastAccessed)}
                {file.accessCount && ` • ${file.accessCount} views`}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {file.accessLevel === 'view' && onView && (
            <Button
              onClick={onView}
              size="sm"
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={isExpired()}
            >
              <Eye size={14} className="mr-1" />
              View
            </Button>
          )}

          {(file.accessLevel === 'download' || file.accessLevel === 'edit') && onDownload && (
            <Button
              onClick={onDownload}
              size="sm"
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={isExpired()}
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
          )}

          {file.accessLevel === 'edit' && onEdit && (
            <Button
              onClick={onEdit}
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-500"
              disabled={isExpired()}
            >
              <Edit3 size={14} className="mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Warning for expired files */}
        {isExpired() && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-center">
            <span className="text-red-400 text-xs">This share has expired</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

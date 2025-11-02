/**
 * BulkShareModal - Share multiple files with multiple users
 * Path: src/components/sharing/BulkShareModal.tsx
 */

import React, { useState } from 'react';
import { X, Share2, UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { apiRequest } from '../../services/api';

interface BulkShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileIds: string[];
  fileNames: string[];
  onShareComplete?: () => void;
}

export const BulkShareModal: React.FC<BulkShareModalProps> = ({
  isOpen,
  onClose,
  fileIds,
  fileNames,
  onShareComplete
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);
  const [permission, setPermission] = useState<'read' | 'write' | 'full_access'>('read');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const addUsername = () => {
    const trimmedUsername = usernameInput.trim();
    if (trimmedUsername && !usernames.includes(trimmedUsername)) {
      setUsernames([...usernames, trimmedUsername]);
      setUsernameInput('');
      setError(null);
    }
  };

  const removeUsername = (username: string) => {
    setUsernames(usernames.filter(u => u !== username));
  };

  const handleShare = async () => {
    if (usernames.length === 0) {
      setError('Please add at least one username');
      return;
    }

    if (fileIds.length === 0) {
      setError('No files selected');
      return;
    }

    setIsSharing(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Sharing files:', {
        fileIds,
        usernames,
        permission
      });

      const response = await apiRequest('/files/bulk-share', {
        method: 'POST',
        body: JSON.stringify({
          file_ids: fileIds,
          usernames,
          permission
        })
      });

      if (response.success) {
        setSuccess(`Successfully shared ${fileIds.length} file(s) with ${usernames.length} user(s)`);
        setTimeout(() => {
          onShareComplete?.();
          onClose();
          // Reset form
          setUsernames([]);
          setUsernameInput('');
          setPermission('read');
          setSuccess(null);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to share files');
      }
    } catch (err) {
      console.error('❌ Bulk share error:', err);
      setError(err instanceof Error ? err.message : 'Failed to share files');
    } finally {
      setIsSharing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUsername();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-indigo-400" />
                  Share Multiple Files
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Share {fileIds.length} file(s) with other users
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Selected Files Display */}
              <div>
                <Label className="text-white mb-2">Selected Files</Label>
                <div className="max-h-32 overflow-y-auto bg-white/5 rounded-lg p-3 space-y-1">
                  {fileNames.map((filename, index) => (
                    <div key={index} className="text-sm text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {filename}
                    </div>
                  ))}
                </div>
              </div>

              {/* Username Input */}
              <div>
                <Label className="text-white mb-2">Share with Users</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                  <Button
                    onClick={addUsername}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Press Enter or click Add to add a username
                </p>
              </div>

              {/* Added Usernames */}
              {usernames.length > 0 && (
                <div>
                  <Label className="text-white mb-2">Users ({usernames.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {usernames.map((username) => (
                      <Badge
                        key={username}
                        className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 pl-3 pr-2 py-1"
                      >
                        {username}
                        <button
                          onClick={() => removeUsername(username)}
                          className="ml-2 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Permission Level */}
              <div>
                <Label className="text-white mb-2">Permission Level</Label>
                <Select value={permission} onValueChange={(value: any) => setPermission(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="read" className="text-white hover:bg-white/10">
                      Read Only - Can view and download
                    </SelectItem>
                    <SelectItem value="write" className="text-white hover:bg-white/10">
                      Write - Can view, download, and modify
                    </SelectItem>
                    <SelectItem value="full_access" className="text-white hover:bg-white/10">
                      Full Access - Can view, download, modify, and delete
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSharing}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={isSharing || usernames.length === 0}
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Files
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

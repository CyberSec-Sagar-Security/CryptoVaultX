/**
 * ShareFileModal Component
 * Modal for sharing files with other registered users
 * Supports multi-file and multi-user selection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Users, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { searchUsers, shareFiles, UserSearchResult, ShareResult } from '../../services/shareApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileIds: string[];  // Support multiple files
  fileNames: string[];  // Display names for selected files
  onShareComplete?: () => void;
}

export const ShareFileModal: React.FC<ShareFileModalProps> = ({
  isOpen,
  onClose,
  fileIds,
  fileNames,
  onShareComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [permission, setPermission] = useState<'full_access' | 'view' | 'download'>('full_access');
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [shareResults, setShareResults] = useState<ShareResult[]>([]);

  // Debounced user search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery, 10);
        setSearchResults(results);
      } catch (error) {
        console.error('User search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddUser = (user: UserSearchResult) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      setShareStatus('error');
      setStatusMessage('Please select at least one user to share with');
      return;
    }

    if (fileIds.length === 0) {
      setShareStatus('error');
      setStatusMessage('No files selected');
      return;
    }

    setIsSharing(true);
    setShareStatus('idle');
    setStatusMessage('');

    try {
      const response = await shareFiles({
        fileIds,
        usernames: selectedUsers.map(u => u.username),
        permission,
      });

      // Check results
      const { summary } = response;
      if (summary) {
        const totalSuccess = summary.created + summary.updated;
        const totalFailed = summary.failed;

        if (totalSuccess > 0 && totalFailed === 0) {
          setShareStatus('success');
          setStatusMessage(response.message || `Successfully shared with ${totalSuccess} user(s)`);
          
          // Dispatch event to notify dashboard
          window.dispatchEvent(new CustomEvent('fileShared', { 
            detail: { fileIds, userCount: totalSuccess }
          }));
          console.log('📡 File shared event dispatched');
          
          // Call onShareComplete callback
          setTimeout(() => {
            if (onShareComplete) onShareComplete();
            handleClose();
          }, 2000);
        } else if (totalSuccess > 0 && totalFailed > 0) {
          setShareStatus('success');
          setStatusMessage(response.message || `Partially successful: ${totalSuccess} shared, ${totalFailed} failed`);
          setShareResults(response.results?.failed || []);
          
          // Dispatch event even for partial success
          window.dispatchEvent(new CustomEvent('fileShared', { 
            detail: { fileIds, userCount: totalSuccess }
          }));
          console.log('📡 File shared event dispatched (partial)');
        } else {
          setShareStatus('error');
          setStatusMessage('All sharing operations failed');
          setShareResults(response.results?.failed || []);
        }
      } else {
        setShareStatus('success');
        setStatusMessage('Files shared successfully');
        setTimeout(() => {
          if (onShareComplete) onShareComplete();
          handleClose();
        }, 2000);
      }
    } catch (error: any) {
      setShareStatus('error');
      setStatusMessage(error.message || 'Failed to share files');
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setPermission('full_access');
    setShareStatus('idle');
    setStatusMessage('');
    setShareResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-blue-500/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
           style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-blue-500/30"
             style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Share Files</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSharing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selected Files */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              Selected Files ({fileIds.length})
            </label>
            <div className="bg-slate-800 rounded-lg p-4 max-h-32 overflow-y-auto border border-blue-500/20"
                 style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
              {fileNames.map((name, idx) => (
                <div key={idx} className="text-sm text-gray-400 py-1">
                  • {name}
                </div>
              ))}
            </div>
          </div>

          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              <Search className="inline w-4 h-4 mr-2" />
              Search Users by Username
            </label>
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type username to search..."
                className="w-full bg-slate-800 border-blue-500/30 text-white placeholder:text-gray-400"
                style={{ backgroundColor: 'rgb(30, 41, 59)', borderWidth: '1px' }}
                disabled={isSharing}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-slate-800 border-2 border-blue-500/30 rounded-lg max-h-48 overflow-y-auto"
                   style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddUser(user)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-500/20 transition-colors border-b border-blue-500/20 last:border-b-0"
                    disabled={selectedUsers.some(u => u.id === user.id)}
                  >
                    <div className="font-medium text-white">@{user.username}</div>
                    <div className="text-sm text-gray-400">{user.name}</div>
                    {selectedUsers.some(u => u.id === user.id) && (
                      <Badge className="mt-1 bg-blue-500/20 text-blue-400">Already selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Selected Users ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 flex items-center gap-2"
                  >
                    <span>@{user.username}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="hover:text-white transition-colors"
                      disabled={isSharing}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Permission Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Access Permission
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as any)}
              className="w-full bg-slate-800 border border-blue-500/30 text-white rounded-lg px-4 py-2"
              style={{ backgroundColor: 'rgb(30, 41, 59)', borderWidth: '1px' }}
              disabled={isSharing}
            >
              <option value="full_access">Full Access (View & Download)</option>
              <option value="view">View Only (No Download)</option>
              <option value="download">Download Only (No Preview)</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">
              • Full Access: User can view and download the file<br/>
              • View Only: User can view file in browser but cannot download<br/>
              • Download Only: User can download but cannot preview
            </p>
          </div>

          {/* Status Message */}
          {shareStatus !== 'idle' && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                shareStatus === 'success'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              {shareStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={shareStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {statusMessage}
                </p>
                {shareResults.length > 0 && (
                  <div className="mt-2 text-sm space-y-1">
                    {shareResults.map((result, idx) => (
                      <div key={idx} className="text-gray-400">
                        • {result.username}: {result.error || result.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-blue-500/30"
             style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isSharing}
            className="border-blue-500/50 hover:bg-blue-500/20 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || selectedUsers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            style={{ backgroundColor: 'rgb(37, 99, 235)' }}
          >
            {isSharing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              `Share with ${selectedUsers.length} user(s)`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareFileModal;

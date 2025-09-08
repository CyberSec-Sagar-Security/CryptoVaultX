/**
 * Share Modal Component
 * Modal for sharing files with other users
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, Plus, Mail, Shield, Calendar } from 'lucide-react';
import { shareFile, getUserPublicKey } from '../../services/shareApi';
import { wrapKey, importPublicKeyPem, getPrivateKeyFromSession, unwrapKey } from '../../services/crypto';
import { apiRequest } from '../../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  onShareSuccess?: () => void;
}

interface Recipient {
  email: string;
  accessLevel: 'view' | 'download' | 'edit';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
  onShareSuccess,
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'download' | 'edit'>('view');
  const [message, setMessage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');

  const addRecipient = () => {
    if (!newRecipientEmail.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (recipients.some(r => r.email === newRecipientEmail)) {
      setError('This user is already in the recipient list');
      return;
    }

    setRecipients([...recipients, { email: newRecipientEmail, accessLevel }]);
    setNewRecipientEmail('');
    setError('');
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r.email !== email));
  };

  const updateRecipientAccess = (email: string, newAccessLevel: 'view' | 'download' | 'edit') => {
    setRecipients(recipients.map(r => 
      r.email === email ? { ...r, accessLevel: newAccessLevel } : r
    ));
  };

  const handleShare = async () => {
    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    setIsSharing(true);
    setError('');

    try {
      // Get the file's wrapped key for the current user
      const fileResponse = await apiRequest(`/files/${fileId}`);
      const userWrappedKey = fileResponse.wrappedKey;

      // Get user's private key from session
      const privateKey = await getPrivateKeyFromSession();
      if (!privateKey) {
        throw new Error('Private key not found. Please log in again.');
      }

      // Unwrap the file key
      const fileKey = await unwrapKey(userWrappedKey, privateKey);

      // Share with each recipient
      for (const recipient of recipients) {
        try {
          // Get recipient's public key
          const recipientPublicKeyPem = await getUserPublicKey(recipient.email);
          const recipientPublicKey = await importPublicKeyPem(recipientPublicKeyPem);

          // Wrap file key for recipient
          const wrappedKeyForRecipient = await wrapKey(fileKey, recipientPublicKey);

          // Share the file
          await shareFile({
            fileId,
            recipientEmail: recipient.email,
            wrappedKey: wrappedKeyForRecipient,
            accessLevel: recipient.accessLevel,
            expiryDate: expiryDate || undefined,
            message: message || undefined,
          });
        } catch (recipientError) {
          console.error(`Failed to share with ${recipient.email}:`, recipientError);
          throw new Error(`Failed to share with ${recipient.email}. They may not be registered.`);
        }
      }

      onShareSuccess?.();
      onClose();
      
      // Reset form
      setRecipients([]);
      setNewRecipientEmail('');
      setMessage('');
      setExpiryDate('');
      setAccessLevel('view');
      
    } catch (error) {
      console.error('Share failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to share file. Please try again.');
    } finally {
      setIsSharing(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={20} className="text-cyan-400" />
            Share File Securely
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share "{fileName}" with team members using end-to-end encryption
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Recipients */}
          <div className="space-y-2">
            <Label className="text-white">Recipients</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
              <Select value={accessLevel} onValueChange={(value: 'view' | 'download' | 'edit') => setAccessLevel(value)}>
                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={addRecipient}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-500"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">Added Recipients</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recipients.map((recipient) => (
                  <div key={recipient.email} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-white text-sm">{recipient.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={recipient.accessLevel}
                        onValueChange={(value: 'view' | 'download' | 'edit') => 
                          updateRecipientAccess(recipient.email, value)
                        }
                      >
                        <SelectTrigger className="w-20 h-6 text-xs bg-transparent border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10">
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="download">Download</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => removeRecipient(recipient.email)}
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Message */}
          <div>
            <Label className="text-white">Message (Optional)</Label>
            <Textarea
              placeholder="Add a message for recipients..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 resize-none"
              rows={3}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <Label className="text-white flex items-center gap-2">
              <Calendar size={16} />
              Expiry Date (Optional)
            </Label>
            <Input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSharing}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={isSharing || recipients.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-cyan-500"
          >
            {isSharing ? 'Sharing...' : `Share with ${recipients.length} user${recipients.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

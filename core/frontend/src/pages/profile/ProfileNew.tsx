/**
 * Profile Settings Page - Complete User Profile Management
 * Features: Photo upload, profile editing, password change, dark mode, account deletion
 * All with proper validation, toast notifications, and error handling
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Palette,
  Globe,
  ArrowLeft,
  Edit3,
  Save,
  Camera,
  Key,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Switch } from '../../components/ui/switch';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { ChangePasswordModal } from '../../components/modals/ChangePasswordModal';
import { validateUsername, validateEmail, validatePhone } from '../../utils/validation';
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  username,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === 'DELETE' || confirmText === username;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 border border-red-500/30 rounded-lg p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-red-500/20">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
            <p className="text-gray-400 mb-4">
              This action cannot be undone. This will permanently delete your account and all associated data including files and shares.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type <span className="font-bold text-red-400">DELETE</span> or your username{' '}
                <span className="font-bold text-red-400">{username}</span> to confirm:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Type DELETE or your username"
                disabled={isDeleting}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={!isConfirmed || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete My Account'
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme, actualTheme } = useTheme();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('token');

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Unknown',
    language: localStorage.getItem('language') || 'English',
    profilePhoto: user?.profile_photo || null,
  });

  const [originalProfileData, setOriginalProfileData] = useState(profileData);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    phone?: string;
  }>({});

  const userInitials = profileData.username ? profileData.username.slice(0, 2).toUpperCase() : 'U';

  // Load profile data from backend
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const userData = response.data.user;
        const newProfileData = {
          username: userData.username,
          email: userData.email,
          phone: userData.phone || '',
          profilePhoto: userData.profile_photo,
          language: userData.preferences?.language || 'English',
          joinDate: new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        setProfileData(newProfileData);
        setOriginalProfileData(newProfileData);

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setFieldErrors({});

    try {
      // Client-side validation
      const usernameValidation = validateUsername(profileData.username);
      const emailValidation = validateEmail(profileData.email);
      const phoneValidation = validatePhone(profileData.phone);

      const errors: typeof fieldErrors = {};
      if (!usernameValidation.valid) errors.username = usernameValidation.error;
      if (!emailValidation.valid) errors.email = emailValidation.error;
      if (!phoneValidation.valid) errors.phone = phoneValidation.error;

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast.error('Please fix validation errors');
        setLoading(false);
        return;
      }

      // Update profile information
      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        {
          username: profileData.username,
          email: profileData.email,
          phone: profileData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update localStorage
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setOriginalProfileData(profileData);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);

      // Handle conflict errors (409)
      if (error.response?.status === 409) {
        const message = error.response?.data?.message || '';
        if (message.toLowerCase().includes('username')) {
          setFieldErrors({ username: 'Username already taken' });
        } else if (message.toLowerCase().includes('email')) {
          setFieldErrors({ email: 'Email already registered' });
        } else if (message.toLowerCase().includes('phone')) {
          setFieldErrors({ phone: 'Phone number already in use' });
        } else {
          toast.error(message || 'Value already in use');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG, JPG, JPEG, GIF, or WEBP images.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload photo
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(`${API_URL}/api/users/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setProfileData((prev) => ({ ...prev, profilePhoto: response.data.photo_url }));

        // Update user data in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.profile_photo = response.data.photo_url;
        localStorage.setItem('user', JSON.stringify(currentUser));

        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent('profilePhotoUpdated', {
            detail: { photoUrl: response.data.photo_url },
          })
        );

        toast.success('Profile photo updated successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
      setPreviewPhoto(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDarkModeToggle = async (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme as any);

    // Update on backend
    try {
      await axios.put(
        `${API_URL}/api/users/preferences`,
        { darkMode: checked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(`${checked ? 'Dark' : 'Light'} mode enabled`);
    } catch (error) {
      console.error('Error updating dark mode preference:', error);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setProfileData((prev) => ({ ...prev, language }));
    localStorage.setItem('language', language);

    // Update on backend
    try {
      await axios.put(
        `${API_URL}/api/users/preferences`,
        { language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(`Language changed to ${language}`);
    } catch (error) {
      console.error('Error updating language preference:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const response = await axios.delete(`${API_URL}/api/users/account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Clear all data
        localStorage.clear();

        toast.success('Your account has been deleted successfully.');

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

  const getProfilePhotoUrl = () => {
    if (previewPhoto) return previewPhoto;
    if (profileData.profilePhoto) {
      return `${API_URL}${profileData.profilePhoto}?t=${Date.now()}`;
    }
    return null;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData(originalProfileData);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-white">Profile Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="relative">
                  <Avatar className="w-24 h-24 cursor-pointer" onClick={handlePhotoClick}>
                    {getProfilePhotoUrl() ? (
                      <AvatarImage src={getProfilePhotoUrl()!} alt={profileData.username} />
                    ) : (
                      <AvatarFallback className="bg-indigo-600 text-white text-2xl">{userInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <Button
                    size="sm"
                    onClick={handlePhotoClick}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-1 truncate">{profileData.username}</h2>
                  <p className="text-gray-400 mb-2 truncate">{profileData.email}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active Account</Badge>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        disabled={loading}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <Input
                    value={profileData.username}
                    onChange={(e) => {
                      setProfileData({ ...profileData, username: e.target.value });
                      setFieldErrors({ ...fieldErrors, username: undefined });
                    }}
                    disabled={!isEditing}
                    className={`bg-white/10 border-white/20 text-white disabled:opacity-60 ${
                      fieldErrors.username ? 'border-red-500/50' : ''
                    }`}
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.username}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      setFieldErrors({ ...fieldErrors, email: undefined });
                    }}
                    disabled={!isEditing}
                    className={`bg-white/10 border-white/20 text-white disabled:opacity-60 ${
                      fieldErrors.email ? 'border-red-500/50' : ''
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => {
                      setProfileData({ ...profileData, phone: e.target.value });
                      setFieldErrors({ ...fieldErrors, phone: undefined });
                    }}
                    disabled={!isEditing}
                    placeholder="Enter phone number (optional)"
                    className={`bg-white/10 border-white/20 text-white disabled:opacity-60 ${
                      fieldErrors.phone ? 'border-red-500/50' : ''
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {profileData.joinDate}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm">
                    Keep your account secure by using a strong password and changing it regularly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Dark Mode</p>
                      <p className="text-gray-400 text-sm">Use dark theme</p>
                    </div>
                    <Switch checked={actualTheme === 'dark'} onCheckedChange={handleDarkModeToggle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={profileData.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                    >
                      <option value="English" className="bg-slate-800">
                        English
                      </option>
                      <option value="Spanish" className="bg-slate-800">
                        Español
                      </option>
                      <option value="French" className="bg-slate-800">
                        Français
                      </option>
                      <option value="German" className="bg-slate-800">
                        Deutsch
                      </option>
                      <option value="Hindi" className="bg-slate-800">
                        हिन्दी
                      </option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="bg-red-500/10 border-red-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-300/70">
                These actions cannot be undone. Please be careful.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-white font-medium mb-1">Delete Account</h3>
                  <p className="text-gray-400 text-sm">
                    Permanently delete your account and all associated data including files and shares.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          toast.success('Password changed successfully!');
        }}
      />

      {/* Delete Account Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        username={profileData.username}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={deletingAccount}
      />
    </div>
  );
};

export default Profile;

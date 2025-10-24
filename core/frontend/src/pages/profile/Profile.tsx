/**
 * Profile Page - User Profile Management
 * Path: src/pages/profile/Profile.tsx
 * User account settings, personal information, and preferences
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Bell, 
  Palette, 
  Globe,
  ArrowLeft,
  Edit3,
  Save,
  Camera,
  Key,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Switch } from '../../components/ui/switch';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'JD';

  const [profileData, setProfileData] = useState({
    username: user?.username || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 2024',
    twoFactorEnabled: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    language: 'English'
  });

  const handleSave = () => {
    // Here you would normally save to API
    setIsEditing(false);
    // Update localStorage user data
    const updatedUser = { ...user, username: profileData.username, email: profileData.email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Header Card */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-indigo-600 text-white text-2xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{profileData.username}</h2>
                  <p className="text-gray-400 mb-2">{profileData.email}</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active Account
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)} 
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
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
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white"
                  />
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
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={profileData.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, twoFactorEnabled: checked})
                    }
                  />
                </div>
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => navigate('/change-password')}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Account Data
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={profileData.emailNotifications}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, emailNotifications: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Browser notifications</p>
                  </div>
                  <Switch
                    checked={profileData.pushNotifications}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, pushNotifications: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-gray-400 text-sm">Use dark theme</p>
                  </div>
                  <Switch
                    checked={profileData.darkMode}
                    onCheckedChange={(checked) => 
                      setProfileData({...profileData, darkMode: checked})
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select 
                    value={profileData.language}
                    onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="English" className="bg-slate-800">English</option>
                    <option value="Spanish" className="bg-slate-800">Español</option>
                    <option value="French" className="bg-slate-800">Français</option>
                    <option value="German" className="bg-slate-800">Deutsch</option>
                  </select>
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
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;

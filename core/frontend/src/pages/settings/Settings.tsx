/**
 * Settings Page - Application Settings and Configuration
 * Path: src/pages/settings/Settings.tsx
 * System preferences, security settings, and app configuration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Globe, 
  Palette, 
  Database,
  ArrowLeft,
  Monitor,
  Smartphone,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  Wifi,
  Lock,
  Key,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    // Security Settings
    autoLockTimeout: '15', // minutes
    requireBiometric: true,
    encryptionLevel: 'AES-256',
    
    // Storage Settings
    autoBackup: true,
    cloudSync: false,
    compressionEnabled: true,
    maxFileSize: '100', // MB
    
    // Notification Settings
    desktopNotifications: true,
    soundEnabled: false,
    emailAlerts: true,
    
    // Performance Settings
    hardwareAcceleration: true,
    preloadFiles: false,
    cacheSize: '500', // MB
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      // Reset to default settings
      setSettings({
        autoLockTimeout: '15',
        requireBiometric: true,
        encryptionLevel: 'AES-256',
        autoBackup: true,
        cloudSync: false,
        compressionEnabled: true,
        maxFileSize: '100',
        desktopNotifications: true,
        soundEnabled: false,
        emailAlerts: true,
        hardwareAcceleration: true,
        preloadFiles: false,
        cacheSize: '500'
      });
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cryptovault-settings.json';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Settings Actions */}
          <div className="flex gap-4 mb-8">
            <Button 
              onClick={handleExportSettings}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <Button 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
            <Button 
              onClick={handleResetSettings}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Security Settings */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage encryption and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-lock Timeout (minutes)
                  </label>
                  <select 
                    value={settings.autoLockTimeout}
                    onChange={(e) => updateSetting('autoLockTimeout', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="5" className="bg-slate-800">5 minutes</option>
                    <option value="15" className="bg-slate-800">15 minutes</option>
                    <option value="30" className="bg-slate-800">30 minutes</option>
                    <option value="60" className="bg-slate-800">1 hour</option>
                    <option value="0" className="bg-slate-800">Never</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Require Biometric Authentication</p>
                    <p className="text-gray-400 text-sm">Use fingerprint or face recognition</p>
                  </div>
                  <Switch
                    checked={settings.requireBiometric}
                    onCheckedChange={(checked) => updateSetting('requireBiometric', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Encryption Level
                  </label>
                  <select 
                    value={settings.encryptionLevel}
                    onChange={(e) => updateSetting('encryptionLevel', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="AES-128" className="bg-slate-800">AES-128</option>
                    <option value="AES-256" className="bg-slate-800">AES-256</option>
                    <option value="ChaCha20" className="bg-slate-800">ChaCha20</option>
                  </select>
                </div>

                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => navigate('/security-audit')}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Run Security Audit
                </Button>
              </CardContent>
            </Card>

            {/* Storage Settings */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Storage Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure backup and storage options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Auto Backup</p>
                    <p className="text-gray-400 text-sm">Automatically backup files</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Cloud Sync</p>
                    <p className="text-gray-400 text-sm">Sync with cloud storage</p>
                  </div>
                  <Switch
                    checked={settings.cloudSync}
                    onCheckedChange={(checked) => updateSetting('cloudSync', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">File Compression</p>
                    <p className="text-gray-400 text-sm">Compress files to save space</p>
                  </div>
                  <Switch
                    checked={settings.compressionEnabled}
                    onCheckedChange={(checked) => updateSetting('compressionEnabled', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max File Size (MB)
                  </label>
                  <select 
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting('maxFileSize', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="50" className="bg-slate-800">50 MB</option>
                    <option value="100" className="bg-slate-800">100 MB</option>
                    <option value="500" className="bg-slate-800">500 MB</option>
                    <option value="1000" className="bg-slate-800">1 GB</option>
                    <option value="0" className="bg-slate-800">No Limit</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Desktop Notifications</p>
                    <p className="text-gray-400 text-sm">Show system notifications</p>
                  </div>
                  <Switch
                    checked={settings.desktopNotifications}
                    onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Sound Notifications</p>
                    <p className="text-gray-400 text-sm">Play sounds for alerts</p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Alerts</p>
                    <p className="text-gray-400 text-sm">Receive important alerts via email</p>
                  </div>
                  <Switch
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) => updateSetting('emailAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Settings */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Performance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Optimize app performance and speed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Hardware Acceleration</p>
                    <p className="text-gray-400 text-sm">Use GPU for faster processing</p>
                  </div>
                  <Switch
                    checked={settings.hardwareAcceleration}
                    onCheckedChange={(checked) => updateSetting('hardwareAcceleration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Preload Files</p>
                    <p className="text-gray-400 text-sm">Cache files for faster access</p>
                  </div>
                  <Switch
                    checked={settings.preloadFiles}
                    onCheckedChange={(checked) => updateSetting('preloadFiles', checked)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cache Size (MB)
                  </label>
                  <select 
                    value={settings.cacheSize}
                    onChange={(e) => updateSetting('cacheSize', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="100" className="bg-slate-800">100 MB</option>
                    <option value="250" className="bg-slate-800">250 MB</option>
                    <option value="500" className="bg-slate-800">500 MB</option>
                    <option value="1000" className="bg-slate-800">1 GB</option>
                  </select>
                </div>

                <Button 
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* System Information */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">App Version</p>
                  <p className="text-white font-semibold">v2.1.0</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Storage Used</p>
                  <p className="text-white font-semibold">2.3 GB</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Cache Size</p>
                  <p className="text-white font-semibold">156 MB</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Files Encrypted</p>
                  <p className="text-white font-semibold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;

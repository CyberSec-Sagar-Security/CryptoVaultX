import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, User, Shield, Sliders, HardDrive, Save, Eye, EyeOff } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    notifications: true,
    autoDeleteSharedFiles: false,
    defaultShareExpiration: '7',
    twoFactorAuth: false
  });
  const navigate = useNavigate();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setSettings({
      ...settings,
      [e.target.name]: value
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement profile update API call
      console.log('Updating profile:', profile);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement settings update API call
      console.log('Updating settings:', settings);
    } catch (error) {
      console.error('Settings update error:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Sliders },
    { id: 'storage', name: 'Storage', icon: HardDrive }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="h-7 w-7 text-purple-300" />
                  Settings
                </h1>
                <p className="text-purple-200 text-sm mt-1">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <div className="glass-card p-4 border border-purple-400/30">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white border-purple-300/50'
                          : 'text-purple-200 hover:text-white hover:bg-white/10 border-transparent'
                      } group rounded-lg px-4 py-3 flex items-center text-sm font-medium w-full text-left transition-all duration-200 border`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9">
            {activeTab === 'profile' && (
              <div className="glass-card p-6 border border-purple-400/30">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-300" />
                    Profile
                  </h3>
                  <p className="mt-2 text-purple-200">
                    Update your personal information and account details.
                  </p>
                </div>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-purple-200 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={profile.username}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 glass-card border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:border-purple-300 focus:ring-0 transition-colors"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 glass-card border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:border-purple-300 focus:ring-0 transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="glass-button text-white font-medium px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-card p-6 border border-purple-400/30">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-300" />
                    Security
                  </h3>
                  <p className="mt-2 text-purple-200">
                    Manage your password and security settings.
                  </p>
                </div>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          placeholder="Current Password"
                          value={profile.currentPassword}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 pr-12 glass-card border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:border-purple-300 focus:ring-0 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="New Password"
                        value={profile.newPassword}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 glass-card border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:border-purple-300 focus:ring-0 transition-colors"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={profile.confirmPassword}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 glass-card border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:border-purple-300 focus:ring-0 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="glass-card p-4 border border-purple-400/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                        <p className="text-purple-200 text-sm">Add an extra layer of security to your account.</p>
                      </div>
                      <button
                        type="button"
                        className={`${
                          settings.twoFactorAuth ? 'bg-purple-500' : 'bg-white/20'
                        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200`}
                        onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                      >
                        <span
                          className={`${
                            settings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="glass-button text-white font-medium px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30 flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Update Security Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="glass-card p-6 border border-purple-400/30">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-purple-300" />
                    Preferences
                  </h3>
                  <p className="mt-2 text-purple-200">
                    Customize your CryptoVault experience.
                  </p>
                </div>
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-6">
                    <div className="glass-card p-4 border border-purple-400/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Email Notifications</h4>
                          <p className="text-purple-200 text-sm">Receive notifications about your files and shares.</p>
                        </div>
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={settings.notifications}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                        />
                      </div>
                    </div>

                    <div className="glass-card p-4 border border-purple-400/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Auto-delete Shared Files</h4>
                          <p className="text-purple-200 text-sm">Automatically delete files after sharing expires.</p>
                        </div>
                        <input
                          type="checkbox"
                          name="autoDeleteSharedFiles"
                          checked={settings.autoDeleteSharedFiles}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="defaultShareExpiration" className="block text-sm font-medium text-purple-200 mb-2">
                        Default Share Expiration
                      </label>
                      <select
                        name="defaultShareExpiration"
                        id="defaultShareExpiration"
                        value={settings.defaultShareExpiration}
                        onChange={handleSettingChange}
                        className="w-full px-4 py-3 glass-card border border-purple-400/30 rounded-lg text-white focus:border-purple-300 focus:ring-0 transition-colors"
                      >
                        <option value="1">1 day</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="glass-button text-white font-medium px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="glass-card p-6 border border-purple-400/30">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-purple-300" />
                    Storage
                  </h3>
                  <p className="mt-2 text-purple-200">
                    Manage your storage usage and cleanup options.
                  </p>
                </div>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Storage Usage</h4>
                    <div className="glass-card p-4 border border-purple-400/30 rounded-lg">
                      <div className="bg-white/10 rounded-full h-3 mb-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full"
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-200">0 MB used</span>
                        <span className="text-white font-medium">1 GB total</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Cleanup Options</h4>
                    <div className="space-y-3">
                      <button
                        type="button"
                        className="w-full glass-card p-4 border border-purple-400/30 rounded-lg hover:border-purple-300/50 text-left transition-all duration-200 hover:bg-white/5"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">Delete expired shares</p>
                            <p className="text-purple-200 text-sm">Remove files with expired sharing links</p>
                          </div>
                          <span className="text-purple-300">→</span>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        className="w-full glass-card p-4 border border-purple-400/30 rounded-lg hover:border-purple-300/50 text-left transition-all duration-200 hover:bg-white/5"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">Clear cache</p>
                            <p className="text-purple-200 text-sm">Remove temporary files and cache</p>
                          </div>
                          <span className="text-purple-300">→</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

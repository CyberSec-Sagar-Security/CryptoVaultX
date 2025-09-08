/**
 * CryptoVaultX - Encrypted File Storage & Sharing Platform
 * Main Application Component
 * 
 * Features:
 * - Secure authentication with password strength validation
 * - Client-side encryption before upload
 * - Encrypted file sharing with access controls
 * - Analytics dashboard with security metrics
 * - Responsive design with Apple-like UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Menu, X, Home, Upload as UploadIcon, Share2, BarChart3, Settings, HelpCircle, User } from 'lucide-react';

// Import pages
import Login from './src/pages/auth/Login';
import Register from './src/pages/auth/Register';
import Dashboard from './src/pages/dashboard/Dashboard';
import UploadPage from './src/pages/upload/Upload';
import SharedFiles from './src/pages/sharedFiles/SharedFiles';
import Analytics from './src/pages/analytics/Analytics';

// Import UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'upload' | 'shared' | 'analytics' | 'settings' | 'help';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload', icon: UploadIcon },
    { id: 'shared', label: 'Shared Files', icon: Share2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'login': return <Login />;
      case 'register': return <Register />;
      case 'dashboard': return <Dashboard />;
      case 'upload': return <UploadPage />;
      case 'shared': return <SharedFiles />;
      case 'analytics': return <Analytics />;
      case 'settings': return <SettingsPlaceholder />;
      case 'help': return <HelpPlaceholder />;
      default: return <LandingPage />;
    }
  };

  // Landing page component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.2
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CryptoVaultX</h1>
                <p className="text-xs text-gray-400">Secure • Encrypted • Private</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => setCurrentPage('analytics')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Security
              </button>
              <button 
                onClick={() => setCurrentPage('help')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Help
              </button>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentPage('login')}
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => setCurrentPage('register')}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-300"
                  onClick={() => {
                    setCurrentPage('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-300"
                  onClick={() => {
                    setCurrentPage('analytics');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Security
                </Button>
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-300"
                    onClick={() => {
                      setCurrentPage('login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                    onClick={() => {
                      setCurrentPage('register');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              🔒 Client-side Encryption • Zero-knowledge Architecture
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
              Your Files,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Truly Secure
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              CryptoVaultX provides military-grade encryption for your files. Upload, share, and collaborate 
              with complete privacy. Your data is encrypted on your device before it ever leaves.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-lg px-8 py-4"
                onClick={() => setCurrentPage('register')}
              >
                Start Encrypting Files
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-gray-300 hover:text-white text-lg px-8 py-4"
                onClick={() => setCurrentPage('dashboard')}
              >
                View Demo →
              </Button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => setCurrentPage('upload')}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UploadIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white mb-2">Secure Upload</CardTitle>
                <CardDescription className="text-gray-400">
                  Files are encrypted on your device using AES-256 before upload. We never see your data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => setCurrentPage('shared')}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white mb-2">Safe Sharing</CardTitle>
                <CardDescription className="text-gray-400">
                  Share encrypted files with granular permissions and expiry dates. Full audit trail included.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => setCurrentPage('analytics')}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white mb-2">Security Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor security posture with real-time threat detection and comprehensive analytics.
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );

  // Placeholder components for Settings and Help
  const SettingsPlaceholder = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-gray-400 mb-6">Configure your CryptoVaultX preferences</p>
        <Button onClick={() => setCurrentPage('dashboard')} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  const HelpPlaceholder = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2">Help & Support</h2>
        <p className="text-gray-400 mb-6">Get help with CryptoVaultX features and security</p>
        <Button onClick={() => setCurrentPage('dashboard')} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  // Render the current page
  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
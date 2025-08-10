import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Moon, Sun, Shield, Upload, Files, BarChart3, Settings, HelpCircle, Home } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Layout({ children, theme, toggleTheme }: LayoutProps) {
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Shared Files', path: '/shared', icon: Files },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CryptoVault
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                🔐 AES-256
              </Badge>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 dark:border-gray-800/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">CryptoVault</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enterprise-grade secure file sharing with end-to-end encryption.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/dashboard" className="hover:text-purple-600">Dashboard</Link></li>
                <li><Link to="/upload" className="hover:text-purple-600">Upload Files</Link></li>
                <li><Link to="/shared" className="hover:text-purple-600">Share Files</Link></li>
                <li><Link to="/analytics" className="hover:text-purple-600">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/help" className="hover:text-purple-600">Help Center</Link></li>
                <li><a href="#" className="hover:text-purple-600">Contact Support</a></li>
                <li><a href="#" className="hover:text-purple-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600">GitHub</a></li>
                <li><a href="#" className="hover:text-purple-600">Documentation</a></li>
                <li><a href="#" className="hover:text-purple-600">API Reference</a></li>
                <li><a href="#" className="hover:text-purple-600">Status Page</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 CryptoVault. All rights reserved. Built with enterprise-grade security.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
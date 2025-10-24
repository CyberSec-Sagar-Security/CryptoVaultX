/**
 * Sidebar Component
 * Navigation sidebar for the dashboard
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Files, 
  Share2, 
  BarChart3, 
  Settings, 
  User, 
  HelpCircle,
  Shield,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../services/auth';

interface SidebarProps {
  isCollapsed?: boolean;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: Files, label: 'Files', path: '/files' },
  { icon: Share2, label: 'Shared', path: '/shared' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

const secondaryItems: NavItem[] = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavButton: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={`w-full justify-start mb-1 ${
          isCollapsed ? 'px-2' : 'px-3'
        } ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
        onClick={() => navigate(item.path)}
      >
        <Icon size={20} className={isCollapsed ? '' : 'mr-3'} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Button>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">CryptoVault</h1>
              <p className="text-gray-400 text-xs">Secure Storage</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className={`w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
          onClick={handleLogout}
        >
          <LogOut size={20} className={isCollapsed ? '' : 'mr-3'} />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
};

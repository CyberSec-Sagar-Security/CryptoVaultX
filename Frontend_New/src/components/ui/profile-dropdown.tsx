/**
 * Profile Dropdown Component
 * Path: src/components/ui/profile-dropdown.tsx
 * Dropdown menu for user profile actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  Shield,
  Bell,
  Key
} from 'lucide-react';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';

interface ProfileDropdownProps {
  userInitials: string;
  username?: string;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  userInitials, 
  username,
  onLogout 
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      action: () => {
        navigate('/profile');
        setIsOpen(false);
      },
      description: 'Manage your account'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        navigate('/settings');
        setIsOpen(false);
      },
      description: 'App preferences'
    },
    {
      icon: Shield,
      label: 'Security',
      action: () => {
        navigate('/security');
        setIsOpen(false);
      },
      description: 'Security settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        navigate('/help');
        setIsOpen(false);
      },
      description: 'Get help and support'
    }
  ];

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      {/* Profile Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-white/10 transition-colors"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-indigo-600 text-white text-sm">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-slate-950 border-2 border-slate-600 rounded-lg shadow-2xl z-[9999] max-h-[80vh] overflow-y-auto"
              style={{ 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 1), 0 0 0 1px rgba(148, 163, 184, 0.5)',
                backgroundColor: 'rgb(2, 6, 23)'
              }}
            >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-600" style={{ backgroundColor: 'rgb(2, 6, 23)' }}>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-sm">
                    {username || 'User'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    CryptoVaultX User
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <item.icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium group-hover:text-white transition-colors">
                      {item.label}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="border-t border-slate-600 p-2" style={{ backgroundColor: 'rgb(2, 6, 23)' }}>
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-900 transition-colors group rounded-md"
              >
                <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">
                    Sign Out
                  </p>
                  <p className="text-red-400/70 text-xs">
                    Log out of your account
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;

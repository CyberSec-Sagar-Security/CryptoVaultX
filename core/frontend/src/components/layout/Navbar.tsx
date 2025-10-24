/**
 * Navbar Component
 * Top navigation bar for the dashboard
 */

import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useAuth } from '../../services/auth';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white"
        >
          <Menu size={20} />
        </Button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files..."
            className="pl-10 w-64 bg-white/5 border-white/10 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
          <Bell size={20} />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
            3
          </Badge>
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-sm">
            <p className="text-white font-medium">{user?.name || 'User'}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

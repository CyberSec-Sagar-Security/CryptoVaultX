/**
 * Navbar Component
 * Top navigation bar for the dashboard
 */

import React from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const handleToggle = () => {
    console.log('Toggle button clicked! Current collapsed state:', sidebarCollapsed);
    onToggleSidebar();
  };

  return (
    <header className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          <Menu size={24} />
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
        {/* Empty - User info removed */}
      </div>
    </header>
  );
};

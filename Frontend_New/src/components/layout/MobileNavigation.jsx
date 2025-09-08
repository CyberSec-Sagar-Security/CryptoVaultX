import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home,
  Upload as UploadIcon,
  BarChart3,
  Settings,
  HelpCircle,
  Share2,
  Shield,
  LogOut
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * MobileNavigation Component
 * Mobile-friendly navigation for the application
 */
const MobileNavigation = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define navigation items
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard' 
    },
    { 
      id: 'upload', 
      label: 'Upload', 
      icon: UploadIcon, 
      path: '/dashboard/files' 
    },
    { 
      id: 'shared', 
      label: 'Shared', 
      icon: Share2, 
      path: '/shared' 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: '/dashboard/analytics' 
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: Shield, 
      path: '/security' 
    },
    { 
      id: 'help', 
      label: 'Help', 
      icon: HelpCircle, 
      path: '/help/faq' 
    }
  ];

  // Toggle menu open/closed
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };
  
  // Check if the current path matches or starts with the given path
  const isActive = (path) => {
    return location.pathname === path || 
      (path !== '/dashboard' && location.pathname.startsWith(path));
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleMenu} 
        className="md:hidden p-2 text-white"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMenu}>
          {/* Mobile menu panel */}
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-gray-900 z-50 transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">CryptoVaultX</span>
              </div>
              <button 
                onClick={toggleMenu}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation items */}
            <nav className="py-4">
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive(item.path)
                          ? 'bg-indigo-600 bg-opacity-20 text-indigo-400 border-r-4 border-indigo-500'
                          : 'text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-white'
                      }`}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Logout button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-red-500 hover:bg-opacity-10 hover:text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

MobileNavigation.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default MobileNavigation;

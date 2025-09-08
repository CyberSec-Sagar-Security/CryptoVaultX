import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Upload as UploadIcon,
  Share2,
  BarChart3,
  Shield,
  HelpCircle,
  Settings,
  Menu,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import NavLinks from './NavLinks';

/**
 * DashboardNavigationIntegration Component
 * 
 * This component provides navigation functionality compatible with the existing dashboard layout.
 * It includes both the side navigation panel and a mobile drawer menu.
 */
const DashboardNavigationIntegration = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Base navigation items from the dashboard
  const baseNavItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      path: '/dashboard',
    },
    { 
      id: 'upload', 
      label: 'Upload', 
      icon: UploadIcon,
      path: '/dashboard/files',
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      path: '/dashboard/analytics',
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: Shield,
      path: '/security',
    },
  ];
  
  // Get additional navigation items from NavLinks
  const additionalNavItems = NavLinks;
  
  // Combine nav items
  const navigationItems = [...baseNavItems, ...additionalNavItems];
  
  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };
  
  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path || 
      (path !== '/dashboard' && location.pathname.startsWith(path));
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuElement = document.getElementById('mobile-menu');
      if (menuElement && !menuElement.contains(event.target) && !event.target.closest('#menu-toggle')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  return (
    <>
      {/* Desktop Side Navigation */}
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
        <div className="py-6">
          <nav>
            <ul className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive(item.path)
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
        </div>
      </div>
      
      {/* Mobile Navigation Button */}
      <div className="md:hidden">
        <button 
          id="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div 
            id="mobile-menu"
            className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">CryptoVaultX</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <nav>
                  <ul className="space-y-2">
                    {navigationItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            isActive(item.path)
                              ? 'bg-white/10 text-white'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
              </div>
              
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

DashboardNavigationIntegration.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default DashboardNavigationIntegration;

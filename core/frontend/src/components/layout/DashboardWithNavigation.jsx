/**
 * DashboardWithNavigation.jsx
 * 
 * This component wraps the existing Dashboard page with our new navigation
 * components for a clean integration without modifying the original files.
 */
import React, { useState } from 'react';
import FilesPage from '../../pages/dashboard/FilesPage';
import DashboardNavigationIntegration from '../glue/DashboardNavigationIntegration';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socket';
import { toast } from 'sonner';

const DashboardWithNavigation = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  // Handle logout
  const handleLogout = () => {
    // Disconnect socket if connected
    if (isConnected) {
      socketService.disconnectSocket();
    }
    
    // Use the same logout logic as in Dashboard
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Connect to socket for real-time notifications on component mount
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      socketService.connectSocket(user.id);
      setIsConnected(true);

      // Set up socket event listeners for share notifications
      socketService.socket.on('share:viewed', (data) => {
        const { viewerEmail, fileName } = data;
        toast.info(
          `Your file "${fileName || 'Unnamed file'}" was viewed by ${viewerEmail}`,
          {
            description: `Just now`,
            duration: 5000
          }
        );
      });
    }

    return () => {
      if (isConnected) {
        socketService.disconnectSocket();
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Our navigation integration */}
      <DashboardNavigationIntegration onLogout={handleLogout} />
      
      {/* Main content area - shift to accommodate sidebar */}
      <div className="flex-1 md:ml-64">
        <FilesPage />
      </div>
    </div>
  );
};

export default DashboardWithNavigation;

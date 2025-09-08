/**
 * Example of how to integrate the dashboard navigation
 * This file shows how to set up routing with the new navigation components
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';

// This is how you would set up the router with our navigation components
const AppRouterExample = () => {
  // Lazy loading components
  const Dashboard = React.lazy(() => import('../src/pages/dashboard/Dashboard'));
  const DashboardWithNavigation = React.lazy(() => import('../components/layout/DashboardWithNavigation'));
  const SharedFilesList = React.lazy(() => import('../pages/shared/SharedFilesList'));
  const SharedLinks = React.lazy(() => import('../pages/shared/SharedLinks'));
  const HelpFAQ = React.lazy(() => import('../pages/help/HelpFAQ'));
  const Login = React.lazy(() => import('../src/pages/auth/Login'));
  
  // Loading fallback
  const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>
  );
  
  // ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('access_token') !== null;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };
  
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard with integrated navigation */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardWithNavigation />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared routes */}
          <Route 
            path="/shared" 
            element={
              <ProtectedRoute>
                <SharedFilesList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shared/links/:fileId" 
            element={
              <ProtectedRoute>
                <SharedLinks />
              </ProtectedRoute>
            } 
          />
          
          {/* Help route */}
          <Route path="/help/faq" element={<HelpFAQ />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouterExample;

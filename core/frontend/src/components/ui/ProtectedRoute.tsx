/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { DashboardLayout } from '../layout/DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  useLayout?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  useLayout = true,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    console.warn('ProtectedRoute: Loading auth state...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.warn(`ProtectedRoute redirect: user not authenticated, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect if user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    console.warn('ProtectedRoute redirect: user authenticated, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Wrap with dashboard layout if requested
  if (useLayout && isAuthenticated) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <>{children}</>;
};

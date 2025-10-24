/**
 * App Router - React Router v6 Configuration
 * Defines all application routes with lazy loading and protection
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ui/ProtectedRoute';
import { AuthProvider } from '../services/auth';
import { ThemeProvider } from '../contexts/ThemeContext';

// Direct imports for auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Lazy load main components
const DashboardPage = React.lazy(() => import('../pages/dashboard/Dashboard'));
const AnalyticsPage = React.lazy(() => import('../pages/dashboard/AnalyticsPage'));
const UploadPage = React.lazy(() => import('../pages/dashboard/Upload'));
const FilesPage = React.lazy(() => import('../pages/dashboard/FilesPage'));
const FileDetailPage = React.lazy(() => import('../pages/dashboard/FileDetailPage'));

// Shared files
const SharedFilesPage = React.lazy(() => import('../pages/shared/SharedFiles'));

// Profile and Settings
const ProfilePage = React.lazy(() => import('../pages/profile/Profile'));
const SettingsPage = React.lazy(() => import('../pages/settings/Settings'));
const KeyBackupPage = React.lazy(() => import('../pages/settings/KeyBackup'));
const HelpPage = React.lazy(() => import('../pages/help/HelpPage'));

// Legal pages
const TermsOfServicePage = React.lazy(() => import('../pages/legal/TermsOfServiceNew'));
const PrivacyPolicyPage = React.lazy(() => import('../pages/legal/PrivacyPolicy'));

// Error pages
const ErrorPage = React.lazy(() => import('../pages/error/ErrorPage'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-white text-lg">Loading...</span>
    </div>
  </div>
);

/**
 * Main App Router Component
 * Configures all application routes with React Router v6
 */
export default function AppRouter() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Auth Routes (redirect to dashboard if already authenticated) */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth/login" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth/register" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Legal pages (public) */}
            <Route 
              path="/terms" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <TermsOfServicePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/terms-of-service" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <TermsOfServicePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/privacy" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <PrivacyPolicyPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/privacy-policy" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <PrivacyPolicyPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/files" 
              element={
                <ProtectedRoute>
                  <FilesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/files/:fileId" 
              element={
                <ProtectedRoute>
                  <FileDetailPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Files */}
            <Route 
              path="/shared" 
              element={
                <ProtectedRoute>
                  <SharedFilesPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile and Settings */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/backup" 
              element={
                <ProtectedRoute>
                  <KeyBackupPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Error Routes */}
            <Route 
              path="/error" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <ErrorPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 - Must be last */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute requireAuth={false} useLayout={false}>
                  <NotFound />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Protected Route Component
 * Checks for authentication token in localStorage
 * Redirects to login if not authenticated
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that guards protected pages
 * @param children - The protected component to render if authenticated
 * @returns Either the protected component or redirect to login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if user is authenticated by looking for token in localStorage
  // Check both authToken (for compatibility) and access_token (from auth service)
  const authToken = localStorage.getItem('authToken');
  const accessToken = localStorage.getItem('access_token');
  
  // If no token found, redirect to login page
  if (!authToken && !accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  // If token exists, render the protected component
  return <>{children}</>;
}

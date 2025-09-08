/**
 * Error Page
 * Generic error fallback page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface ErrorPageProps {
  error?: Error;
  errorTitle?: string;
  errorMessage?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  errorTitle = 'Something went wrong',
  errorMessage = 'An unexpected error occurred. Please try again.',
  showRetry = true,
  onRetry,
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle size={32} className="text-red-400" />
            </motion.div>
            <CardTitle className="text-white text-xl">{errorTitle}</CardTitle>
            <CardDescription className="text-gray-400">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {showRetry && (
                <Button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-500"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Home size={16} className="mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={handleGoBack}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft size={16} className="mr-2" />
                Go Back
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                If this problem persists, please{' '}
                <button
                  onClick={() => navigate('/help')}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  contact support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

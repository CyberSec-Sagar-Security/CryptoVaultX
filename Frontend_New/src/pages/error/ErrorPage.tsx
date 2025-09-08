import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface ErrorPageProps {
  error?: Error;
  errorMessage?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, errorMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const displayError = error?.message || errorMessage || 'An unexpected error occurred';

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4"
            >
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Oops! Something went wrong
            </CardTitle>
            <p className="text-slate-400">
              We encountered an error while processing your request.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error details */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300 text-sm font-mono">
                {displayError}
              </p>
              {location.pathname && (
                <p className="text-slate-400 text-xs mt-2">
                  Path: {location.pathname}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={handleGoHome}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Additional help */}
            <div className="text-center text-sm text-slate-400">
              <p>If this problem persists, please contact support.</p>
            </div>
          </CardContent>
        </Card>

        {/* Background decoration */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-xl"
        />
      </motion.div>
    </div>
  );
};

export default ErrorPage;

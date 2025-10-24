/**
 * Not Found Page (404)
 * Page displayed when route doesn't exist
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const popularPages = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Upload Files', path: '/upload', icon: Shield },
    { name: 'My Files', path: '/files', icon: Search },
    { name: 'Shared Files', path: '/shared', icon: Search },
  ];

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
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mb-4"
            >
              <div className="text-6xl font-bold text-white mb-2">404</div>
              <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded mx-auto"></div>
            </motion.div>
            
            <CardTitle className="text-white text-2xl mb-2">Page Not Found</CardTitle>
            <CardDescription className="text-gray-400 text-base">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
              >
                <Home size={16} className="mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft size={16} className="mr-2" />
                Go Back
              </Button>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-white font-medium mb-3">Popular Pages</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularPages.map((page) => {
                  const IconComponent = page.icon;
                  return (
                    <Button
                      key={page.path}
                      onClick={() => navigate(page.path)}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <IconComponent size={14} className="mr-2" />
                      {page.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Looking for something specific?{' '}
                <button
                  onClick={() => navigate('/help')}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Contact support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Floating Animation Elements */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-400/20 rounded-full blur-xl"
        />
      </motion.div>
    </div>
  );
};

export default NotFound;

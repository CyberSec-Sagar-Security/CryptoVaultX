import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Shield, Upload, Users, BarChart3, Lock, FileCheck, Moon, Sun } from 'lucide-react';

interface LandingPageProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function LandingPage({ theme, toggleTheme }: LandingPageProps) {
  const features = [
    {
      icon: Shield,
      title: 'AES-256 Encryption',
      description: 'Military-grade encryption ensures your files are always secure.'
    },
    {
      icon: Upload,
      title: 'Secure Upload',
      description: 'Files are encrypted before leaving your device.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share files securely with granular permissions.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track usage and monitor file activity.'
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge',
      description: 'We never have access to your unencrypted data.'
    },
    {
      icon: FileCheck,
      title: 'File Integrity',
      description: 'Verify file authenticity with cryptographic checksums.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CryptoVault
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                🔐 AES-256
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6">
            🔐 Enterprise-Grade Security
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Secure File Sharing
            <br />
            Made Simple
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            CryptoVault provides enterprise-grade file sharing with end-to-end encryption, 
            zero-knowledge architecture, and seamless collaboration tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose CryptoVault?</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Built for teams who need bulletproof security without compromising on usability.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 w-fit mb-4">
                    <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="backdrop-blur-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-white/20 dark:border-gray-800/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Files?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who trust CryptoVault with their most sensitive data.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg">
                Get Started Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
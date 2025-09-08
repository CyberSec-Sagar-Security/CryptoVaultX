/**
 * Help Page - Documentation and Support
 * Path: src/pages/help/Help.tsx
 * User guides, FAQ, and support resources
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowLeft,
  Search,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Book,
  Video,
  Download,
  ChevronDown,
  ChevronRight,
  Shield,
  Upload,
  Share2,
  Lock,
  Key,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  articles: number;
}

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const helpTopics: HelpTopic[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of CryptoVaultX',
      icon: Book,
      articles: 8
    },
    {
      id: 'file-encryption',
      title: 'File Encryption',
      description: 'How to encrypt and decrypt files',
      icon: Shield,
      articles: 12
    },
    {
      id: 'file-sharing',
      title: 'File Sharing',
      description: 'Share files securely with others',
      icon: Share2,
      articles: 6
    },
    {
      id: 'account-security',
      title: 'Account Security',
      description: 'Protect your account and data',
      icon: Lock,
      articles: 10
    },
    {
      id: 'api-keys',
      title: 'API & Integration',
      description: 'API usage and third-party integrations',
      icon: Key,
      articles: 7
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      description: 'Work with teams and manage permissions',
      icon: Users,
      articles: 9
    }
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I encrypt a file?',
      answer: 'To encrypt a file, go to the Upload page, select your file, choose an encryption level (Standard, Strong, or Maximum), and click Upload. The file will be automatically encrypted using AES-256 encryption.',
      category: 'encryption'
    },
    {
      id: '2',
      question: 'Can I share encrypted files with others?',
      answer: 'Yes! You can share encrypted files by going to your file list, clicking the share icon next to any file, and entering the email addresses of people you want to share with. They will receive secure access to the file.',
      category: 'sharing'
    },
    {
      id: '3',
      question: 'What encryption standards does CryptoVaultX use?',
      answer: 'CryptoVaultX uses industry-standard AES-256 encryption for maximum security. We also support AES-128 and ChaCha20 encryption algorithms depending on your security preferences.',
      category: 'encryption'
    },
    {
      id: '4',
      question: 'How do I reset my password?',
      answer: 'If you forgot your password, click "Forgot Password" on the login page. You will receive an email with instructions to reset your password. For security reasons, this process requires email verification.',
      category: 'account'
    },
    {
      id: '5',
      question: 'Is there a file size limit?',
      answer: 'The default file size limit is 100MB per file. You can adjust this limit in Settings > Storage Settings. Premium users can upload files up to 1GB in size.',
      category: 'upload'
    },
    {
      id: '6',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Profile > Security Settings and toggle on "Two-Factor Authentication". You will be guided through the setup process which includes scanning a QR code with your authenticator app.',
      category: 'security'
    },
    {
      id: '7',
      question: 'Can I access my files offline?',
      answer: 'Files are stored securely in the cloud and require an internet connection to access. However, you can download encrypted files for offline access and decrypt them locally when needed.',
      category: 'access'
    },
    {
      id: '8',
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to Profile > Danger Zone and click "Delete Account". This action is irreversible and will permanently delete all your files and data.',
      category: 'account'
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Search Section */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
                <p className="text-gray-400">Search our knowledge base or browse topics below</p>
              </div>
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles, FAQs, or guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 bg-white/10 border-white/20 text-white placeholder-gray-400 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              className="h-auto p-6 bg-blue-600 hover:bg-blue-700 flex-col gap-2"
              onClick={() => window.open('mailto:support@cryptovaultx.com')}
            >
              <Mail className="w-6 h-6" />
              <span>Email Support</span>
              <span className="text-xs opacity-80">Get help via email</span>
            </Button>
            <Button 
              className="h-auto p-6 bg-green-600 hover:bg-green-700 flex-col gap-2"
              onClick={() => window.open('/live-chat', '_blank')}
            >
              <MessageCircle className="w-6 h-6" />
              <span>Live Chat</span>
              <span className="text-xs opacity-80">Chat with our team</span>
            </Button>
            <Button 
              className="h-auto p-6 bg-purple-600 hover:bg-purple-700 flex-col gap-2"
              onClick={() => window.open('/user-guide.pdf')}
            >
              <Download className="w-6 h-6" />
              <span>User Guide</span>
              <span className="text-xs opacity-80">Download PDF guide</span>
            </Button>
          </div>

          {/* Help Topics */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Browse by Topic</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpTopics.map((topic) => (
                <Card 
                  key={topic.id}
                  className="bg-white/10 border-white/20 backdrop-blur-xl hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => navigate(`/help/${topic.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <topic.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{topic.title}</h4>
                        <p className="text-gray-400 text-sm mb-2">{topic.description}</p>
                        <Badge variant="secondary" className="bg-white/10 text-white">
                          {topic.articles} articles
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="bg-white/10 border-white/20 backdrop-blur-xl">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <span className="text-white font-medium">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4"
                      >
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Watch step-by-step video guides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Getting Started with CryptoVaultX</p>
                    <p className="text-gray-400 text-xs">5:30</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">How to Encrypt and Share Files</p>
                    <p className="text-gray-400 text-xs">8:15</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Advanced Security Settings</p>
                    <p className="text-gray-400 text-xs">12:45</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Support
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-white font-medium mb-1">Email Support</p>
                  <p className="text-gray-400 text-sm">support@cryptovaultx.com</p>
                  <p className="text-gray-400 text-xs">Response within 24 hours</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Live Chat</p>
                  <p className="text-gray-400 text-sm">Available 24/7</p>
                  <p className="text-gray-400 text-xs">Instant support for urgent issues</p>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Phone Support</p>
                  <p className="text-gray-400 text-sm">+1 (800) 123-4567</p>
                  <p className="text-gray-400 text-xs">Business hours: 9 AM - 6 PM EST</p>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status and Updates */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
              <CardDescription className="text-gray-400">
                Current system status and recent updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium">All systems operational</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white">File Upload Service</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white">Encryption Service</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white">File Sharing</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white">API Services</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Operational</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Help;

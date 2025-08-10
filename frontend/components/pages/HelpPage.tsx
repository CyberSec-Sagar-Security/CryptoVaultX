import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Shield, 
  Upload, 
  Share2, 
  Settings,
  ExternalLink,
  FileText,
  Video,
  Github
} from 'lucide-react';
import { motion } from 'motion/react';

export function HelpPage() {
  const faqItems = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I upload my first file?',
          answer: 'Navigate to the Upload page, drag and drop your files or click "Select Files" to browse. Files are automatically encrypted before upload.'
        },
        {
          question: 'What file types are supported?',
          answer: 'CryptoVault supports all file types including documents, images, videos, archives, and more. Maximum file size is 100MB per file.'
        },
        {
          question: 'How does the encryption work?',
          answer: 'We use AES-256 encryption with zero-knowledge architecture. Files are encrypted on your device before upload, ensuring even we cannot access your data.'
        }
      ]
    },
    {
      category: 'File Sharing',
      questions: [
        {
          question: 'How do I share files securely?',
          answer: 'Go to the Shared Files page, select a file, and choose to share via email or generate a secure link. You can set permissions and expiration dates.'
        },
        {
          question: 'Can I control who accesses my files?',
          answer: 'Yes, you can set granular permissions (view, download, edit) and revoke access at any time. You can also set expiration dates for shared links.'
        },
        {
          question: 'How long do share links last?',
          answer: 'Share links can be set to expire after a specific date or remain active indefinitely. You can modify or revoke access at any time.'
        }
      ]
    },
    {
      category: 'Security',
      questions: [
        {
          question: 'Is my data really secure?',
          answer: 'Yes, we use end-to-end encryption with AES-256. Your data is encrypted before it leaves your device, and we use a zero-knowledge architecture.'
        },
        {
          question: 'Should I enable 2FA?',
          answer: 'We strongly recommend enabling two-factor authentication for additional security. This adds an extra layer of protection to your account.'
        },
        {
          question: 'What happens if I forget my password?',
          answer: 'You can reset your password, but due to our zero-knowledge architecture, this will result in loss of access to encrypted files. Always keep a secure backup.'
        }
      ]
    },
    {
      category: 'Storage & Billing',
      questions: [
        {
          question: 'How much storage do I get?',
          answer: 'Free accounts get 5GB of storage. Pro accounts get 100GB. Enterprise plans offer unlimited storage with advanced features.'
        },
        {
          question: 'Can I upgrade my storage?',
          answer: 'Yes, you can upgrade to a Pro or Enterprise plan at any time from the Settings page. Billing is monthly or annual.'
        },
        {
          question: 'What happens when I reach my storage limit?',
          answer: 'You will be notified when approaching your limit. Once reached, you cannot upload new files until you upgrade or free up space.'
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'API Documentation', icon: FileText, url: '#' },
    { title: 'Video Tutorials', icon: Video, url: '#' },
    { title: 'GitHub Repository', icon: Github, url: '#' },
    { title: 'Security Whitepaper', icon: Shield, url: '#' },
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      action: 'Contact Support',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: HelpCircle,
      action: 'Visit Forum',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl mb-4">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find answers to common questions, learn how to use CryptoVault effectively, 
          and get support when you need it.
        </p>
      </div>

      {/* Search */}
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardContent className="p-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <div className="space-y-6">
            {faqItems.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {category.questions.map((item, index) => (
                        <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                          <AccordionTrigger>{item.question}</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              {item.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Getting Started Guide',
                description: 'Learn the basics of using CryptoVault',
                icon: Book,
                time: '5 min read',
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'File Upload & Encryption',
                description: 'How to securely upload and encrypt your files',
                icon: Upload,
                time: '3 min read',
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'Sharing Files Securely',
                description: 'Best practices for sharing files with others',
                icon: Share2,
                time: '4 min read',
                color: 'from-purple-500 to-purple-600'
              },
              {
                title: 'Account Security Setup',
                description: 'Configure 2FA and security settings',
                icon: Shield,
                time: '6 min read',
                color: 'from-red-500 to-red-600'
              },
              {
                title: 'Managing Your Storage',
                description: 'Optimize and organize your files',
                icon: Settings,
                time: '4 min read',
                color: 'from-orange-500 to-orange-600'
              },
              {
                title: 'Privacy & Data Control',
                description: 'Understanding your data privacy options',
                icon: Shield,
                time: '7 min read',
                color: 'from-indigo-500 to-indigo-600'
              }
            ].map((guide, index) => {
              const Icon = guide.icon;
              return (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${guide.color} text-white w-fit mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2">{guide.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {guide.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {guide.time}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className={`p-4 rounded-lg bg-gradient-to-r ${option.color} text-white w-fit mx-auto mb-4`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="mb-2">{option.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {option.description}
                      </p>
                      <Button className={`bg-gradient-to-r ${option.color} hover:opacity-90`}>
                        {option.action}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.title}
                      variant="ghost"
                      className="w-full justify-between hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4" />
                        <span>{link.title}</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Upload Service</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Encryption Service</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Operational
                  </Badge>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Status Page
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
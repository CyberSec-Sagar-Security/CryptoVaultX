/**
 * Getting Started Help Topic Page
 * FAQ articles for getting started with CryptoVault
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const GettingStartedPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'What is CryptoVault and how does it work?',
      answer: 'CryptoVault is a secure file storage platform that uses end-to-end encryption to protect your files. When you upload a file, it\'s encrypted on your device before being stored in the cloud. Only you have the decryption keys, ensuring complete privacy.'
    },
    {
      id: '2',
      question: 'How do I create an account?',
      answer: 'Click on "Sign Up" on the login page, enter your email address, create a strong password, and verify your email. Once verified, you can start uploading and encrypting your files immediately.'
    },
    {
      id: '3',
      question: 'What file types are supported?',
      answer: 'CryptoVault supports all file types including documents (PDF, DOC, XLS), images (JPG, PNG, GIF), videos (MP4, AVI), and archives (ZIP, RAR). The maximum file size is 500MB per file.'
    },
    {
      id: '4',
      question: 'How do I upload my first file?',
      answer: 'Navigate to the Upload page from the sidebar, click "Choose Files" or drag and drop your files into the upload area. Your files will be automatically encrypted and uploaded to your secure vault.'
    },
    {
      id: '5',
      question: 'Is there a mobile app available?',
      answer: 'Yes! CryptoVault is available on iOS and Android. Download the app from the App Store or Google Play Store and use the same credentials to access your encrypted files on the go.'
    },
    {
      id: '6',
      question: 'How much storage space do I get?',
      answer: 'Free accounts get 5GB of storage. Pro accounts get 100GB, and Business accounts get unlimited storage. You can upgrade your plan anytime from the Settings page.'
    },
    {
      id: '7',
      question: 'Can I access my files offline?',
      answer: 'Yes, you can mark files for offline access in the mobile app. These files will be downloaded and decrypted on your device for offline viewing.'
    },
    {
      id: '8',
      question: 'How do I organize my files?',
      answer: 'Create folders from the Files page by clicking "New Folder". You can drag and drop files into folders, use tags for categorization, and use the search function to quickly find files.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/help')}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Getting Started</h1>
              <p className="text-gray-400 mt-2">Learn the basics of CryptoVaultX</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">{faqs.length} articles</span>
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-xl hover:bg-white/15 transition-colors">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedFAQ === faq.id && (
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Back to Dashboard Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default GettingStartedPage;

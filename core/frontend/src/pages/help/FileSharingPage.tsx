/**
 * File Sharing Help Topic Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const FileSharingPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I share a file with someone?',
      answer: 'Navigate to the Files page, select the file you want to share, click the Share button, enter the recipient\'s email address, and set permissions (view/download/edit). The recipient will receive an encrypted link.'
    },
    {
      id: '2',
      question: 'Can I set expiration dates for shared links?',
      answer: 'Yes! When creating a share link, you can set an expiration date. After this date, the link will automatically become invalid and the file will no longer be accessible.'
    },
    {
      id: '3',
      question: 'What permissions can I grant when sharing?',
      answer: 'You can grant View (read-only), Download (save a copy), or Edit (modify the file) permissions. Choose the level that matches your sharing needs.'
    },
    {
      id: '4',
      question: 'How do I revoke access to a shared file?',
      answer: 'Go to the Shared page, find the file you want to stop sharing, click the three-dot menu, and select "Revoke Access". The recipient will immediately lose access.'
    },
    {
      id: '5',
      question: 'Can I share folders?',
      answer: 'Yes! You can share entire folders with all their contents. Recipients will see the folder structure and can access all files within based on their permissions.'
    },
    {
      id: '6',
      question: 'Are shared files still encrypted?',
      answer: 'Absolutely! Shared files remain encrypted. We generate secure sharing keys that allow recipients to decrypt only the specific files shared with them.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/help')} className="text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">File Sharing</h1>
              <p className="text-gray-400 mt-2">Share files securely with others</p>
            </div>
          </div>

          <span className="text-gray-400 text-sm">{faqs.length} articles</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div key={faq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
              <Card className="bg-white/10 border-white/20 backdrop-blur-xl hover:bg-white/15 transition-colors">
                <CardHeader className="cursor-pointer" onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                    {expandedFAQ === faq.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FileSharingPage;

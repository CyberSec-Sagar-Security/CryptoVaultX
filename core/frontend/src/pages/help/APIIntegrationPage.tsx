/**
 * API & Integration Help Topic Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const APIIntegrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I generate an API key?',
      answer: 'Navigate to Profile > Security > API Keys, click "Generate New Key", give it a descriptive name, select permissions, and save the key securely. You won\'t be able to see it again.'
    },
    {
      id: '2',
      question: 'What can I do with the CryptoVault API?',
      answer: 'The API allows you to upload files, download files, manage sharing, create folders, and perform all operations available in the web interface programmatically.'
    },
    {
      id: '3',
      question: 'Are there rate limits on API requests?',
      answer: 'Free accounts have 1000 requests/day, Pro accounts get 10,000/day, and Business accounts have unlimited requests. Rate limit headers are included in all API responses.'
    },
    {
      id: '4',
      question: 'How do I authenticate API requests?',
      answer: 'Include your API key in the Authorization header: "Authorization: Bearer YOUR_API_KEY". All API requests must be made over HTTPS.'
    },
    {
      id: '5',
      question: 'Can I integrate CryptoVault with third-party apps?',
      answer: 'Yes! We support OAuth 2.0 for third-party integrations. Popular integrations include Dropbox, Google Drive, Slack, and Microsoft Teams.'
    },
    {
      id: '6',
      question: 'Where can I find API documentation?',
      answer: 'Complete API documentation is available at docs.cryptovaultx.com/api. It includes endpoints, parameters, examples, and SDKs for popular languages.'
    },
    {
      id: '7',
      question: 'What programming languages are supported?',
      answer: 'We provide official SDKs for Python, JavaScript/Node.js, Java, PHP, Ruby, and Go. The REST API can be used with any language that supports HTTP requests.'
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
              <Key className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">API & Integration</h1>
              <p className="text-gray-400 mt-2">API usage and third-party integrations</p>
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

export default APIIntegrationPage;

/**
 * File Encryption Help Topic Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FileEncryptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'What encryption algorithm does CryptoVault use?',
      answer: 'CryptoVault uses AES-256 encryption, the same standard used by governments and financial institutions worldwide. This ensures your files are protected with military-grade security.'
    },
    {
      id: '2',
      question: 'How do I encrypt a file?',
      answer: 'Files are automatically encrypted when you upload them. Simply drag and drop or select files to upload, and they\'ll be encrypted on your device before being sent to our servers.'
    },
    {
      id: '3',
      question: 'Can I decrypt files on different devices?',
      answer: 'Yes! Your encryption keys are securely synced across all your devices. Log in to any device with your credentials to access and decrypt your files.'
    },
    {
      id: '4',
      question: 'What happens if I forget my password?',
      answer: 'Due to end-to-end encryption, we cannot recover your files if you forget your password. We recommend enabling two-factor authentication and keeping your password in a secure password manager.'
    },
    {
      id: '5',
      question: 'Are my encryption keys stored on your servers?',
      answer: 'No. Your encryption keys are derived from your password and are never sent to our servers. Only you have access to decrypt your files, ensuring complete privacy.'
    },
    {
      id: '6',
      question: 'Can I share encrypted files with others?',
      answer: 'Yes! When you share a file, CryptoVault creates a secure sharing key that allows the recipient to decrypt and access the file without compromising your master encryption keys.'
    },
    {
      id: '7',
      question: 'How secure is the encryption process?',
      answer: 'Our encryption is performed client-side using proven cryptographic libraries. The encryption process is audited regularly by security experts to ensure the highest level of protection.'
    },
    {
      id: '8',
      question: 'Can encrypted files be accessed by CryptoVault staff?',
      answer: 'No. Due to zero-knowledge encryption, our staff cannot access your files. Only you hold the keys to decrypt your data.'
    },
    {
      id: '9',
      question: 'What is end-to-end encryption?',
      answer: 'End-to-end encryption means your files are encrypted on your device before upload and can only be decrypted by you. The files remain encrypted during transmission and storage.'
    },
    {
      id: '10',
      question: 'How do I verify my files are encrypted?',
      answer: 'You can verify encryption status in the file details panel. Encrypted files will show a shield icon and display the encryption algorithm used.'
    },
    {
      id: '11',
      question: 'Can I use custom encryption keys?',
      answer: 'Pro and Business accounts can enable custom encryption keys for additional control. Contact support to enable this advanced feature.'
    },
    {
      id: '12',
      question: 'Is metadata encrypted too?',
      answer: 'Yes! File metadata including filenames, sizes, and timestamps are also encrypted to ensure complete privacy of your data.'
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">File Encryption</h1>
              <p className="text-gray-400 mt-2">How to encrypt and decrypt files</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">{faqs.length} articles</span>
          </div>
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

export default FileEncryptionPage;

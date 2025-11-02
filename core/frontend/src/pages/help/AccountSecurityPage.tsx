/**
 * Account Security Help Topic Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AccountSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I enable two-factor authentication (2FA)?',
      answer: 'Go to Profile > Security Settings, click "Enable 2FA", scan the QR code with your authenticator app (Google Authenticator, Authy), and enter the verification code to complete setup.'
    },
    {
      id: '2',
      question: 'What makes a strong password?',
      answer: 'A strong password should be at least 12 characters long, include uppercase and lowercase letters, numbers, and special characters. Avoid common words and personal information.'
    },
    {
      id: '3',
      question: 'How can I check my login history?',
      answer: 'Navigate to Profile > Security > Login History to see all recent login attempts, including device information, location, and timestamps.'
    },
    {
      id: '4',
      question: 'What should I do if I suspect unauthorized access?',
      answer: 'Immediately change your password, review your login history, revoke all active sessions, and enable 2FA. Contact support if you notice suspicious activity.'
    },
    {
      id: '5',
      question: 'Can I use a security key for authentication?',
      answer: 'Yes! Pro and Business accounts support hardware security keys (YubiKey, etc.) for enhanced authentication security.'
    },
    {
      id: '6',
      question: 'How often should I change my password?',
      answer: 'We recommend changing your password every 90 days or immediately if you suspect it may have been compromised.'
    },
    {
      id: '7',
      question: 'What is session management?',
      answer: 'Session management allows you to view and control all active login sessions across your devices. You can remotely log out from any device.'
    },
    {
      id: '8',
      question: 'How does CryptoVault protect against brute force attacks?',
      answer: 'We implement rate limiting, account lockouts after failed attempts, and CAPTCHA challenges to protect against automated attacks.'
    },
    {
      id: '9',
      question: 'Can I whitelist specific IP addresses?',
      answer: 'Business accounts can restrict access to specific IP addresses or ranges for added security.'
    },
    {
      id: '10',
      question: 'What happens if I lose my 2FA device?',
      answer: 'Use your backup recovery codes (provided during 2FA setup) to regain access. Always store these codes securely offline.'
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Account Security</h1>
              <p className="text-gray-400 mt-2">Protect your account and data</p>
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

export default AccountSecurityPage;

/**
 * Terms of Service Page - CryptoVaultX
 * Path: src/pages/legal/TermsOfService.tsx
 * Comprehensive legal terms following industry standards
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Scale, FileText, Lock, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/register')}
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Register
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CryptoVaultX</h1>
                <p className="text-xs text-gray-400">Terms of Service</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Introduction */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-indigo-400" />
                <div>
                  <CardTitle className="text-white">Terms of Service</CardTitle>
                  <CardDescription className="text-gray-400">
                    Last updated: September 5, 2025
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Welcome to CryptoVaultX. These Terms of Service ("Terms") govern your use of our 
                encrypted file storage and management platform. By accessing or using our services, 
                you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">Important Notice</span>
                </div>
                <p className="text-blue-200 text-sm">
                  By using CryptoVaultX, you acknowledge that you have read, understood, and agree 
                  to be bound by these Terms and our commitment to data protection and privacy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-400" />
                <CardTitle className="text-white">1. Service Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                CryptoVaultX provides a secure, encrypted cloud storage platform that enables users to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Store files with end-to-end AES-256 encryption</li>
                <li>Share encrypted files securely with other users</li>
                <li>Manage file access controls and permissions</li>
                <li>Monitor security analytics and access logs</li>
                <li>Access files through our web-based interface</li>
              </ul>
              <p>
                Our services are designed to meet or exceed industry standards including NIST Cybersecurity 
                Framework, GDPR compliance guidelines.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-400" />
                <CardTitle className="text-white">2. User Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">Account Security</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use strong passwords and enable two-factor authentication when available</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Keep your contact information current and accurate</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-4">Acceptable Use</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will not use our service for any illegal purposes</li>
                <li>You will not attempt to circumvent any security features</li>
                <li>You will not upload content that infringes others' intellectual property rights</li>
                <li>You will not use the service to distribute malware or harmful content</li>
              </ul>
            </CardContent>
          </Card>

          {/* Security and Encryption */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-purple-400" />
                <CardTitle className="text-white">3. Security and Encryption</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                CryptoVaultX employs zero-knowledge encryption architecture, meaning your files are 
                encrypted on your device before being transmitted to our servers.
              </p>
              <h4 className="font-semibold text-white">Encryption Protocol</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AES-256 encryption for all stored data</li>
                <li>TLS 1.3 for all data in transit</li>
                <li>Client-side key generation and management</li>
                <li>Optional hardware security key support for 2FA</li>
              </ul>
              <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
                <p className="font-medium text-white mb-2">Important Security Notice:</p>
                <p>
                  Because we employ zero-knowledge architecture, we cannot recover your data if you lose 
                  your password. We strongly recommend enabling account recovery options and safely storing 
                  recovery keys.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white">4. Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms. 
                Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will lose access to all stored content</li>
                <li>Your data will remain encrypted on our servers for 30 days</li>
                <li>After 30 days, we will permanently delete your data</li>
                <li>No refunds will be issued for current billing periods</li>
              </ul>
              <p>
                You may terminate your account at any time through the account settings page.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white">5. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRYPTOVAULTX SHALL NOT BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF 
                PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p>
                IN NO EVENT SHALL OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICES 
                EXCEED THE GREATER OF $100 OR THE AMOUNTS PAID BY YOU TO CRYPTOVAULTX FOR THE PAST 
                12 MONTHS OF SERVICE.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 font-medium">Legal Notice</span>
                </div>
                <p className="text-amber-200 text-sm">
                  Some jurisdictions do not allow the exclusion of certain warranties or the limitation 
                  or exclusion of liability for certain types of damages. Accordingly, some of the above 
                  limitations may not apply to you.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white">6. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                These Terms shall be governed by the laws of the State of California, without respect to 
                its conflict of laws principles. Any claim or dispute between you and CryptoVaultX that 
                arises in whole or in part from the Services shall be decided exclusively by a court of 
                competent jurisdiction located in San Francisco County, California.
              </p>
              <p>
                If you are an EU resident, you may have additional rights under EU law.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white">7. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                For questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p>Email: legal@cryptovaultx.com</p>
                <p>Address: 123 Encryption Avenue, Suite 500, San Francisco, CA 94105, United States</p>
                <p>Data Protection Officer: dpo@cryptovaultx.com</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsOfService;

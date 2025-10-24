/**
 * Privacy Policy Page - CryptoVaultX
 * Path: src/pages/legal/PrivacyPolicy.tsx
 * Comprehensive privacy policy following GDPR, CCSP, NIST guidelines
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Eye, Database, Cookie, Globe, Users, Settings, Lock, FileText, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const PrivacyPolicy = () => {
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
                <p className="text-xs text-gray-400">Privacy Policy</p>
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
                <Eye className="w-6 h-6 text-indigo-400" />
                <div>
                  <CardTitle className="text-white">Privacy Policy</CardTitle>
                  <CardDescription className="text-gray-400">
                    Last updated: September 5, 2025 | Effective Date: September 5, 2025
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                At CryptoVaultX, we are committed to protecting your privacy and maintaining the 
                highest standards of data protection. This Privacy Policy explains how we collect, 
                use, and safeguard your information in compliance with GDPR, CCSP guidelines, 
                NIST Cybersecurity Framework, and other applicable data protection regulations.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  <strong>Zero-Knowledge Promise:</strong> We cannot access your encrypted files. 
                  Your privacy is protected by design, not just by policy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-400" />
                <CardTitle className="text-white">1. Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">Personal Information</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Data:</strong> Name, email address, and authentication credentials</li>
                <li><strong>Profile Information:</strong> User preferences and account settings</li>
                <li><strong>Communication Data:</strong> Support requests and correspondence</li>
                <li><strong>Billing Information:</strong> Payment details and transaction history (processed securely through compliant payment processors)</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Technical Information</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Usage Data:</strong> Login times, feature usage, and system interactions</li>
                <li><strong>Security Logs:</strong> Authentication attempts and security events</li>
                <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers</li>
                <li><strong>Performance Data:</strong> System performance metrics and error logs</li>
                <li><strong>Network Information:</strong> Connection type, ISP, and geographic location (city/country level)</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">Encrypted File Metadata</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>File Properties:</strong> File size, type, and upload timestamps</li>
                <li><strong>Access Records:</strong> File access logs and sharing permissions</li>
                <li><strong>Versioning Data:</strong> Timestamps and identifiers for file versions</li>
                <li><strong>Note:</strong> File contents are encrypted and inaccessible to us</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Legal Basis for Collection</h4>
              <p>
                Our collection and processing of your personal data is governed by the following legal bases under GDPR Article 6:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Contract Performance:</strong> Processing necessary to fulfill our contractual obligations</li>
                <li><strong>Legitimate Interest:</strong> Processing necessary for our legitimate business interests</li>
                <li><strong>Legal Obligation:</strong> Processing necessary for compliance with legal requirements</li>
                <li><strong>Consent:</strong> Processing based on specific, informed, and unambiguous consent</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-400" />
                <CardTitle className="text-white">2. How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">Service Provision</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Authenticate and authorize access to your account</li>
                <li>Provide secure file storage and sharing capabilities</li>
                <li>Deliver personalized user experience and preferences</li>
                <li>Process and respond to your support requests</li>
                <li>Manage subscription billing and payment processing</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Security and Compliance</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Monitor for security threats and unauthorized access</li>
                <li>Conduct security audits and vulnerability assessments</li>
                <li>Maintain compliance with regulatory requirements</li>
                <li>Investigate and respond to security incidents</li>
                <li>Perform data integrity checks and validation</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Service Improvement</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Identify and resolve technical issues</li>
                <li>Develop new features and capabilities</li>
                <li>Measure performance and optimize system resources</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">Legal Basis (GDPR Article 6)</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Contract Performance:</strong> Providing agreed services</li>
                <li><strong>Legitimate Interest:</strong> Security monitoring and fraud prevention</li>
                <li><strong>Legal Obligation:</strong> Compliance with applicable laws</li>
                <li><strong>Consent:</strong> Marketing communications (where applicable)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection Measures */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-green-400" />
                <CardTitle className="text-white">3. Data Protection and Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">Encryption Standards</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>AES-256:</strong> Military-grade encryption for all file data</li>
                <li><strong>TLS 1.3:</strong> Secure data transmission</li>
                <li><strong>Key Derivation:</strong> PBKDF2 with high iteration counts</li>
                <li><strong>Zero-Knowledge:</strong> Client-side encryption ensures data privacy</li>
                <li><strong>Digital Signatures:</strong> File integrity verification</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Security Controls (NIST Framework)</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Identify:</strong> Regular security assessments and risk management</li>
                <li><strong>Protect:</strong> Multi-layered security controls and access management</li>
                <li><strong>Detect:</strong> 24/7 monitoring and threat detection systems</li>
                <li><strong>Respond:</strong> Incident response procedures and breach notification</li>
                <li><strong>Recover:</strong> Business continuity and disaster recovery plans</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">Physical Security</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Secure data centers with ISO 27001 certification</li>
                <li>Multi-factor access controls and surveillance</li>
                <li>Environmental controls and redundant power systems</li>
                <li>Regular security audits and compliance verification</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">CCSP Compliance</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cloud security architecture and design</li>
                <li>Data classification and secure storage</li>
                <li>Identity and access management (IAM)</li>
                <li>Security monitoring and logging</li>
                <li>Encryption and key management</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Security Certifications</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SOC 2 Type II</li>
                <li>ISO 27001:2013</li>
                <li>HIPAA Business Associate compliance</li>
                <li>GDPR compliance</li>
                <li>Annual penetration testing by independent security firms</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing and Transfers */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-orange-400" />
                <CardTitle className="text-white">4. Data Sharing and International Transfers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">We Do Not Sell Your Data</h4>
              <p>
                CryptoVaultX does not sell, rent, or trade your personal information to third parties 
                for marketing purposes.
              </p>
              
              <h4 className="font-semibold text-white mt-6">Limited Sharing</h4>
              <p>We may share data only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Trusted partners bound by strict confidentiality</li>
                <li><strong>Legal Requirements:</strong> When required by law or court order</li>
                <li><strong>Security Threats:</strong> To protect our users and systems</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition (with notice)</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">Service Provider Categories</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Infrastructure Providers:</strong> Cloud hosting and storage services</li>
                <li><strong>Security Services:</strong> Threat detection and authentication providers</li>
                <li><strong>Analytics Services:</strong> Performance and usage analytics (anonymized)</li>
                <li><strong>Payment Processors:</strong> Secure payment processing services</li>
                <li><strong>Support Services:</strong> Customer support and communication tools</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">International Transfers</h4>
              <p>
                Data may be processed in countries with adequate protection levels. For transfers 
                to other countries, we implement appropriate safeguards including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>EU-US Data Privacy Framework compliance</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Data Processing Agreements with strict security requirements</li>
                <li>Regular compliance audits of data processing activities</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Data Transfer Impact Assessment</h4>
              <p>
                We conduct regular Data Transfer Impact Assessments (DTIAs) for international data transfers 
                to ensure adequate protection levels are maintained in accordance with GDPR requirements and 
                Schrems II decision requirements.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights (GDPR) */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-400" />
                <CardTitle className="text-white">5. Your Privacy Rights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">GDPR Rights (EU Residents)</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right of Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("Right to be Forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Rights related to Automated Decision-making:</strong> Opt-out of automated processing</li>
                <li><strong>Right to Withdraw Consent:</strong> Revoke previously given consent</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">CCPA/CPRA Rights (California Residents)</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right to Know:</strong> What personal information is collected</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of the sale or sharing of personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service and pricing regardless of exercising rights</li>
                <li><strong>Right to Correct:</strong> Correct inaccurate personal information</li>
                <li><strong>Right to Limit Use:</strong> Limit use and disclosure of sensitive personal information</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Other Privacy Rights</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>UK Data Protection Act:</strong> Similar rights to GDPR for UK residents</li>
                <li><strong>LGPD (Brazil):</strong> Comprehensive rights for Brazilian residents</li>
                <li><strong>PIPEDA (Canada):</strong> Data access and correction rights</li>
                <li><strong>APPI (Japan):</strong> Disclosure, correction and discontinuance rights</li>
              </ul>

              <h4 className="font-semibold text-white mt-6">How to Exercise Your Rights</h4>
              <p>To exercise any of your rights, please contact us using the following methods:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Email:</strong> <span className="text-indigo-400">privacy@cryptovaultx.com</span></li>
                <li><strong>Web Form:</strong> Available in your account privacy settings</li>
                <li><strong>Mail:</strong> 123 Encryption Avenue, Suite 500, San Francisco, CA 94105, USA</li>
              </ul>
              <p className="mt-4">
                We will respond to all legitimate requests within the timeframes required by applicable law:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>30 days for GDPR requests (may be extended by up to 60 days if necessary)</li>
                <li>45 days for CCPA/CPRA requests (may be extended by up to 45 additional days)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-amber-400" />
                <CardTitle className="text-white">6. Cookies and Tracking Technologies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">Types of Cookies We Use</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Security Cookies:</strong> Detect suspicious activities</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Cookie Lifespans</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain for a specified period (typically 30-365 days)</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Your Cookie Choices</h4>
              <p>
                You can control cookies through your browser settings or our cookie preference center. 
                Options include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accepting all cookies</li>
                <li>Rejecting non-essential cookies</li>
                <li>Configuring specific cookie preferences</li>
              </ul>
              
              <p className="mt-4">
                Note that disabling essential cookies may affect service functionality and security features.
              </p>
              
              <h4 className="font-semibold text-white mt-6">Do Not Track Signals</h4>
              <p>
                We respect Do Not Track (DNT) signals from browsers. When DNT is enabled, we will disable 
                non-essential tracking mechanisms.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-cyan-400" />
                <CardTitle className="text-white">7. Data Retention</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="font-semibold text-white">Retention Periods</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>File Data:</strong> Retained until you delete files or close your account</li>
                <li><strong>Security Logs:</strong> Retained for 2 years for security purposes</li>
                <li><strong>Communication Records:</strong> Retained for 3 years</li>
                <li><strong>Billing Information:</strong> Retained for 7 years to comply with tax regulations</li>
                <li><strong>Analytics Data:</strong> Anonymized after 2 years</li>
              </ul>
              
              <h4 className="font-semibold text-white mt-6">Data Deletion Process</h4>
              <p>
                After account closure, your data is processed as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Immediate deactivation of your account</li>
                <li>Encrypted files are securely deleted within 30 days</li>
                <li>Personal information is anonymized or deleted within 90 days</li>
                <li>Backup data is purged according to our backup rotation schedule (maximum 180 days)</li>
              </ul>
              
              <p className="mt-4">
                We may retain certain information where required by law, for legitimate business purposes, 
                or to protect our legal rights. Any retained data will be handled in accordance with this Privacy Policy.
              </p>
              
              <h4 className="font-semibold text-white mt-6">Exceptions to Standard Retention</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Legal obligations requiring longer retention</li>
                <li>Ongoing disputes or legal claims</li>
                <li>Technical constraints requiring phased deletion</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-pink-400" />
                <CardTitle className="text-white">8. Children's Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                CryptoVaultX services are not directed to individuals under the age of 16. We do not 
                knowingly collect personal information from children. If you believe we have inadvertently 
                collected information from a child, please contact us immediately, and we will take steps 
                to delete such information.
              </p>
              <p className="mt-4">
                If you are a parent or guardian and believe your child has provided us with personal 
                information without your consent, please contact our Data Protection Officer at 
                dpo@cryptovaultx.com.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Policy Updates */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white">9. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices, 
                technologies, legal requirements, or other factors. We will notify you of any material 
                changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email to the address associated with your account</li>
                <li>Displaying a notice in your account dashboard</li>
              </ul>
              <p className="mt-4">
                The "Last Updated" date at the top of this policy indicates when it was last revised. 
                Your continued use of our services after any changes indicates your acceptance of the 
                updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact and Complaints */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">10. Contact Information and Complaints</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <p><strong>Data Protection Officer:</strong> dpo@cryptovaultx.com</p>
                <p><strong>Privacy Inquiries:</strong> privacy@cryptovaultx.com</p>
                <p><strong>General Contact:</strong> support@cryptovaultx.com</p>
                <p><strong>Phone:</strong> +1 (800) 555-CRYPT</p>
                <p><strong>Postal Address:</strong> 123 Encryption Avenue, Suite 500, San Francisco, CA 94105, United States</p>
              </div>
              
              <h4 className="font-semibold text-white mt-6">Supervisory Authority</h4>
              <p>
                EU residents have the right to lodge a complaint with their local data protection 
                authority. You can find your local authority at: 
                <span className="text-indigo-400"> https://edpb.europa.eu/about-edpb/board/members_en</span>
              </p>
              
              <h4 className="font-semibold text-white mt-6">Response Time Commitment</h4>
              <p>
                We are committed to addressing all privacy-related inquiries and complaints within 
                10 business days. For complex issues, we will provide an initial response and estimated 
                timeline for resolution.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

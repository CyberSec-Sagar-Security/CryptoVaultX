/**
 * Terms of Service Page
 * Legal terms and conditions for CryptoVaultX
 */

import React from 'react';
import { Shield } from 'lucide-react';

const TermsOfServiceNew: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Shield className="w-12 h-12 text-blue-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400 mt-2">Last updated: October 27, 2025</p>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CryptoVaultX, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily use CryptoVaultX for personal,
              non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Privacy and Security</h2>
            <p>
              Your files are encrypted client-side before upload. We do not have access to your
              encryption keys or unencrypted file contents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Do not upload illegal or malicious content</li>
              <li>Respect file storage quotas</li>
              <li>Back up your encryption keys safely</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Disclaimer</h2>
            <p>
              The service is provided "as is" without warranties of any kind. We are not liable
              for any data loss or security breaches resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us through the help
              section in the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceNew;

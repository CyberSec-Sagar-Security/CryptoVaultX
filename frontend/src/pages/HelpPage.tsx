import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Rocket, Lock, Share2, Wrench, MessageCircle, Mail, Clock, Upload, Settings, Users, BarChart3 } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const navigate = useNavigate();

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Rocket },
    { id: 'encryption', title: 'Encryption & Security', icon: Lock },
    { id: 'file-sharing', title: 'File Sharing', icon: Share2 },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: Wrench },
    { id: 'faq', title: 'FAQ', icon: HelpCircle }
  ];

  const helpContent = {
    'getting-started': {
      title: 'Getting Started with CryptoVault',
      content: [
        {
          question: 'How do I upload my first file?',
          answer: 'Navigate to the Upload page from your dashboard. You can either click "Select File" or drag and drop your file into the upload area. Your file will be automatically encrypted before being uploaded to our secure servers.'
        },
        {
          question: 'How does the encryption work?',
          answer: 'CryptoVault uses AES-256-GCM encryption, which is military-grade encryption. Your files are encrypted in your browser before being uploaded, ensuring that only you have access to the encryption keys.'
        },
        {
          question: 'How do I access my files?',
          answer: 'All your uploaded files are visible on your Dashboard. You can download, share, or delete files from there. Downloaded files are automatically decrypted using your stored encryption keys.'
        }
      ]
    },
    'encryption': {
      title: 'Encryption & Security',
      content: [
        {
          question: 'What encryption algorithm is used?',
          answer: 'CryptoVault uses AES-256-GCM (Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode), which provides both confidentiality and authenticity.'
        },
        {
          question: 'Where are encryption keys stored?',
          answer: 'Encryption keys are generated in your browser and stored locally. We never have access to your encryption keys, ensuring zero-knowledge security.'
        },
        {
          question: 'Can CryptoVault employees see my files?',
          answer: 'No. Since files are encrypted before upload and we don\'t have access to your encryption keys, your files remain completely private and secure.'
        },
        {
          question: 'What happens if I lose my encryption keys?',
          answer: 'If you lose your encryption keys (by clearing browser data), your files cannot be recovered. We recommend backing up your keys securely.'
        }
      ]
    },
    'file-sharing': {
      title: 'File Sharing',
      content: [
        {
          question: 'How do I share a file?',
          answer: 'From your dashboard, click the share button next to any file. You can set an expiration date and generate a secure sharing link.'
        },
        {
          question: 'How long do shared links last?',
          answer: 'You can set custom expiration times for shared links, from 1 day to never expiring. The default can be configured in your settings.'
        },
        {
          question: 'Can I revoke a shared link?',
          answer: 'Yes, you can revoke shared links at any time from the Shared Files page. Once revoked, the link will no longer work.'
        },
        {
          question: 'Do recipients need an account?',
          answer: 'No, recipients can download shared files without creating an account. However, they will need any passwords or additional security measures you\'ve set.'
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      content: [
        {
          question: 'Upload is failing or stuck',
          answer: 'Check your internet connection and try again. Large files may take longer to encrypt and upload. If the problem persists, try refreshing the page.'
        },
        {
          question: 'Cannot decrypt downloaded files',
          answer: 'This usually happens when encryption keys are missing. Check if you\'re using the same browser and haven\'t cleared your data.'
        },
        {
          question: 'Shared links not working',
          answer: 'Verify that the link hasn\'t expired and that you\'ve copied the complete URL. Some email clients may break long URLs.'
        },
        {
          question: 'Browser compatibility issues',
          answer: 'CryptoVault requires a modern browser with Web Crypto API support. We recommend Chrome, Firefox, Safari, or Edge (latest versions).'
        }
      ]
    },
    'faq': {
      title: 'Frequently Asked Questions',
      content: [
        {
          question: 'Is CryptoVault free to use?',
          answer: 'CryptoVault offers a free tier with 1GB of storage. Premium plans with additional storage and features are available.'
        },
        {
          question: 'What file types are supported?',
          answer: 'CryptoVault supports all file types. There are no restrictions on file formats, though individual file size limits may apply.'
        },
        {
          question: 'How secure is CryptoVault?',
          answer: 'CryptoVault uses end-to-end encryption, meaning your files are encrypted before leaving your device. We use industry-standard security practices and regular security audits.'
        },
        {
          question: 'Can I use CryptoVault for business?',
          answer: 'Yes, CryptoVault is suitable for both personal and business use. We offer team plans with additional collaboration features.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'You can delete your account from the Settings page. This will permanently remove all your files and data.'
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-7 w-7 text-purple-300" />
                  Help & Support
                </h1>
                <p className="text-purple-200 text-sm mt-1">Find answers and get help with CryptoVault</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <div className="glass-card p-4 border border-purple-400/30">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`${
                        activeSection === section.id
                          ? 'bg-white/20 text-white border-purple-300/50'
                          : 'text-purple-200 hover:text-white hover:bg-white/10 border-transparent'
                      } group rounded-lg px-4 py-3 flex items-center text-sm font-medium w-full text-left transition-all duration-200 border`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            <div className="glass-card p-6 border border-purple-400/30">
              <h2 className="text-2xl font-bold text-white mb-6">
                {helpContent[activeSection as keyof typeof helpContent].title}
              </h2>

              <div className="space-y-6">
                {helpContent[activeSection as keyof typeof helpContent].content.map((item, index) => (
                  <div key={index} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {item.question}
                    </h3>
                    <p className="text-purple-200 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="glass-card p-6 border border-purple-400/30">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-300" />
                Still need help?
              </h3>
              <p className="text-purple-200 mb-6">
                If you can't find the answer you're looking for, our support team is here to help.
              </p>
              <div className="space-y-4">
                <button className="glass-button text-white font-medium px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-purple-400/30 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </button>
                <div className="space-y-2 text-sm text-purple-200">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email: support@cryptovault.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Live Chat: Available 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Response time: Usually within 2 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-6 border border-purple-400/30">
              <h3 className="text-xl font-semibold text-white mb-6">
                Quick Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/upload')}
                  className="glass-card p-4 border border-purple-400/30 hover:border-purple-300/50 text-left transition-all duration-200 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Upload className="h-5 w-5 text-purple-300" />
                    <div className="font-medium text-white">Upload Your First File</div>
                  </div>
                  <div className="text-sm text-purple-200">Get started with CryptoVault</div>
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="glass-card p-4 border border-purple-400/30 hover:border-purple-300/50 text-left transition-all duration-200 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-5 w-5 text-purple-300" />
                    <div className="font-medium text-white">Account Settings</div>
                  </div>
                  <div className="text-sm text-purple-200">Manage your preferences</div>
                </button>
                <button
                  onClick={() => navigate('/shared-files')}
                  className="glass-card p-4 border border-purple-400/30 hover:border-purple-300/50 text-left transition-all duration-200 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-purple-300" />
                    <div className="font-medium text-white">Shared Files</div>
                  </div>
                  <div className="text-sm text-purple-200">Manage file sharing</div>
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="glass-card p-4 border border-purple-400/30 hover:border-purple-300/50 text-left transition-all duration-200 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-300" />
                    <div className="font-medium text-white">Usage Analytics</div>
                  </div>
                  <div className="text-sm text-purple-200">View your storage stats</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;

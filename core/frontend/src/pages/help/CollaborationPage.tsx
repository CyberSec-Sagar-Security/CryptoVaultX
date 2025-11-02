/**
 * Collaboration Help Topic Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const CollaborationPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I create a team workspace?',
      answer: 'Business accounts can create team workspaces from Settings > Teams. Click "Create Team", invite members via email, and start collaborating on shared files.'
    },
    {
      id: '2',
      question: 'What are team roles and permissions?',
      answer: 'Teams have three roles: Admin (full control), Member (upload, edit, share), and Viewer (read-only access). Admins can manage team members and settings.'
    },
    {
      id: '3',
      question: 'How do I invite team members?',
      answer: 'From your team dashboard, click "Invite Members", enter email addresses, select their role, and send invitations. Members receive an email with joining instructions.'
    },
    {
      id: '4',
      question: 'Can multiple people edit a file simultaneously?',
      answer: 'Yes! Pro and Business accounts support real-time collaboration. Multiple users can edit documents simultaneously with changes syncing in real-time.'
    },
    {
      id: '5',
      question: 'How do I track changes made by team members?',
      answer: 'Enable version history on shared files to track all changes. You can see who made changes, when, and restore previous versions if needed.'
    },
    {
      id: '6',
      question: 'Can I set different permissions for different folders?',
      answer: 'Yes! You can set custom permissions at the folder level. For example, Finance folder for accountants only, while Marketing folder is shared with marketing team.'
    },
    {
      id: '7',
      question: 'How do activity logs work?',
      answer: 'Team admins can view detailed activity logs showing all file operations, logins, sharing activities, and permission changes across the team.'
    },
    {
      id: '8',
      question: 'Can I remove a team member?',
      answer: 'Yes. Team admins can remove members from Settings > Team Members. Removed members immediately lose access to all team files.'
    },
    {
      id: '9',
      question: 'What happens to files when someone leaves the team?',
      answer: 'Files created by departing members remain in the team workspace. Their personal files are not affected. Admins can reassign ownership of shared files.'
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
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Collaboration</h1>
              <p className="text-gray-400 mt-2">Work with teams and manage permissions</p>
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

export default CollaborationPage;

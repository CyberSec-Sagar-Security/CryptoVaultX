/**
 * FilesPage - CryptoVaultX Files Management
 * Path: src/pages/dashboard/FilesPage.tsx
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText, Upload, Download, Shield } from 'lucide-react';

const FilesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Files</h1>
          <p className="text-gray-400">Manage your encrypted files and documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Upload Files</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Securely upload and encrypt your files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Upload files with end-to-end encryption</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                <CardTitle className="text-white">My Files</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                View and manage your files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Access your encrypted file library</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-white">Security</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Advanced encryption settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Configure security preferences</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;

/**
 * Key Backup Page
 * Export and import encrypted private key backups
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Download, 
  Upload, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  Copy,
  FileDown,
  FileUp,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  getPrivateKeyFromSession, 
  exportPrivateKeyPem, 
  encryptPrivateKeyExport, 
  decryptPrivateKeyImport,
  importPrivateKeyPem 
} from '../../services/crypto';

export const KeyBackup: React.FC = () => {
  const [exportPassword, setExportPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importData, setImportData] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportResult, setExportResult] = useState('');
  const [importResult, setImportResult] = useState('');
  const [exportError, setExportError] = useState('');
  const [importError, setImportError] = useState('');

  const handleExportKey = async () => {
    if (!exportPassword) {
      setExportError('Please enter a password to encrypt your key backup');
      return;
    }

    if (exportPassword !== confirmPassword) {
      setExportError('Passwords do not match');
      return;
    }

    if (exportPassword.length < 8) {
      setExportError('Password must be at least 8 characters long');
      return;
    }

    setIsExporting(true);
    setExportError('');
    setExportResult('');

    try {
      // Get private key from session
      const privateKey = await getPrivateKeyFromSession();
      if (!privateKey) {
        throw new Error('Private key not found. Please log in again.');
      }

      // Encrypt the private key for export
      const encryptedBackup = await encryptPrivateKeyExport(privateKey, exportPassword);

      // Create backup data with metadata
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        encryptedPrivateKey: encryptedBackup,
        keyDerivation: 'PBKDF2',
        iterations: 100000,
        algorithm: 'AES-256-GCM'
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      setExportResult(backupJson);

      // Also trigger download
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptovault-key-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export key backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportKey = async () => {
    if (!importPassword || !importData) {
      setImportError('Please provide both backup data and password');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportResult('');

    try {
      // Parse backup data
      const backupData = JSON.parse(importData);
      
      if (!backupData.encryptedPrivateKey) {
        throw new Error('Invalid backup format');
      }

      // Decrypt the private key
      const privateKey = await decryptPrivateKeyImport(backupData.encryptedPrivateKey, importPassword);

      // Verify the key by exporting it as PEM
      const privateKeyPem = await exportPrivateKeyPem(privateKey);

      // Store in session storage
      sessionStorage.setItem('privateKey', privateKeyPem);

      setImportResult('Private key successfully restored! You can now access your encrypted files.');

    } catch (error) {
      console.error('Import failed:', error);
      if (error instanceof SyntaxError) {
        setImportError('Invalid backup file format');
      } else if (error instanceof Error && error.message.includes('OperationError')) {
        setImportError('Incorrect password or corrupted backup');
      } else {
        setImportError(error instanceof Error ? error.message : 'Failed to import key backup');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Key Backup</h1>
              <p className="text-gray-400">Backup and restore your encryption keys</p>
            </div>
          </div>

          <Alert className="bg-yellow-500/20 border-yellow-500/30">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              <strong>Important:</strong> Keep your key backup safe and secure. Anyone with access to your backup and password can decrypt your files.
              Never share your backup or password with anyone.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Key */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download size={20} className="text-green-400" />
                  Export Key Backup
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Create an encrypted backup of your private key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Backup Password</Label>
                  <div className="relative">
                    <Input
                      type={showExportPassword ? 'text' : 'password'}
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      placeholder="Enter a strong password..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-0 hover:bg-transparent"
                      onClick={() => setShowExportPassword(!showExportPassword)}
                    >
                      {showExportPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password..."
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>

                {exportError && (
                  <Alert className="bg-red-500/20 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">{exportError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleExportKey}
                  disabled={isExporting || !exportPassword || !confirmPassword}
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  {isExporting ? (
                    'Creating Backup...'
                  ) : (
                    <>
                      <FileDown size={16} className="mr-2" />
                      Create Backup
                    </>
                  )}
                </Button>

                {exportResult && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Backup Created</Label>
                      <Button
                        onClick={() => copyToClipboard(exportResult)}
                        size="sm"
                        variant="ghost"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <Copy size={14} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={exportResult}
                      readOnly
                      className="bg-white/5 border-white/10 text-white text-xs font-mono resize-none"
                      rows={8}
                    />
                    <Alert className="mt-2 bg-green-500/20 border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-200">
                        Backup file downloaded! Store it in a safe place.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Import Key */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload size={20} className="text-blue-400" />
                  Import Key Backup
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Restore your private key from a backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Upload Backup File</Label>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="bg-white/5 border-white/10 text-white file:bg-white/10 file:border-0 file:text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Or Paste Backup Data</Label>
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your backup JSON here..."
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 text-xs font-mono resize-none"
                    rows={6}
                  />
                </div>

                <div>
                  <Label className="text-white">Backup Password</Label>
                  <div className="relative">
                    <Input
                      type={showImportPassword ? 'text' : 'password'}
                      value={importPassword}
                      onChange={(e) => setImportPassword(e.target.value)}
                      placeholder="Enter backup password..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-0 hover:bg-transparent"
                      onClick={() => setShowImportPassword(!showImportPassword)}
                    >
                      {showImportPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>

                {importError && (
                  <Alert className="bg-red-500/20 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">{importError}</AlertDescription>
                  </Alert>
                )}

                {importResult && (
                  <Alert className="bg-green-500/20 border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">{importResult}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleImportKey}
                  disabled={isImporting || !importData || !importPassword}
                  className="w-full bg-blue-600 hover:bg-blue-500"
                >
                  {isImporting ? (
                    'Restoring Key...'
                  ) : (
                    <>
                      <FileUp size={16} className="mr-2" />
                      Restore Key
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock size={20} />
                Security Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">When Creating Backups:</h4>
                  <ul className="space-y-1">
                    <li>• Use a strong, unique password</li>
                    <li>• Store backup files in multiple secure locations</li>
                    <li>• Never share your backup password</li>
                    <li>• Test your backup by restoring it</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">When Restoring Backups:</h4>
                  <ul className="space-y-1">
                    <li>• Only import backups you created</li>
                    <li>• Verify the backup source and integrity</li>
                    <li>• Use the exact password you used for export</li>
                    <li>• Delete backup files after successful restore</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default KeyBackup;

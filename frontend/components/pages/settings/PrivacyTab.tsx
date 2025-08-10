import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Shield, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PrivacyTab() {
  const exportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

  const deleteAccount = () => {
    toast.error('Account deletion is irreversible. Please contact support.');
  };

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardHeader>
          <CardTitle>Privacy Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>End-to-End Encryption</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Active
              </Badge>
            </div>
            
            <div className="p-4 rounded-lg border border-white/20 dark:border-gray-800/20 bg-white/30 dark:bg-gray-900/30">
              <div className="flex items-center space-x-3 mb-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <span>Data Visibility</span>
              </div>
              <Badge variant="secondary">Zero Knowledge</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download a copy of all your data including files, sharing history, and account information.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
        <CardHeader>
          <CardTitle>Account Deletion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Account deletion is permanent and cannot be undone. 
              All your files, shares, and account data will be permanently deleted.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={deleteAccount}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
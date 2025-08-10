import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Lock, Eye, EyeOff, Smartphone, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RECENT_SESSIONS, ACTIVITY_LOG } from './constants';

interface SecurityTabProps {
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: string;
    encryptionLevel: string;
  };
  setSecurity: (security: any) => void;
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordForm: (form: any) => void;
}

export function SecurityTab({ security, setSecurity, passwordForm, setPasswordForm }: SecurityTabProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleTwoFactorToggle = () => {
    setSecurity((prev: any) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
    toast.success(security.twoFactorEnabled ? '2FA disabled' : '2FA enabled');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handlePasswordChange}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-white/20 dark:border-gray-800/20">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <div>
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <Switch
                checked={security.twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
              />
            </div>
            
            {security.twoFactorEnabled && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  2FA is enabled. Use your authenticator app to log in.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_SESSIONS.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.current ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        Current
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ACTIVITY_LOG.map((activity, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-gray-600 dark:text-gray-400">{activity.ip}</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
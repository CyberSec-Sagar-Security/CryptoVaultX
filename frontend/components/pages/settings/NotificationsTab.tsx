import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Bell, Mail, Smartphone, Shield, BarChart3 } from 'lucide-react';

interface NotificationsTabProps {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    shareNotifications: boolean;
    securityAlerts: boolean;
    weeklyReports: boolean;
  };
  setNotifications: (notifications: any) => void;
}

export function NotificationsTab({ notifications, setNotifications }: NotificationsTabProps) {
  const notificationSettings = [
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail
    },
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Receive push notifications on your devices',
      icon: Bell
    },
    {
      key: 'shareNotifications',
      title: 'Share Notifications',
      description: 'Get notified when files are shared with you',
      icon: Smartphone
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security-related notifications',
      icon: Shield
    },
    {
      key: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Receive weekly usage and activity reports',
      icon: BarChart3
    }
  ];

  const handleToggle = (key: string) => {
    setNotifications((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card className="backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800/20">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationSettings.map((setting) => {
          const Icon = setting.icon;
          return (
            <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg border border-white/20 dark:border-gray-800/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                  <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label>{setting.title}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications[setting.key as keyof typeof notifications]}
                onCheckedChange={() => handleToggle(setting.key)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
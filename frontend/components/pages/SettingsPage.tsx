import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Shield } from 'lucide-react';
import { ProfileTab } from './settings/ProfileTab';
import { SecurityTab } from './settings/SecurityTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { StorageTab } from './settings/StorageTab';
import { PrivacyTab } from './settings/PrivacyTab';
import { 
  INITIAL_PROFILE, 
  INITIAL_SECURITY, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_PASSWORD_FORM 
} from './settings/constants';

export function SettingsPage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [security, setSecurity] = useState(INITIAL_SECURITY);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account, security, and preferences
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <Shield className="h-3 w-3 mr-1" />
          Account Verified
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab profile={profile} setProfile={setProfile} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab 
            security={security} 
            setSecurity={setSecurity}
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab 
            notifications={notifications} 
            setNotifications={setNotifications} 
          />
        </TabsContent>

        <TabsContent value="storage">
          <StorageTab />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
export const RECENT_SESSIONS = [
  { device: 'MacBook Pro', location: 'San Francisco, CA', lastActive: '2 minutes ago', current: true },
  { device: 'iPhone 14', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
  { device: 'Chrome on Windows', location: 'New York, NY', lastActive: '3 days ago', current: false }
];

export const ACTIVITY_LOG = [
  { action: 'Password changed', time: '2 hours ago', ip: '192.168.1.1' },
  { action: '2FA enabled', time: '1 day ago', ip: '192.168.1.1' },
  { action: 'New device login', time: '3 days ago', ip: '203.0.113.1' },
  { action: 'Profile updated', time: '1 week ago', ip: '192.168.1.1' }
];

export const SECURITY_METRICS = [
  { title: 'Encrypted Files', value: '100%', icon: 'Shield', color: 'text-green-600' },
  { title: 'Active Sessions', value: '3', icon: 'Activity', color: 'text-blue-600' },
  { title: '2FA Enabled', value: 'Yes', icon: 'Shield', color: 'text-purple-600' },
  { title: 'Last Backup', value: '2h ago', icon: 'Calendar', color: 'text-orange-600' }
];

export const INITIAL_PROFILE = {
  name: 'John Doe',
  email: 'john.doe@company.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'Senior Product Manager'
};

export const INITIAL_SECURITY = {
  twoFactorEnabled: true,
  loginNotifications: true,
  sessionTimeout: '30',
  encryptionLevel: 'AES-256'
};

export const INITIAL_NOTIFICATIONS = {
  emailNotifications: true,
  pushNotifications: true,
  shareNotifications: true,
  securityAlerts: true,
  weeklyReports: false
};

export const INITIAL_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};
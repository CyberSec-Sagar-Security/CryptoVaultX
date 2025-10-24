import React from 'react';
import { Share2, HelpCircle } from 'lucide-react';

/**
 * NavLinks Component
 * Provides additional navigation links for the application
 * Can be imported into the main layout/navbar to add new routes
 * without modifying existing components
 */
const NavLinks = [
  {
    id: 'shared',
    label: 'Shared',
    icon: Share2,
    path: '/shared',
    description: 'View and manage shared files'
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    path: '/help/faq',
    description: 'Get help and frequently asked questions'
  }
];

export default NavLinks;

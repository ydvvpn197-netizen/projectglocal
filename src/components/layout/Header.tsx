/**
 * Header Component - Now uses ConsolidatedHeader
 * This file maintains backward compatibility while using the consolidated implementation
 */

import React from 'react';
import { ConsolidatedHeader } from './ConsolidatedHeader';

interface HeaderProps {
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showNavigation?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'glass';
}

export const Header: React.FC<HeaderProps> = (props) => {
  return <ConsolidatedHeader {...props} />;
};
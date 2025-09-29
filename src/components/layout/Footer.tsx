/**
 * Footer Component - Now uses ConsolidatedFooter
 * This file maintains backward compatibility while using the consolidated implementation
 */

import React from 'react';
import { ConsolidatedFooter } from './ConsolidatedFooter';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = (props) => {
  return <ConsolidatedFooter {...props} />;
};
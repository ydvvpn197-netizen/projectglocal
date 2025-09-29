/**
 * Consolidated Footer Component
 * Unified footer that combines features from all existing footer components
 * Supports different variants: default, minimal, admin
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Mail, MapPin, Phone, Clock, Shield, Users, Calendar, Newspaper, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConsolidatedFooterProps {
  variant?: 'default' | 'minimal' | 'admin';
  showNewsletter?: boolean;
  showSocialLinks?: boolean;
  showContactInfo?: boolean;
  showQuickLinks?: boolean;
  showLegalLinks?: boolean;
  showAdminLinks?: boolean;
  className?: string;
}

export const ConsolidatedFooter: React.FC<ConsolidatedFooterProps> = ({
  variant = 'default',
  showNewsletter = true,
  showSocialLinks = true,
  showContactInfo = true,
  showQuickLinks = true,
  showLegalLinks = true,
  showAdminLinks = false,
  className
}) => {
  const currentYear = new Date().getFullYear();

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-background/50 border-t border-border/30';
      case 'admin':
        return 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-t border-red-200 dark:border-red-800';
      default:
        return 'bg-background border-t border-border';
    }
  };

  const quickLinks = [
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Chat', href: '/chat', icon: MessageSquare },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Data Protection', href: '/data-protection' },
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', href: '/admin', icon: Shield },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Content Moderation', href: '/admin/moderation', icon: Shield },
  ];

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com', icon: Github },
    { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { label: 'Email', href: 'mailto:contact@theglocal.in', icon: Mail },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription submitted');
  };

  return (
    <footer className={cn(
      'w-full transition-all duration-200',
      getVariantStyles(),
      className
    )}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="TheGlocal Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">
                {variant === 'admin' ? 'TheGlocal Admin' : 'TheGlocal'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {variant === 'admin' 
                ? 'Administrative panel for community management and moderation.'
                : 'Your local community platform for news, events, and civic engagement.'
              }
            </p>
            
            {/* Social Links */}
            {showSocialLinks && (
              <div className="flex space-x-4">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.label}
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <a 
                        href={link.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={link.label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {showQuickLinks && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                {variant === 'admin' ? 'Admin Tools' : 'Quick Links'}
              </h3>
              <ul className="space-y-2">
                {(variant === 'admin' ? adminLinks : quickLinks).map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {showContactInfo && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Local Community Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@theglocal.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Community Support</span>
                </div>
              </div>
            </div>
          )}

          {/* Newsletter */}
          {showNewsletter && variant !== 'admin' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest community news and events delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                />
                <Button type="submit" size="sm" className="w-full">
                  Subscribe
                </Button>
              </form>
            </div>
          )}

          {/* Admin Status */}
          {variant === 'admin' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Server Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <Badge variant="outline">
                    1,234
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© {currentYear} TheGlocal. All rights reserved.</span>
              {variant === 'admin' && (
                <Badge variant="destructive" className="text-xs">
                  Admin Mode
                </Badge>
              )}
            </div>
            
            {/* Legal Links */}
            {showLegalLinks && (
              <div className="flex flex-wrap items-center space-x-4 text-sm">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Made with Love */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>for local communities</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

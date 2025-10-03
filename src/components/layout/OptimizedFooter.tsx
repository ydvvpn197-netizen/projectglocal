import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Shield,
  Scale,
  Users,
  Globe
} from 'lucide-react';

interface OptimizedFooterProps {
  className?: string;
  showNewsletter?: boolean;
  showSocialLinks?: boolean;
  showContactInfo?: boolean;
  showQuickLinks?: boolean;
  showLegalLinks?: boolean;
}

export const OptimizedFooter = memo<OptimizedFooterProps>(({
  className,
  showNewsletter = true,
  showSocialLinks = true,
  showContactInfo = true,
  showQuickLinks = true,
  showLegalLinks = true
}) => {
  const quickLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Community Guidelines', href: '/guidelines' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Help Center', href: '/help' },
    { label: 'Contact', href: '/contact' }
  ];

  const features = [
    { label: 'Public Square', href: '/public-square', icon: Globe },
    { label: 'Legal Assistant', href: '/legal-assistant', icon: Scale },
    { label: 'Community Polls', href: '/polls', icon: Users },
    { label: 'Privacy First', href: '/privacy', icon: Shield }
  ];

  const socialLinks = [
    { label: 'Facebook', href: '#', icon: Facebook },
    { label: 'Twitter', href: '#', icon: Twitter },
    { label: 'Instagram', href: '#', icon: Instagram },
    { label: 'LinkedIn', href: '#', icon: Linkedin }
  ];

  return (
    <footer className={cn('bg-muted/50 border-t border-border', className)}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="TheGlocal" className="h-8 w-8" />
              <span className="text-lg font-semibold">TheGlocal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A privacy-first digital public square for local communities. 
              Connect, engage, and build your community with complete anonymity and transparency.
            </p>
            {showSocialLinks && (
              <div className="flex space-x-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Button key={social.label} variant="ghost" size="sm" asChild>
                      <Link to={social.href} className="h-8 w-8 p-0">
                        <Icon className="h-4 w-4" />
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Features</h3>
            <ul className="space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.label}>
                    <Link 
                      to={feature.href} 
                      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{feature.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          {showQuickLinks && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          {showNewsletter && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest community updates and local news.
              </p>
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="h-9"
                />
                <Button size="sm" className="w-full">
                  Subscribe
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© 2024 TheGlocal. Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for local communities.</span>
            </div>
            
            {showLegalLinks && (
              <div className="flex space-x-4 text-sm">
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
                <Link to="/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookies
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
});

OptimizedFooter.displayName = 'OptimizedFooter';

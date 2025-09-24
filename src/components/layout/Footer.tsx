import React from 'react';
import { Heart, Github, Twitter, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("bg-background border-t border-border py-6", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="TheGlocal Logo" 
                className="h-6 w-6 object-contain"
              />
              <h3 className="text-lg font-semibold">TheGlocal</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting local communities through technology, privacy, and engagement.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Community Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/communities" className="text-muted-foreground hover:text-foreground transition-colors">
                  Local Communities
                </a>
              </li>
              <li>
                <a href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </a>
              </li>
              <li>
                <a href="/news" className="text-muted-foreground hover:text-foreground transition-colors">
                  Local News
                </a>
              </li>
              <li>
                <a href="/polls" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community Polls
                </a>
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/book-artist" className="text-muted-foreground hover:text-foreground transition-colors">
                  Artist Booking
                </a>
              </li>
              <li>
                <a href="/legal-assistant" className="text-muted-foreground hover:text-foreground transition-colors">
                  Legal Assistant
                </a>
              </li>
              <li>
                <a href="/life-wish" className="text-muted-foreground hover:text-foreground transition-colors">
                  Life Wishes
                </a>
              </li>
              <li>
                <a href="/civic-engagement" className="text-muted-foreground hover:text-foreground transition-colors">
                  Civic Engagement
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 TheGlocal. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for local communities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

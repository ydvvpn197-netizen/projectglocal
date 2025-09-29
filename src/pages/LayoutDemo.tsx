/**
 * Layout Demo Page
 * Showcases the new responsive layout system
 */

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLayout } from '@/components/layout/PageLayout';
import { CardLayout } from '@/components/layout/CardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Users, 
  Calendar, 
  Music, 
  MessageSquare, 
  Newspaper,
  Settings,
  Star,
  Heart,
  Share2,
  Eye
} from 'lucide-react';

const LayoutDemo: React.FC = () => {
  return (
    <MainLayout>
      <PageLayout
        title="Layout System Demo"
        description="Professional responsive layout with header, sidebar, and footer"
        actions={
          <Button>
            <Star className="h-4 w-4 mr-2" />
            Get Started
          </Button>
        }
      >
        {/* Layout Overview */}
        <div className="space-y-8">
          <CardLayout
            title="Layout Components"
            description="Professional layout system with responsive design"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Header</h3>
                    <p className="text-sm text-muted-foreground">Top navigation</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Responsive header with search, notifications, and user menu
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sidebar</h3>
                    <p className="text-sm text-muted-foreground">Collapsible navigation</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Collapsible sidebar with navigation items and user info
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Newspaper className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Footer</h3>
                    <p className="text-sm text-muted-foreground">Bottom content</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comprehensive footer with links and information
                </p>
              </div>
            </div>
          </CardLayout>

          {/* Features Grid */}
          <CardLayout
            title="Features"
            description="Key features of the layout system"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Responsive Design</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Mobile-first approach
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Tablet and desktop optimized
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Touch-friendly interactions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Adaptive breakpoints
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Professional UI</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Clean, modern design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Consistent spacing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Smooth animations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Accessibility focused
                  </li>
                </ul>
              </div>
            </div>
          </CardLayout>

          {/* Sample Content */}
          <CardLayout
            title="Sample Content"
            description="Example of how content looks in the layout"
          >
            <div className="space-y-6">
              {/* Sample Post */}
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">John Doe</h4>
                      <Badge variant="secondary">Verified</Badge>
                      <span className="text-sm text-muted-foreground">2h ago</span>
                    </div>
                    <p className="text-sm">
                      This is a sample post showing how content looks in our new layout system. 
                      The design is clean, responsive, and professional.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>24</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span>8</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>142</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Event */}
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Community Music Night</h4>
                      <Badge variant="outline">Event</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Join us for an evening of local music and community bonding. 
                      Featuring local artists and food vendors.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">📅 Dec 15, 2024</span>
                      <span className="text-muted-foreground">📍 Community Center</span>
                      <span className="text-muted-foreground">🎵 Music</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardLayout>

          {/* Navigation Demo */}
          <CardLayout
            title="Navigation Items"
            description="Available navigation options in the sidebar"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Home, label: 'Home', href: '/feed' },
                { icon: Users, label: 'Communities', href: '/communities' },
                { icon: Calendar, label: 'Events', href: '/events' },
                { icon: Music, label: 'Artists', href: '/book-artist' },
                { icon: MessageSquare, label: 'Messages', href: '/messages' },
                { icon: Newspaper, label: 'News', href: '/news' },
                { icon: Settings, label: 'Settings', href: '/settings' },
                { icon: Star, label: 'Analytics', href: '/analytics' }
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </CardLayout>
        </div>
      </PageLayout>
    </MainLayout>
  );
};

export default LayoutDemo;
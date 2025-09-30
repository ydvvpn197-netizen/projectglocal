/**
 * @internal Test/Demo page
 * This page is for testing and demonstration purposes.
 * Should be moved to /dev route behind feature flag.
 * Not for production use.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UnifiedButton } from '@/design-system';
import { UnifiedSearchInterface } from '@/components/search/UnifiedSearchInterface';
import { AdvancedSearchInterface } from '@/components/search/AdvancedSearchInterface';
import { LiveCollaboration } from '@/components/realtime/LiveCollaboration';
import { SearchResult } from '@/services/AdvancedSearchService';
import { 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  Code,
  Palette,
  Database
} from 'lucide-react';

export const EnhancedSearchDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('unified');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [collaborationSession, setCollaborationSession] = useState<string | null>(null);

  const demos = [
    {
      id: 'unified',
      title: 'Unified Search & Collaboration',
      description: 'Complete search experience with real-time collaboration',
      icon: <Search className="h-5 w-5" />,
      component: (
        <UnifiedSearchInterface
          onResultsChange={setSearchResults}
          initialQuery="community events"
        />
      )
    },
    {
      id: 'search',
      title: 'Advanced Search Only',
      description: 'Powerful search with filters, sorting, and analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      component: (
        <AdvancedSearchInterface
          onResultsChange={setSearchResults}
          initialQuery="local businesses"
        />
      )
    },
    {
      id: 'collaboration',
      title: 'Live Collaboration',
      description: 'Real-time document collaboration and chat',
      icon: <MessageSquare className="h-5 w-5" />,
      component: (
        <LiveCollaboration
          sessionId={collaborationSession || 'demo-session'}
          documentId="demo-document"
          onDocumentChange={(content) => console.log('Document changed:', content)}
        />
      )
    }
  ];

  const features = [
    {
      title: 'Design System Consistency',
      description: 'Unified button components with consistent styling',
      icon: <Palette className="h-6 w-6" />,
      benefits: [
        'Single source of truth for all button styles',
        'Context-specific variants (event, community, trending)',
        'Consistent spacing and typography',
        'Design tokens for maintainability'
      ]
    },
    {
      title: 'Advanced Search Implementation',
      description: 'Full-text search with filters, sorting, and analytics',
      icon: <Search className="h-6 w-6" />,
      benefits: [
        'Universal search across all content types',
        'Advanced filtering and sorting options',
        'Search analytics and suggestions',
        'Real-time search performance metrics'
      ]
    },
    {
      title: 'Real-time Features',
      description: 'WebSocket connections, notifications, and live collaboration',
      icon: <Zap className="h-6 w-6" />,
      benefits: [
        'Live collaboration on documents',
        'Real-time typing indicators',
        'Presence tracking and notifications',
        'WebSocket-based real-time updates'
      ]
    },
    {
      title: 'Enhanced User Experience',
      description: 'Improved interface with better performance and usability',
      icon: <Globe className="h-6 w-6" />,
      benefits: [
        'Responsive design across all devices',
        'Optimized search performance',
        'Intuitive user interface',
        'Accessibility improvements'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Enhanced Search & Collaboration Demo</h1>
              <p className="text-muted-foreground mt-2">
                Experience the new unified search system with real-time collaboration features
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Privacy First</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Community Driven</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Interactive Demos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={setActiveDemo}>
              <TabsList className="grid w-full grid-cols-3">
                {demos.map((demo) => (
                  <TabsTrigger key={demo.id} value={demo.id} className="flex items-center space-x-2">
                    {demo.icon}
                    <span>{demo.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {demos.map((demo) => (
                <TabsContent key={demo.id} value={demo.id} className="mt-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">{demo.title}</h3>
                      <p className="text-muted-foreground">{demo.description}</p>
                    </div>
                    {demo.component}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {feature.icon}
                  <span>{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Technical Implementation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Design System</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• UnifiedButton component</li>
                  <li>• Design tokens system</li>
                  <li>• Consistent spacing</li>
                  <li>• Context-specific variants</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Search Engine</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AdvancedSearchService</li>
                  <li>• Full-text search indexes</li>
                  <li>• Search analytics tracking</li>
                  <li>• Suggestion system</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Real-time Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• EnhancedRealtimeService</li>
                  <li>• WebSocket connections</li>
                  <li>• Live collaboration</li>
                  <li>• Presence tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <UnifiedButton
            variant="primary"
            size="lg"
            onClick={() => setActiveDemo('unified')}
          >
            <Search className="h-4 w-4 mr-2" />
            Try Unified Search
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="lg"
            onClick={() => setCollaborationSession(`demo-${Date.now()}`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Collaboration
          </UnifiedButton>
          <UnifiedButton
            variant="secondary"
            size="lg"
            onClick={() => setActiveDemo('search')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </UnifiedButton>
        </div>
      </div>
    </div>
  );
};

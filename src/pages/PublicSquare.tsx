import React, { useState } from 'react';
import { ResponsiveLayout } from '../components/ResponsiveLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Newspaper, 
  Vote, 
  Megaphone, 
  Users, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Building2,
  MessageSquare,
  Share2,
  Heart,
  Eye,
  BarChart3,
  Activity,
  Globe,
  Shield,
  Zap,
  Target,
  Award,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Plus,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import PublicSquareNews from '../components/PublicSquareNews';
import CommunityPolls from '../components/CommunityPolls';
import VirtualProtests from '../components/VirtualProtests';
import CommunityEvents from '../components/CommunityEvents';
import ServiceProviders from '../components/ServiceProviders';

const PublicSquare: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'polls' | 'protests' | 'events' | 'providers' | 'overview'>('overview');

  const PublicSquareOverview = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Digital Public Square
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your community's digital gathering place. Stay informed, voice your opinions, 
          and connect with local authorities to build a better community together.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Badge variant="outline" className="flex items-center gap-1">
            <Newspaper className="h-3 w-3" />
            AI-Summarized News
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Vote className="h-3 w-3" />
            Community Polls
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Megaphone className="h-3 w-3" />
            Virtual Protests
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Government Tagging
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Newspaper className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">News Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Vote className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Active Polls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Megaphone className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Active Protests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2,456</p>
                <p className="text-sm text-muted-foreground">Community Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Newspaper className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Local News Hub</CardTitle>
            </div>
            <CardDescription>
              Stay informed with AI-summarized local news and engage in community discussions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Real-time news updates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                AI-powered summaries
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Community discussions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Government tagging
              </li>
            </ul>
            <Button 
              className="w-full mt-4" 
              onClick={() => setActiveTab('news')}
            >
              Explore News
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Vote className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Community Polls</CardTitle>
            </div>
            <CardDescription>
              Voice your opinion on local issues and participate in community decision-making
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Create and vote on polls
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Real-time results
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Government notifications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Community discussions
              </li>
            </ul>
            <Button 
              className="w-full mt-4" 
              onClick={() => setActiveTab('polls')}
            >
              View Polls
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Megaphone className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg">Virtual Protests</CardTitle>
            </div>
            <CardDescription>
              Raise your voice for community issues and demand accountability from authorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Start virtual protests
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Digital signatures
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Community support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Authority notifications
              </li>
            </ul>
            <Button 
              className="w-full mt-4" 
              onClick={() => setActiveTab('protests')}
            >
              Join Protests
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Community Activity
          </CardTitle>
          <CardDescription>
            Latest updates from your digital public square
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Newspaper className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New infrastructure article published</p>
                <p className="text-xs text-muted-foreground">Municipal Corporation announces new road construction project</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">Infrastructure</Badge>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Vote className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New poll created: "Should we build a new park?"</p>
                <p className="text-xs text-muted-foreground">Community is voting on the proposed park construction</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">Environment</Badge>
                  <span className="text-xs text-muted-foreground">4 hours ago</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 bg-red-100 rounded-lg">
                <Megaphone className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Virtual protest started: "Fix our broken streetlights"</p>
                <p className="text-xs text-muted-foreground">Residents demand immediate action on streetlight repairs</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">Infrastructure</Badge>
                  <span className="text-xs text-muted-foreground">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Community Guidelines
          </CardTitle>
          <CardDescription>
            Help us maintain a respectful and productive public square
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Do</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Respect different opinions and perspectives</li>
                <li>• Provide constructive feedback and suggestions</li>
                <li>• Tag relevant authorities for important issues</li>
                <li>• Share factual information and sources</li>
                <li>• Engage in civil discussions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">❌ Don't</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Post spam, misinformation, or fake news</li>
                <li>• Use offensive language or personal attacks</li>
                <li>• Share private information without consent</li>
                <li>• Create multiple accounts to manipulate votes</li>
                <li>• Ignore community moderation guidelines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Polls
            </TabsTrigger>
            <TabsTrigger value="protests" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Protests
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Providers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PublicSquareOverview />
          </TabsContent>

          <TabsContent value="news">
            <PublicSquareNews />
          </TabsContent>

          <TabsContent value="polls">
            <CommunityPolls />
          </TabsContent>

          <TabsContent value="protests">
            <VirtualProtests />
          </TabsContent>

          <TabsContent value="events">
            <CommunityEvents />
          </TabsContent>

          <TabsContent value="providers">
            <ServiceProviders />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default PublicSquare;

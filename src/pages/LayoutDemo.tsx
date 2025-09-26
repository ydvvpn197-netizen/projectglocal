import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layout, 
  Sidebar as SidebarIcon, 
  Monitor, 
  Smartphone, 
  Tablet,
  Settings,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react';

const LayoutDemo = () => {
  const [activeLayout, setActiveLayout] = useState<'main' | 'sidebar' | 'full' | 'minimal'>('main');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  const layoutOptions = [
    { value: 'main', label: 'Main Layout', description: 'Full layout with header, sidebar, and footer' },
    { value: 'sidebar', label: 'Sidebar Layout', description: 'Layout with collapsible sidebar' },
    { value: 'full', label: 'Full Layout', description: 'Full-width layout without sidebar' },
    { value: 'minimal', label: 'Minimal Layout', description: 'Minimal layout for auth pages' },
  ];

  const demoContent = (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Layout System Demo</h1>
          <p className="text-muted-foreground">
            Explore different layout configurations and responsive behavior
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Layout className="w-4 h-4 mr-2" />
          {activeLayout.charAt(0).toUpperCase() + activeLayout.slice(1)} Layout
        </Badge>
      </div>

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Configuration</CardTitle>
              <CardDescription>
                Adjust layout settings to see real-time changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {layoutOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={activeLayout === option.value ? "default" : "outline"}
                    onClick={() => setActiveLayout(option.value as 'main' | 'sidebar' | 'mobile')}
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sidebar"
                    checked={showSidebar}
                    onChange={(e) => setShowSidebar(e.target.checked)}
                  />
                  <label htmlFor="sidebar" className="text-sm">Show Sidebar</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="header"
                    checked={showHeader}
                    onChange={(e) => setShowHeader(e.target.checked)}
                  />
                  <label htmlFor="header" className="text-sm">Show Header</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="footer"
                    checked={showFooter}
                    onChange={(e) => setShowFooter(e.target.checked)}
                  />
                  <label htmlFor="footer" className="text-sm">Show Footer</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect with local communities and discover events happening in your area.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and manage local events, from community gatherings to cultural festivals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time messaging with community members and event organizers.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="responsive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Breakpoints</CardTitle>
              <CardDescription>
                The layout system adapts to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Smartphone className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="font-semibold">Mobile</div>
                    <div className="text-sm text-muted-foreground">&lt; 768px</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Tablet className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-semibold">Tablet</div>
                    <div className="text-sm text-muted-foreground">768px - 1024px</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Monitor className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="font-semibold">Desktop</div>
                    <div className="text-sm text-muted-foreground">&gt; 1024px</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Examples</CardTitle>
              <CardDescription>
                Common layout patterns used throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Dashboard Pages</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">layout="main"</code> for dashboard and content pages
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Chat Pages</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">layout="sidebar"</code> for chat and messaging interfaces
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Auth Pages</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">layout="minimal"</code> for sign-in and registration pages
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Landing Pages</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">layout="full"</code> for marketing and landing pages
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <MainLayout
      layout={activeLayout}
      showSidebar={showSidebar}
      showHeader={showHeader}
      showFooter={showFooter}
    >
      {demoContent}
    </MainLayout>
  );
};

export default LayoutDemo;

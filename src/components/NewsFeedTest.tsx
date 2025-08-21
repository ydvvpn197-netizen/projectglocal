import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';

const NewsFeedTest: React.FC = () => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [testCategory, setTestCategory] = useState('');
  const { location } = useLocation();
  const { toast } = useToast();

  const createTestNews = () => {
    if (!testCategory.trim()) return;
    
    const mockNewsItems = [
      {
        id: `test-${Date.now()}-1`,
        title: `Breaking: ${testCategory} News Update`,
        summary: `Important update in the ${testCategory} sector affecting local community.`,
        category: testCategory.toLowerCase(),
        location: location ? `${location.lat}, ${location.lng}` : 'Global',
        published_at: new Date().toISOString(),
      }
    ];

    setNewsItems(prev => [...mockNewsItems, ...prev]);
    setTestCategory('');
    
    toast({
      title: "Success",
      description: `Created test news for ${testCategory}`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>News Feed Test Component</CardTitle>
          <CardDescription>Test component for news functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter news category"
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createTestNews}>Add Test News</Button>
          </div>
          
          <div className="space-y-4">
            {newsItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsFeedTest;
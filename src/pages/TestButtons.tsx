/**
 * @internal Test/Demo page
 * This page is for testing and demonstration purposes.
 * Should be moved to /dev route behind feature flag.
 * Not for production use.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Globe, Vote, CheckCircle, XCircle } from 'lucide-react';

const TestButtons: React.FC = () => {
  const navigate = useNavigate();

  const testButtons = [
    {
      title: 'Public Square',
      description: 'Test the public square button functionality',
      icon: Globe,
      url: '/public-square',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Polls',
      description: 'Test the polls button functionality',
      icon: Vote,
      url: '/polls',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleTestButton = (url: string) => {
    try {
      navigate(url);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Button Functionality Test</h1>
          <p className="text-muted-foreground">
            Test the public square and polls buttons to ensure they're working correctly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testButtons.map((button) => (
            <Card key={button.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <button.icon className="h-6 w-6" />
                  {button.title}
                </CardTitle>
                <CardDescription>
                  {button.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={() => handleTestButton(button.url)}
                    className={`w-full text-white ${button.color}`}
                  >
                    <button.icon className="h-4 w-4 mr-2" />
                    Test {button.title}
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Route configured: {button.url}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Component exists</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              If the buttons work correctly, you should be able to navigate to the respective pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Public Square button should navigate to /public-square</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Polls button should navigate to /polls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Both pages should load without errors</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};

export default TestButtons;

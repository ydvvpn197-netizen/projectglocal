import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  Brain, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Zap,
  Database,
  Globe,
  Bot
} from 'lucide-react';
import { AIIntegrationService } from '@/services/aiIntegrationService';
import { EnhancedNewsSummarizationService } from '@/services/enhancedNewsSummarizationService';

export const AIConfiguration: React.FC = () => {
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; error?: string }>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const { toast } = useToast();

  const aiService = AIIntegrationService.getInstance();
  const summarizationService = EnhancedNewsSummarizationService.getInstance();

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const loadConfiguration = () => {
    const providers = aiService.getAvailableProviders();
    const current = aiService.getCurrentProvider();
    
    setAvailableProviders(providers);
    setCurrentProvider(current);
    setFallbackEnabled(true); // Default to enabled
  };

  const handleProviderChange = async (provider: string) => {
    try {
      aiService.setProvider(provider);
      setCurrentProvider(provider);
      toast({
        title: 'Success',
        description: `Switched to ${provider} provider`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to switch provider',
        variant: 'destructive'
      });
    }
  };

  const handleTestProvider = async (provider: string) => {
    setTesting(provider);
    try {
      const result = await aiService.testProvider(provider);
      setTestResults(prev => ({ ...prev, [provider]: result }));
      
      if (result.success) {
        toast({
          title: 'Test Successful',
          description: `${provider} provider is working correctly`
        });
      } else {
        toast({
          title: 'Test Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [provider]: { success: false, error: 'Test failed' } 
      }));
      toast({
        title: 'Test Failed',
        description: 'Failed to test provider',
        variant: 'destructive'
      });
    } finally {
      setTesting(null);
    }
  };

  const handleTestAllProviders = async () => {
    for (const provider of availableProviders) {
      await handleTestProvider(provider);
    }
  };

  const handleFallbackToggle = (enabled: boolean) => {
    summarizationService.setFallbackEnabled(enabled);
    setFallbackEnabled(enabled);
    toast({
      title: 'Settings Updated',
      description: `Fallback summarization ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return <Brain className="h-4 w-4" />;
      case 'claude':
        return <Bot className="h-4 w-4" />;
      case 'gemini':
        return <Globe className="h-4 w-4" />;
      case 'huggingface':
        return <Database className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'claude':
        return 'bg-blue-100 text-blue-800';
      case 'gemini':
        return 'bg-purple-100 text-purple-800';
      case 'huggingface':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestResultIcon = (provider: string) => {
    const result = testResults[provider];
    if (!result) return null;
    
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Configuration</h2>
          <p className="text-gray-600">Configure AI providers for news summarization</p>
        </div>
        <Button onClick={handleTestAllProviders} variant="outline">
          <TestTube className="h-4 w-4 mr-2" />
          Test All Providers
        </Button>
      </div>

      {/* Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">AI Provider</Label>
              <Select value={currentProvider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider)}
                        <span className="capitalize">{provider}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="fallback"
                checked={fallbackEnabled}
                onCheckedChange={handleFallbackToggle}
              />
              <Label htmlFor="fallback">Enable Fallback Summarization</Label>
            </div>
          </div>

          {availableProviders.length === 0 && (
            <Alert>
              <AlertDescription>
                No AI providers are configured. Please set up environment variables for at least one AI provider.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProviders.map((provider) => (
              <div key={provider} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProviderIcon(provider)}
                    <span className="font-medium capitalize">{provider}</span>
                  </div>
                  <Badge className={getProviderColor(provider)}>
                    {provider === currentProvider ? 'Active' : 'Available'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex items-center gap-2">
                    {getTestResultIcon(provider)}
                    {testResults[provider]?.success ? (
                      <span className="text-sm text-green-600">Working</span>
                    ) : testResults[provider] ? (
                      <span className="text-sm text-red-600">Error</span>
                    ) : (
                      <span className="text-sm text-gray-600">Not tested</span>
                    )}
                  </div>
                </div>

                {testResults[provider]?.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {testResults[provider].error}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestProvider(provider)}
                  disabled={testing === provider}
                  className="w-full"
                >
                  {testing === provider ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                  ) : (
                    <TestTube className="h-3 w-3 mr-2" />
                  )}
                  Test Provider
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Help */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                To use AI providers, you need to set up the following environment variables in your .env file:
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">OpenAI</h4>
                <div className="text-sm space-y-1">
                  <div><code>VITE_OPENAI_API_KEY</code> - Your OpenAI API key</div>
                  <div><code>VITE_OPENAI_MODEL</code> - Model to use (default: gpt-3.5-turbo)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Anthropic Claude</h4>
                <div className="text-sm space-y-1">
                  <div><code>VITE_ANTHROPIC_API_KEY</code> - Your Anthropic API key</div>
                  <div><code>VITE_ANTHROPIC_MODEL</code> - Model to use (default: claude-3-sonnet-20240229)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Google Gemini</h4>
                <div className="text-sm space-y-1">
                  <div><code>VITE_GOOGLE_API_KEY</code> - Your Google API key</div>
                  <div><code>VITE_GOOGLE_MODEL</code> - Model to use (default: gemini-pro)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Hugging Face</h4>
                <div className="text-sm space-y-1">
                  <div><code>VITE_HUGGINGFACE_API_KEY</code> - Your Hugging Face API key</div>
                  <div><code>VITE_HUGGINGFACE_MODEL</code> - Model to use (default: facebook/bart-large-cnn)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

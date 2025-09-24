import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseStatus } from '@/integrations/supabase/client';
import { supabaseConfig } from '@/config/environment';

/**
 * Configuration Status Component
 * Displays the current status of environment variables and Supabase connection
 */
export const ConfigStatus: React.FC = () => {
  const [status, setStatus] = React.useState(getSupabaseStatus());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    // Wait a bit to simulate checking
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus(getSupabaseStatus());
    setIsRefreshing(false);
  };

  const isConfigured = isSupabaseConfigured();
  const url = supabaseConfig.url;
  const anonKey = supabaseConfig.anonKey;

  const getStatusIcon = () => {
    if (isConfigured) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isConfigured) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>;
    }
    return <Badge variant="destructive">Not Configured</Badge>;
  };

  const getUrlStatus = () => {
    if (!url || url === 'your_supabase_project_url' || url.includes('your_supabase')) {
      return { valid: false, message: 'Invalid or placeholder URL' };
    }
    if (url.startsWith('https://') && url.includes('.supabase.co')) {
      return { valid: true, message: 'Valid Supabase URL' };
    }
    return { valid: false, message: 'Invalid URL format' };
  };

  const getKeyStatus = () => {
    if (!anonKey || anonKey === 'your_supabase_anon_key' || anonKey.includes('your_supabase')) {
      return { valid: false, message: 'Invalid or placeholder key' };
    }
    if (anonKey.startsWith('eyJ') && anonKey.length > 100) {
      return { valid: true, message: 'Valid JWT key format' };
    }
    return { valid: false, message: 'Invalid key format' };
  };

  const urlStatus = getUrlStatus();
  const keyStatus = getKeyStatus();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Configuration Status
        </CardTitle>
        <CardDescription>
          Current status of your environment variables and Supabase connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status:</span>
          {getStatusBadge()}
        </div>

        {/* Supabase URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">VITE_SUPABASE_URL:</span>
            <Badge variant={urlStatus.valid ? "default" : "destructive"}>
              {urlStatus.valid ? "Valid" : "Invalid"}
            </Badge>
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {url || 'Not set'}
          </div>
          {!urlStatus.valid && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4" />
              {urlStatus.message}
            </div>
          )}
        </div>

        {/* Supabase Anon Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">VITE_SUPABASE_ANON_KEY:</span>
            <Badge variant={keyStatus.valid ? "default" : "destructive"}>
              {keyStatus.valid ? "Valid" : "Invalid"}
            </Badge>
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
            {anonKey ? `${anonKey.substring(0, 20)}...` : 'Not set'}
          </div>
          {!keyStatus.valid && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4" />
              {keyStatus.message}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status:</span>
            <Badge variant={status.connected ? "default" : "destructive"}>
              {status.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          {status.error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {status.error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={refreshStatus} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          
          {!isConfigured && (
            <Button 
              onClick={() => {
                const envContent = `# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Copy this to your .env file
# Never commit .env files to version control`;
                
                const blob = new Blob([envContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '.env.example';
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="default"
              size="sm"
            >
              Download .env Template
            </Button>
          )}
        </div>

        {/* Instructions */}
        {!isConfigured && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How to Fix:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root</li>
              <li>Add your Supabase credentials (see template above)</li>
              <li>Restart your development server</li>
              <li>Refresh this page to verify the configuration</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigStatus;

/**
 * @internal Test/Demo page
 * This page is for testing and demonstration purposes.
 * Should be moved to /dev route behind feature flag.
 * Not for production use.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  TestTube, 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Bell, 
  Home, 
  Navigation, 
  Compass, 
  Flag, 
  Hash, 
  AtSign, 
  ExternalLink, 
  BookOpen, 
  Music, 
  Camera, 
  Mic as MicIcon, 
  Coffee, 
  Car, 
  Building, 
  Leaf, 
  Mountain, 
  Globe, 
  UserPlus, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  MessageSquare, 
  Navigation as NavigationIcon, 
  Compass as CompassIcon, 
  Flag as FlagIcon, 
  Hash as HashIcon, 
  AtSign as AtSignIcon, 
  ExternalLink as ExternalLinkIcon, 
  BookOpen as BookOpenIcon, 
  Music as MusicIcon, 
  Camera as CameraIcon, 
  Mic as MicIcon2, 
  Coffee as CoffeeIcon, 
  Car as CarIcon, 
  Building as BuildingIcon, 
  Leaf as LeafIcon, 
  Mountain as MountainIcon, 
  Globe as GlobeIcon, 
  UserPlus as UserPlusIcon, 
  Crown as CrownIcon, 
  Sparkles as SparklesIcon, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  Activity as ActivityIcon, 
  BarChart3 as BarChart3Icon, 
  MessageSquare as MessageSquareIcon, 
  Navigation as NavigationIcon2, 
  Compass as CompassIcon2, 
  Flag as FlagIcon2, 
  Hash as HashIcon2, 
  AtSign as AtSignIcon2, 
  ExternalLink as ExternalLinkIcon2, 
  BookOpen as BookOpenIcon2, 
  Music as MusicIcon2, 
  Camera as CameraIcon2, 
  Mic as MicIcon3, 
  Coffee as CoffeeIcon2, 
  Car as CarIcon2, 
  Building as BuildingIcon2, 
  Leaf as LeafIcon2, 
  Mountain as MountainIcon2, 
  Globe as GlobeIcon2, 
  UserPlus as UserPlusIcon2, 
  Crown as CrownIcon2, 
  Sparkles as SparklesIcon2, 
  TrendingUp as TrendingUpIcon2, 
  TrendingDown as TrendingDownIcon2, 
  Activity as ActivityIcon2, 
  BarChart3 as BarChart3Icon2, 
  MessageSquare as MessageSquareIcon2, 
  Navigation as NavigationIcon3, 
  Compass as CompassIcon3, 
  Flag as FlagIcon3, 
  Hash as HashIcon3, 
  AtSign as AtSignIcon3, 
  ExternalLink as ExternalLinkIcon3, 
  BookOpen as BookOpenIcon3, 
  Music as MusicIcon3, 
  Camera as CameraIcon3, 
  Mic as MicIcon4, 
  Coffee as CoffeeIcon3, 
  Car as CarIcon3, 
  Building as BuildingIcon3, 
  Leaf as LeafIcon3, 
  Mountain as MountainIcon3, 
  Globe as GlobeIcon3, 
  UserPlus as UserPlusIcon3, 
  Crown as CrownIcon3, 
  Sparkles as SparklesIcon3, 
  TrendingUp as TrendingUpIcon3, 
  TrendingDown as TrendingDownIcon3, 
  Activity as ActivityIcon3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: string;
}

interface VoiceTest {
  isRecording: boolean;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  transcript: string;
  confidence: number;
}

interface LayoutTest {
  breakpoint: string;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  viewport: {
    width: number;
    height: number;
  };
}

const ConsolidatedTest: React.FC = () => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'buttons' | 'voice' | 'layout' | 'performance' | 'accessibility'>('buttons');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [voiceTest, setVoiceTest] = useState<VoiceTest>({
    isRecording: false,
    isPlaying: false,
    volume: 50,
    isMuted: false,
    transcript: '',
    confidence: 0
  });
  const [layoutTest, setLayoutTest] = useState<LayoutTest>({
    breakpoint: 'desktop',
    orientation: 'landscape',
    deviceType: 'desktop',
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0
  });
  const [accessibilityScore, setAccessibilityScore] = useState(0);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Update layout test on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint = 'desktop';
      let deviceType = 'desktop';
      
      if (width < 768) {
        breakpoint = 'mobile';
        deviceType = 'mobile';
      } else if (width < 1024) {
        breakpoint = 'tablet';
        deviceType = 'tablet';
      }
      
      setLayoutTest(prev => ({
        ...prev,
        breakpoint,
        deviceType,
        orientation: width > height ? 'landscape' : 'portrait',
        viewport: { width, height }
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock test results
  useEffect(() => {
    const mockResults: TestResult[] = [
      {
        id: '1',
        name: 'Button Click Test',
        status: 'passed',
        duration: 150,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Form Validation Test',
        status: 'passed',
        duration: 200,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        name: 'API Connection Test',
        status: 'failed',
        duration: 500,
        error: 'Connection timeout',
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Database Query Test',
        status: 'pending',
        duration: 0,
        timestamp: new Date().toISOString()
      }
    ];
    
    setTestResults(mockResults);
  }, []);

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    
    try {
      for (let i = 0; i < testResults.length; i++) {
        setTestResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'running' } : result
        ));
        
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTestResults(prev => prev.map((result, index) => 
          index === i ? { 
            ...result, 
            status: Math.random() > 0.2 ? 'passed' : 'failed',
            duration: Math.floor(Math.random() * 500) + 100
          } : result
        ));
        
        setTestProgress(((i + 1) / testResults.length) * 100);
      }
      
      toast({
        title: "Tests Completed",
        description: "All tests have been executed successfully",
      });
    } catch (err) {
      toast({
        title: "Test Error",
        description: "Some tests failed to execute",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setVoiceTest(prev => ({ ...prev, isRecording: true }));
      
      mediaRecorder.ondataavailable = (event) => {
        // Handle audio data
        console.log('Audio data available:', event.data);
      };
      
      mediaRecorder.onstop = () => {
        setVoiceTest(prev => ({ ...prev, isRecording: false }));
        stream.getTracks().forEach(track => track.stop());
      };
      
      toast({
        title: "Recording Started",
        description: "Voice recording is now active",
      });
    } catch (err) {
      toast({
        title: "Recording Error",
        description: "Failed to start voice recording",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && voiceTest.isRecording) {
      mediaRecorderRef.current.stop();
      setVoiceTest(prev => ({ ...prev, isRecording: false }));
      
      // Mock transcript generation
      setTimeout(() => {
        setVoiceTest(prev => ({
          ...prev,
          transcript: "This is a sample transcript of the recorded audio.",
          confidence: 0.85
        }));
      }, 1000);
    }
  };

  const toggleMute = () => {
    setVoiceTest(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const updateVolume = (value: number[]) => {
    setVoiceTest(prev => ({ ...prev, volume: value[0] }));
  };

  const runPerformanceTest = async () => {
    const startTime = performance.now();
    
    // Simulate performance testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    setPerformanceMetrics({
      loadTime,
      renderTime: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      networkLatency: Math.random() * 200
    });
    
    toast({
      title: "Performance Test Complete",
      description: "Performance metrics have been updated",
    });
  };

  const runAccessibilityTest = async () => {
    // Mock accessibility testing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    setAccessibilityScore(score);
    
    toast({
      title: "Accessibility Test Complete",
      description: `Accessibility score: ${score}/100`,
    });
  };

  const renderButtonTests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Button Functionality Tests</CardTitle>
          <CardDescription>Test various button interactions and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={() => toast({ title: "Button Clicked", description: "Primary button clicked successfully" })}>
              Test Click
            </Button>
            <Button variant="outline" onClick={runAllTests} disabled={isRunningTests}>
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Current test execution status and results</CardDescription>
        </CardHeader>
        <CardContent>
          {isRunningTests && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Test Progress</span>
                <span className="text-sm text-gray-600">{Math.round(testProgress)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
          
          <div className="space-y-2">
            {testResults.map(result => (
              <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {result.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  {result.status === 'running' && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  {result.status === 'pending' && <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                  <div>
                    <h4 className="font-medium">{result.name}</h4>
                    {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    result.status === 'passed' ? 'default' :
                    result.status === 'failed' ? 'destructive' :
                    result.status === 'running' ? 'secondary' : 'outline'
                  }>
                    {result.status}
                  </Badge>
                  {result.duration > 0 && (
                    <span className="text-sm text-gray-600">{result.duration}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVoiceTests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Control Testing</CardTitle>
          <CardDescription>Test voice recording, playback, and transcription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={voiceTest.isRecording ? stopVoiceRecording : startVoiceRecording}
              variant={voiceTest.isRecording ? "destructive" : "default"}
            >
              {voiceTest.isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {voiceTest.isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            
            <Button
              onClick={() => setVoiceTest(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
              variant="outline"
            >
              {voiceTest.isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {voiceTest.isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button onClick={toggleMute} variant="outline">
              {voiceTest.isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
              {voiceTest.isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="volume">Volume: {voiceTest.volume}%</Label>
              <Slider
                id="volume"
                value={[voiceTest.volume]}
                onValueChange={updateVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            {voiceTest.transcript && (
              <div>
                <Label>Transcript</Label>
                <Textarea
                  value={voiceTest.transcript}
                  readOnly
                  className="mt-2"
                  rows={3}
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Badge variant="secondary">{Math.round(voiceTest.confidence * 100)}%</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLayoutTests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layout Responsiveness Testing</CardTitle>
          <CardDescription>Test layout behavior across different screen sizes and orientations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current Viewport</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Width:</span>
                  <span className="text-sm font-medium">{layoutTest.viewport.width}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Height:</span>
                  <span className="text-sm font-medium">{layoutTest.viewport.height}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Breakpoint:</span>
                  <Badge variant="outline">{layoutTest.breakpoint}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Device Type:</span>
                  <Badge variant="outline">{layoutTest.deviceType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Orientation:</span>
                  <Badge variant="outline">{layoutTest.orientation}</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Layout Test Grid</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-blue-200 rounded"></div>
                <div className="h-8 bg-green-200 rounded"></div>
                <div className="h-8 bg-purple-200 rounded"></div>
                <div className="h-8 bg-yellow-200 rounded"></div>
                <div className="h-8 bg-red-200 rounded"></div>
                <div className="h-8 bg-indigo-200 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Responsive Test Elements</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Mobile</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Tablet</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Desktop</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Testing</CardTitle>
          <CardDescription>Monitor application performance metrics and benchmarks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={runPerformanceTest}>
              <Zap className="w-4 h-4 mr-2" />
              Run Performance Test
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Load Time</span>
                  <span className="text-sm text-gray-600">{performanceMetrics.loadTime.toFixed(2)}ms</span>
                </div>
                <Progress value={(performanceMetrics.loadTime / 1000) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Render Time</span>
                  <span className="text-sm text-gray-600">{performanceMetrics.renderTime.toFixed(2)}ms</span>
                </div>
                <Progress value={performanceMetrics.renderTime} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-gray-600">{performanceMetrics.memoryUsage.toFixed(2)}%</span>
                </div>
                <Progress value={performanceMetrics.memoryUsage} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-gray-600">{performanceMetrics.cpuUsage.toFixed(2)}%</span>
                </div>
                <Progress value={performanceMetrics.cpuUsage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Network Latency</span>
                  <span className="text-sm text-gray-600">{performanceMetrics.networkLatency.toFixed(2)}ms</span>
                </div>
                <Progress value={(performanceMetrics.networkLatency / 200) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilityTests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Testing</CardTitle>
          <CardDescription>Test accessibility features and compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={runAccessibilityTest}>
              <Target className="w-4 h-4 mr-2" />
              Run Accessibility Test
            </Button>
          </div>
          
          {accessibilityScore > 0 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Accessibility Score</span>
                  <span className="text-sm text-gray-600">{accessibilityScore}/100</span>
                </div>
                <Progress value={accessibilityScore} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Accessibility Checks</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Color contrast ratio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Keyboard navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Screen reader support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Alt text for images</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Recommendations</h4>
                  <div className="space-y-1">
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>
                        Add alt text to images for better screen reader support
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test & Demo Center</h1>
            <p className="text-gray-600">Comprehensive testing tools and demonstrations</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Testing</Badge>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            {renderButtonTests()}
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            {renderVoiceTests()}
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            {renderLayoutTests()}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {renderPerformanceTests()}
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            {renderAccessibilityTests()}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedTest;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Link,
  Navigation,
  Compass,
  Flag,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingDown,
  Activity,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserStar,
  UserHeart,
  UserMessage,
  UserPhone,
  UserMail,
  UserCalendar,
  UserClock,
  UserMap,
  UserHome,
  UserWork,
  UserSchool,
  UserGame,
  UserMusic,
  UserArt,
  UserSport,
  UserFood,
  UserTravel,
  UserTech,
  UserHealth,
  UserFinance,
  UserShopping,
  UserGift,
  UserParty,
  UserSun,
  UserMoon,
  UserCloud,
  UserRain,
  UserSnow,
  UserWind,
  UserDroplet,
  UserThermometer,
  UserEye,
  UserSearch as UserSearchIcon,
  UserFilter,
  UserGrid,
  UserList,
  UserMore,
  UserSettings,
  UserBell,
  UserMail as UserMailIcon,
  UserPhone as UserPhoneIcon,
  UserMap as UserMapIcon,
  UserNavigation,
  UserCompass,
  UserFlag,
  UserTag,
  UserHash,
  UserAtSign,
  UserDollarSign,
  UserCreditCard,
  UserWallet,
  UserPiggyBank,
  UserTrendingDown,
  UserActivity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface VoiceControlPanelProps {
  compact?: boolean;
  className?: string;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Control Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: "Failed to process voice input. Please try again.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        processVoiceCommand(transcript);
      }
    };

    recognition.start();
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Process voice command
  const processVoiceCommand = (command: string) => {
    setIsProcessing(true);
    
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to')) {
      if (lowerCommand.includes('home')) {
        window.location.href = '/';
        toast({ title: "Navigating to Home", description: "Taking you to the home page." });
      } else if (lowerCommand.includes('events')) {
        window.location.href = '/events';
        toast({ title: "Navigating to Events", description: "Taking you to the events page." });
      } else if (lowerCommand.includes('community')) {
        window.location.href = '/communities';
        toast({ title: "Navigating to Community", description: "Taking you to the community page." });
      } else if (lowerCommand.includes('profile')) {
        window.location.href = '/profile';
        toast({ title: "Navigating to Profile", description: "Taking you to your profile." });
      } else if (lowerCommand.includes('settings')) {
        window.location.href = '/settings';
        toast({ title: "Navigating to Settings", description: "Taking you to settings." });
      }
    }
    
    // Search commands
    else if (lowerCommand.includes('search')) {
      const searchTerm = command.replace(/search\s+/i, '');
      // Implement search functionality
      toast({ 
        title: "Voice Search", 
        description: `Searching for: ${searchTerm}` 
      });
    }
    
    // Action commands
    else if (lowerCommand.includes('create') || lowerCommand.includes('new')) {
      if (lowerCommand.includes('post')) {
        window.location.href = '/create-post';
        toast({ title: "Creating Post", description: "Opening post creation form." });
      } else if (lowerCommand.includes('event')) {
        window.location.href = '/create-event';
        toast({ title: "Creating Event", description: "Opening event creation form." });
      }
    }
    
    // Help commands
    else if (lowerCommand.includes('help')) {
      toast({ 
        title: "Voice Commands Help", 
        description: "Try saying: 'Go to home', 'Search for events', 'Create post', or 'Navigate to profile'" 
      });
    }
    
    // Default response
    else {
      toast({ 
        title: "Voice Command", 
        description: `You said: "${command}". Try saying 'help' for available commands.` 
      });
    }
    
    setIsProcessing(false);
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
          className={`w-12 h-12 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          size="icon"
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-blue-500" />
            Voice Control
            {isListening && (
              <Badge className="bg-red-500 text-white animate-pulse">
                Listening
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Use voice commands to navigate and interact with the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
              }`} />
              <span className="text-sm">
                {isListening ? 'Listening...' : 'Ready'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isSupported ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Supported
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Supported
                </Badge>
              )}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              className={`flex-1 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h4 className="text-sm font-medium">Transcript:</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{transcript}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing Indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-blue-600"
              >
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Processing command...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Commands:</h4>
            <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
              <div>• "Go to home" - Navigate to home page</div>
              <div>• "Go to events" - Navigate to events</div>
              <div>• "Go to community" - Navigate to community</div>
              <div>• "Search for [term]" - Search content</div>
              <div>• "Create post" - Create new post</div>
              <div>• "Help" - Show this help</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export { VoiceControlPanel };
export default VoiceControlPanel;

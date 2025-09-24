import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  HelpCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Command,
  ArrowRight
} from 'lucide-react';
import { useVoiceControl, useCommonVoiceCommands } from '@/hooks/useVoiceControl';
import { useToast } from '@/hooks/use-toast';

interface VoiceControlPanelProps {
  className?: string;
  compact?: boolean;
  showCommands?: boolean;
}

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({ 
  className,
  compact = false,
  showCommands = true
}) => {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    confidence,
    error,
    startListening,
    stopListening,
    toggleListening,
    getCommands
  } = useVoiceControl({
    language: 'en-US',
    continuous: true,
    interimResults: true
  });

  // Register common voice commands
  useCommonVoiceCommands();

  const commands = getCommands();

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      toast({
        title: "Voice control enabled",
        description: "You can now use voice commands"
      });
    } else {
      toast({
        title: "Voice control muted",
        description: "Voice commands are temporarily disabled"
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Voice control is not supported in your browser
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant={isListening ? "default" : "outline"}
          size="icon"
          onClick={handleToggleListening}
          disabled={isMuted}
          className={`relative ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'hover:bg-blue-50'
          }`}
        >
          {isListening ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
        
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Listening...</span>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <Card className={`${className} ${isListening ? 'ring-2 ring-red-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Voice Control
            {isListening && (
              <Badge variant="destructive" className="animate-pulse">
                Listening
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main control button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleToggleListening}
            disabled={isMuted}
            className={`w-20 h-20 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isListening ? (
              <Mic className="h-8 w-8" />
            ) : (
              <MicOff className="h-8 w-8" />
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-2">
            {isListening ? 'Click to stop listening' : 'Click to start listening'}
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className={isMuted ? 'text-red-500' : 'text-green-500'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="text-xs text-muted-foreground">
              {isMuted ? 'Muted' : 'Active'}
            </span>
          </div>
          
          {confidence > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16">
                <Progress value={confidence * 100} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Transcript display */}
        <AnimatePresence>
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                {isListening ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {transcript || interimTranscript}
                  </p>
                  {interimTranscript && (
                    <p className="text-xs text-gray-500 mt-1">
                      Processing...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Commands help */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Command className="h-4 w-4" />
                Available Commands
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {commands.map((cmd) => (
                  <div key={cmd.command} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {cmd.description}
                      </p>
                      <p className="text-xs text-blue-700">
                        Try: "{cmd.keywords[0]}"
                      </p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-blue-500" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Voice Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Continuous listening</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Language</span>
                  <Badge variant="outline">English (US)</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Confidence threshold</span>
                  <Badge variant="outline">70%</Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default VoiceControlPanel;

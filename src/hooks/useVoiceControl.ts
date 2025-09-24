import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  keywords: string[];
}

interface VoiceControlOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  timeout?: number;
}

export const useVoiceControl = (options: VoiceControlOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    timeout = 10000
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandsRef = useRef<VoiceCommand[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processCommand(finalTranscript);
      }
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'no-speech':
          toast({
            title: "No speech detected",
            description: "Please try speaking again",
            variant: "destructive"
          });
          break;
        case 'audio-capture':
          toast({
            title: "Microphone not available",
            description: "Please check your microphone permissions",
            variant: "destructive"
          });
          break;
        case 'not-allowed':
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice control",
            variant: "destructive"
          });
          break;
        default:
          toast({
            title: "Voice recognition error",
            description: "Please try again",
            variant: "destructive"
          });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    return recognition;
  }, [isSupported, continuous, interimResults, language, maxAlternatives, toast, processCommand]);

  // Process voice commands
  const processCommand = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of commandsRef.current) {
      const isMatch = command.keywords.some(keyword => 
        normalizedTranscript.includes(keyword.toLowerCase())
      );
      
      if (isMatch) {
        try {
          command.action();
          toast({
            title: "Voice command executed",
            description: `Executed: ${command.description}`,
            duration: 2000
          });
          return;
        } catch (error) {
          console.error('Error executing voice command:', error);
          toast({
            title: "Command failed",
            description: "Failed to execute voice command",
            variant: "destructive"
          });
        }
      }
    }
  }, [toast]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: "Voice control not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
      return;
    }

    if (isListening) return;

    const recognition = initializeRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      
      // Set timeout
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, timeout);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start voice recognition');
    }
  }, [isSupported, isListening, initializeRecognition, timeout, toast, stopListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Register voice commands
  const registerCommand = useCallback((command: VoiceCommand) => {
    commandsRef.current.push(command);
  }, []);

  // Unregister voice commands
  const unregisterCommand = useCallback((commandId: string) => {
    commandsRef.current = commandsRef.current.filter(cmd => cmd.command !== commandId);
  }, []);

  // Clear all commands
  const clearCommands = useCallback(() => {
    commandsRef.current = [];
  }, []);

  // Get available commands
  const getCommands = useCallback(() => {
    return commandsRef.current.map(cmd => ({
      command: cmd.command,
      description: cmd.description,
      keywords: cmd.keywords
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    confidence,
    error,
    startListening,
    stopListening,
    toggleListening,
    registerCommand,
    unregisterCommand,
    clearCommands,
    getCommands
  };
};

// Hook for common voice commands
export const useCommonVoiceCommands = () => {
  const { registerCommand, unregisterCommand } = useVoiceControl();
  const { toast } = useToast();

  useEffect(() => {
    // Navigation commands
    registerCommand({
      command: 'navigate-home',
      description: 'Navigate to home page',
      keywords: ['home', 'go home', 'main page'],
      action: () => {
        window.location.href = '/';
      }
    });

    registerCommand({
      command: 'navigate-feed',
      description: 'Navigate to feed',
      keywords: ['feed', 'posts', 'timeline'],
      action: () => {
        window.location.href = '/feed';
      }
    });

    registerCommand({
      command: 'navigate-events',
      description: 'Navigate to events',
      keywords: ['events', 'calendar', 'upcoming'],
      action: () => {
        window.location.href = '/events';
      }
    });

    registerCommand({
      command: 'navigate-profile',
      description: 'Navigate to profile',
      keywords: ['profile', 'my profile', 'account'],
      action: () => {
        window.location.href = '/profile';
      }
    });

    // Action commands
    registerCommand({
      command: 'create-post',
      description: 'Create a new post',
      keywords: ['create post', 'new post', 'write post'],
      action: () => {
        window.location.href = '/create';
      }
    });

    registerCommand({
      command: 'search',
      description: 'Open search',
      keywords: ['search', 'find', 'look for'],
      action: () => {
        // Focus on search input or open search modal
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    registerCommand({
      command: 'refresh',
      description: 'Refresh the page',
      keywords: ['refresh', 'reload', 'update'],
      action: () => {
        window.location.reload();
      }
    });

    // Utility commands
    registerCommand({
      command: 'help',
      description: 'Show help information',
      keywords: ['help', 'what can you do', 'commands'],
      action: () => {
        toast({
          title: "Voice Commands Available",
          description: "Say 'home', 'feed', 'events', 'profile', 'create post', 'search', or 'refresh'",
          duration: 5000
        });
      }
    });

    registerCommand({
      command: 'stop-listening',
      description: 'Stop voice recognition',
      keywords: ['stop', 'stop listening', 'quiet'],
      action: () => {
        // This will be handled by the voice control hook
      }
    });

    return () => {
      unregisterCommand('navigate-home');
      unregisterCommand('navigate-feed');
      unregisterCommand('navigate-events');
      unregisterCommand('navigate-profile');
      unregisterCommand('create-post');
      unregisterCommand('search');
      unregisterCommand('refresh');
      unregisterCommand('help');
      unregisterCommand('stop-listening');
    };
  }, [registerCommand, unregisterCommand, toast]);
};

export default useVoiceControl;
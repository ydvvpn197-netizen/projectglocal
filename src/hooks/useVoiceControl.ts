import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: Date;
}

interface VoiceControlState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  commands: VoiceCommand[];
  error: string | null;
}

interface VoiceControlActions {
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  clearCommands: () => void;
}

export const useVoiceControl = (): VoiceControlState & VoiceControlActions => {
  const [state, setState] = useState<VoiceControlState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    commands: [],
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;
    
    setState(prev => ({ ...prev, isSupported }));

    if (isSupported && !isInitializedRef.current) {
      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        // Configure recognition settings
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        // Event handlers
        recognition.onstart = () => {
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };

        recognition.onend = () => {
          setState(prev => ({ ...prev, isListening: false }));
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
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

          if (finalTranscript) {
            const newCommand: VoiceCommand = {
              command: finalTranscript.trim(),
              confidence: event.results[event.results.length - 1][0].confidence || 0,
              timestamp: new Date(),
            };

            setState(prev => ({
              ...prev,
              transcript: finalTranscript,
              commands: [...prev.commands, newCommand],
            }));
          } else {
            setState(prev => ({ ...prev, transcript: interimTranscript }));
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          let errorMessage = 'Speech recognition error occurred';
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech was detected';
              break;
            case 'audio-capture':
              errorMessage = 'Audio capture failed';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access denied';
              break;
            case 'network':
              errorMessage = 'Network error occurred';
              break;
            case 'aborted':
              errorMessage = 'Speech recognition aborted';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not allowed';
              break;
            case 'bad-grammar':
              errorMessage = 'Bad grammar in speech';
              break;
            case 'language-not-supported':
              errorMessage = 'Language not supported';
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }

          setState(prev => ({
            ...prev,
            isListening: false,
            error: errorMessage,
          }));
        };

        isInitializedRef.current = true;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Failed to initialize speech recognition',
        }));
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && state.isSupported && !state.isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to start listening',
        }));
      }
    }
  }, [state.isSupported, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to stop listening',
        }));
      }
    }
  }, [state.isListening]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  const clearCommands = useCallback(() => {
    setState(prev => ({ ...prev, commands: [] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && state.isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [state.isListening]);

  return {
    ...state,
    startListening,
    stopListening,
    clearTranscript,
    clearCommands,
  };
};

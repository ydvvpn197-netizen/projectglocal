/**
 * Voice Control Hook
 * Provides voice control functionality
 */

import { useState, useEffect, useCallback } from 'react';

export const useCommonVoiceCommands = () => {
  useEffect(() => {
    // Mock implementation for voice commands
    console.log('Voice commands initialized');
    
    return () => {
      console.log('Voice commands cleaned up');
    };
  }, []);
};

export const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return;
    }

    setIsListening(true);
    setError(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = Array.from(event.results)
        .slice(current)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setTranscript(transcript);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
  };
};

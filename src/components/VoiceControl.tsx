import React, { useState, useEffect, useCallback } from 'react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useToast } from '../hooks/use-toast';
import { Mic, MicOff, X, HelpCircle, History, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface VoiceControlProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ 
  className,
  position = 'bottom-right' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [lastCommandResult, setLastCommandResult] = useState<string | null>(null);

  const {
    isListening,
    isSupported,
    transcript,
    commands,
    error,
    startListening,
    stopListening,
    clearTranscript,
    clearCommands,
  } = useVoiceControl();

  const { processCommand, executeCommand, getAvailableCommands, commandHistory } = useVoiceCommands();
  const { toast } = useToast();

  // Process voice commands when they come in
  useEffect(() => {
    if (commands.length > 0) {
      const lastCommand = commands[commands.length - 1];
      const commandAction = processCommand(lastCommand.command);
      
      if (commandAction) {
        const result = executeCommand(commandAction);
        setLastCommandResult(result.message);
        
        if (result.success) {
          toast({
            title: "Voice Command Executed",
            description: result.message,
            duration: 3000,
          });
        } else {
          toast({
            title: "Voice Command Failed",
            description: result.message,
            variant: "destructive",
            duration: 3000,
          });
        }
      } else {
        setLastCommandResult("Command not recognized. Try saying 'help' for available commands.");
        toast({
          title: "Command Not Recognized",
          description: "Try saying 'help' for available commands",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [commands, processCommand, executeCommand, toast]);

  // Show error toast when voice recognition fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Recognition Error",
        description: error,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [error, toast]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleClearAll = useCallback(() => {
    clearTranscript();
    clearCommands();
    setLastCommandResult(null);
    toast({
      title: "Cleared",
      description: "Voice command history cleared",
      duration: 2000,
    });
  }, [clearTranscript, clearCommands, toast]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  if (!isSupported) {
    return (
      <div className={cn(
        'fixed z-50 p-4 bg-red-100 border border-red-300 rounded-lg shadow-lg',
        positionClasses[position],
        className
      )}>
        <div className="flex items-center gap-2 text-red-700">
          <MicOff className="w-4 h-4" />
          <span className="text-sm font-medium">Voice control not supported</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Voice Control Button */}
      <div className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}>
        <motion.div
          className="relative"
          initial={false}
          animate={isExpanded ? 'expanded' : 'collapsed'}
        >
          {/* Main Microphone Button */}
          <motion.button
            onClick={toggleListening}
            className={cn(
              'relative w-16 h-16 rounded-full shadow-lg border-2 transition-all duration-300',
              'flex items-center justify-center',
              isListening
                ? 'bg-red-500 border-red-600 text-white shadow-red-500/50'
                : 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            
            {/* Listening indicator */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Expand Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-600 text-white',
              'flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Expanded Controls */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Voice Control</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title="Show help"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      title="Show history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                    )} />
                    <span className="text-sm text-gray-600">
                      {isListening ? 'Listening...' : 'Ready'}
                    </span>
                  </div>
                  
                  {transcript && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                      <span className="font-medium">Transcript:</span> {transcript}
                    </div>
                  )}
                </div>

                {/* Help Section */}
                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">Available Commands:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getAvailableCommands().map((cmd, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-gray-800">{cmd.example}</div>
                          <div className="text-gray-600">{cmd.description}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* History Section */}
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">Recent Commands:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {commandHistory.slice(-5).reverse().map((cmd, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {cmd}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Last Command Result */}
                {lastCommandResult && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-1">Last Result:</div>
                    <div className="text-sm text-blue-800">{lastCommandResult}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

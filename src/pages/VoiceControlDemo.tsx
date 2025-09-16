import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Command, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useToast } from '../hooks/use-toast';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

const VoiceControlDemo: React.FC = () => {
  const [showExamples, setShowExamples] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  
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

  const { processCommand, executeCommand, getAvailableCommands } = useVoiceCommands();
  const { toast } = useToast();

  // Process commands when they come in
  React.useEffect(() => {
    if (commands.length > 0) {
      const lastCommand = commands[commands.length - 1];
      const commandAction = processCommand(lastCommand.command);
      
      if (commandAction) {
        const result = executeCommand(commandAction);
        setLastResult(result.message);
        
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
        setLastResult("Command not recognized. Try saying 'help' for available commands.");
        toast({
          title: "Command Not Recognized",
          description: "Try saying 'help' for available commands",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [commands, processCommand, executeCommand, toast]);

  const exampleCommands = [
    "Go to profile",
    "Show community",
    "Search for events",
    "Create post",
    "Book artist",
    "Go home",
    "Help",
    "Scroll up",
    "Refresh page",
  ];

  const commandCategories = [
    {
      title: "Navigation",
      commands: ["Go to profile", "Show community", "Go home", "Go back"],
      icon: <ArrowRight className="w-5 h-5" />,
    },
    {
      title: "Content",
      commands: ["Create post", "Search for events", "Book artist", "Show notifications"],
      icon: <Command className="w-5 h-5" />,
    },
    {
      title: "System",
      commands: ["Help", "Scroll up", "Refresh page", "Clear commands"],
      icon: <Volume2 className="w-5 h-5" />,
    },
  ];

  if (!isSupported) {
    return (
      <ResponsiveLayout showNewsFeed={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MicOff className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Voice Control Not Supported
          </h1>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support the Web Speech API. Please use a modern browser like Chrome, Edge, or Safari.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            <p>Supported browsers:</p>
            <ul className="mt-2 space-y-1">
              <li>• Google Chrome (recommended)</li>
              <li>• Microsoft Edge</li>
              <li>• Safari (macOS)</li>
              <li>• Firefox (limited support)</li>
            </ul>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Voice Control Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience hands-free navigation and control of your application using natural voice commands.
            Simply speak naturally and watch the magic happen!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Voice Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Voice Control</h2>
            </div>

            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  w-4 h-4 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}
                `} />
                <span className="font-medium text-gray-700">
                  {isListening ? 'Listening...' : 'Ready'}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`
                    flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200
                    ${isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    }
                  `}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 inline mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 inline mr-2" />
                      Start Listening
                    </>
                  )}
                </button>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="font-medium text-blue-900 mb-2">Live Transcript:</div>
                  <div className="text-blue-800">{transcript}</div>
                </div>
              )}

              {/* Last Result */}
              {lastResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-medium text-green-900 mb-2">Last Result:</div>
                  <div className="text-green-800">{lastResult}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={clearTranscript}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Transcript
              </button>
              <button
                onClick={clearCommands}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear History
              </button>
            </div>
          </motion.div>

          {/* Commands Guide */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Command className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Available Commands</h2>
            </div>

            {/* Command Categories */}
            <div className="space-y-6">
              {commandCategories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {category.icon}
                    <h3 className="font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{command}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Examples */}
            <div className="mt-6">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="w-full py-3 px-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              >
                {showExamples ? 'Hide' : 'Show'} Quick Examples
              </button>

              {showExamples && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2"
                >
                  {exampleCommands.map((command, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        // Simulate voice command
                        const commandAction = processCommand(command);
                        if (commandAction) {
                          const result = executeCommand(commandAction);
                          setLastResult(result.message);
                          toast({
                            title: "Command Executed",
                            description: result.message,
                            duration: 3000,
                          });
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-500" />
                        <span>"{command}"</span>
                        <span className="text-xs text-gray-400">(Click to test)</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tips for Best Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Speak Clearly</h3>
              <p className="text-gray-600 text-sm">
                Speak at a normal pace with clear pronunciation for better recognition accuracy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Command className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Use Natural Language</h3>
              <p className="text-gray-600 text-sm">
                Speak naturally as you would to another person. The system understands conversational commands.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quiet Environment</h3>
              <p className="text-gray-600 text-sm">
                Minimize background noise for optimal voice recognition performance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </ResponsiveLayout>
  );
};

export default VoiceControlDemo;

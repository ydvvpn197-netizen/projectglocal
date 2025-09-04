import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface VoiceCommandAction {
  action: string;
  params?: Record<string, any>;
  description: string;
}

interface VoiceCommandPattern {
  pattern: RegExp;
  action: string;
  params?: (matches: RegExpMatchArray) => Record<string, any>;
  description: string;
}

export const useVoiceCommands = () => {
  const navigate = useNavigate();
  const commandHistoryRef = useRef<string[]>([]);

  // Define command patterns
  const commandPatterns: VoiceCommandPattern[] = [
    // Navigation commands
    {
      pattern: /^(go to|navigate to|open|show)\s+(.+)$/i,
      action: 'navigate',
      params: (matches) => ({ destination: matches[2].trim() }),
      description: 'Navigate to a page or section',
    },
    {
      pattern: /^(go back|back|previous|return)$/i,
      action: 'navigateBack',
      description: 'Go back to previous page',
    },
    {
      pattern: /^(go home|home|main page)$/i,
      action: 'navigateHome',
      description: 'Go to home page',
    },

    // Profile and user commands
    {
      pattern: /^(show|open|view)\s+(my\s+)?(profile|account|dashboard)$/i,
      action: 'navigate',
      params: () => ({ destination: 'profile' }),
      description: 'Open user profile or dashboard',
    },
    {
      pattern: /^(edit|update|change)\s+(my\s+)?(profile|account|settings)$/i,
      action: 'navigate',
      params: () => ({ destination: 'settings' }),
      description: 'Open settings page',
    },

    // Community and social commands
    {
      pattern: /^(show|open|view)\s+(community|groups|discussions)$/i,
      action: 'navigate',
      params: () => ({ destination: 'community' }),
      description: 'Open community section',
    },
    {
      pattern: /^(create|start|new)\s+(post|discussion|group|event)$/i,
      action: 'navigate',
      params: (matches) => ({ destination: `create-${matches[2]}` }),
      description: 'Create new content',
    },

    // Search and discovery
    {
      pattern: /^(search|find|look for)\s+(.+)$/i,
      action: 'search',
      params: (matches) => ({ query: matches[2].trim() }),
      description: 'Search for content',
    },
    {
      pattern: /^(discover|explore|browse)$/i,
      action: 'navigate',
      params: () => ({ destination: 'discover' }),
      description: 'Open discovery page',
    },

    // Events and activities
    {
      pattern: /^(show|view|list)\s+(events|activities|calendar)$/i,
      action: 'navigate',
      params: () => ({ destination: 'events' }),
      description: 'Show events or activities',
    },
    {
      pattern: /^(book|reserve|schedule)\s+(.+)$/i,
      action: 'book',
      params: (matches) => ({ service: matches[2].trim() }),
      description: 'Book a service or event',
    },

    // Notifications and messages
    {
      pattern: /^(show|open|view)\s+(notifications|messages|inbox)$/i,
      action: 'navigate',
      params: (matches) => ({ destination: matches[2] }),
      description: 'Open notifications or messages',
    },

    // Help and support
    {
      pattern: /^(help|support|assistance|what can you do)$/i,
      action: 'showHelp',
      description: 'Show available voice commands',
    },
    {
      pattern: /^(clear|reset|stop)\s+(listening|commands|transcript)$/i,
      action: 'clear',
      description: 'Clear voice command history',
    },

    // System commands
    {
      pattern: /^(refresh|reload|restart)$/i,
      action: 'refresh',
      description: 'Refresh the current page',
    },
    {
      pattern: /^(scroll|move)\s+(up|down|top|bottom)$/i,
      action: 'scroll',
      params: (matches) => ({ direction: matches[2] }),
      description: 'Scroll the page',
    },
  ];

  // Process voice command and return action
  const processCommand = useCallback((command: string): VoiceCommandAction | null => {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Add to command history
    commandHistoryRef.current.push(normalizedCommand);
    if (commandHistoryRef.current.length > 10) {
      commandHistoryRef.current.shift();
    }

    // Find matching pattern
    for (const pattern of commandPatterns) {
      const matches = normalizedCommand.match(pattern.pattern);
      if (matches) {
        return {
          action: pattern.action,
          params: pattern.params ? pattern.params(matches) : undefined,
          description: pattern.description,
        };
      }
    }

    return null;
  }, []);

  // Execute voice command action
  const executeCommand = useCallback((commandAction: VoiceCommandAction) => {
    const { action, params } = commandAction;

    try {
      switch (action) {
        case 'navigate':
          if (params?.destination) {
            const destination = params.destination.toLowerCase();
            // Map voice destinations to actual routes
            const routeMap: Record<string, string> = {
              'profile': '/profile',
              'dashboard': '/dashboard',
              'settings': '/settings',
              'community': '/community',
              'discover': '/discover',
              'events': '/events',
              'notifications': '/notifications',
              'messages': '/messages',
              'inbox': '/messages',
              'home': '/',
              'main page': '/',
            };

            const route = routeMap[destination] || `/${destination}`;
            navigate(route);
            return { success: true, message: `Navigating to ${destination}` };
          }
          break;

        case 'navigateBack':
          navigate(-1);
          return { success: true, message: 'Going back' };

        case 'navigateHome':
          navigate('/');
          return { success: true, message: 'Going to home page' };

        case 'search':
          if (params?.query) {
            navigate(`/discover?search=${encodeURIComponent(params.query)}`);
            return { success: true, message: `Searching for ${params.query}` };
          }
          break;

        case 'book':
          if (params?.service) {
            navigate(`/book-artist?service=${encodeURIComponent(params.service)}`);
            return { success: true, message: `Booking ${params.service}` };
          }
          break;

        case 'showHelp':
          return { 
            success: true, 
            message: 'Available commands: navigate, search, create, book, help, and more. Say "help" for details.' 
          };

        case 'clear':
          return { success: true, message: 'Clearing command history' };

        case 'refresh':
          window.location.reload();
          return { success: true, message: 'Refreshing page' };

        case 'scroll':
          if (params?.direction) {
            const direction = params.direction.toLowerCase();
            if (direction === 'up' || direction === 'top') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return { success: true, message: 'Scrolling to top' };
            } else if (direction === 'down' || direction === 'bottom') {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              return { success: true, message: 'Scrolling to bottom' };
            }
          }
          break;

        default:
          return { success: false, message: 'Unknown command' };
      }
    } catch (error) {
      return { success: false, message: 'Error executing command' };
    }

    return { success: false, message: 'Command not implemented' };
  }, [navigate]);

  // Get available commands for help
  const getAvailableCommands = useCallback(() => {
    return commandPatterns.map(pattern => ({
      pattern: pattern.pattern.source,
      description: pattern.description,
      example: getExampleCommand(pattern.pattern.source),
    }));
  }, []);

  // Generate example command from pattern
  const getExampleCommand = (patternSource: string) => {
    const examples: Record<string, string> = {
      '^(go to|navigate to|open|show)\\s+(.+)$': 'Go to profile',
      '^(go back|back|previous|return)$': 'Go back',
      '^(go home|home|main page)$': 'Go home',
      '^(show|open|view)\\s+(my\\s+)?(profile|account|dashboard)$': 'Show my profile',
      '^(edit|update|change)\\s+(my\\s+)?(profile|account|settings)$': 'Edit my profile',
      '^(show|open|view)\\s+(community|groups|discussions)$': 'Show community',
      '^(create|start|new)\\s+(post|discussion|group|event)$': 'Create post',
      '^(search|find|look for)\\s+(.+)$': 'Search for events',
      '^(discover|explore|browse)$': 'Discover',
      '^(show|view|list)\\s+(events|activities|calendar)$': 'Show events',
      '^(book|reserve|schedule)\\s+(.+)$': 'Book artist',
      '^(show|open|view)\\s+(notifications|messages|inbox)$': 'Show notifications',
      '^(help|support|assistance|what can you do)$': 'Help',
      '^(clear|reset|stop)\\s+(listening|commands|transcript)$': 'Clear commands',
      '^(refresh|reload|restart)$': 'Refresh',
      '^(scroll|move)\\s+(up|down|top|bottom)$': 'Scroll up',
    };

    return examples[patternSource] || 'Try saying the command naturally';
  };

  return {
    processCommand,
    executeCommand,
    getAvailableCommands,
    commandHistory: commandHistoryRef.current,
  };
};

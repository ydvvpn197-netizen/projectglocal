/**
 * Voice-to-Text Service for Accessibility
 * Provides speech recognition and voice commands functionality
 */

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  keywords: string[];
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
}

export interface VoiceSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: string[];
}

export class VoiceToTextService {
  private static instance: VoiceToTextService;
  private recognition: any = null;
  private isListening = false;
  private commands: Map<string, VoiceCommand> = new Map();
  private settings: VoiceSettings = {
    language: 'en-IN', // English (India)
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
  };
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;

  static getInstance(): VoiceToTextService {
    if (!VoiceToTextService.instance) {
      VoiceToTextService.instance = new VoiceToTextService();
    }
    return VoiceToTextService.instance;
  }

  constructor() {
    this.initializeSpeechRecognition();
    this.setupDefaultCommands();
  }

  private initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.settings.continuous;
    this.recognition.interimResults = this.settings.interimResults;
    this.recognition.lang = this.settings.language;
    this.recognition.maxAlternatives = this.settings.maxAlternatives;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStartCallback?.();
    };

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      const speechResult: SpeechRecognitionResult = {
        transcript: transcript.trim(),
        confidence,
        isFinal,
        alternatives: isFinal ? Array.from(event.results[event.resultIndex]).map((r: any) => r.transcript) : undefined,
      };

      this.onResultCallback?.(speechResult);

      // Process voice commands if final result
      if (isFinal) {
        this.processVoiceCommand(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      this.onErrorCallback?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEndCallback?.();
    };
  }

  private setupDefaultCommands(): void {
    // Navigation commands
    this.addCommand({
      command: 'go home',
      action: () => window.location.href = '/',
      description: 'Navigate to home page',
      keywords: ['home', 'main', 'dashboard'],
    });

    this.addCommand({
      command: 'go to news',
      action: () => window.location.href = '/news',
      description: 'Navigate to news page',
      keywords: ['news', 'articles', 'latest'],
    });

    this.addCommand({
      command: 'go to events',
      action: () => window.location.href = '/events',
      description: 'Navigate to events page',
      keywords: ['events', 'calendar', 'activities'],
    });

    this.addCommand({
      command: 'go to profile',
      action: () => window.location.href = '/profile',
      description: 'Navigate to profile page',
      keywords: ['profile', 'account', 'settings'],
    });

    // Accessibility commands
    this.addCommand({
      command: 'increase font size',
      action: () => this.increaseFontSize(),
      description: 'Increase font size for better readability',
      keywords: ['bigger', 'larger', 'zoom in'],
    });

    this.addCommand({
      command: 'decrease font size',
      action: () => this.decreaseFontSize(),
      description: 'Decrease font size',
      keywords: ['smaller', 'zoom out'],
    });

    this.addCommand({
      command: 'toggle dark mode',
      action: () => this.toggleDarkMode(),
      description: 'Toggle between light and dark mode',
      keywords: ['dark', 'light', 'theme'],
    });

    // Search commands
    this.addCommand({
      command: 'search',
      action: () => this.focusSearch(),
      description: 'Focus on search input',
      keywords: ['find', 'look for'],
    });

    // Help command
    this.addCommand({
      command: 'help',
      action: () => this.showVoiceCommands(),
      description: 'Show available voice commands',
      keywords: ['commands', 'what can I say'],
    });
  }

  /**
   * Start voice recognition
   */
  startListening(): void {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.start();
    } catch (error) {
      this.onErrorCallback?.('Failed to start voice recognition');
    }
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Add a voice command
   */
  addCommand(command: VoiceCommand): void {
    this.commands.set(command.command.toLowerCase(), command);
  }

  /**
   * Remove a voice command
   */
  removeCommand(command: string): void {
    this.commands.delete(command.toLowerCase());
  }

  /**
   * Get all available commands
   */
  getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Set voice recognition settings
   */
  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (this.recognition) {
      this.setupRecognition();
    }
  }

  /**
   * Set callback for speech recognition results
   */
  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for speech recognition errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for when recognition starts
   */
  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  /**
   * Set callback for when recognition ends
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return !!(typeof window !== 'undefined' && 
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): string[] {
    return [
      'en-IN', // English (India)
      'hi-IN', // Hindi (India)
      'en-US', // English (US)
      'en-GB', // English (UK)
      'hi',    // Hindi
      'bn',    // Bengali
      'te',    // Telugu
      'mr',    // Marathi
      'ta',    // Tamil
      'gu',    // Gujarati
      'kn',    // Kannada
      'ml',    // Malayalam
      'pa',    // Punjabi
      'or',    // Odia
      'as',    // Assamese
    ];
  }

  // Private helper methods

  private processVoiceCommand(transcript: string): void {
    const lowerTranscript = transcript.toLowerCase();
    
    // Find matching command
    for (const [command, voiceCommand] of this.commands) {
      if (lowerTranscript.includes(command) || 
          voiceCommand.keywords.some(keyword => lowerTranscript.includes(keyword))) {
        try {
          voiceCommand.action();
          this.showFeedback(`Executed: ${voiceCommand.description}`);
        } catch (error) {
          this.showFeedback(`Error executing command: ${error}`);
        }
        return;
      }
    }

    // No command matched, show feedback
    this.showFeedback(`Command not recognized: "${transcript}"`);
  }

  private increaseFontSize(): void {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = Math.min(currentSize + 2, 24);
    document.documentElement.style.fontSize = `${newSize}px`;
    this.showFeedback(`Font size increased to ${newSize}px`);
  }

  private decreaseFontSize(): void {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = Math.max(currentSize - 2, 12);
    document.documentElement.style.fontSize = `${newSize}px`;
    this.showFeedback(`Font size decreased to ${newSize}px`);
  }

  private toggleDarkMode(): void {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      this.showFeedback('Switched to light mode');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      this.showFeedback('Switched to dark mode');
    }
  }

  private focusSearch(): void {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      this.showFeedback('Search input focused');
    } else {
      this.showFeedback('Search input not found');
    }
  }

  private showVoiceCommands(): void {
    const commands = this.getCommands();
    const commandList = commands.map(cmd => `"${cmd.command}" - ${cmd.description}`).join('\n');
    
    // Show commands in a modal or toast
    this.showFeedback(`Available commands:\n${commandList}`);
  }

  private showFeedback(message: string): void {
    // Create a temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  }
}

export const voiceToTextService = VoiceToTextService.getInstance();

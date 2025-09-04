/**
 * Test Setup Configuration
 * Configures the testing environment for Vitest and React Testing Library
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock DOMPurify for security utilities
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((content: string) => content),
    setConfig: vi.fn(),
  },
}));

// Mock crypto for security utilities
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    subtle: {
      digest: vi.fn(async () => new ArrayBuffer(32)),
    },
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock console methods in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console errors and warnings in tests unless explicitly needed
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
        limit: vi.fn(),
        range: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
      })),
    },
  },
  getConnectionStatus: vi.fn(() => 'connected'),
  forceReconnection: vi.fn(async () => true),
  isSupabaseConfigured: vi.fn(() => true),
}));

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
      },
    },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  }),
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
}));

// Mock DOMPurify for security utilities
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((content: string) => content),
    setConfig: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MoreVertical: () => '⋮',
  Pin: () => '📌',
  Lock: () => '🔒',
  CheckCircle: () => '✓',
  TrendingUp: () => '📈',
  Users: () => '👥',
  Star: () => '⭐',
  MapPin: () => '📍',
  Mail: () => '📧',
  Shield: () => '🛡️',
  Heart: () => '❤️',
  HeartOff: () => '💔',
  MessageCircle: () => '💬',
  Share2: () => '📤',
  Eye: () => '👁️',
  Bookmark: () => '🔖',
  ThumbsUp: () => '👍',
  ThumbsDown: () => '👎',
  Flag: () => '🚩',
  Edit: () => '✏️',
  Trash2: () => '🗑️',
  User: () => '👤',
  Calendar: () => '📅',
  Clock: () => '🕐',
  Globe: () => '🌐',
  Phone: () => '📞',
  ExternalLink: () => '🔗',
  Plus: () => '➕',
  Minus: () => '➖',
  X: () => '❌',
  Check: () => '✅',
  AlertCircle: () => '⚠️',
  Info: () => 'ℹ️',
  HelpCircle: () => '❓',
  Search: () => '🔍',
  Filter: () => '🔧',
  Settings: () => '⚙️',
  Bell: () => '🔔',
  Home: () => '🏠',
  LogOut: () => '🚪',
  LogIn: () => '🔑',
  UserPlus: () => '👤➕',
  UserMinus: () => '👤➖',
  Camera: () => '📷',
  Video: () => '📹',
  Mic: () => '🎤',
  MicOff: () => '🎤❌',
  Volume2: () => '🔊',
  VolumeX: () => '🔇',
  Play: () => '▶️',
  Pause: () => '⏸️',
  SkipForward: () => '⏭️',
  SkipBack: () => '⏮️',
  RotateCcw: () => '🔄',
  RotateCw: () => '🔄',
  ZoomIn: () => '🔍➕',
  ZoomOut: () => '🔍➖',
  Download: () => '⬇️',
  Upload: () => '⬆️',
  File: () => '📄',
  Folder: () => '📁',
  Image: () => '🖼️',
  Link: () => '🔗',
  Unlink: () => '🔗❌',
  Copy: () => '📋',
  Scissors: () => '✂️',
  Save: () => '💾',
  RefreshCw: () => '🔄',
  RefreshCcw: () => '🔄',
  ArrowUp: () => '⬆️',
  ArrowDown: () => '⬇️',
  ArrowLeft: () => '⬅️',
  ArrowRight: () => '➡️',
  ChevronUp: () => '⌃',
  ChevronDown: () => '⌄',
  ChevronLeft: () => '⌃',
  ChevronRight: () => '⌄',
  Menu: () => '☰',
  Grid: () => '⊞',
  List: () => '☰',
  Layout: () => '⊞',
  Monitor: () => '🖥️',
  Smartphone: () => '📱',
  Tablet: () => '📱',
  Watch: () => '⌚',
  Headphones: () => '🎧',
  Speaker: () => '🔊',
  Wifi: () => '📶',
  WifiOff: () => '📶❌',
  Battery: () => '🔋',
  BatteryCharging: () => '🔋⚡',
  Zap: () => '⚡',
  ZapOff: () => '⚡❌',
  Sun: () => '☀️',
  Moon: () => '🌙',
  Cloud: () => '☁️',
  CloudRain: () => '🌧️',
  CloudSnow: () => '❄️',
  Wind: () => '💨',
  Umbrella: () => '☂️',
  Droplets: () => '💧',
  Thermometer: () => '🌡️',
  Target: () => '🎯',
  Crosshair: () => '🎯',
  Navigation: () => '🧭',
  Compass: () => '🧭',
  Map: () => '🗺️',
  Globe2: () => '🌍',
  Building: () => '🏢',
  Store: () => '🏪',
  ShoppingCart: () => '🛒',
  CreditCard: () => '💳',
  DollarSign: () => '💵',
  Euro: () => '💶',
  PoundSterling: () => '💷',
  Yen: () => '💴',
  Bitcoin: () => '₿',
  TrendingDown: () => '📉',
  BarChart: () => '📊',
  PieChart: () => '📊',
  Activity: () => '📈',
  GitBranch: () => '🌿',
  GitCommit: () => '💾',
  GitPullRequest: () => '🔀',
  GitMerge: () => '🔀',
  GitCompare: () => '🔀',
  GitFork: () => '🍴',
  Github: () => '🐙',
  Twitter: () => '🐦',
  Facebook: () => '📘',
  Instagram: () => '📷',
  Linkedin: () => '💼',
  Youtube: () => '📺',
  Twitch: () => '📺',
  Discord: () => '💬',
  Slack: () => '💬',
  Codepen: () => '💻',
  StackOverflow: () => '📚',
  Reddit: () => '🤖',
  Medium: () => '📝',
  Tumblr: () => '📝',
  Pinterest: () => '📌',
  Snapchat: () => '👻',
  Tiktok: () => '🎵',
  Spotify: () => '🎵',
  Apple: () => '🍎',
  Android: () => '🤖',
  Windows: () => '🪟',
  Linux: () => '🐧',
  Chrome: () => '🌐',
  Firefox: () => '🦊',
  Safari: () => '🌐',
  Edge: () => '🌐',
  Opera: () => '🌐',
  Brave: () => '🦁',
  Vercel: () => '▲',
  Netlify: () => '🌐',
  Heroku: () => '🚀',
  Aws: () => '☁️',
  Google: () => '🔍',
  Microsoft: () => '🪟',
  Apple2: () => '🍎',
  Android2: () => '🤖',
  Windows2: () => '🪟',
  Linux2: () => '🐧',
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: (date: Date, options: { addSuffix: boolean }) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return 'over 1 year ago';
    if (days > 30) return 'over 1 month ago';
    if (days > 7) return 'over 1 week ago';
    if (days > 0) return 'over 1 day ago';
    return 'less than 1 day ago';
  },
}));

// Mock security utils
vi.mock('@/config/security', () => ({
  SecurityUtils: {
    sanitizeHtml: (content: string) => content,
    validateInput: (schema: unknown, input: unknown) => ({ success: true, data: input }),
    containsDangerousContent: (content: string) => {
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      ];
      return dangerousPatterns.some(pattern => pattern.test(content));
    },
    generateSecureToken: (length = 32) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    hashData: async (data: string) => {
      // Mock hash function
      return 'a'.repeat(64);
    },
    validateFile: (file: File) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > maxSize) {
        return { valid: false, error: 'File size too large' };
      }
      
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File type not allowed' };
      }
      
      return { valid: true };
    },
    createRateLimiter: (maxRequests: number, windowMs: number) => {
      const requests = new Map<string, { count: number; resetTime: number }>();
      
      return {
        isAllowed: (identifier: string) => {
          const now = Date.now();
          const request = requests.get(identifier);
          
          if (!request || now > request.resetTime) {
            requests.set(identifier, { count: 1, resetTime: now + windowMs });
            return true;
          }
          
          if (request.count >= maxRequests) {
            return false;
          }
          
          request.count++;
          return true;
        },
        reset: (identifier: string) => {
          requests.delete(identifier);
        }
      };
    },
  },
  SecuritySchemas: {
    username: {
      _def: {
        regex: /^[a-zA-Z0-9_-]+$/,
      },
      safeParse: (input: unknown) => {
        // Mock validation logic for username
        if (typeof input === 'string' && input.length >= 3 && input.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(input)) {
          return { success: true, data: input };
        }
        return { success: false, error: { issues: [{ message: 'Username must be at least 3 characters' }] } };
      },
    },
    email: {
      safeParse: (input: unknown) => {
        // Mock validation logic for email
        if (typeof input === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
          return { success: true, data: input };
        }
        return { success: false, error: { issues: [{ message: 'Invalid email address' }] } };
      },
    },
    password: {
      safeParse: (input: unknown) => {
        // Mock validation logic for password
        if (typeof input === 'string' && input.length >= 12 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(input)) {
          return { success: true, data: input };
        }
        return { success: false, error: { issues: [{ message: 'Password too weak' }] } };
      },
    },
    postContent: {
      safeParse: (input: unknown) => {
        // Mock validation logic for post content
        if (typeof input === 'string' && input.length > 0 && input.length <= 10000) {
          return { success: true, data: input };
        }
        return { success: false, error: { issues: [{ message: 'Invalid post content' }] } };
      },
    },
    commentContent: {
      safeParse: (input: unknown) => {
        // Mock validation logic for comment content
        if (typeof input === 'string' && input.length > 0 && input.length <= 1000) {
          return { success: true, data: input };
        }
        return { success: false, error: { issues: [{ message: 'Invalid comment content' }] } };
      },
    },
    fileUpload: {
      safeParse: (input: unknown) => {
        // Mock validation logic for file upload
        if (input && typeof input === 'object' && input.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(input.type)) {
          return { success: true, data: input };
        }
        return { success: false, error: { issues: [{ message: 'Invalid file upload' }] } };
      },
    },
  },
  SECURITY_CONFIG: {
    SESSION_TIMEOUT: 3600,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900,
    MIN_PASSWORD_LENGTH: 12,
    REQUIRE_SPECIAL_CHARS: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_REQUESTS_PER_HOUR: 1000,
    ALLOWED_HTML_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
    ALLOWED_HTML_ATTRS: ['href', 'target', 'rel'],
    MAX_CONTENT_LENGTH: 10000,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    API_RATE_LIMIT_WINDOW: 60000,
    MAX_API_PAYLOAD_SIZE: 1024 * 1024, // 1MB
  },
}));

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Global test utilities
global.testUtils = {
  // Wait for a condition to be true
  waitFor: (condition: () => boolean, timeout = 1000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition not met within timeout'));
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  },

  // Mock API response
  mockApiResponse: (data: unknown, status = 200) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
    };
  },

  // Create mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    ...overrides,
  }),

  // Create mock post
  createMockPost: (overrides = {}) => ({
    id: 'test-post-id',
    userId: 'test-user-id',
    type: 'post',
    title: 'Test Post',
    content: 'This is a test post content',
    status: 'public',
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),
};

// Extend expect matchers
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expected) {
    const pass = received.mock.calls.some(call => 
      expected.every((arg, index) => 
        call[index] && typeof call[index] === 'object' && 
        Object.keys(arg).every(key => 
          call[index][key] === arg[key]
        )
      )
    );
    
    return {
      pass,
      message: () => 
        `expected ${received.getMockName()} to have been called with arguments matching ${JSON.stringify(expected)}`,
    };
  },
});

// Type declarations for global test utilities
declare global {
  interface VitestMatchers<R> {
    toHaveBeenCalledWithMatch(...expected: unknown[]): R;
  }
  
  const testUtils: {
    waitFor: (condition: () => boolean, timeout?: number) => Promise<void>;
    mockApiResponse: (data: unknown, status?: number) => Response;
    createMockUser: (overrides?: Record<string, unknown>) => Record<string, unknown>;
    createMockPost: (overrides?: Record<string, unknown>) => Record<string, unknown>;
  };
}

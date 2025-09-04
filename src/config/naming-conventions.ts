/**
 * Naming Conventions Configuration
 * Standardized naming patterns for the entire application
 */

// Component naming conventions
export const COMPONENT_NAMING = {
  // React components should use PascalCase
  COMPONENT: 'PascalCase',
  
  // Examples of good component names:
  EXAMPLES: [
    'UserProfile',
    'PostCard',
    'CommentList',
    'NotificationBell',
    'SearchBar',
    'ModalDialog',
    'FormInput',
    'ButtonGroup',
    'DataTable',
    'LoadingSpinner'
  ],
  
  // Component file names should match component names
  FILE_PATTERN: 'ComponentName.tsx',
  
  // Component folders should use kebab-case
  FOLDER_PATTERN: 'component-name',
  
  // Component props interface should be ComponentNameProps
  PROPS_INTERFACE: 'ComponentNameProps',
  
  // Component state interface should be ComponentNameState
  STATE_INTERFACE: 'ComponentNameState',
} as const;

// Function naming conventions
export const FUNCTION_NAMING = {
  // Regular functions should use camelCase
  FUNCTION: 'camelCase',
  
  // Examples of good function names:
  EXAMPLES: [
    'getUserData',
    'updatePost',
    'handleSubmit',
    'validateInput',
    'formatDate',
    'calculateTotal',
    'sendNotification',
    'fetchUserProfile',
    'toggleVisibility',
    'resetForm'
  ],
  
  // Event handlers should start with 'handle'
  EVENT_HANDLER_PREFIX: 'handle',
  
  // Async functions should indicate their async nature
  ASYNC_PREFIX: 'async',
  
  // Boolean functions should start with 'is', 'has', 'can', etc.
  BOOLEAN_PREFIXES: ['is', 'has', 'can', 'should', 'will', 'does'],
  
  // CRUD operations should use standard verbs
  CRUD_VERBS: ['create', 'read', 'update', 'delete', 'get', 'set', 'add', 'remove'],
} as const;

// Variable naming conventions
export const VARIABLE_NAMING = {
  // Variables should use camelCase
  VARIABLE: 'camelCase',
  
  // Examples of good variable names:
  EXAMPLES: [
    'userName',
    'postCount',
    'isLoading',
    'hasError',
    'canEdit',
    'shouldRefresh',
    'maxRetries',
    'defaultTimeout',
    'apiEndpoint',
    'formData'
  ],
  
  // Constants should use UPPER_SNAKE_CASE
  CONSTANT: 'UPPER_SNAKE_CASE',
  
  // Examples of constants:
  CONSTANT_EXAMPLES: [
    'MAX_RETRY_ATTEMPTS',
    'DEFAULT_TIMEOUT',
    'API_BASE_URL',
    'SUPPORTED_FILE_TYPES',
    'MAX_FILE_SIZE',
    'SESSION_TIMEOUT'
  ],
  
  // Private variables should start with underscore
  PRIVATE_PREFIX: '_',
  
  // Boolean variables should start with appropriate prefixes
  BOOLEAN_PREFIXES: ['is', 'has', 'can', 'should', 'will', 'does', 'show', 'enable'],
} as const;

// Type and interface naming conventions
export const TYPE_NAMING = {
  // Types should use PascalCase
  TYPE: 'PascalCase',
  
  // Examples of good type names:
  EXAMPLES: [
    'User',
    'Post',
    'Comment',
    'Notification',
    'ApiResponse',
    'FormData',
    'ValidationError',
    'UserPreferences',
    'SearchFilters',
    'PaginationOptions'
  ],
  
  // Interface names should be descriptive and end with appropriate suffixes
  INTERFACE_SUFFIXES: ['Props', 'State', 'Config', 'Options', 'Settings', 'Data'],
  
  // Generic types should use descriptive names
  GENERIC_EXAMPLES: [
    'ApiResponse<T>',
    'PaginatedResult<T>',
    'FormField<T>',
    'ValidationRule<T>',
    'EventHandler<T>'
  ],
  
  // Union types should be descriptive
  UNION_EXAMPLES: [
    'UserRole',
    'PostStatus',
    'NotificationType',
    'SortDirection',
    'FilterOperator'
  ],
} as const;

// File and folder naming conventions
export const FILE_NAMING = {
  // File names should use kebab-case
  FILE: 'kebab-case',
  
  // Examples of good file names:
  EXAMPLES: [
    'user-profile.tsx',
    'post-card.tsx',
    'comment-list.tsx',
    'notification-bell.tsx',
    'search-bar.tsx',
    'modal-dialog.tsx',
    'form-input.tsx',
    'button-group.tsx',
    'data-table.tsx',
    'loading-spinner.tsx'
  ],
  
  // Folder names should use kebab-case
  FOLDER: 'kebab-case',
  
  // Examples of good folder names:
  FOLDER_EXAMPLES: [
    'user-management',
    'post-creation',
    'comment-system',
    'notification-center',
    'search-functionality',
    'modal-components',
    'form-elements',
    'button-components',
    'data-display',
    'loading-states'
  ],
  
  // Index files should be named 'index.ts' or 'index.tsx'
  INDEX_FILE: 'index.ts',
  
  // Test files should end with '.test.ts' or '.test.tsx'
  TEST_FILE: '.test.ts',
  
  // Story files should end with '.stories.ts' or '.stories.tsx'
  STORY_FILE: '.stories.ts',
} as const;

// Database naming conventions
export const DATABASE_NAMING = {
  // Table names should use snake_case
  TABLE: 'snake_case',
  
  // Examples of good table names:
  EXAMPLES: [
    'users',
    'posts',
    'comments',
    'notifications',
    'user_profiles',
    'post_likes',
    'comment_votes',
    'notification_settings',
    'user_preferences',
    'post_shares'
  ],
  
  // Column names should use snake_case
  COLUMN: 'snake_case',
  
  // Examples of good column names:
  COLUMN_EXAMPLES: [
    'user_id',
    'post_id',
    'created_at',
    'updated_at',
    'is_active',
    'has_verified_email',
    'can_post_comments',
    'should_receive_notifications',
    'max_file_size',
    'session_timeout'
  ],
  
  // Foreign key columns should end with '_id'
  FOREIGN_KEY_SUFFIX: '_id',
  
  // Boolean columns should start with 'is_', 'has_', 'can_', etc.
  BOOLEAN_COLUMN_PREFIXES: ['is_', 'has_', 'can_', 'should_', 'will_', 'does_'],
  
  // Timestamp columns should use '_at' suffix
  TIMESTAMP_SUFFIX: '_at',
} as const;

// API naming conventions
export const API_NAMING = {
  // API endpoints should use kebab-case
  ENDPOINT: 'kebab-case',
  
  // Examples of good API endpoints:
  EXAMPLES: [
    '/api/users',
    '/api/posts',
    '/api/comments',
    '/api/notifications',
    '/api/user-profiles',
    '/api/post-likes',
    '/api/comment-votes',
    '/api/notification-settings',
    '/api/user-preferences',
    '/api/post-shares'
  ],
  
  // HTTP methods should use standard verbs
  HTTP_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  
  // Query parameters should use snake_case
  QUERY_PARAM: 'snake_case',
  
  // Examples of good query parameters:
  QUERY_PARAM_EXAMPLES: [
    'user_id',
    'post_id',
    'page_number',
    'items_per_page',
    'sort_by',
    'sort_direction',
    'filter_by',
    'search_term',
    'include_deleted',
    'exclude_archived'
  ],
  
  // Response status codes should use standard HTTP codes
  STATUS_CODES: [200, 201, 400, 401, 403, 404, 422, 500],
} as const;

// CSS naming conventions
export const CSS_NAMING = {
  // CSS classes should use kebab-case
  CLASS: 'kebab-case',
  
  // Examples of good CSS class names:
  EXAMPLES: [
    'user-profile',
    'post-card',
    'comment-list',
    'notification-bell',
    'search-bar',
    'modal-dialog',
    'form-input',
    'button-group',
    'data-table',
    'loading-spinner'
  ],
  
  // BEM methodology should be used for complex components
  BEM_PATTERN: 'block__element--modifier',
  
  // Examples of BEM naming:
  BEM_EXAMPLES: [
    'card__title--large',
    'button__icon--primary',
    'form__input--error',
    'modal__header--centered',
    'table__row--highlighted'
  ],
  
  // Utility classes should be descriptive
  UTILITY_EXAMPLES: [
    'text-center',
    'margin-top-large',
    'padding-bottom-small',
    'border-radius-medium',
    'box-shadow-heavy'
  ],
} as const;

// Export all naming conventions
export const NAMING_CONVENTIONS = {
  COMPONENT: COMPONENT_NAMING,
  FUNCTION: FUNCTION_NAMING,
  VARIABLE: VARIABLE_NAMING,
  TYPE: TYPE_NAMING,
  FILE: FILE_NAMING,
  DATABASE: DATABASE_NAMING,
  API: API_NAMING,
  CSS: CSS_NAMING,
} as const;

// Utility function to validate naming conventions
export class NamingValidator {
  /**
   * Check if a component name follows conventions
   */
  static isValidComponentName(name: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Check if a function name follows conventions
   */
  static isValidFunctionName(name: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Check if a variable name follows conventions
   */
  static isValidVariableName(name: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Check if a constant name follows conventions
   */
  static isValidConstantName(name: string): boolean {
    return /^[A-Z][A-Z0-9_]*$/.test(name);
  }

  /**
   * Check if a file name follows conventions
   */
  static isValidFileName(name: string): boolean {
    return /^[a-z][a-z0-9-]*$/.test(name);
  }

  /**
   * Check if a table name follows conventions
   */
  static isValidTableName(name: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(name);
  }

  /**
   * Check if an API endpoint follows conventions
   */
  static isValidApiEndpoint(endpoint: string): boolean {
    return /^\/api\/[a-z][a-z0-9-]*$/.test(endpoint);
  }

  /**
   * Check if a CSS class name follows conventions
   */
  static isValidCssClassName(name: string): boolean {
    return /^[a-z][a-z0-9-]*$/.test(name);
  }
}

// Export types
export type ComponentNaming = typeof COMPONENT_NAMING;
export type FunctionNaming = typeof FUNCTION_NAMING;
export type VariableNaming = typeof VARIABLE_NAMING;
export type TypeNaming = typeof TYPE_NAMING;
export type FileNaming = typeof FILE_NAMING;
export type DatabaseNaming = typeof DATABASE_NAMING;
export type ApiNaming = typeof API_NAMING;
export type CssNaming = typeof CSS_NAMING;
export type NamingConventions = typeof NAMING_CONVENTIONS;

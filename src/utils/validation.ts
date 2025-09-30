import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');

// User validation schemas
export const userProfileSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  location_city: z.string().max(100, 'City name must be less than 100 characters').optional(),
  location_state: z.string().max(100, 'State name must be less than 100 characters').optional(),
  location_country: z.string().max(100, 'Country name must be less than 100 characters').optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  interests: z.array(z.string()).optional(),
  privacy_level: z.enum(['public', 'private', 'anonymous']).default('public'),
  is_anonymous: z.boolean().default(false),
  anonymous_handle: z.string().max(20, 'Anonymous handle must be less than 20 characters').optional(),
  anonymous_display_name: z.string().max(50, 'Anonymous display name must be less than 50 characters').optional(),
  real_name_visibility: z.boolean().default(true),
  location_sharing: z.boolean().default(false),
  precise_location: z.boolean().default(false)
});

// Community validation schemas
export const communitySchema = z.object({
  name: z.string().min(1, 'Community name is required').max(100, 'Community name must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  location_city: z.string().max(100, 'City name must be less than 100 characters').optional(),
  location_state: z.string().max(100, 'State name must be less than 100 characters').optional(),
  location_country: z.string().max(100, 'Country name must be less than 100 characters').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  is_public: z.boolean().default(true),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  tags: z.array(z.string()).optional()
});

// Post validation schemas
export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  community_id: z.string().uuid('Invalid community ID').optional(),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  tags: z.array(z.string()).optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  is_anonymous: z.boolean().default(false),
  anonymous_handle: z.string().max(20, 'Anonymous handle must be less than 20 characters').optional()
});

// Comment validation schemas
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment must be less than 1000 characters'),
  post_id: z.string().uuid('Invalid post ID'),
  parent_comment_id: z.string().uuid('Invalid parent comment ID').optional(),
  is_anonymous: z.boolean().default(false),
  anonymous_handle: z.string().max(20, 'Anonymous handle must be less than 20 characters').optional()
});

// Event validation schemas
export const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200, 'Event title must be less than 200 characters'),
  description: z.string().min(1, 'Event description is required').max(2000, 'Event description must be less than 2000 characters'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  event_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  location_name: z.string().min(1, 'Location name is required').max(200, 'Location name must be less than 200 characters'),
  location_city: z.string().max(100, 'City name must be less than 100 characters').optional(),
  location_state: z.string().max(100, 'State name must be less than 100 characters').optional(),
  location_country: z.string().max(100, 'Country name must be less than 100 characters').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  max_attendees: z.number().min(1, 'Max attendees must be at least 1').max(10000, 'Max attendees must be less than 10000').optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false)
});

// Virtual protest validation schemas
export const virtualProtestSchema = z.object({
  title: z.string().min(1, 'Protest title is required').max(200, 'Protest title must be less than 200 characters'),
  description: z.string().min(1, 'Protest description is required').max(2000, 'Protest description must be less than 2000 characters'),
  protest_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  protest_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  location_name: z.string().min(1, 'Location name is required').max(200, 'Location name must be less than 200 characters'),
  location_city: z.string().max(100, 'City name must be less than 100 characters').optional(),
  location_state: z.string().max(100, 'State name must be less than 100 characters').optional(),
  location_country: z.string().max(100, 'Country name must be less than 100 characters').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  max_attendees: z.number().min(1, 'Max attendees must be at least 1').max(10000, 'Max attendees must be less than 10000').optional(),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false)
});

// News article validation schemas
export const newsArticleSchema = z.object({
  title: z.string().min(1, 'Article title is required').max(200, 'Article title must be less than 200 characters'),
  content: z.string().min(1, 'Article content is required').max(10000, 'Article content must be less than 10000 characters'),
  summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
  author: z.string().min(1, 'Author is required').max(100, 'Author name must be less than 100 characters'),
  source_url: z.string().url('Invalid source URL').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false)
});

// Privacy settings validation schemas
export const privacySettingsSchema = z.object({
  profile_visibility: z.enum(['public', 'private', 'anonymous']).default('public'),
  show_email: z.boolean().default(false),
  show_phone: z.boolean().default(false),
  show_location: z.boolean().default(false),
  anonymous_mode: z.boolean().default(false),
  anonymous_posts: z.boolean().default(false),
  anonymous_comments: z.boolean().default(false),
  anonymous_votes: z.boolean().default(false),
  location_sharing: z.boolean().default(false),
  precise_location: z.boolean().default(false)
});

// Report validation schemas
export const reportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'inappropriate_content', 'fake_news', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  reported_item_type: z.enum(['post', 'comment', 'event', 'user', 'community']),
  reported_item_id: z.string().uuid('Invalid reported item ID'),
  reporter_id: z.string().uuid('Invalid reporter ID')
});

// Validation utility functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const validateFormData = <T>(schema: z.ZodSchema<T>, formData: FormData): { success: boolean; data?: T; errors?: string[] } => {
  const data = Object.fromEntries(formData.entries());
  return validateData(schema, data);
};

export const validatePartialData = <T>(schema: z.ZodSchema<T>, data: Partial<T>): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.partial().parse(data);
    return { success: true, data: validatedData as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (html: string): string => {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (['http:', 'https:'].includes(urlObj.protocol)) {
      return urlObj.toString();
    }
    throw new Error('Invalid protocol');
  } catch {
    return '';
  }
};

// Validation middleware for API routes
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    const validation = validateData(schema, req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }
    req.validatedData = validation.data;
    next();
  };
};

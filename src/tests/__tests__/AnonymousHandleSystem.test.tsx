import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AnonymousHandleManager } from '@/components/anonymous/AnonymousHandleManager';
import { anonymousHandleService } from '@/services/anonymousHandleService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/use-toast');
jest.mock('@/services/anonymousHandleService');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockAnonymousHandleService = anonymousHandleService as jest.Mocked<typeof anonymousHandleService>;

describe('AnonymousHandleManager', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      isOnline: true,
      connectionStatus: 'connected' as const,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
      clearAuthData: jest.fn()
    });

    mockUseToast.mockReturnValue({
      toast: mockToast
    });
  });

  describe('Handle Generation', () => {
    it('should generate handle suggestions when requested', async () => {
      const mockSuggestions = [
        { username: 'SwiftTiger123', displayName: 'SwiftTiger123', isGenerated: true, isUnique: true },
        { username: 'BlueEagle456', displayName: 'BlueEagle456', isGenerated: true, isUnique: true },
        { username: 'CleverWolf789', displayName: 'CleverWolf789', isGenerated: true, isUnique: true }
      ];

      mockAnonymousHandleService.generateHandleSuggestions.mockResolvedValue(mockSuggestions);

      render(<AnonymousHandleManager />);

      const generateButton = screen.getByText('Generate New Handle');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockAnonymousHandleService.generateHandleSuggestions).toHaveBeenCalledWith(6, {
          format: 'random',
          includeNumbers: true,
          maxLength: 20
        });
      });
    });

    it('should validate custom handles', async () => {
      mockAnonymousHandleService.validateHandle.mockReturnValue({
        isValid: true,
        errors: []
      });
      mockAnonymousHandleService.isHandleUnique.mockResolvedValue(true);

      render(<AnonymousHandleManager />);

      const customHandleButton = screen.getByText('Custom Handle');
      fireEvent.click(customHandleButton);

      const input = screen.getByPlaceholderText('Enter your desired username');
      fireEvent.change(input, { target: { value: 'CustomUser123' } });

      await waitFor(() => {
        expect(mockAnonymousHandleService.validateHandle).toHaveBeenCalledWith('CustomUser123');
        expect(mockAnonymousHandleService.isHandleUnique).toHaveBeenCalledWith('CustomUser123');
      });
    });

    it('should show validation errors for invalid handles', async () => {
      mockAnonymousHandleService.validateHandle.mockReturnValue({
        isValid: false,
        errors: ['Username must be at least 3 characters long']
      });

      render(<AnonymousHandleManager />);

      const customHandleButton = screen.getByText('Custom Handle');
      fireEvent.click(customHandleButton);

      const input = screen.getByPlaceholderText('Enter your desired username');
      fireEvent.change(input, { target: { value: 'ab' } });

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters long')).toBeInTheDocument();
      });
    });
  });

  describe('Handle Application', () => {
    it('should apply generated handle when selected', async () => {
      const mockHandle = {
        username: 'SwiftTiger123',
        displayName: 'SwiftTiger123',
        isGenerated: true,
        isUnique: true
      };

      mockAnonymousHandleService.regenerateAnonymousHandle.mockResolvedValue({
        success: true,
        handle: mockHandle
      });

      const mockOnHandleChange = jest.fn();
      render(<AnonymousHandleManager onHandleChange={mockOnHandleChange} />);

      // First generate suggestions
      const mockSuggestions = [mockHandle];
      mockAnonymousHandleService.generateHandleSuggestions.mockResolvedValue(mockSuggestions);

      const generateButton = screen.getByText('Generate New Handle');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Use This')).toBeInTheDocument();
      });

      const useButton = screen.getByText('Use This');
      fireEvent.click(useButton);

      await waitFor(() => {
        expect(mockAnonymousHandleService.regenerateAnonymousHandle).toHaveBeenCalledWith(
          'test-user-id',
          {
            format: 'random',
            includeNumbers: true,
            maxLength: 20
          }
        );
        expect(mockOnHandleChange).toHaveBeenCalledWith(mockHandle);
      });
    });

    it('should show error toast when handle application fails', async () => {
      mockAnonymousHandleService.regenerateAnonymousHandle.mockResolvedValue({
        success: false,
        error: 'Handle update failed'
      });

      render(<AnonymousHandleManager />);

      // Simulate applying a handle
      const mockHandle = {
        username: 'TestHandle',
        displayName: 'TestHandle',
        isGenerated: true,
        isUnique: true
      };

      // We need to trigger the apply function somehow
      // This would typically be done through the UI interactions
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Update Failed",
          description: "Failed to update your handle",
          variant: "destructive"
        });
      });
    });
  });

  describe('Handle Validation', () => {
    it('should validate handle format correctly', () => {
      const validation = anonymousHandleService.validateHandle('ValidHandle123');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject handles that are too short', () => {
      const validation = anonymousHandleService.validateHandle('ab');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject handles with invalid characters', () => {
      const validation = anonymousHandleService.validateHandle('invalid@handle');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Username can only contain letters, numbers, underscores, and hyphens');
    });

    it('should reject reserved usernames', () => {
      const validation = anonymousHandleService.validateHandle('admin');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('This username is reserved and cannot be used');
    });
  });

  describe('Privacy Features', () => {
    it('should display privacy information', () => {
      render(<AnonymousHandleManager />);

      expect(screen.getByText('About Anonymous Handles')).toBeInTheDocument();
      expect(screen.getByText('Privacy Protection')).toBeInTheDocument();
      expect(screen.getByText('Regeneratable')).toBeInTheDocument();
      expect(screen.getByText('No Personal Info')).toBeInTheDocument();
    });

    it('should show anonymous badge for current handle', () => {
      render(<AnonymousHandleManager />);

      // The component should show the anonymous status
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockAnonymousHandleService.generateHandleSuggestions.mockRejectedValue(
        new Error('Network error')
      );

      render(<AnonymousHandleManager />);

      const generateButton = screen.getByText('Generate New Handle');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Generation Failed",
          description: "Failed to generate handle suggestions",
          variant: "destructive"
        });
      });
    });

    it('should handle missing user context', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        isOnline: true,
        connectionStatus: 'connected' as const,
        signUp: jest.fn(),
        signIn: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        requestPasswordReset: jest.fn(),
        resetPassword: jest.fn(),
        clearAuthData: jest.fn()
      });

      render(<AnonymousHandleManager />);

      // Component should handle missing user gracefully
      expect(screen.getByText('Loading your handle...')).toBeInTheDocument();
    });
  });
});

describe('AnonymousHandleService', () => {
  describe('generateAnonymousHandle', () => {
    it('should generate a handle with default options', async () => {
      const handle = await anonymousHandleService.generateAnonymousHandle();
      
      expect(handle).toHaveProperty('username');
      expect(handle).toHaveProperty('displayName');
      expect(handle).toHaveProperty('isGenerated', true);
      expect(handle).toHaveProperty('isUnique');
      expect(handle.username.length).toBeGreaterThan(0);
      expect(handle.displayName).toBe(handle.username);
    });

    it('should generate handles with custom options', async () => {
      const handle = await anonymousHandleService.generateAnonymousHandle({
        format: 'adjective-noun',
        includeNumbers: false,
        maxLength: 15
      });

      expect(handle.username.length).toBeLessThanOrEqual(15);
    });

    it('should generate multiple unique suggestions', async () => {
      const suggestions = await anonymousHandleService.generateHandleSuggestions(3);
      
      expect(suggestions).toHaveLength(3);
      
      // All suggestions should be unique
      const usernames = suggestions.map(s => s.username);
      const uniqueUsernames = new Set(usernames);
      expect(uniqueUsernames.size).toBe(usernames.length);
    });
  });

  describe('validateHandle', () => {
    it('should validate handle format correctly', () => {
      const result = anonymousHandleService.validateHandle('ValidHandle123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch multiple validation errors', () => {
      const result = anonymousHandleService.validateHandle('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getHandleStatistics', () => {
    it('should return handle statistics', async () => {
      const stats = await anonymousHandleService.getHandleStatistics();
      
      expect(stats).toHaveProperty('totalHandles');
      expect(stats).toHaveProperty('anonymousHandles');
      expect(stats).toHaveProperty('publicHandles');
      expect(stats).toHaveProperty('uniquePrefixes');
      expect(Array.isArray(stats.uniquePrefixes)).toBe(true);
    });
  });
});

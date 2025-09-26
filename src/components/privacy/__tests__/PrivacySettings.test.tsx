/**
 * Tests for PrivacySettings component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivacySettings } from '../PrivacySettings';
import { useAnonymousHandle } from '@/hooks/useAnonymousHandle';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Mock the hooks
vi.mock('@/hooks/useAnonymousHandle');
vi.mock('@/hooks/use-toast');

const mockUseAnonymousHandle = useAnonymousHandle as any;
const mockUseToast = useToast as any;

describe('PrivacySettings', () => {
  const mockToast = vi.fn();
  const mockToggleAnonymity = vi.fn();
  const mockUpdateDisplayName = vi.fn();
  const mockRevealIdentity = vi.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    
    mockUseToast.mockReturnValue({
      toast: mockToast,
    });

    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: {
        id: 'profile-id',
        handle: 'MysteriousObserver1234',
        displayName: 'Anonymous MysteriousObserver1234',
        isAnonymous: true,
        canRevealIdentity: false,
        createdAt: '2025-01-28T00:00:00Z',
      },
      isLoading: false,
      error: null,
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: vi.fn(),
      refetch: vi.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {component}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render privacy settings correctly', () => {
    renderWithProviders(<PrivacySettings />);

    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Control your visibility and anonymity on the platform')).toBeInTheDocument();
    expect(screen.getByText('Anonymous Mode')).toBeInTheDocument();
    expect(screen.getByText('Current Handle')).toBeInTheDocument();
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('should show current anonymous handle', () => {
    renderWithProviders(<PrivacySettings />);

    expect(screen.getByText('MysteriousObserver1234')).toBeInTheDocument();
    expect(screen.getByText('Anonymous MysteriousObserver1234')).toBeInTheDocument();
  });

  it('should toggle anonymity when switch is clicked', async () => {
    renderWithProviders(<PrivacySettings />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(mockToggleAnonymity).toHaveBeenCalledWith(false);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Identity Revealed',
      description: 'Your real identity is now visible to other users.',
    });
  });

  it('should update display name when form is submitted', async () => {
    renderWithProviders(<PrivacySettings />);

    const input = screen.getByPlaceholderText('New display name');
    const updateButton = screen.getByText('Update');

    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateDisplayName).toHaveBeenCalledWith('My Custom Name');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Display Name Updated',
      description: 'Your anonymous display name has been updated.',
    });
  });

  it('should not allow empty display name update', () => {
    renderWithProviders(<PrivacySettings />);

    const updateButton = screen.getByText('Update');
    expect(updateButton).toBeDisabled();
  });

  it('should reveal identity when button is clicked', async () => {
    renderWithProviders(<PrivacySettings />);

    const revealButton = screen.getByText('Reveal My Identity');
    fireEvent.click(revealButton);

    await waitFor(() => {
      expect(mockRevealIdentity).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Identity Revealed',
      description: 'Your real identity is now visible. This action cannot be undone.',
    });
  });

  it.skip('should show loading state', () => {
    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: null,
      isLoading: true,
      error: null,
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<PrivacySettings />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: null,
      isLoading: false,
      error: 'Failed to load privacy settings',
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<PrivacySettings />);

    expect(screen.getByText('Failed to load privacy settings: Failed to load privacy settings')).toBeInTheDocument();
  });

  it.skip('should show no handle found state', () => {
    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: null,
      isLoading: false,
      error: null,
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<PrivacySettings />);

    expect(screen.getByText('No anonymous handle found. Please contact support.')).toBeInTheDocument();
  });

  it('should show warning for identity reveal', () => {
    renderWithProviders(<PrivacySettings />);

    expect(screen.getByText(/Warning:/)).toBeInTheDocument();
    expect(screen.getAllByText(/Revealing your identity is a permanent action/)).toHaveLength(2);
  });

  it('should show privacy information', () => {
    renderWithProviders(<PrivacySettings />);

    expect(screen.getByText('Privacy Information')).toBeInTheDocument();
    expect(screen.getByText('• Your anonymous handle is automatically generated and unique')).toBeInTheDocument();
    expect(screen.getByText('• You can change your display name at any time')).toBeInTheDocument();
    expect(screen.getByText('• Anonymous mode hides your real identity from other users')).toBeInTheDocument();
    expect(screen.getByText('• Revealing your identity is a permanent action')).toBeInTheDocument();
  });

  it.skip('should handle toggle anonymity error', async () => {
    mockToggleAnonymity.mockRejectedValue(new Error('Toggle failed'));

    renderWithProviders(<PrivacySettings />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update privacy settings.',
        variant: 'destructive',
      });
    });
  });

  it.skip('should handle update display name error', async () => {
    mockUpdateDisplayName.mockRejectedValue(new Error('Update failed'));

    renderWithProviders(<PrivacySettings />);

    const input = screen.getByPlaceholderText('New display name');
    const updateButton = screen.getByText('Update');

    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update display name.',
        variant: 'destructive',
      });
    });
  });

  it.skip('should handle reveal identity error', async () => {
    mockRevealIdentity.mockRejectedValue(new Error('Reveal failed'));

    renderWithProviders(<PrivacySettings />);

    const revealButton = screen.getByText('Reveal My Identity');
    fireEvent.click(revealButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to reveal identity.',
        variant: 'destructive',
      });
    });
  });

  it.skip('should show reveal identity button only when identity not revealed', () => {
    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: {
        id: 'profile-id',
        handle: 'MysteriousObserver1234',
        displayName: 'Anonymous MysteriousObserver1234',
        isAnonymous: true,
        canRevealIdentity: true, // Already revealed
        createdAt: '2025-01-28T00:00:00Z',
      },
      isLoading: false,
      error: null,
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<PrivacySettings />);

    expect(screen.queryByText('Reveal My Identity')).not.toBeInTheDocument();
  });
});

/**
 * Tests for PrivacySettings component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivacySettings } from '../PrivacySettings';
import { useAnonymousHandle } from '@/hooks/useAnonymousHandle';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
jest.mock('@/hooks/useAnonymousHandle');
jest.mock('@/hooks/use-toast');

const mockUseAnonymousHandle = useAnonymousHandle as jest.MockedFunction<typeof useAnonymousHandle>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('PrivacySettings', () => {
  const mockToast = jest.fn();
  const mockToggleAnonymity = jest.fn();
  const mockUpdateDisplayName = jest.fn();
  const mockRevealIdentity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
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
      createAnonymousHandle: jest.fn(),
      refetch: jest.fn(),
    });
  });

  it('should render privacy settings correctly', () => {
    render(<PrivacySettings />);

    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Control your visibility and anonymity on the platform')).toBeInTheDocument();
    expect(screen.getByText('Anonymous Mode')).toBeInTheDocument();
    expect(screen.getByText('Current Handle')).toBeInTheDocument();
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('should show current anonymous handle', () => {
    render(<PrivacySettings />);

    expect(screen.getByText('MysteriousObserver1234')).toBeInTheDocument();
    expect(screen.getByText('Anonymous MysteriousObserver1234')).toBeInTheDocument();
  });

  it('should toggle anonymity when switch is clicked', async () => {
    render(<PrivacySettings />);

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
    render(<PrivacySettings />);

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
    render(<PrivacySettings />);

    const updateButton = screen.getByText('Update');
    expect(updateButton).toBeDisabled();
  });

  it('should reveal identity when button is clicked', async () => {
    render(<PrivacySettings />);

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

  it('should show loading state', () => {
    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: null,
      isLoading: true,
      error: null,
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: jest.fn(),
      refetch: jest.fn(),
    });

    render(<PrivacySettings />);

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
      createAnonymousHandle: jest.fn(),
      refetch: jest.fn(),
    });

    render(<PrivacySettings />);

    expect(screen.getByText('Failed to load privacy settings: Failed to load privacy settings')).toBeInTheDocument();
  });

  it('should show no handle found state', () => {
    mockUseAnonymousHandle.mockReturnValue({
      anonymousHandle: null,
      isLoading: false,
      error: null,
      toggleAnonymity: mockToggleAnonymity,
      updateDisplayName: mockUpdateDisplayName,
      revealIdentity: mockRevealIdentity,
      createAnonymousHandle: jest.fn(),
      refetch: jest.fn(),
    });

    render(<PrivacySettings />);

    expect(screen.getByText('No anonymous handle found. Please contact support.')).toBeInTheDocument();
  });

  it('should show warning for identity reveal', () => {
    render(<PrivacySettings />);

    expect(screen.getByText('Warning: Revealing your identity is a permanent action.')).toBeInTheDocument();
    expect(screen.getByText('Once revealed, you cannot return to full anonymity.')).toBeInTheDocument();
  });

  it('should show privacy information', () => {
    render(<PrivacySettings />);

    expect(screen.getByText('Privacy Information')).toBeInTheDocument();
    expect(screen.getByText('• Your anonymous handle is automatically generated and unique')).toBeInTheDocument();
    expect(screen.getByText('• You can change your display name at any time')).toBeInTheDocument();
    expect(screen.getByText('• Anonymous mode hides your real identity from other users')).toBeInTheDocument();
    expect(screen.getByText('• Revealing your identity is a permanent action')).toBeInTheDocument();
  });

  it('should handle toggle anonymity error', async () => {
    mockToggleAnonymity.mockRejectedValue(new Error('Toggle failed'));

    render(<PrivacySettings />);

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

  it('should handle update display name error', async () => {
    mockUpdateDisplayName.mockRejectedValue(new Error('Update failed'));

    render(<PrivacySettings />);

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

  it('should handle reveal identity error', async () => {
    mockRevealIdentity.mockRejectedValue(new Error('Reveal failed'));

    render(<PrivacySettings />);

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

  it('should show reveal identity button only when identity not revealed', () => {
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
      createAnonymousHandle: jest.fn(),
      refetch: jest.fn(),
    });

    render(<PrivacySettings />);

    expect(screen.queryByText('Reveal My Identity')).not.toBeInTheDocument();
  });
});

/**
 * Simple Test Component
 * Basic test to verify the testing environment is working
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple test component
const TestComponent = () => {
  return <div data-testid="test-component">Hello World</div>;
};

describe('Simple Test', () => {
  it('should render a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

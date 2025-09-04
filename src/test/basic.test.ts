/**
 * Basic Test
 * Simple test to verify the testing environment works
 */

import { describe, it, expect } from 'vitest';

describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const message = 'Hello World';
    expect(message).toContain('Hello');
    expect(message.length).toBe(11);
  });

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });
});

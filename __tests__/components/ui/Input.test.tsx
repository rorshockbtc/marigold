import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

/**
 * Behavioral Test: Input Primitive
 *
 * Tests label rendering, error state, onChange, and ref forwarding.
 */
describe('Input', () => {
  it('renders without label or error', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeDefined();
  });

  it('renders label when provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByText('Email Address')).toBeDefined();
  });

  it('renders error message when provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeDefined();
  });

  it('fires onChange when user types', () => {
    const handler = vi.fn();
    render(<Input onChange={handler} placeholder="type here" />);
    fireEvent.change(screen.getByPlaceholderText('type here'), {
      target: { value: 'hello' },
    });
    expect(handler).toHaveBeenCalled();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} placeholder="ref test" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

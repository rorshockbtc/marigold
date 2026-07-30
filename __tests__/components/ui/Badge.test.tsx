import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

/**
 * Behavioral Test: Badge Primitive
 *
 * Tests that Badge renders correctly with all variants.
 */
describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders all five variants without error', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info'] as const;
    variants.forEach(variant => {
      expect(() => {
        render(<Badge variant={variant}>{variant}</Badge>);
      }).not.toThrow();
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<Badge className="extra">Tag</Badge>);
    expect(container.firstElementChild?.classList.contains('extra')).toBe(true);
  });
});

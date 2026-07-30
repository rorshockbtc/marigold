import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

/**
 * Behavioral Test: Button Primitive
 *
 * Every button in the application must use this component.
 * This test proves the component enforces the UX contract:
 * - Buttons MUST do something when clicked.
 * - Buttons auto-generate data-testid for Playwright.
 * - Disabled buttons block interaction.
 */
describe('Button', () => {
  it('renders with primary variant by default', () => {
    render(<Button onClick={() => {}}>Click Me</Button>);
    const btn = screen.getByTestId('btn-click-me');
    expect(btn).toBeDefined();
    expect(btn.textContent).toBe('Click Me');
  });

  it('fires onClick handler exactly once when clicked', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Action</Button>);
    fireEvent.click(screen.getByTestId('btn-action'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('prevents click propagation when disabled', () => {
    const handler = vi.fn();
    render(<Button onClick={handler} disabled>Disabled</Button>);
    fireEvent.click(screen.getByTestId('btn-disabled'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does NOT throw when type="submit" (no onClick needed)', () => {
    expect(() => {
      render(<Button type="submit">Submit Form</Button>);
    }).not.toThrow();
  });

  it('does NOT throw when type="reset" (no onClick needed)', () => {
    expect(() => {
      render(<Button type="reset">Reset</Button>);
    }).not.toThrow();
  });

  it('THROWS in test environment when no onClick and no submit/reset type', () => {
    expect(() => {
      render(<Button>Dead Button</Button>);
    }).toThrow(/actionable intent/);
  });

  it('auto-generates data-testid from children text', () => {
    render(<Button onClick={() => {}}>Download CSV</Button>);
    expect(screen.getByTestId('btn-download-csv')).toBeDefined();
  });

  it('uses explicit data-testid when provided', () => {
    render(<Button onClick={() => {}} data-testid="custom-id">Text</Button>);
    expect(screen.getByTestId('custom-id')).toBeDefined();
  });

  it('renders all six variants without error', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost', 'outline', 'success'] as const;
    variants.forEach(variant => {
      expect(() => {
        render(<Button variant={variant} onClick={() => {}}>{variant}</Button>);
      }).not.toThrow();
    });
  });

  it('renders all three sizes without error', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach(size => {
      expect(() => {
        render(<Button size={size} onClick={() => {}}>{size}</Button>);
      }).not.toThrow();
    });
  });

  it('renders with an icon', () => {
    render(
      <Button onClick={() => {}} icon={<span data-testid="icon">★</span>}>
        Star It
      </Button>
    );
    expect(screen.getByTestId('icon')).toBeDefined();
  });
});

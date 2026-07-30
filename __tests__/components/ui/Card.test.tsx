import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

/**
 * Behavioral Test: Card Primitive
 *
 * Tests that Card, CardHeader, CardTitle, and CardContent compose
 * correctly and render children without errors.
 */
describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeDefined();
  });

  it('composes header, title, and content correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Body text</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Body text')).toBeDefined();
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstElementChild?.classList.contains('custom-class')).toBe(true);
  });
});

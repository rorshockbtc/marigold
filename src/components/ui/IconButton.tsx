import React from 'react';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for accessibility. Describes what the button does. */
  'aria-label': string;
  /** The icon element to render. */
  icon: React.ReactNode;
  size?: IconButtonSize;
  /** Explicit test ID. If omitted, auto-generated from aria-label. */
  'data-testid'?: string;
}

/**
 * Governed IconButton primitive.
 * For icon-only buttons (close, menu, toggle, etc.).
 * 
 * Enforcement:
 * - Requires `aria-label` (TypeScript enforced) for screen readers.
 * - Requires `onClick` handler — icon buttons that do nothing are banned.
 * - Auto-generates data-testid from aria-label for Playwright selectors.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', 'aria-label': ariaLabel, 'data-testid': explicitTestId, ...props }, ref) => {
    const isActionable = !!props.onClick || props.type === 'submit' || props.type === 'reset';

    if (!isActionable) {
      const msg = `IconButton "${ariaLabel}" must have an actionable intent (onClick, type="submit", or type="reset").`;
      if (process.env.NODE_ENV === 'test') {
        throw new Error(msg);
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn(msg);
      }
    }

    let testId = explicitTestId;
    if (!testId) {
      testId = `icon-btn-${ariaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }

    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12"
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${className}`}
        aria-label={ariaLabel}
        data-testid={testId}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

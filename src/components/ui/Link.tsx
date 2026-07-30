import React from 'react';
import NextLink from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';

export interface LinkProps extends Omit<NextLinkProps, 'passHref'> {
  children: React.ReactNode;
  className?: string;
  /** Explicit test ID. If omitted, auto-generated from children text content. */
  'data-testid'?: string;
  /** Standard HTML anchor attributes */
  target?: string;
  rel?: string;
}

/**
 * Governed Link primitive.
 * All navigation links in the application MUST use this component.
 * Raw <a href> elements are banned by the UAT enforcer (Rule 8).
 *
 * Enforcement:
 * - Requires `href` (enforced by TypeScript via NextLinkProps).
 * - Auto-generates data-testid from children text for Playwright selectors.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, className = '', 'data-testid': explicitTestId, ...props }, ref) => {
    let testId = explicitTestId;
    if (!testId && typeof children === 'string') {
      testId = `link-${children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }

    return (
      <NextLink
        ref={ref}
        className={`transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        data-testid={testId}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';

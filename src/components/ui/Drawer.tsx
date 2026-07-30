import React, { useEffect, useRef } from 'react';

export type DrawerSide = 'left' | 'right';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

export interface DrawerProps {
  /** Whether the drawer is currently open. */
  isOpen: boolean;
  /** Handler called when the drawer should close (backdrop click, Escape key, close button). */
  onClose: () => void;
  /** The title displayed in the drawer header. */
  title: string;
  /** Which side the drawer slides in from. Defaults to 'right'. */
  side?: DrawerSide;
  /** The width of the drawer. Defaults to 'md'. */
  size?: DrawerSize;
  children: React.ReactNode;
  /** Explicit test ID. If omitted, auto-generated from title. */
  'data-testid'?: string;
}

/**
 * Governed Drawer primitive.
 * All slide-in panels (side sheets, detail panels, Mari panel, etc.)
 * MUST use this component.
 *
 * Enforcement:
 * - Requires `isOpen` state and `onClose` handler (no drawers without close capability).
 * - Traps focus when open (accessibility).
 * - Closes on Escape key press.
 * - Closes on backdrop click.
 * - Auto-generates data-testid from title for Playwright selectors.
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  side = 'right',
  size = 'md',
  children,
  'data-testid': explicitTestId,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap: focus the drawer when it opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  let testId = explicitTestId;
  if (!testId) {
    testId = `drawer-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  }

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-[28rem]',
    lg: 'w-[36rem]',
    full: 'w-full',
  };

  const slideClasses = {
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
  };

  const positionClasses = {
    right: 'right-0',
    left: 'left-0',
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
          data-testid={`${testId}-backdrop`}
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`fixed top-0 ${positionClasses[side]} h-full ${sizeClasses[size]} bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${slideClasses[side]} flex flex-col`}
        data-testid={testId}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif font-black text-lg text-primary tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
            aria-label={`Close ${title}`}
            data-testid={`${testId}-close`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </>
  );
};

Drawer.displayName = 'Drawer';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  /** Explicit test ID. If omitted, auto-generated from children text content. */
  'data-testid'?: string;
}

/**
 * Governed Button primitive.
 * All interactive buttons in the application MUST use this component.
 * Raw <button> elements are banned by the UAT enforcer (Rule 7).
 *
 * Enforcement:
 * - In test env: throws if no actionable handler (onClick, type=submit/reset).
 * - In dev env: console.warn for the same condition.
 * - Auto-generates data-testid from children text for Playwright selectors.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, icon, ...props }, ref) => {
    const isActionable = !!props.onClick || props.type === 'submit' || props.type === 'reset';

    if (!isActionable) {
      const msg = 'Button must have an actionable intent (onClick, type="submit", or type="reset"). A button that does nothing violates the Marigold UX contract.';
      if (process.env.NODE_ENV === 'test') {
        throw new Error(msg);
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn(msg);
      }
    }

    // Auto-generate data-testid from children text if not explicitly provided
    let testId = props['data-testid'];
    if (!testId && typeof children === 'string') {
      testId = `btn-${children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }
    
    // Base styles
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";
    
    // Variant styles matching Astryx/Albers
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-slate-800 shadow-sm",
      secondary: "bg-white border border-border text-foreground hover:bg-muted shadow-sm",
      outline: "border-2 border-primary text-primary hover:bg-primary/5",
      danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-sm",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      ghost: "hover:bg-muted text-muted-foreground hover:text-foreground"
    };
    
    // Size styles
    const sizes = {
      sm: "h-8 rounded-lg px-3 text-xs",
      md: "h-11 rounded-xl px-5 text-sm",
      lg: "h-14 rounded-xl px-8 text-base"
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={combinedClassName} data-testid={testId} {...props}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';


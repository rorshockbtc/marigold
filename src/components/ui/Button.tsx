import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, icon, ...props }, ref) => {
    
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
      <button ref={ref} className={combinedClassName} {...props}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

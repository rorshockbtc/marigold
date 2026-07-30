import React from 'react';

export interface ProgressBarProps {
  /** Progress value from 0 to 100. */
  progress: number;
  /** Optional label displayed above the bar. */
  label?: string;
  /** Visual variant. */
  variant?: 'default' | 'success' | 'danger' | 'accent';
  /** Height of the bar. */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the percentage text. */
  showPercentage?: boolean;
  className?: string;
  /** Explicit test ID. If omitted, auto-generated from label. */
  'data-testid'?: string;
}

/**
 * Governed ProgressBar primitive.
 * All progress indicators MUST use this component instead of inline
 * `style={{ width: `${progress}%` }}` patterns.
 *
 * This eliminates the most common legitimate use of inline styles
 * across the codebase (6+ instances found in audit).
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  variant = 'default',
  size = 'md',
  showPercentage = false,
  className = '',
  'data-testid': explicitTestId,
}) => {
  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  let testId = explicitTestId;
  if (!testId && label) {
    testId = `progress-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  } else if (!testId) {
    testId = 'progress-bar';
  }

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    danger: 'bg-red-500',
    accent: 'bg-amber-500',
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const trackSizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`} data-testid={testId}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-medium text-muted-foreground" data-testid={`${testId}-value`}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${trackSizeClasses[size]} bg-muted rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

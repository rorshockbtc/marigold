import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterControlProps {
  /** The currently selected value. */
  value: string;
  /** Handler called when the selection changes. Must update parent state. */
  onChange: (value: string) => void;
  /** The list of available options. */
  options: FilterOption[];
  /** Label displayed above the filter. */
  label?: string;
  /** Placeholder text when no value is selected. */
  placeholder?: string;
  className?: string;
  /** Explicit test ID. If omitted, auto-generated from label. */
  'data-testid'?: string;
}

/**
 * Governed FilterControl primitive.
 * All filter dropdowns, select menus, and option pickers MUST use this component.
 * Raw <select> elements are banned by the UAT enforcer (Rule 9).
 *
 * Enforcement:
 * - Requires `value` and `onChange` — a filter that doesn't update state is impossible.
 * - Requires `options[]` — a filter with no options is a dead element.
 * - Auto-generates data-testid from label for Playwright selectors.
 */
export const FilterControl: React.FC<FilterControlProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select...',
  className = '',
  'data-testid': explicitTestId,
}) => {
  let testId = explicitTestId;
  if (!testId && label) {
    testId = `filter-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  } else if (!testId) {
    testId = 'filter-control';
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          className="text-xs font-bold text-muted-foreground tracking-wide uppercase"
          htmlFor={testId}
        >
          {label}
        </label>
      )}
      <select
        id={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        data-testid={testId}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

FilterControl.displayName = 'FilterControl';

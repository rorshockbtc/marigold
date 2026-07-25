import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-border">
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-3xl font-serif text-text-header flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h1>
        {subtitle && (
          <div className="text-sm text-text-body mt-1">
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex gap-3 mt-4 md:mt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

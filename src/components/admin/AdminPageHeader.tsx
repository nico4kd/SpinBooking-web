import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <header className="h-16 border-b border-[hsl(var(--border-default))] flex items-center justify-between pl-16 pr-4 sm:px-6 lg:px-8 bg-[hsl(var(--surface-0))]">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold truncate">{title}</h1>
        {subtitle && <p className="text-sm text-secondary truncate">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}

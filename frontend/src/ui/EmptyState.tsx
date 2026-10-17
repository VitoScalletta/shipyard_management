import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType; // LucideIcon yerine React'ın evrensel tipini kullandık
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-700/50 bg-slate-900/20 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/80 text-slate-500 shadow-inner border border-slate-800">
        <Icon className="h-8 w-8" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-sans text-lg font-bold text-slate-200">{title}</h3>
        <p className="max-w-sm font-sans text-sm text-slate-400">{description}</p>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
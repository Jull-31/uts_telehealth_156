import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function Alert({
  type = 'warning',
  title,
  children,
  action,
  className = '',
}) {
  const styles = {
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    danger: {
      bg: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-primary-soft/80 border-sky-200 text-sky-950',
      icon: <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div
      role="alert"
      className={`p-4 rounded-card border flex items-start gap-3.5 text-sm shadow-soft-sm ${current.bg} ${className}`}
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold mb-0.5 leading-snug">{title}</h4>}
        <div className="leading-relaxed text-inherit">{children}</div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
}

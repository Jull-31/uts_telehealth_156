import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateQ({
  question,
  value = '',
  onChange,
  error,
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = question.max || todayStr;

  return (
    <div className="space-y-1.5">
      <div className="relative flex items-center">
        <input
          type="date"
          id={`input-${question.id}`}
          value={value || ''}
          max={maxDate}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-12 pl-3.5 pr-10 bg-surface rounded-control text-base text-text border transition-colors focus:outline-hidden focus:ring-2 ${
            error
              ? 'border-danger focus:ring-red-200'
              : 'border-slate-300 focus:border-primary focus:ring-indigo-100'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `err-${question.id}` : undefined}
        />
        <Calendar className="w-5 h-5 text-muted absolute right-3.5 pointer-events-none" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-0.5">
        <div>
          {error ? (
            <span id={`err-${question.id}`} className="text-danger font-medium" role="alert">
              {error}
            </span>
          ) : (
            <span>Maksimal hari ini ({todayStr})</span>
          )}
        </div>
      </div>
    </div>
  );
}

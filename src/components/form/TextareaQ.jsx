import React from 'react';

export default function TextareaQ({
  question,
  value = '',
  onChange,
  error,
}) {
  const maxLength = question.max_length || 500;
  const currentLength = (value || '').length;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <textarea
          id={`input-${question.id}`}
          rows={3}
          value={value || ''}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'Tulis keterangan tambahan jika ada...'}
          className={`w-full p-3.5 bg-surface rounded-control text-base text-text border transition-colors focus:outline-hidden focus:ring-2 resize-y min-h-[96px] ${
            error
              ? 'border-danger focus:ring-red-200'
              : 'border-slate-300 focus:border-primary focus:ring-indigo-100'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `err-${question.id}` : undefined}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-0.5">
        <div>
          {error && (
            <span id={`err-${question.id}`} className="text-danger font-medium" role="alert">
              {error}
            </span>
          )}
        </div>
        <span className="font-mono ml-auto">
          {currentLength} / {maxLength} karakter
        </span>
      </div>
    </div>
  );
}

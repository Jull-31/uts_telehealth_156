import React from 'react';
import { Check } from 'lucide-react';

export default function SingleChoiceQ({
  question,
  value,
  onChange,
  error,
}) {
  const options = question.options || [];

  return (
    <div className="space-y-3" role="radiogroup" aria-labelledby={`label-${question.id}`}>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const optValue = opt.code || opt.value || opt.id;
          const optLabel = opt.label || opt.text || opt.title || optValue;
          const isSelected = value === optValue;

          return (
            <button
              key={optValue}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(optValue)}
              className={`min-h-[44px] px-4 py-2.5 rounded-control text-sm font-medium transition-all text-left flex items-center justify-between gap-3 border ${
                isSelected
                  ? 'border-2 border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                  : 'border-border bg-surface text-text hover:bg-slate-50 active:bg-slate-100'
              } ${options.length <= 3 ? 'flex-1 min-w-[120px]' : 'w-full sm:w-auto'}`}
            >
              <span className="leading-snug">{optLabel}</span>
              {isSelected && <Check className="w-4 h-4 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1" role="alert">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

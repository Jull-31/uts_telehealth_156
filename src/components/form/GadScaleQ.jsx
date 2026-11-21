import React from 'react';
import { Check } from 'lucide-react';

export default function GadScaleQ({
  question,
  value,
  onChange,
  error,
}) {
  const options = question.options || [
    { value: 0, label: 'Tidak sama sekali' },
    { value: 1, label: 'Beberapa hari' },
    { value: 2, label: 'Lebih dari separuh waktu' },
    { value: 3, label: 'Hampir setiap hari' },
  ];

  const numericValue = value !== undefined && value !== null && value !== '' ? Number(value) : null;

  return (
    <div className="space-y-2.5" role="radiogroup" aria-labelledby={`label-${question.id}`}>
      {options.map((opt) => {
        const optVal = Number(opt.value !== undefined ? opt.value : opt.code);
        const isSelected = numericValue === optVal;

        return (
          <button
            key={optVal}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(optVal)}
            className={`w-full min-h-[48px] px-4 py-3 rounded-control text-sm transition-all text-left flex items-center justify-between border ${
              isSelected
                ? 'border-2 border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                : 'border-border bg-surface text-text hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {optVal}
              </span>
              <span className="leading-snug">{opt.label || opt.text}</span>
            </div>
            {isSelected && <Check className="w-4 h-4 shrink-0 text-primary" />}
          </button>
        );
      })}

      {error && (
        <p className="text-xs text-danger font-medium mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

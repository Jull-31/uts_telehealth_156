import React from 'react';
import { Check } from 'lucide-react';
import { handleMultiChoiceChange } from '../../lib/formEngine';

export default function MultiChoiceQ({
  question,
  value = [],
  onChange,
  error,
}) {
  const options = question.options || [];
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (optCode, isExclusive) => {
    const updated = handleMultiChoiceChange(selectedValues, optCode, isExclusive, options);
    onChange(updated);
  };

  return (
    <div className="space-y-3" role="group" aria-labelledby={`label-${question.id}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const optValue = opt.code || opt.value || opt.id;
          const optLabel = opt.label || opt.text || optValue;
          const isExclusive = Boolean(opt.exclusive);
          const isSelected = selectedValues.includes(optValue);

          return (
            <button
              key={optValue}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => handleToggle(optValue, isExclusive)}
              className={`min-h-[48px] px-4 py-3 rounded-control text-sm font-medium transition-all text-left flex items-start gap-3 border ${
                isSelected
                  ? 'border-2 border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                  : 'border-border bg-surface text-text hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-sm border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="flex-1 leading-snug">
                <span>{optLabel}</span>
                {isExclusive && (
                  <span className="block text-[11px] text-muted font-normal mt-0.5">
                    (Pilihan tunggal / melepaskan pilihan lain)
                  </span>
                )}
              </div>
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

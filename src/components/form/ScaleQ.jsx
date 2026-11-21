import React from 'react';

export default function ScaleQ({
  question,
  value,
  onChange,
  error,
}) {
  // If question has specific options or min/max
  const options = question.options || [];
  
  // Default 1-5 if no options defined
  const scaleItems = options.length > 0 
    ? options.map(opt => ({
        val: typeof opt.value !== 'undefined' ? Number(opt.value) : Number(opt.code),
        label: opt.label || opt.text || ''
      }))
    : [
        { val: 1, label: question.min_label || 'Sangat jarang' },
        { val: 2, label: '' },
        { val: 3, label: 'Kadang-kadang' },
        { val: 4, label: '' },
        { val: 5, label: question.max_label || 'Sangat sering' },
      ];

  const numericValue = value !== undefined && value !== null ? Number(value) : null;

  return (
    <div className="space-y-3" role="radiogroup" aria-labelledby={`label-${question.id}`}>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {scaleItems.map((item) => {
          const isSelected = numericValue === item.val;
          return (
            <button
              key={item.val}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(item.val)}
              className={`min-h-[52px] sm:min-h-[64px] rounded-control border flex flex-col items-center justify-center p-1.5 transition-all ${
                isSelected
                  ? 'border-2 border-primary bg-primary-soft text-primary font-bold shadow-xs'
                  : 'border-border bg-surface text-text hover:bg-slate-50'
              }`}
            >
              <span className="text-base sm:text-lg font-bold">{item.val}</span>
              {item.label && (
                <span className="text-[10px] sm:text-xs text-center font-normal line-clamp-2 leading-tight mt-0.5 text-muted">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-danger font-medium mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

import React from 'react';

export default function NumberQ({
  question,
  value,
  onChange,
  error,
}) {
  const isDecimal = question.step && String(question.step).includes('.');
  const unit = question.unit || question.satuan || '';

  const handleChange = (e) => {
    const valStr = e.target.value;
    if (valStr === '') {
      onChange(null);
      return;
    }
    const parsed = isDecimal ? parseFloat(valStr) : parseInt(valStr, 10);
    onChange(isNaN(parsed) ? valStr : parsed);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative flex items-center">
        <input
          type="number"
          id={`input-${question.id}`}
          value={value !== undefined && value !== null ? value : ''}
          step={question.step || (isDecimal ? '0.1' : '1')}
          min={question.min}
          max={question.max}
          inputMode={isDecimal ? 'decimal' : 'numeric'}
          placeholder={
            question.min !== undefined && question.max !== undefined
              ? `${question.min} – ${question.max}`
              : '0'
          }
          onChange={handleChange}
          className={`w-full h-12 pl-3.5 pr-14 bg-surface rounded-control text-base text-text border transition-colors focus:outline-hidden focus:ring-2 font-mono ${
            error
              ? 'border-danger focus:ring-red-200'
              : 'border-slate-300 focus:border-primary focus:ring-indigo-100'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `err-${question.id}` : undefined}
        />
        {unit && (
          <div className="absolute right-3.5 pointer-events-none text-sm font-semibold text-muted">
            {unit}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-0.5">
        <div>
          {error ? (
            <span id={`err-${question.id}`} className="text-danger font-medium" role="alert">
              {error}
            </span>
          ) : (
            question.min !== undefined &&
            question.max !== undefined && (
              <span>
                Rentang valid: {question.min} – {question.max} {unit}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

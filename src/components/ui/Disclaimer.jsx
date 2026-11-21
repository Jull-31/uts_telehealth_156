import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Disclaimer({ variant = 'footer', text, className = '' }) {
  const defaultText = text || 'Hasil self-assessment bukan diagnosis. Laporan Anda akan ditinjau oleh tenaga kesehatan.';

  if (variant === 'box') {
    return (
      <div className={`p-3.5 bg-accent-soft text-[#78350F] rounded-control border border-amber-200 text-xs sm:text-sm flex items-start gap-2.5 ${className}`}>
        <AlertCircle className="w-4 h-4 shrink-0 text-accent mt-0.5" />
        <span className="font-medium leading-relaxed">{defaultText}</span>
      </div>
    );
  }

  // Default footer variant
  return (
    <div className={`py-4 px-2 text-center text-xs text-muted leading-relaxed ${className}`}>
      <p>{defaultText}</p>
    </div>
  );
}

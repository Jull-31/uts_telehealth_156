import React from 'react';

/**
 * StatusBadge component following design.md specs
 * Supports status_pengiriman and status_peninjauan with modern micro-dot indicators
 */
export default function StatusBadge({ status, type = 'peninjauan', className = '' }) {
  if (!status) return null;

  const kode = typeof status === 'object' ? status.kode : status;
  const label = typeof status === 'object' ? status.label : status;

  // Exact color mapping + subtle dot colors
  const config = {
    // Draft & Belum dikirim
    draft: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    belum_dikirim: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    // Terkirim & Sudah ditinjau
    terkirim: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    sudah_ditinjau: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    // Menunggu peninjauan
    menunggu_peninjauan: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    // Sedang ditinjau
    sedang_ditinjau: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-500',
    },
    // Perlu klarifikasi
    perlu_klarifikasi: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
    // Klarifikasi sudah dijawab
    klarifikasi_dijawab: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
    },
  };

  const current = config[kode] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap leading-none border shadow-2xs ${current.bg} ${className}`}
      data-kode={kode}
      data-type={type}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{label || kode}</span>
    </span>
  );
}

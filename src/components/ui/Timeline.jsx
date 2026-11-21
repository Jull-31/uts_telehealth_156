import React from 'react';
import { Check, Clock, AlertCircle, MessageSquare, FileCheck } from 'lucide-react';

export default function Timeline({ events = [], className = '' }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-sm text-muted italic py-2">Belum ada riwayat aktivitas.</p>
    );
  }

  // Format date helper (WIB: UTC+7)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(date) + ' WIB';
    } catch (e) {
      return isoString;
    }
  };

  const getEventIcon = (event) => {
    switch (event) {
      case 'dibuat':
        return <Clock className="w-3.5 h-3.5 text-slate-600" />;
      case 'dikirim':
        return <FileCheck className="w-3.5 h-3.5 text-primary" />;
      case 'mulai_ditinjau':
      case 'sedang_ditinjau':
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 'klarifikasi_diminta':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'klarifikasi_dijawab':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
      case 'tindak_lanjut':
      case 'sudah_ditinjau':
        return <Check className="w-3.5 h-3.5 text-green-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getDotBg = (event) => {
    switch (event) {
      case 'dikirim':
        return 'bg-primary-soft border-primary';
      case 'mulai_ditinjau':
        return 'bg-blue-50 border-blue-500';
      case 'klarifikasi_diminta':
        return 'bg-amber-50 border-amber-500';
      case 'klarifikasi_dijawab':
        return 'bg-purple-50 border-purple-500';
      case 'tindak_lanjut':
      case 'sudah_ditinjau':
        return 'bg-green-50 border-green-500';
      default:
        return 'bg-slate-100 border-slate-400';
    }
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border ${className}`}>
      {events.map((ev, idx) => {
        const time = formatTime(ev.waktu || ev.created_at || ev.timestamp);
        const title = ev.keterangan || ev.label || ev.event;
        const actor = ev.oleh ? `Oleh: ${ev.oleh}` : null;

        return (
          <div key={idx} className="relative group">
            {/* Dot Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white shadow-sm ${getDotBg(
                ev.event
              )}`}
            >
              {getEventIcon(ev.event)}
            </div>

            <div className="text-sm">
              <p className="font-semibold text-text leading-tight">{title}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted mt-1">
                <span>{time}</span>
                {actor && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-slate-600">{actor}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

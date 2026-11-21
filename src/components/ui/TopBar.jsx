import React from 'react';
import { Menu, ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({
  title = 'Beranda',
  showBack = false,
  onBack,
  onOpenDrawer,
  rightAction,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-ink/95 backdrop-blur-md text-white px-4 flex items-center justify-between border-b border-slate-800 shadow-soft-sm lg:hidden">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center -ml-2 rounded-control text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenDrawer}
            className="w-11 h-11 flex items-center justify-center -ml-2 rounded-control text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          {!showBack && (
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
          )}
          <h1 className="text-base font-bold text-white truncate leading-tight tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {rightAction && (
        <div className="flex items-center shrink-0 ml-2">{rightAction}</div>
      )}
    </header>
  );
}

import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, CheckSquare, User, X, Activity } from 'lucide-react';
import { getMahasiswa } from '../../lib/config';

export default function Drawer({ isOpen, onClose }) {
  const mhs = getMahasiswa();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems = [
    { to: '/', label: 'Beranda', icon: Home, end: true },
    { to: '/riwayat', label: 'Riwayat Laporan', icon: History },
    { to: '/status-uts', label: 'Status UTS', icon: CheckSquare },
    { to: '/identitas', label: 'Identitas & Token', icon: User },
  ];

  const initials = mhs.nama
    ? mhs.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JF';

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (280px) */}
      <aside
        className="fixed top-0 bottom-0 left-0 w-[280px] bg-ink text-white flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-slate-800"
        aria-label="Menu Navigasi Mobile"
      >
        {/* Drawer Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Activity className="w-4 h-4 text-sky-400 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base text-white">Telehealth</span>
              <span className="block text-[10px] text-sky-300 font-medium">Portal Pasien</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-control hover:bg-white/10 active:bg-white/20 text-slate-300 transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-control text-sm font-semibold transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-primary text-white shadow-soft-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Student Identity Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-xs truncate">{mhs.nama}</p>
              <p className="text-[11px] text-sky-300 font-mono">{mhs.nim}</p>
              <p className="text-[10px] text-slate-400">Kelas {mhs.kelas}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, CheckSquare, User, Activity } from 'lucide-react';
import { getMahasiswa } from '../../lib/config';

export default function Sidebar() {
  const mhs = getMahasiswa();

  const navItems = [
    { to: '/', label: 'Beranda', icon: Home, end: true },
    { to: '/riwayat', label: 'Riwayat Laporan', icon: History },
    { to: '/status-uts', label: 'Status UTS', icon: CheckSquare },
    { to: '/identitas', label: 'Identitas & Token', icon: User },
  ];

  // Initials for avatar
  const initials = mhs.nama
    ? mhs.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JF';

  return (
    <aside
      className="hidden lg:flex fixed top-0 bottom-0 left-0 w-[220px] bg-ink text-white flex-col z-30 border-r border-slate-800/90 select-none shadow-soft-md"
      aria-label="Navigasi Utama Desktop"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-xs">
            <Activity className="w-4 h-4 text-sky-400 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Telehealth
            </h1>
            <p className="text-[11px] text-sky-300 font-medium tracking-wide mt-1">
              Portal Pasien
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-white shadow-soft-sm font-bold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Student Badge Footer for Julius Ferdinan */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-xs truncate" title={mhs.nama}>
              {mhs.nama}
            </p>
            <p className="text-[11px] text-sky-300 font-mono truncate">{mhs.nim}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Kelas {mhs.kelas} · Aktif</span>
        </div>
      </div>
    </aside>
  );
}

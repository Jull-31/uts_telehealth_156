import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <AppShell title="Halaman Tidak Ditemukan" maxWidth="max-w-md">
      <div className="py-12 sm:py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-muted rounded-full flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink">404 - Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
          Tautan yang Anda tuju mungkin sudah dipindahkan atau nomor laporan tidak terdaftar.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-soft-sm"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

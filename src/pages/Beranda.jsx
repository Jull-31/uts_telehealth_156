import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import { getMahasiswa, getApiToken } from '../lib/config';
import {
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Beranda() {
  const [profile, setProfile] = useState(null);
  const [forms, setForms] = useState([]);
  const [utsData, setUtsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasToken, setHasToken] = useState(Boolean(getApiToken()));
  const navigate = useNavigate();
  const mhs = getMahasiswa();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getApiToken();
      setHasToken(Boolean(token));

      if (!token) {
        setLoading(false);
        return;
      }

      const [meRes, formsRes] = await Promise.all([
        api.getMe(mhs.nim).catch((err) => {
          if (err.status === 401) throw err;
          return null;
        }),
        api.getForms().catch(() => ({ data: [] })),
      ]);

      if (meRes?.data) setProfile(meRes.data);
      if (formsRes?.data) setForms(formsRes.data);

      // Only check UTS status if student already has submissions to prevent 404
      const hasReports = (meRes?.data?.statistik?.total || 0) > 0;
      if (hasReports) {
        try {
          const utsRes = await api.getUtsStatus(mhs.nim);
          if (utsRes?.data) setUtsData(utsRes.data);
        } catch (utsErr) {
          if (utsErr.status === 404) {
            setUtsData({ bukti_fitur: { tercapai: 0, total: 10 } });
          }
        }
      } else {
        setUtsData({ bukti_fitur: { tercapai: 0, total: 10 } });
      }
    } catch (err) {
      console.error('Error loading Beranda data:', err);
      if (err.status === 401) {
        setError('Token pasien belum diisi atau tidak valid. Silakan atur token di menu Pengaturan.');
      } else {
        setError(err.message || 'Gagal memuat data dari server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = profile?.statistik || {
    draf: 0,
    menunggu: 0,
    perlu_klarifikasi: 0,
    sudah_ditinjau: 0,
  };

  const tercapaiCount = utsData?.bukti_fitur?.tercapai || 0;
  const totalBukti = utsData?.bukti_fitur?.total || 10;
  const progressPercent = Math.min(100, Math.round((tercapaiCount / totalBukti) * 100));

  return (
    <AppShell
      title="Beranda"
      rightAction={
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="p-2 text-muted hover:text-text rounded-control hover:bg-slate-100 transition-colors"
          title="Muat ulang data"
          aria-label="Muat ulang data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Token Alert if token missing */}
        {!hasToken && (
          <Alert
            type="warning"
            title="Token Pasien Belum Dikonfigurasi"
            action={
              <Link
                to="/identitas"
                className="px-3.5 py-1.5 bg-amber-600 text-white font-semibold rounded-control text-xs hover:bg-amber-700 transition-colors shadow-xs"
              >
                Atur Token
              </Link>
            }
          >
            Aplikasi memerlukan token pasien dari dosen untuk dapat mengakses data dan formulir.
          </Alert>
        )}

        {/* Global Error Banner */}
        {error && (
          <Alert type="danger" title="Koneksi Bermasalah">
            {error}
            <div className="mt-2">
              <button
                type="button"
                onClick={loadData}
                className="text-xs font-bold text-danger underline hover:no-underline"
              >
                Coba lagi
              </button>
            </div>
          </Alert>
        )}

        {/* Modern Greeting Banner */}
        <section className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-card shadow-soft-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-sky-200 text-xs font-medium backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Portal Pasien Telehealth</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Halo, {profile?.nama || 'Pasien'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {profile?.id ? `Akun ${profile.id}` : 'Pasien Umum'}
              {profile?.no_rm ? ` · Rekam Medis: ${profile.no_rm}` : ''}
            </p>
          </div>
          {/* Subtle decorative glowing circle */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Modern Bento Stats Grid */}
        <section aria-label="Statistik Laporan">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Draf */}
            <div className="p-4 sm:p-5 bg-surface rounded-card border border-border shadow-soft-sm hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Draf</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-ink font-mono">
                {loading ? '–' : stats.draf ?? 0}
              </p>
              <p className="text-[11px] text-muted mt-1">Belum dikirim</p>
            </div>

            {/* Menunggu */}
            <div className="p-4 sm:p-5 bg-surface rounded-card border border-border shadow-soft-sm hover:border-sky-300 transition-all">
              <div className="flex items-center justify-between text-sky-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Menunggu</span>
                <Activity className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 font-mono">
                {loading ? '–' : stats.menunggu ?? 0}
              </p>
              <p className="text-[11px] text-muted mt-1">Antrean peninjauan</p>
            </div>

            {/* Perlu Klarifikasi */}
            <div className="p-4 sm:p-5 bg-surface rounded-card border border-border shadow-soft-sm hover:border-rose-300 transition-all">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Klarifikasi</span>
                <AlertTriangle className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-accent font-mono">
                {loading ? '–' : stats.perlu_klarifikasi ?? 0}
              </p>
              <p className="text-[11px] text-muted mt-1">Butuh respons</p>
            </div>

            {/* Sudah Ditinjau */}
            <div className="p-4 sm:p-5 bg-surface rounded-card border border-border shadow-soft-sm hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Selesai</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                {loading ? '–' : stats.sudah_ditinjau ?? 0}
              </p>
              <p className="text-[11px] text-muted mt-1">Laporan disetujui</p>
            </div>
          </div>
        </section>

        {/* Alert Klarifikasi Banner */}
        {!loading && stats.perlu_klarifikasi > 0 && (
          <div className="p-4 bg-accent-soft rounded-card border border-rose-200 flex items-center justify-between gap-3 text-sm shadow-soft-sm">
            <div className="flex items-center gap-2.5 text-rose-950 font-semibold">
              <AlertTriangle className="w-5 h-5 text-accent shrink-0" />
              <span>
                {stats.perlu_klarifikasi} laporan memerlukan tanggapan klarifikasi dari dokter.
              </span>
            </div>
            <Link
              to="/riwayat?filter=perlu_klarifikasi"
              className="text-xs sm:text-sm font-bold text-rose-700 underline hover:text-rose-900 shrink-0"
            >
              Jawab Sekarang
            </Link>
          </div>
        )}

        {/* Formulir Pilihan (Cards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ink tracking-tight">Formulir Self-Assessment</h3>
            <span className="text-xs text-muted">Pilih formulir untuk mulai</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: FRM-KELUHAN (Wajib) */}
            <div className="p-6 bg-surface rounded-card border border-border shadow-soft-sm flex flex-col justify-between hover:border-sky-300 hover:shadow-soft-md transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    Wajib Konsultasi
                  </span>
                  <span className="text-xs text-muted font-medium">± 5 menit · 21 butir</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                  Formulir Keluhan Pasien Sebelum Konsultasi
                </h4>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Ceritakan kondisi kesehatan Anda sebelum berkonsultasi. Jawaban Anda ditinjau langsung oleh dokter penanggung jawab.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/petunjuk/FRM-KELUHAN"
                  className="w-full min-h-[44px] px-4 py-3 rounded-control bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:bg-sky-800 transition-colors flex items-center justify-center gap-2 shadow-soft-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Mulai Self-Assessment</span>
                </Link>
              </div>
            </div>

            {/* Card 2: FRM-GAD7 (Bonus) */}
            <div className="p-6 bg-surface rounded-card border border-border shadow-soft-sm flex flex-col justify-between hover:border-rose-300 hover:shadow-soft-md transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    Bonus · Skala Skor
                  </span>
                  <span className="text-xs text-muted font-medium">± 3 menit · 8 butir</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-ink leading-snug group-hover:text-rose-600 transition-colors">
                  Kuesioner Kecemasan (GAD-7)
                </h4>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Instrumen tervalidasi klinis untuk memantau indikator kecemasan dalam 2 minggu terakhir lengkap dengan skor & kategori.
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/petunjuk/FRM-GAD7"
                  className="w-full min-h-[44px] px-4 py-3 rounded-control border-2 border-primary text-primary bg-white text-sm font-semibold hover:bg-primary-soft transition-colors flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Mulai Kuesioner GAD-7</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Status Tugas UTS Card */}
        <section aria-label="Status Tugas UTS">
          <div className="p-6 bg-surface rounded-card border border-border shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">Status Penilaian UTS</h3>
                <p className="text-xs text-muted mt-0.5">
                  10 Bukti fitur dipantau otomatis oleh sistem
                </p>
              </div>
              <span className="text-xl font-bold text-primary font-mono bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                {tercapaiCount}/{totalBukti}
              </span>
            </div>

            {/* Modern Rounded Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-muted font-medium">
                {progressPercent === 100
                  ? 'Semua bukti fitur lengkap (10/10)'
                  : `${totalBukti - tercapaiCount} bukti lagi untuk nilai sempurna 10/10`}
              </span>
              <Link
                to="/status-uts"
                className="font-bold text-primary hover:text-primary-dark flex items-center gap-1 group"
              >
                <span>Buka Detail UTS</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StickyBar from '../components/ui/StickyBar';
import Disclaimer from '../components/ui/Disclaimer';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Home,
  RefreshCw,
} from 'lucide-react';

export default function Hasil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hasilData, setHasilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHasil = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calls GET /assessments/{id}/hasil (triggers 'hasil' evidence)
      const res = await api.getAssessmentHasil(id);
      if (res.data) {
        setHasilData(res.data);
      }
    } catch (err) {
      console.error('Error fetching hasil:', err);
      setError(err.message || 'Gagal memuat ringkasan hasil assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHasil();
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Memuat Hasil..." showBack>
        <div className="space-y-4 max-w-2xl mx-auto py-12 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-card" />
          <div className="h-64 bg-slate-200 rounded-card" />
        </div>
      </AppShell>
    );
  }

  const hasil = hasilData?.hasil || hasilData || {};
  const skor = hasil.skor;
  const perubahan = hasil.perubahan;
  const ringkasan = hasil.ringkasan || [];
  const kelengkapan = hasil.kelengkapan || {};

  // GAD-7 Gauge Category colors
  const getCategoryColor = (kode) => {
    switch (kode) {
      case 'minimal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ringan':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sedang':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'berat':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <AppShell
      title="Hasil Assessment"
      showBack
      rightAction={
        <button
          type="button"
          onClick={loadHasil}
          className="p-2 text-muted hover:text-text rounded-control hover:bg-slate-100 transition-colors"
          title="Muat ulang hasil"
          aria-label="Muat ulang hasil"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pb-28 lg:pb-12">
        {error && (
          <Alert type="danger" title="Gagal Memuat Hasil">
            {error}
          </Alert>
        )}

        {/* 1. GAD-7 Score Card (If Score Instrument) */}
        {skor && (
          <div className="p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  Instrumen Tervalidasi
                </span>
                <h3 className="text-base sm:text-lg font-bold text-ink mt-1">
                  Skor Generalized Anxiety Disorder-7 (GAD-7)
                </h3>
              </div>
            </div>

            {/* Score & Category Display */}
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-ink font-mono">
                    {skor.total}
                  </span>
                  <span className="text-lg text-muted font-mono">/ {skor.maks || 21}</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Rentang skor kecemasan (0–21)
                </p>
              </div>

              {skor.kategori && (
                <div
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold border ${getCategoryColor(
                    skor.kategori.kode
                  )}`}
                >
                  {skor.kategori.label || skor.kategori.kode}
                </div>
              )}
            </div>

            {/* GAD-7 4-Segment Gauge Bar */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-4 gap-1 h-3 rounded-full overflow-hidden bg-slate-100 p-0.5">
                <div
                  className={`h-full rounded-l-full transition-opacity ${
                    skor.total <= 4 ? 'bg-green-500 ring-2 ring-green-600' : 'bg-green-200'
                  }`}
                  title="Minimal (0-4)"
                />
                <div
                  className={`h-full transition-opacity ${
                    skor.total >= 5 && skor.total <= 9
                      ? 'bg-blue-500 ring-2 ring-blue-600'
                      : 'bg-blue-200'
                  }`}
                  title="Ringan (5-9)"
                />
                <div
                  className={`h-full transition-opacity ${
                    skor.total >= 10 && skor.total <= 14
                      ? 'bg-amber-500 ring-2 ring-amber-600'
                      : 'bg-amber-200'
                  }`}
                  title="Sedang (10-14)"
                />
                <div
                  className={`h-full rounded-r-full transition-opacity ${
                    skor.total >= 15 ? 'bg-red-500 ring-2 ring-red-600' : 'bg-red-200'
                  }`}
                  title="Berat (15-21)"
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted font-medium px-1">
                <span>0 Minimal</span>
                <span>5 Ringan</span>
                <span>10 Sedang</span>
                <span>15–21 Berat</span>
              </div>
            </div>

            {/* Score interpretation */}
            {skor.keterangan && (
              <p className="text-xs sm:text-sm text-text leading-relaxed bg-slate-50 p-3.5 rounded-control border border-slate-200">
                {skor.keterangan}
              </p>
            )}
          </div>
        )}

        {/* 2. Perubahan vs Pengisian Sebelumnya (Bonus GAD-7 comparative test) */}
        {perubahan && (
          <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-ink">
                Perubahan dari Laporan Sebelumnya
              </h3>
            </div>

            {perubahan.skor && (
              <div className="flex items-center gap-3 p-3 bg-primary-soft/50 rounded-control border border-sky-100 text-sm">
                <span className="text-muted">Perubahan Skor:</span>
                <span className="font-bold text-text font-mono">
                  {perubahan.skor.sebelumnya} → {perubahan.skor.sekarang}
                </span>
                <span
                  className={`font-semibold ml-auto flex items-center gap-1 ${
                    perubahan.skor.selisih > 0
                      ? 'text-red-600'
                      : perubahan.skor.selisih < 0
                      ? 'text-green-600'
                      : 'text-muted'
                  }`}
                >
                  {perubahan.skor.selisih > 0 ? `+${perubahan.skor.selisih} (naik)` : `${perubahan.skor.selisih}`}
                </span>
              </div>
            )}

            {Array.isArray(perubahan.perubahan) && perubahan.perubahan.length > 0 && (
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-muted text-xs">Butir Pertanyaan yang Berubah:</p>
                <div className="divide-y divide-border/60 border border-border/60 rounded-control overflow-hidden">
                  {perubahan.perubahan.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row justify-between gap-1 text-xs sm:text-sm">
                      <span className="font-medium text-text">{item.label}</span>
                      <div className="text-muted text-xs flex items-center gap-1.5 shrink-0">
                        <span>{item.sebelumnya}</span>
                        <span>→</span>
                        <span className="font-semibold text-ink">{item.sekarang}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Ringkasan Jawaban (Wireframe W4) */}
        <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-bold text-base text-ink">Jawaban Anda</h3>
            {kelengkapan.label && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {kelengkapan.label} ({kelengkapan.persen}%)
              </span>
            )}
          </div>

          <dl className="divide-y divide-border/60 text-sm">
            {ringkasan.map((item, idx) => {
              const isPengukuran = item.data_type === 'pengukuran';
              return (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                  <dt className="text-muted text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{item.label || item.pertanyaan}</span>
                    {isPengukuran && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        pengukuran
                      </span>
                    )}
                  </dt>
                  <dd className="font-semibold text-text text-sm sm:text-right shrink-0">
                    {item.terisi === false || item.jawaban_teks === 'Belum diisi' ? (
                      <span className="italic text-muted font-normal">Belum diisi</span>
                    ) : (
                      item.jawaban_teks || String(item.jawaban)
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* 4. Keterbatasan Hasil Box (Amber Alert per Wireframe W4) */}
        <div className="p-5 bg-accent-soft rounded-card border border-amber-300 space-y-2 text-xs sm:text-sm text-amber-950">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-accent shrink-0" />
            <h4>Keterbatasan Hasil</h4>
          </div>
          <p className="leading-relaxed">
            {hasil.keterbatasan ||
              'Hasil self-assessment BUKAN diagnosis medis. Hasil ini adalah alat bantu penapisan awal untuk persiapan konsultasi dengan tenaga medis yang berwenang.'}
          </p>
          {hasil.langkah_berikutnya && (
            <p className="text-xs text-amber-900 font-medium pt-1">
              <strong>Langkah berikutnya:</strong> {hasil.langkah_berikutnya}
            </p>
          )}
        </div>

        {/* Sticky Action Bar */}
        <StickyBar>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-control border-2 border-primary text-primary bg-white text-xs sm:text-sm font-semibold hover:bg-primary-soft transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/status/${id}`)}
            className="flex-1 min-h-[44px] px-6 py-2.5 rounded-control bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark active:bg-sky-800 transition-colors flex items-center justify-center gap-2 shadow-soft-sm"
          >
            <span>Pantau Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </StickyBar>
      </div>
    </AppShell>
  );
}

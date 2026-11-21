import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import { getMahasiswa } from '../lib/config';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Award,
  User,
  GraduationCap,
} from 'lucide-react';

export default function StatusUts() {
  const [utsData, setUtsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mhs = getMahasiswa();

  const loadUts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUtsStatus(mhs.nim);
      if (res.data) {
        setUtsData(res.data);
      }
    } catch (err) {
      if (err.status === 404) {
        // Normal API response when student has not yet submitted an assessment
        setUtsData({
          nim: mhs.nim,
          nama: mhs.nama,
          kelas: mhs.kelas,
          jumlah: { total: 0, terkirim: 0, draf: 0, sudah_ditinjau: 0 },
          bukti_fitur: {
            tercapai: 0,
            total: 10,
            daftar: defaultDaftarBukti.map((d) => ({ ...d, tercapai: false })),
          },
          penilaian: {
            status: { kode: 'belum_diperiksa', label: 'Belum ada pengiriman' },
            catatan: 'NIM belum pernah mengirim self-assessment. Silakan mulai isi dan kirim formulir keluhan agar bukti fitur tercatat otomatis oleh dosen.',
          },
        });
      } else {
        console.error('Error fetching UTS status:', err);
        setError(err.message || 'Gagal memuat status penilaian UTS.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUts();
  }, []);

  const defaultDaftarBukti = [
    { kode: 'buat', label: 'Membuat self-assessment (dengan persetujuan)' },
    { kode: 'simpan_draf', label: 'Menyimpan draf / melanjutkan pengisian' },
    { kode: 'validasi', label: 'Memeriksa jawaban sebelum kirim (dengan nim)' },
    { kode: 'kirim', label: 'Mengirim formulir keluhan (FRM-KELUHAN)' },
    { kode: 'riwayat', label: 'Menampilkan riwayat pengisian (?nim=)' },
    { kode: 'hasil', label: 'Menampilkan ringkasan hasil assessment' },
    { kode: 'status', label: 'Menampilkan pelacakan status peninjauan' },
    { kode: 'klarifikasi', label: 'Menjawab pertanyaan klarifikasi dari petugas' },
    { kode: 'tindak_lanjut', label: 'Menampilkan tindak lanjut medis setelah ditinjau' },
    { kode: 'gad7', label: 'Bonus: Kuesioner Kecemasan GAD-7 terkirim' },
  ];

  const tercapai = utsData?.bukti_fitur?.tercapai || 0;
  const total = utsData?.bukti_fitur?.total || 10;
  const persen = Math.min(100, Math.round((tercapai / total) * 100));

  const daftarBukti = utsData?.bukti_fitur?.daftar || defaultDaftarBukti;

  const penilaian = utsData?.penilaian || {
    status: { kode: 'belum_diperiksa', label: 'Belum diperiksa' },
  };

  const getStatusPenilaianStyle = (kode) => {
    switch (kode) {
      case 'disetujui':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'perlu_revisi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ditolak':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'belum_diperiksa':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <AppShell
      title="Status Tugas UTS"
      showBack
      rightAction={
        <button
          type="button"
          onClick={loadUts}
          disabled={loading}
          className="p-2 text-muted hover:text-text rounded-control hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Muat ulang bukti fitur"
          aria-label="Muat ulang bukti fitur"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Muat ulang</span>
        </button>
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pb-12">
        {error && (
          <Alert type="danger" title="Gagal Memuat Status UTS">
            {error}
          </Alert>
        )}

        {/* 1. Student Identity & Approval Status */}
        <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-ink leading-tight">
                  {utsData?.nama || mhs.nama}
                </h3>
                <p className="text-xs text-muted font-mono mt-0.5">
                  NIM: {utsData?.nim || mhs.nim} · Kelas {utsData?.kelas || mhs.kelas}
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusPenilaianStyle(
                penilaian.status?.kode
              )}`}
            >
              {penilaian.status?.label || 'Belum diperiksa'}
            </div>
          </div>

          {/* Lecturer Note if any */}
          {penilaian.catatan && (
            <div className="p-3.5 bg-slate-50 rounded-control border border-slate-200 text-xs sm:text-sm text-text">
              <p className="font-semibold text-muted text-xs uppercase tracking-wider mb-1">
                Catatan Dosen Pengampu:
              </p>
              <p className="leading-relaxed">{penilaian.catatan}</p>
            </div>
          )}

          {/* Submission Counts */}
          {utsData?.jumlah && (
            <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-control border border-border">
                <p className="font-bold text-base text-ink">{utsData.jumlah.total}</p>
                <p className="text-muted text-[11px]">Total</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-control border border-border">
                <p className="font-bold text-base text-primary">{utsData.jumlah.terkirim}</p>
                <p className="text-muted text-[11px]">Terkirim</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-control border border-border">
                <p className="font-bold text-base text-slate-600">{utsData.jumlah.draf}</p>
                <p className="text-muted text-[11px]">Draf</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-control border border-border">
                <p className="font-bold text-base text-green-600">{utsData.jumlah.sudah_ditinjau}</p>
                <p className="text-muted text-[11px]">Ditinjau</p>
              </div>
            </div>
          )}

          {/* Action CTA when 0 submissions yet */}
          {(utsData?.jumlah?.terkirim === 0 || tercapai === 0) && (
            <div className="p-4 bg-primary-soft/80 rounded-control border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-sky-950 font-medium leading-relaxed">
                NIM Anda belum mengirimkan formulir. Mulai pengisian pertama untuk mencatatkan 10 bukti fitur secara otomatis.
              </span>
              <Link
                to="/petunjuk/FRM-KELUHAN"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-control shrink-0 hover:bg-primary-dark transition-colors text-center shadow-soft-sm"
              >
                Mulai Isi Formulir
              </Link>
            </div>
          )}
        </div>

        {/* 2. 10 Bukti Fitur Progress & Checklist */}
        <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-ink">10 Bukti Fitur Otomatis</h3>
              <p className="text-xs text-muted mt-0.5">
                Tercatat otomatis di server saat frontend memanggil endpoint terkait.
              </p>
            </div>
            <span className="text-xl font-bold font-mono text-primary">
              {tercapai}/{total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${persen}%` }}
            />
          </div>

          {/* Checklist */}
          <div className="divide-y divide-border/60 border border-border/60 rounded-control overflow-hidden">
            {daftarBukti.map((item, idx) => {
              const isDone = Boolean(item.tercapai);
              return (
                <div
                  key={item.kode || idx}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    isDone ? 'bg-green-50/30' : 'bg-surface'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                        [{item.kode}]
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold leading-snug ${
                          isDone ? 'text-green-950' : 'text-text'
                        }`}
                      >
                        {item.label || item.kode}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isDone
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? 'Tercapai' : 'Belum'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips Box */}
        <div className="p-4 bg-primary-soft/60 rounded-control border border-sky-100 text-xs sm:text-sm text-sky-950 space-y-1 leading-relaxed">
          <p className="font-bold">Tips Penilaian:</p>
          <p>
            Kirim formulir lebih awal agar petugas (dosen) dapat memberikan permintaan klarifikasi dan mencatat tindak lanjut sebelum batas waktu pengumpulan.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

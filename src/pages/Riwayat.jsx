import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import { getMahasiswa } from '../lib/config';
import {
  FileText,
  Clock,
  Trash2,
  ArrowRight,
  Eye,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export default function Riwayat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mhs = getMahasiswa();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const activeFilter = searchParams.get('filter') || 'semua';

  // Delete draft state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRiwayat = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query params
      const params = { nim: mhs.nim };
      if (activeFilter === 'draf') {
        params.status_pengiriman = 'draft';
      } else if (activeFilter === 'perlu_klarifikasi') {
        params.status_peninjauan = 'perlu_klarifikasi';
      } else if (activeFilter === 'sudah_ditinjau') {
        params.status_peninjauan = 'sudah_ditinjau';
      } else if (activeFilter === 'diproses') {
        // diproses includes menunggu_peninjauan or sedang_ditinjau
      }

      const res = await api.getAssessments(params);
      let data = res.data || [];

      // Filter client side for diproses if needed
      if (activeFilter === 'diproses') {
        data = data.filter(
          (item) =>
            item.status_pengiriman?.kode === 'terkirim' &&
            ['menunggu_peninjauan', 'sedang_ditinjau', 'klarifikasi_dijawab'].includes(
              item.status_peninjauan?.kode
            )
        );
      }

      setItems(data);
    } catch (err) {
      console.error('Error fetching riwayat:', err);
      setError(err.message || 'Gagal memuat riwayat pengisian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiwayat();
  }, [activeFilter]);

  const handleDeleteDraft = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await api.deleteAssessment(deletingId);
      setItems((prev) => prev.filter((i) => i.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert(err.message || 'Gagal menghapus draf.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filterTabs = [
    { id: 'semua', label: 'Semua' },
    { id: 'draf', label: 'Draf' },
    { id: 'diproses', label: 'Diproses' },
    { id: 'perlu_klarifikasi', label: 'Perlu klarifikasi' },
    { id: 'sudah_ditinjau', label: 'Sudah ditinjau' },
  ];

  const formatTanggal = (isoString) => {
    if (!isoString) return '';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(isoString)) + ' WIB';
    } catch {
      return isoString;
    }
  };

  return (
    <AppShell
      title="Riwayat Self-Assessment"
      rightAction={
        <button
          type="button"
          onClick={loadRiwayat}
          disabled={loading}
          className="p-2 text-muted hover:text-text rounded-control hover:bg-slate-100 transition-colors"
          title="Muat ulang riwayat"
          aria-label="Muat ulang riwayat"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      }
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 pb-12">
        {error && (
          <Alert type="danger" title="Gagal Memuat">
            {error}
          </Alert>
        )}

        {/* Horizontal Scrollable Filter Chips (Mockup W1 / Page 6 of wireframe) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchParams({ filter: tab.id })}
                className={`min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-ink text-white border-ink shadow-xs'
                    : 'bg-surface text-muted border-border hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List of Assessment Cards */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-card" />
            <div className="h-32 bg-slate-200 rounded-card" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 sm:p-12 bg-surface rounded-card border border-border text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-muted rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-text text-base">Belum Ada Laporan</h3>
            <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
              {activeFilter === 'semua'
                ? 'Anda belum memiliki riwayat pengisian formulir. Mulai pengisian pertama Anda sekarang.'
                : `Tidak ada laporan pada kategori "${filterTabs.find((t) => t.id === activeFilter)?.label}".`}
            </p>
            <div className="pt-2">
              <Link
                to="/petunjuk/FRM-KELUHAN"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-control bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Mulai Self-Assessment</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isDraft = item.status_pengiriman?.kode === 'draft';
              const isPerluKlarifikasi = item.status_peninjauan?.kode === 'perlu_klarifikasi';
              const isSudahDitinjau = item.status_peninjauan?.kode === 'sudah_ditinjau';

              const cardTitle =
                item.judul ||
                (item.form?.id === 'FRM-GAD7'
                  ? 'Kuesioner Kecemasan (GAD-7)'
                  : 'Formulir Keluhan Pasien');

              const dateFormatted = formatTanggal(item.dikirim_pada || item.dibuat_pada);

              return (
                <div
                  key={item.id}
                  className="p-5 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Card Header & Status Badges */}
                  <div className="flex flex-wrap items-start justify-between gap-2.5">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {item.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-muted truncate">
                          {item.form?.judul || item.form?.id}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-ink leading-snug truncate">
                        {cardTitle}
                      </h3>
                    </div>

                    {/* Two Separate Badges (Design.md Principle 4) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={item.status_pengiriman} type="pengiriman" />
                      <StatusBadge status={item.status_peninjauan} type="peninjauan" />
                    </div>
                  </div>

                  {/* Clarification Alert Box if needed */}
                  {isPerluKlarifikasi && (
                    <div className="p-3 bg-accent-soft rounded-control border border-amber-300 text-xs text-amber-950 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
                        <span>Petugas meminta informasi klarifikasi tambahan.</span>
                      </div>
                    </div>
                  )}

                  {/* Date & Additional info */}
                  <div className="flex items-center justify-between text-xs text-muted border-t border-border/60 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateFormatted}</span>
                    </div>

                    {item.status_kelengkapan && (
                      <span className="capitalize font-medium">
                        {item.status_kelengkapan === 'lengkap' ? 'Data Lengkap' : 'Belum Lengkap'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {isDraft ? (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/isi/${item.id}?form=${item.form?.id || 'FRM-KELUHAN'}`)}
                          className="flex-1 min-h-[44px] px-4 py-2 bg-primary text-white text-xs sm:text-sm font-semibold rounded-control hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5 shadow-soft-sm"
                        >
                          <span>Lanjutkan Pengisian</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          className="min-h-[44px] px-3.5 py-2 border border-red-200 text-danger hover:bg-red-50 text-xs sm:text-sm font-semibold rounded-control transition-colors flex items-center gap-1"
                          title="Hapus Draf"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Hapus draf</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/hasil/${item.id}`)}
                          className="flex-1 min-h-[44px] px-3 py-2 border border-border text-text hover:bg-slate-50 text-xs sm:text-sm font-semibold rounded-control transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 text-muted" />
                          <span>Lihat Ringkasan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/status/${item.id}`)}
                          className={`flex-1 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-control transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                            isPerluKlarifikasi
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : isSudahDitinjau
                              ? 'bg-green-700 hover:bg-green-800 text-white'
                              : 'bg-primary hover:bg-primary-dark text-white'
                          }`}
                        >
                          {isPerluKlarifikasi ? (
                            <span>Jawab Klarifikasi</span>
                          ) : isSudahDitinjau ? (
                            <span>Lihat Tindak Lanjut</span>
                          ) : (
                            <span>Pantau Status</span>
                          )}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingId)}
          title="Hapus Draf Self-Assessment?"
          message="Draf yang dihapus tidak dapat dipulihkan kembali. Anda harus mengisi ulang dari awal."
          confirmLabel="Hapus Draf"
          cancelLabel="Batal"
          confirmVariant="danger"
          isLoading={deleteLoading}
          onConfirm={handleDeleteDraft}
          onCancel={() => setDeletingId(null)}
        />
      </div>
    </AppShell>
  );
}

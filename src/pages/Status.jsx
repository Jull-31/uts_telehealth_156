import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StatusBadge from '../components/ui/StatusBadge';
import Timeline from '../components/ui/Timeline';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import {
  RefreshCw,
  MessageSquare,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  Home,
  AlertTriangle,
} from 'lucide-react';

export default function Status() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clarification reply state
  const [replies, setReplies] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(null);

  const isMountedRef = useRef(true);

  const fetchStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      // Calls GET /assessments/{id}/status (triggers 'status' and 'tindak_lanjut' evidence)
      const res = await api.getAssessmentStatus(id);
      if (isMountedRef.current && res.data) {
        setStatusData(res.data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Gagal memuat status laporan.');
      }
    } finally {
      if (isMountedRef.current && showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchStatus(true);

    // Light polling every 30s, paused when tab is inactive
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStatus(false);
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [id]);

  const handleReplyClarification = async (clarificationId) => {
    const text = (replies[clarificationId] || '').trim();
    if (!text) {
      setReplyError('Silakan tulis jawaban klarifikasi Anda.');
      return;
    }

    setReplyingId(clarificationId);
    setReplyError(null);
    setReplySuccess(null);

    try {
      // POST /assessments/{id}/clarifications/{cid}/reply (triggers 'klarifikasi' evidence)
      await api.replyClarification(id, clarificationId, text);
      setReplySuccess('Jawaban klarifikasi berhasil dikirim.');
      setReplies((prev) => ({ ...prev, [clarificationId]: '' }));
      // Reload status data immediately
      await fetchStatus(false);
    } catch (err) {
      console.error('Error sending clarification reply:', err);
      setReplyError(err.message || 'Gagal mengirim jawaban klarifikasi.');
    } finally {
      setReplyingId(null);
    }
  };

  if (loading) {
    return (
      <AppShell title="Memuat Status Laporan..." showBack>
        <div className="space-y-4 max-w-2xl mx-auto py-12 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-card" />
          <div className="h-48 bg-slate-200 rounded-card" />
          <div className="h-64 bg-slate-200 rounded-card" />
        </div>
      </AppShell>
    );
  }

  const s = statusData || {};
  const isPerluKlarifikasi = s.status_peninjauan?.kode === 'perlu_klarifikasi';
  const clarifications = s.klarifikasi_menunggu || [];
  const tindakLanjut = s.tindak_lanjut;
  const timeline = s.timeline || [];

  const formatWib = (isoString) => {
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
      title={`Status Laporan ${id}`}
      showBack
      rightAction={
        <button
          type="button"
          onClick={() => fetchStatus(true)}
          className="p-2 text-muted hover:text-text rounded-control hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Muat ulang status"
          aria-label="Muat ulang status"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Muat ulang</span>
        </button>
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pb-20">
        {error && (
          <Alert type="danger" title="Gagal Memuat Status">
            {error}
          </Alert>
        )}

        {/* 1. Header Status Card (Two Separate Badges per Wireframe W5) */}
        <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {id}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                Status Pengiriman & Peninjauan
              </h2>
            </div>

            {/* Two Separate Badges */}
            <div className="flex items-center gap-2">
              <StatusBadge status={s.status_pengiriman} type="pengiriman" />
              <StatusBadge status={s.status_peninjauan} type="peninjauan" />
            </div>
          </div>

          {/* Status Message from API */}
          {s.pesan && (
            <div className="p-3.5 bg-primary-soft/60 rounded-control border border-sky-100 text-xs sm:text-sm text-sky-950 leading-relaxed font-medium">
              {s.pesan}
            </div>
          )}
        </div>

        {/* 2. Klarifikasi Form Card (if requested by doctor) */}
        {isPerluKlarifikasi && clarifications.length > 0 && (
          <div className="space-y-4">
            {replySuccess && (
              <Alert type="success" title="Terkirim">
                {replySuccess}
              </Alert>
            )}
            {replyError && (
              <Alert type="danger" title="Gagal Mengirim">
                {replyError}
              </Alert>
            )}

            {clarifications.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 bg-surface rounded-card border-2 border-amber-300 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3>Klarifikasi dari Petugas ({item.id})</h3>
                </div>

                {/* Doctor's Question */}
                <div className="p-4 bg-slate-50 rounded-control border border-slate-200 text-sm font-medium text-text leading-relaxed">
                  {item.pertanyaan}
                </div>

                {/* Reply Textarea */}
                <div className="space-y-2">
                  <label
                    htmlFor={`reply-${item.id}`}
                    className="block text-xs sm:text-sm font-semibold text-text"
                  >
                    Jawaban Anda
                  </label>
                  <textarea
                    id={`reply-${item.id}`}
                    rows={3}
                    value={replies[item.id] || ''}
                    onChange={(e) =>
                      setReplies((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder="Tulis jawaban klarifikasi Anda di sini..."
                    className="w-full p-3.5 bg-white rounded-control text-base text-text border border-slate-300 focus:outline-hidden focus:ring-2 focus:border-primary focus:ring-indigo-100 resize-y"
                  />
                </div>

                {/* Submit Reply Button */}
                <button
                  type="button"
                  onClick={() => handleReplyClarification(item.id)}
                  disabled={replyingId === item.id}
                  className="w-full min-h-[44px] px-6 py-2.5 rounded-control bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:bg-sky-800 transition-colors flex items-center justify-center gap-2 shadow-soft-sm disabled:opacity-50"
                >
                  {replyingId === item.id ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Kirim Jawaban Klarifikasi</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. Tindak Lanjut Card (Follow-up after Doctor Reviewed) */}
        {tindakLanjut && (
          <div className="p-5 sm:p-6 bg-surface rounded-card border border-green-200 shadow-2xs space-y-4 bg-linear-to-b from-green-50/40 to-surface">
            <div className="flex items-center justify-between border-b border-green-100 pb-3">
              <div className="flex items-center gap-2 text-green-900 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3>Tindak Lanjut Medis</h3>
              </div>
              {tindakLanjut.jenis && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                  {tindakLanjut.jenis.label || tindakLanjut.jenis.kode}
                </span>
              )}
            </div>

            {/* Arahan Petugas */}
            {tindakLanjut.arahan && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Arahan Petugas:
                </p>
                <p className="text-sm font-medium text-text leading-relaxed">
                  {tindakLanjut.arahan}
                </p>
              </div>
            )}

            {/* Jadwal Konsultasi (if applicable) */}
            {tindakLanjut.jadwal_konsultasi && (
              <div className="p-3.5 bg-green-50 rounded-control border border-green-200 text-xs sm:text-sm text-green-900 flex items-center gap-3 font-medium">
                <Calendar className="w-5 h-5 text-green-700 shrink-0" />
                <div>
                  <span className="block text-[11px] text-green-700 uppercase font-bold">
                    Jadwal Konsultasi:
                  </span>
                  <span className="text-sm font-bold text-green-950">
                    {formatWib(tindakLanjut.jadwal_konsultasi)}
                  </span>
                </div>
              </div>
            )}

            {/* Pencatat */}
            {tindakLanjut.dicatat_oleh && (
              <div className="flex items-center gap-2 text-xs text-muted pt-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Dicatat oleh: <strong>{tindakLanjut.dicatat_oleh.nama || 'Petugas Medis'}</strong>
                </span>
                {tindakLanjut.dicatat_pada && (
                  <span>({formatWib(tindakLanjut.dicatat_pada)})</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Timeline Riwayat Status (Wireframe W5) */}
        <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-base text-ink">Riwayat Status</h3>
            <p className="text-xs text-muted mt-0.5">
              Jejak waktu proses peninjauan laporan Anda.
            </p>
          </div>

          <Timeline events={timeline} />
        </div>

        {/* Quick Nav Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/hasil/${id}`)}
            className="w-full sm:flex-1 min-h-[44px] px-4 py-2.5 rounded-control border-2 border-primary text-primary bg-white text-xs sm:text-sm font-semibold hover:bg-primary-soft transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Ringkasan Hasil</span>
          </button>

          <Link
            to="/riwayat"
            className="w-full sm:flex-1 min-h-[44px] px-4 py-2.5 rounded-control bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Semua Riwayat</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

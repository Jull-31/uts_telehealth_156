import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StatusBadge from '../components/ui/StatusBadge';
import { api } from '../lib/api';
import { CheckCircle2, Clock, Eye, Activity, ArrowRight, Home } from 'lucide-react';

export default function Konfirmasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [assessment, setAssessment] = useState(location.state?.submitResult || null);
  const [loading, setLoading] = useState(!assessment);

  useEffect(() => {
    if (!assessment) {
      api
        .getAssessment(id)
        .then((res) => setAssessment(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, assessment]);

  const submissionTime = assessment?.dikirim_pada
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(assessment.dikirim_pada)) + ' WIB'
    : 'Baru saja';

  return (
    <AppShell title="Konfirmasi Pengiriman" maxWidth="max-w-md">
      <div className="py-6 sm:py-10 space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Formulir Anda telah diterima
          </h2>
          <p className="text-sm text-muted">
            Laporan Anda tersimpan dan siap ditinjau oleh tim medis.
          </p>
        </div>

        {/* Detail Box */}
        <div className="p-5 bg-surface rounded-card border border-border/80 shadow-2xs text-left space-y-3.5">
          <div className="flex justify-between items-center text-sm border-b border-border/60 pb-2.5">
            <span className="text-muted">Nomor Laporan:</span>
            <span className="font-mono font-bold text-text">{id}</span>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-border/60 pb-2.5">
            <span className="text-muted">Waktu Kirim:</span>
            <span className="font-medium text-text">{submissionTime}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">Status Peninjauan:</span>
            <StatusBadge
              status={assessment?.status_peninjauan || { kode: 'menunggu_peninjauan', label: 'Menunggu peninjauan' }}
            />
          </div>
        </div>

        {/* Message Note */}
        <div className="p-4 bg-primary-soft/70 rounded-control border border-sky-100 text-xs sm:text-sm text-sky-950 text-left leading-relaxed">
          Petugas tenaga medis akan meninjau jawaban Anda. Jika diperlukan informasi tambahan, Anda akan menerima permintaan klarifikasi pada halaman status.
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/status/${id}`)}
            className="w-full min-h-[44px] px-6 py-3 rounded-control bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:bg-sky-800 transition-colors flex items-center justify-center gap-2 shadow-soft-sm"
          >
            <span>Pantau Status Peninjauan</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate(`/hasil/${id}`)}
            className="w-full min-h-[44px] px-6 py-3 rounded-control border-2 border-primary text-primary bg-white font-semibold text-sm hover:bg-primary-soft transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Ringkasan Hasil</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted hover:text-text pt-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

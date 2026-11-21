import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StickyBar from '../components/ui/StickyBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import { getMahasiswa } from '../lib/config';
import { CheckCircle2, AlertTriangle, ArrowLeft, Send, Edit3, HelpCircle } from 'lucide-react';

export default function Periksa() {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();
  const mhs = getMahasiswa();

  const [assessment, setAssessment] = useState(null);
  const [formDef, setFormDef] = useState(null);
  const [validationData, setValidationData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const assRes = await api.getAssessment(assessmentId);
      const assData = assRes.data;

      if (assData.status_pengiriman?.kode === 'terkirim') {
        navigate(`/status/${assessmentId}`, { replace: true });
        return;
      }

      setAssessment(assData);

      const formId = assData.form?.id || 'FRM-KELUHAN';
      const [formRes, valRes] = await Promise.all([
        api.getForm(formId),
        // Mandatory: POST /forms/{id}/validate with nim to record "validasi" evidence
        api.validateForm(formId, assData.answers || {}, mhs.nim),
      ]);

      if (formRes.data) setFormDef(formRes.data);
      if (valRes.data) setValidationData(valRes.data);
    } catch (err) {
      console.error('Error validating assessment:', err);
      if (err.status === 409) {
        navigate(`/status/${assessmentId}`);
      } else {
        setError(err.message || 'Gagal memvalidasi jawaban.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.submitAssessment(assessmentId);
      // Navigates to confirmation page (triggers "kirim" evidence)
      navigate(`/konfirmasi/${assessmentId}`, { state: { submitResult: res.data } });
    } catch (err) {
      console.error('Error submitting assessment:', err);
      if (err.status === 422) {
        setError(err.message || 'Masih ada data yang belum lengkap atau format salah.');
        loadData(); // refresh validation
      } else if (err.status === 409) {
        navigate(`/status/${assessmentId}`);
      } else {
        setError(err.message || 'Gagal mengirim formulir.');
      }
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Memeriksa Jawaban..." showBack>
        <div className="space-y-4 max-w-2xl mx-auto py-12 animate-pulse">
          <div className="h-28 bg-slate-200 rounded-card" />
          <div className="h-64 bg-slate-200 rounded-card" />
        </div>
      </AppShell>
    );
  }

  const isValid = validationData?.valid ?? false;
  const kelengkapan = validationData?.kelengkapan || {};
  const isLengkap = kelengkapan.status === 'lengkap' || isValid;
  const persen = kelengkapan.persen ?? (isValid ? 100 : 50);

  const errorsMap = validationData?.errors || {};
  const errorKeys = Object.keys(errorsMap);

  // Flatten form questions to look up labels and types
  const allQuestionsMap = {};
  for (const sec of formDef?.sections || []) {
    for (const q of sec.questions || []) {
      allQuestionsMap[q.id] = q;
    }
  }

  const answers = assessment?.answers || {};

  return (
    <AppShell title="Periksa Jawaban" showBack maxWidth="max-w-2xl">
      <div className="space-y-6 pb-28 lg:pb-12">
        {error && (
          <Alert type="danger" title="Peringatan Validasi">
            {error}
          </Alert>
        )}

        {/* 1. Kelengkapan Card (Wireframe W3) */}
        <div className="p-5 bg-surface rounded-card border border-border/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-ink">Kelengkapan</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isLengkap
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isLengkap ? 'Lengkap' : 'Belum lengkap'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isLengkap ? 'bg-green-600' : 'bg-accent'
              }`}
              style={{ width: `${persen}%` }}
            />
          </div>

          <p className="text-xs text-muted">
            {kelengkapan.wajib_terisi !== undefined && kelengkapan.wajib_total !== undefined
              ? `${kelengkapan.wajib_terisi} dari ${kelengkapan.wajib_total} pertanyaan wajib terisi`
              : `${persen}% formulir telah dilengkapi`}
          </p>
        </div>

        {/* 2. Masih Perlu Diperbaiki Box (if any errors or incomplete) */}
        {!isValid && errorKeys.length > 0 && (
          <div className="p-5 bg-accent-soft rounded-card border border-amber-300 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
              <h4>Masih perlu diperbaiki</h4>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-amber-900 list-disc list-inside">
              {errorKeys.map((key) => {
                const q = allQuestionsMap[key];
                const msg = errorsMap[key];
                return (
                  <li key={key}>
                    <Link
                      to={`/isi/${assessmentId}`}
                      className="font-medium underline hover:text-amber-950 ml-1"
                    >
                      {msg || `Silakan isi ${q?.question || key}`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 3. Ringkasan Jawaban Card (Wireframe W3) */}
        <div className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-base text-ink">Ringkasan jawaban</h3>
            <p className="text-xs text-muted mt-0.5">
              Periksa kembali data Anda sebelum dikirim ke petugas medis.
            </p>
          </div>

          <dl className="divide-y divide-border/60 text-sm">
            {Object.keys(allQuestionsMap).map((qId) => {
              const q = allQuestionsMap[qId];
              // Only render if visible according to current answers
              const visible = validationData?.pertanyaan_tampil
                ? validationData.pertanyaan_tampil.includes(qId)
                : true;

              if (!visible) return null;

              const val = answers[qId];
              const isFilledVal = val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && !val.length);
              const isPengukuran = q.data_type === 'pengukuran';

              // Format answer text
              let displayVal = null;
              if (!isFilledVal) {
                displayVal = <span className="italic text-muted">Belum diisi</span>;
              } else if (Array.isArray(val)) {
                displayVal = val.join(', ');
              } else if (typeof val === 'boolean') {
                displayVal = val ? 'Ya' : 'Tidak';
              } else if (val === 'ya') {
                displayVal = 'Ya';
              } else if (val === 'tidak') {
                displayVal = 'Tidak';
              } else {
                displayVal = String(val);
                if (q.unit) displayVal += ` ${q.unit}`;
              }

              return (
                <div key={qId} className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4">
                  <dt className="text-muted flex items-center gap-2 text-xs sm:text-sm">
                    <span>{q.question || q.label || qId}</span>
                    {isPengukuran && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        pengukuran
                      </span>
                    )}
                  </dt>
                  <dd className="font-semibold text-text text-sm sm:text-right shrink-0">
                    {displayVal}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Sticky Action Bar (Per Wireframe W3) */}
        <StickyBar>
          <button
            type="button"
            onClick={() => navigate(`/isi/${assessmentId}`)}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-control border-2 border-primary text-primary bg-white text-xs sm:text-sm font-semibold hover:bg-primary-soft transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Ubah jawaban</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!isValid || submitting}
            className="flex-1 min-h-[44px] px-6 py-2.5 rounded-control bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark active:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-soft-sm"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Kirim Jawaban</span>
          </button>
        </StickyBar>

        {/* Confirmation Modal */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Kirim Formulir Self-Assessment?"
          message="Setelah dikirim, jawaban Anda tidak dapat diubah lagi dan akan langsung masuk antrean peninjauan petugas tenaga kesehatan."
          confirmLabel="Ya, Kirim Sekarang"
          cancelLabel="Periksa Lagi"
          isLoading={submitting}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </AppShell>
  );
}

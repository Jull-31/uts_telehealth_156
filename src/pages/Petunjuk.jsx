import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StickyBar from '../components/ui/StickyBar';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import { getMahasiswa } from '../lib/config';
import { FileText, Clock, Calendar, CheckSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Petunjuk() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formDef, setFormDef] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const mhs = getMahasiswa();

  const id = formId || 'FRM-KELUHAN';

  useEffect(() => {
    let isMounted = true;
    async function fetchForm() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getForm(id);
        if (isMounted && res.data) {
          setFormDef(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat definisi formulir.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchForm();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStart = async () => {
    if (!consentChecked) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        form_id: id,
        persetujuan: true, // boolean true is required
        mahasiswa: {
          nim: mhs.nim,
          nama: mhs.nama,
          kelas: mhs.kelas,
        },
        answers: {},
      };

      const res = await api.createAssessment(payload);
      if (res.data?.id) {
        // Navigate to /isi/SA-xxxx?form=FRM-KELUHAN
        navigate(`/isi/${res.data.id}?form=${id}`);
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
      setError(err.message || 'Gagal memulai formulir. Pastikan identitas dan token sudah benar.');
    } finally {
      setSubmitting(false);
    }
  };

  const title = formDef?.judul || (id === 'FRM-GAD7' ? 'Kuesioner Kecemasan (GAD-7)' : 'Formulir Keluhan Pasien');
  const petunjukText = formDef?.petunjuk || [
    'Formulir ini membantu Anda menyampaikan keluhan sebelum berkonsultasi dengan dokter.',
    'Jawab sesuai kondisi yang Anda rasakan. Tidak ada jawaban benar atau salah.',
    'Pertanyaan bertanda bintang (*) wajib diisi sebelum formulir dapat dikirim.',
    'Anda dapat menyimpan draf kapan saja dan melanjutkannya nanti.',
    'Hasil self-assessment BUKAN diagnosis. Jawaban akan ditinjau oleh tenaga kesehatan.',
  ];

  const estimasi = formDef?.estimasi_menit ? `± ${formDef.estimasi_menit} menit` : '± 3–5 menit';
  const periode = formDef?.periode_pelaporan || (id === 'FRM-GAD7' ? '2 minggu terakhir' : 'Saat ini dan 7 hari terakhir');
  const persetujuanText = formDef?.persetujuan?.teks || 'Saya memahami bahwa data yang saya isi digunakan untuk persiapan konsultasi, hanya dapat diakses oleh petugas yang berwenang, dan hasilnya bukan diagnosis.';

  return (
    <AppShell title="Petunjuk & Persetujuan" showBack maxWidth="max-w-2xl">
      <div className="space-y-6 pb-24 lg:pb-8">
        {error && (
          <Alert type="danger" title="Gagal Memulai">
            {error}
          </Alert>
        )}

        {/* Card Header & Deskripsi */}
        <div className="p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {id}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mt-2 leading-snug">
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-muted border-t border-border/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Estimasi: {estimasi}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Periode: {periode}</span>
            </div>
          </div>
        </div>

        {/* Petunjuk Pengisian */}
        <div className="p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-3">
          <h3 className="text-base font-bold text-ink">Petunjuk Pengisian</h3>
          <ul className="space-y-2 text-sm text-text leading-relaxed list-disc list-inside marker:text-primary">
            {Array.isArray(petunjukText) ? (
              petunjukText.map((item, idx) => <li key={idx}>{item}</li>)
            ) : (
              <li>{petunjukText}</li>
            )}
          </ul>
        </div>

        {/* Persetujuan Penggunaan Data */}
        <div className="p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-ink font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3>Persetujuan Penggunaan Data</h3>
          </div>

          <label className="flex items-start gap-3.5 p-3.5 rounded-control bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded-sm border-slate-300 text-primary focus:ring-primary accent-primary shrink-0"
            />
            <span className="text-xs sm:text-sm text-text leading-relaxed select-none">
              {persetujuanText}
            </span>
          </label>
        </div>

        {/* Sticky Action Bar */}
        <StickyBar>
          <button
            type="button"
            onClick={handleStart}
            disabled={!consentChecked || submitting || loading}
            className="w-full min-h-[44px] px-6 py-3 rounded-control bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-soft-sm"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Mulai Mengisi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </StickyBar>
      </div>
    </AppShell>
  );
}

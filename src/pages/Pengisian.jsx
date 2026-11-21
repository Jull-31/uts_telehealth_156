import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../components/ui/AppShell';
import StickyBar from '../components/ui/StickyBar';
import QuestionRenderer from '../components/form/QuestionRenderer';
import Alert from '../components/ui/Alert';
import { api, ApiError } from '../lib/api';
import {
  getVisibleSections,
  getVisibleQuestions,
  cleanAnswersForServer,
  validateAnswers,
} from '../lib/formEngine';
import { Check, ArrowLeft, ArrowRight, Save, AlertCircle } from 'lucide-react';

export default function Pengisian() {
  const { id: assessmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formDef, setFormDef] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load Assessment & Form Definition
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setServerError(null);

      try {
        // Fetch Assessment
        const assRes = await api.getAssessment(assessmentId);
        const assData = assRes.data;

        // If already submitted, redirect to status
        if (assData.status_pengiriman?.kode === 'terkirim') {
          navigate(`/status/${assessmentId}`, { replace: true });
          return;
        }

        if (isMounted) {
          setAssessment(assData);
          setAnswers(assData.answers || {});
        }

        // Determine Form ID from assessment or query param
        const formId = assData.form?.id || searchParams.get('form') || 'FRM-KELUHAN';
        const formRes = await api.getForm(formId);

        if (isMounted && formRes.data) {
          setFormDef(formRes.data);
        }
      } catch (err) {
        console.error('Error loading assessment/form:', err);
        if (isMounted) {
          if (err.status === 409) {
            navigate(`/status/${assessmentId}`, { replace: true });
          } else {
            setServerError(err.message || 'Gagal memuat data formulir.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [assessmentId, navigate, searchParams]);

  // Compute visible sections based on current answers
  const visibleSections = getVisibleSections(formDef?.sections || [], answers);
  const safeSectionIndex = Math.min(currentSectionIndex, Math.max(0, visibleSections.length - 1));
  const currentSection = visibleSections[safeSectionIndex];
  const visibleQuestions = getVisibleQuestions(currentSection, answers);

  const totalSections = visibleSections.length;
  const currentStepNumber = safeSectionIndex + 1;
  const progressPercent = totalSections > 0 ? Math.round((currentStepNumber / totalSections) * 100) : 0;

  // Handle single question answer update
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: value };
      return nextAnswers;
    });

    // Clear error for this question if it exists
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  // Save draft to server (triggers simpan_draf evidence)
  const handleSaveDraft = async (silent = false) => {
    setSaving(true);
    setServerError(null);

    try {
      const cleaned = cleanAnswersForServer(formDef, answers);
      await api.patchAssessment(assessmentId, cleaned);
      if (!silent) {
        setToastMessage('Draf berhasil disimpan.');
        setTimeout(() => setToastMessage(null), 3500);
      }
      return true;
    } catch (err) {
      console.error('Error saving draft:', err);
      if (err.status === 409) {
        navigate(`/status/${assessmentId}`);
      } else {
        setServerError(err.message || 'Gagal menyimpan draf.');
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Next section or proceed to check page
  const handleNext = async () => {
    // Validate current visible questions
    const validation = validateAnswers(visibleQuestions, answers);
    if (!validation.valid) {
      setErrors(validation.errors);
      // Scroll to first error
      const firstErrKey = Object.keys(validation.errors)[0];
      const element = document.getElementById(`question-${firstErrKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    const saved = await handleSaveDraft(true);
    if (!saved) return;

    if (safeSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(safeSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finished all sections -> go to Periksa
      navigate(`/periksa/${assessmentId}`);
    }
  };

  const handlePrev = () => {
    if (safeSectionIndex > 0) {
      setCurrentSectionIndex(safeSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <AppShell title="Memuat Formulir..." showBack>
        <div className="space-y-4 max-w-2xl mx-auto py-12 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-24 bg-slate-200 rounded-card" />
          <div className="h-24 bg-slate-200 rounded-card" />
        </div>
      </AppShell>
    );
  }

  const formTitle = formDef?.judul || 'Formulir Assessment';
  const sectionTitle = currentSection?.title || currentSection?.judul || `Bagian ${currentStepNumber}`;

  return (
    <AppShell
      title={formTitle}
      showBack
      onBack={handlePrev}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6 pb-28 lg:pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 right-4 z-50 bg-ink text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-control shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {serverError && (
          <Alert type="danger" title="Kesalahan Penyimpanan">
            {serverError}
          </Alert>
        )}

        {/* Desktop Stepper (>= 768px / md) */}
        <div className="hidden md:block bg-surface p-4 rounded-card border border-border/80 shadow-2xs">
          <nav aria-label="Progress Stepper" className="flex items-center justify-between gap-2">
            {visibleSections.map((sec, idx) => {
              const isActive = idx === safeSectionIndex;
              const isPast = idx < safeSectionIndex;
              return (
                <div key={sec.id || idx} className="flex-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isPast) setCurrentSectionIndex(idx);
                    }}
                    disabled={!isPast}
                    className={`flex items-center gap-2.5 text-xs font-semibold py-1.5 px-3 rounded-full transition-all text-left ${
                      isActive
                        ? 'bg-primary text-white shadow-soft-sm'
                        : isPast
                        ? 'bg-primary-soft text-primary hover:bg-sky-100 cursor-pointer'
                        : 'bg-slate-100 text-muted opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </span>
                    <span className="truncate max-w-[120px]">{sec.title || sec.judul || `Bagian ${idx + 1}`}</span>
                  </button>
                  {idx < visibleSections.length - 1 && (
                    <div className="h-0.5 flex-1 bg-border/80 mx-1" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mobile Section Indicator & Progress Bar (Per Wireframe W2) */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-ink">
            <span>
              Bagian {currentStepNumber} dari {totalSections} · {sectionTitle}
            </span>
            <span className="font-mono text-muted">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Content Layout: 2 Columns on Desktop (>= 1024px lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Current Section & Questions (max 640px) */}
          <div className="lg:col-span-8 max-w-2xl space-y-4">
            {/* Section Header Description */}
            {currentSection?.deskripsi && (
              <div className="p-4 bg-primary-soft/60 rounded-control border border-sky-100 text-xs sm:text-sm text-text">
                <p className="leading-relaxed">{currentSection.deskripsi}</p>
              </div>
            )}

            {/* Questions List */}
            {visibleQuestions.length === 0 ? (
              <div className="p-8 bg-surface rounded-card border border-border text-center text-muted text-sm">
                Tidak ada pertanyaan aktif pada bagian ini. Silakan klik <strong>Lanjut</strong>.
              </div>
            ) : (
              visibleQuestions.map((q) => (
                <QuestionRenderer
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  error={errors[q.id]}
                  formId={formDef?.id}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                />
              ))
            )}
          </div>

          {/* Right Column: Sticky Summary Panel on Desktop (290px per design.md) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
            <div className="p-5 bg-surface rounded-card border border-border shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-ink uppercase tracking-wider">
                Ringkasan Pengisian
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Progres Bagian:</span>
                  <span className="font-semibold text-text">{currentStepNumber} dari {totalSections}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="border-t border-border/80 pt-3 space-y-2">
                <p className="text-xs font-semibold text-muted">Jawaban Tersimpan Sementara:</p>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 text-xs">
                  {Object.entries(answers).length === 0 ? (
                    <p className="text-muted italic">Belum ada jawaban diisi.</p>
                  ) : (
                    Object.entries(answers)
                      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
                      .slice(0, 8)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                          <span className="text-slate-500 truncate max-w-[120px]">{k}:</span>
                          <span className="font-medium text-text truncate max-w-[130px]">
                            {Array.isArray(v) ? v.join(', ') : String(v)}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-control border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                Hasil self-assessment bukan diagnosis. Jawaban Anda akan ditinjau oleh tenaga medis.
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar (Per Wireframe W2) */}
        <StickyBar>
          <button
            type="button"
            onClick={() => handleSaveDraft(false)}
            disabled={saving}
            className="px-4 py-2.5 min-h-[44px] rounded-control border-2 border-primary text-primary bg-white text-xs sm:text-sm font-semibold hover:bg-primary-soft active:bg-sky-100 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan draf</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="flex-1 min-h-[44px] px-6 py-2.5 rounded-control bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark active:bg-sky-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-soft-sm"
          >
            <span>{safeSectionIndex === totalSections - 1 ? 'Periksa Jawaban' : 'Lanjut'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </StickyBar>
      </div>
    </AppShell>
  );
}

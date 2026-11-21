import React, { useState } from 'react';
import AppShell from '../components/ui/AppShell';
import Alert from '../components/ui/Alert';
import {
  getMahasiswa,
  setMahasiswa,
  getApiToken,
  setApiToken,
  PRESET_ACCOUNTS,
} from '../lib/config';
import { api, ApiError } from '../lib/api';
import { User, Key, CheckCircle2, ShieldAlert, Save, RefreshCw, Check } from 'lucide-react';

export default function Identitas() {
  const currentMhs = getMahasiswa();
  const currentToken = getApiToken();

  const [nim, setNim] = useState(currentMhs.nim);
  const [nama, setNama] = useState(currentMhs.nama);
  const [kelas, setKelas] = useState(currentMhs.kelas);
  const [token, setToken] = useState(currentToken);

  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectPreset = (preset) => {
    setToken(preset.token);
  };

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setError(null);
    setResult(null);

    const cleanNim = nim.trim().toUpperCase();
    const cleanNama = nama.trim();
    const cleanKelas = kelas.trim();
    const cleanToken = token.trim();

    if (!cleanNim || !cleanNama || !cleanKelas) {
      setError('NIM, Nama, dan Kelas wajib diisi.');
      setTesting(false);
      return;
    }

    if (!cleanToken) {
      setError('Token pasien belum diisi.');
      setTesting(false);
      return;
    }

    try {
      // Save locally
      setMahasiswa({ nim: cleanNim, nama: cleanNama, kelas: cleanKelas });
      setApiToken(cleanToken);

      // Test connection with the new token & NIM
      const res = await api.getMe(cleanNim);
      setResult(res.data);
    } catch (err) {
      console.error('Connection test error:', err);
      if (err.status === 401) {
        setError('Token tidak valid atau format salah (HTTP 401). Pastikan token berawalan tlh_pasien_.');
      } else {
        setError(err.message || 'Gagal terhubung ke API dosen.');
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <AppShell title="Identitas & Pengaturan Token" showBack maxWidth="max-w-xl">
      <div className="space-y-6 pb-12">
        {/* Intro Info */}
        <div className="p-5 bg-surface rounded-card border border-border/80 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-ink font-bold text-base">
            <User className="w-5 h-5 text-primary" />
            <h2>Identitas Mahasiswa & Token API</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Data ini akan disuntikkan secara otomatis pada setiap request pengisian dan filter laporan. Anda dapat berpindah akun pasien kapan saja.
          </p>
        </div>

        {error && (
          <Alert type="danger" title="Uji Koneksi Gagal">
            {error}
          </Alert>
        )}

        {result && (
          <Alert type="success" title="Koneksi Berhasil!">
            <div className="text-xs sm:text-sm space-y-1">
              <p>
                Terhubung sebagai <strong>{result.nama}</strong> ({result.id} · RM-{result.no_rm})
              </p>
              <p className="text-green-800">
                Filter NIM aktif: <strong>{result.statistik?.filter_nim || nim}</strong>
              </p>
            </div>
          </Alert>
        )}

        {/* Preset Patient Accounts Selector */}
        <div className="p-5 bg-surface rounded-card border border-border/80 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-ink">Pilih Akun Pasien Cepat (3 Akun Dosen):</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESET_ACCOUNTS.map((acc) => {
              const isSelected = token === acc.token;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectPreset(acc)}
                  className={`p-3 rounded-control border text-left transition-all ${
                    isSelected
                      ? 'border-2 border-primary bg-primary-soft shadow-xs'
                      : 'border-border bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{acc.id}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                  </div>
                  <p className="text-xs font-bold text-ink mt-1 truncate">{acc.nama}</p>
                  <p className="text-[10px] text-muted line-clamp-1">{acc.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveAndTest} className="p-5 sm:p-6 bg-surface rounded-card border border-border/80 shadow-2xs space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="input-nim" className="block text-xs sm:text-sm font-semibold text-text mb-1">
                NIM Mahasiswa <span className="text-danger">*</span>
              </label>
              <input
                id="input-nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value.toUpperCase())}
                placeholder="Contoh: C2C023156"
                className="w-full h-12 px-3.5 bg-white rounded-control text-base text-text border border-slate-300 focus:outline-hidden focus:ring-2 focus:border-primary font-mono"
                required
              />
              <p className="text-[11px] text-muted mt-1">5–20 karakter, otomatis huruf besar.</p>
            </div>

            <div>
              <label htmlFor="input-nama" className="block text-xs sm:text-sm font-semibold text-text mb-1">
                Nama Lengkap Mahasiswa <span className="text-danger">*</span>
              </label>
              <input
                id="input-nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Julius Ferdinan"
                className="w-full h-12 px-3.5 bg-white rounded-control text-base text-text border border-slate-300 focus:outline-hidden focus:ring-2 focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="input-kelas" className="block text-xs sm:text-sm font-semibold text-text mb-1">
                Kelas <span className="text-danger">*</span>
              </label>
              <input
                id="input-kelas"
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: E atau TI-5A"
                className="w-full h-12 px-3.5 bg-white rounded-control text-base text-text border border-slate-300 focus:outline-hidden focus:ring-2 focus:border-primary font-mono"
                required
              />
            </div>

            <div className="border-t border-border/60 pt-4">
              <label htmlFor="input-token" className="block text-xs sm:text-sm font-semibold text-text mb-1">
                Token Pasien (Bearer Token) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="tlh_pasien_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full h-12 pl-3.5 pr-10 bg-white rounded-control text-base text-text border border-slate-300 focus:outline-hidden focus:ring-2 focus:border-primary font-mono text-xs sm:text-sm"
                  required
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted mt-1">
                Token pasien yang dibagikan oleh dosen pengampu (berawalan <code>tlh_pasien_</code>).
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={testing}
              className="w-full min-h-[44px] px-6 py-3 rounded-control bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:bg-sky-800 transition-colors flex items-center justify-center gap-2 shadow-soft-sm disabled:opacity-50"
            >
              {testing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menguji & Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan & Uji Koneksi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

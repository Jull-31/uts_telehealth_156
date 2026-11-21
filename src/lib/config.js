// Centralized Configuration for Telehealth Self-Assessment
const STORAGE_KEY_TOKEN = 'tlh_token';
const STORAGE_KEY_MHS = 'tlh_mahasiswa_v4';

// Automatically clean up any legacy localStorage from previous students/versions
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    ['tlh_mahasiswa', 'tlh_mahasiswa_v2', 'tlh_mahasiswa_v3'].forEach((k) => {
      if (localStorage.getItem(k)) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {}
}

export const PRESET_ACCOUNTS = [
  {
    id: 'P-001',
    nama: 'Budi Santoso',
    desc: 'Pasien umum',
    token: 'tlh_pasien_e89c3a630df4c65d4d75856ab900959834fd49e2',
  },
  {
    id: 'P-002',
    nama: 'Siti Aminah',
    desc: 'Contoh pasien diisi pendamping',
    token: 'tlh_pasien_14e0b0ed213d717074a5503f07253004ae620661',
  },
  {
    id: 'P-003',
    nama: 'Andi Wijaya',
    desc: 'Pasien umum',
    token: 'tlh_pasien_18337a01caa11e8d627efc338033f82e139807df',
  },
];

export const DEFAULT_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://telehealth.informatikaunimus.site/api',
  apiToken:
    import.meta.env.VITE_API_TOKEN || 'tlh_pasien_e89c3a630df4c65d4d75856ab900959834fd49e2',
  mahasiswa: {
    nim: import.meta.env.VITE_MHS_NIM || 'C2C023156',
    nama: import.meta.env.VITE_MHS_NAMA || 'Julius Ferdinan',
    kelas: import.meta.env.VITE_MHS_KELAS || 'E',
  },
};

export function getApiToken() {
  const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (stored) return stored.trim();
  return DEFAULT_CONFIG.apiToken.trim();
}

export function setApiToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}

export function getMahasiswa() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MHS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Strictly verify if stored data belongs to current student and class
      if (
        parsed?.nim === DEFAULT_CONFIG.mahasiswa.nim &&
        parsed?.kelas === DEFAULT_CONFIG.mahasiswa.kelas &&
        parsed?.nama === DEFAULT_CONFIG.mahasiswa.nama
      ) {
        return {
          nim: (parsed.nim || DEFAULT_CONFIG.mahasiswa.nim).trim().toUpperCase(),
          nama: (parsed.nama || DEFAULT_CONFIG.mahasiswa.nama).trim(),
          kelas: (parsed.kelas || DEFAULT_CONFIG.mahasiswa.kelas).trim(),
        };
      }
    }
  } catch (e) {
    console.error('Error reading mahasiswa from localStorage', e);
  }
  return {
    nim: DEFAULT_CONFIG.mahasiswa.nim.trim().toUpperCase(),
    nama: DEFAULT_CONFIG.mahasiswa.nama.trim(),
    kelas: DEFAULT_CONFIG.mahasiswa.kelas.trim(),
  };
}

export function setMahasiswa(mhs) {
  if (mhs) {
    localStorage.setItem(
      STORAGE_KEY_MHS,
      JSON.stringify({
        nim: (mhs.nim || '').trim().toUpperCase(),
        nama: (mhs.nama || '').trim(),
        kelas: (mhs.kelas || '').trim(),
      })
    );
  }
}

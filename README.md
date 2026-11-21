# Telehealth Self-Assessment (Frontend Pasien - Edisi Julius Ferdinan)

Aplikasi web pasien **mobile-first dan responsif** untuk *self-assessment* kesehatan sebelum konsultasi dokter. Proyek ini dibangun sebagai solusi lengkap Tugas UTS Telehealth (Pertemuan 6).

> **Pernyataan Medis:** *Hasil self-assessment bukan diagnosis. Laporan Anda akan ditinjau langsung oleh tenaga kesehatan.*

---

## 1. Identitas Mahasiswa

- **Nama Mahasiswa:** `Julius Ferdinan`
- **NIM:** `C2C023156`
- **Kelas:** `E`
- **Base API:** `https://telehealth.informatikaunimus.site/api`

---

## 2. Fitur Utama & 10 Bukti Fitur Otomatis

Aplikasi ini memenuhi seluruh kriteria dan menghasilkan **10/10 bukti fitur** yang dipantau otomatis oleh server dosen pada `GET /api/uts/{nim}`:

| No | Kode Bukti | Fitur / Tindakan Frontend | Endpoint Terkait |
|:---|:---|:---|:---|
| 1 | `buat` | Membuat draf pengisian baru dengan persetujuan | `POST /api/assessments` |
| 2 | `simpan_draf` | Menyimpan perubahan draf bertahap | `PATCH /api/assessments/{id}` |
| 3 | `validasi` | Validasi kelengkapan jawaban sebelum kirim dengan identitas NIM | `POST /api/forms/{id}/validate` |
| 4 | `kirim` | Mengirim formulir keluhan (FRM-KELUHAN) ke antrean peninjauan | `POST /api/assessments/{id}/submit` |
| 5 | `riwayat` | Menampilkan daftar riwayat terfilter NIM sendiri | `GET /api/assessments?nim={NIM}` |
| 6 | `hasil` | Menampilkan ringkasan jawaban, kelengkapan, dan skor instrumen | `GET /api/assessments/{id}/hasil` |
| 7 | `status` | Pelacakan status dua badge terpisah dan timeline vertikal | `GET /api/assessments/{id}/status` |
| 8 | `klarifikasi` | Menjawab pertanyaan klarifikasi dari petugas medis | `POST .../clarifications/{cid}/reply` |
| 9 | `tindak_lanjut` | Menampilkan arahan dan jadwal konsultasi setelah ditinjau | `GET /api/assessments/{id}/status` |
| 10 | `gad7` | Bonus pengisian kuesioner kecemasan GAD-7 (0–21 skor + kategori) | `POST /api/assessments` (FRM-GAD7) |

---

## 3. Desain Baru: Modern Contemporary MedTech

Antarmuka dirancang dengan tema khusus yang berbeda dari versi sebelumnya maupun demo dosen:
- **Design Tokens Baru:**
  - `ink`: `#0F172A` (Slate 900 - Deep Midnight Navy)
  - `primary`: `#0284C7` (Sky 600 - Ocean Blue)
  - `primary-soft`: `#F0F9FF` (Sky 50)
  - `accent`: `#F43F5E` (Rose 500 - Medical Pulse Accent)
  - `accent-soft`: `#FFF1F2` (Rose 50)
- **Komponen Visual:**
  - Bento Grid statistik di Beranda dengan micro-icon badge.
  - Avatar inisial `JF` untuk Julius Ferdinan pada desktop sidebar dan mobile drawer.
  - Kartu dengan softened squircle radius (`20px`).
  - Badge status modern dengan micro-dot indikator status aktif.
  - Banner sapaan gradasi modern bernuansa *high-precision clinical portal*.

---

## 4. Cara Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
```env
VITE_API_URL=https://telehealth.informatikaunimus.site/api
VITE_API_TOKEN=tlh_pasien_e89c3a630df4c65d4d75856ab900959834fd49e2
VITE_MHS_NIM=C2C023156
VITE_MHS_NAMA=Julius Ferdinan
VITE_MHS_KELAS=E
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat [http://localhost:5173/](http://localhost:5173/) atau [http://localhost:5174/](http://localhost:5174/).

### 4. Menjalankan Pengujian Unit
```bash
npm test
```

### 5. Membangun untuk Produksi
```bash
npm run build
```

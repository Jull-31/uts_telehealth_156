# PRD – Web Responsif Self-Assessment Telehealth

**Proyek:** Tugas UTS Telehealth (Pertemuan 6)
**Pembuat:** Julius Ferdinan · NIM C2C023156 · Kelas E (sesuaikan format dari dosen)
**Versi:** 1.1 · **Tanggal:** 17 November 2026 · **Tenggat internal:** 23 November 2026
**Tech stack:** React + Vite (tanpa backend sendiri) · **API:** `https://telehealth.informatikaunimus.site/api` (v2.0)

> **Fokus:** aplikasi web pasien yang **mobile-first dan responsif**. Layar utama pengguna adalah ponsel (360–430 px); tablet dan desktop adalah perluasan dari tata letak mobile, bukan sebaliknya.
> **Penting:** Hasil self-assessment bukan diagnosis. Pernyataan ini wajib tampil di aplikasi.

---

## 1. Ringkasan

Dosen meminta mahasiswa membuat **frontend** aplikasi pasien untuk *self-assessment* kesehatan. Seluruh logika (penyimpanan, validasi, skor, status, klarifikasi, tindak lanjut) sudah disediakan API dosen. Peran petugas dijalankan dosen lewat dashboard dosen, sehingga laporan yang dikirim benar-benar ditinjau.

Alur pasien: **petunjuk dan persetujuan → isi formulir bertahap → periksa jawaban → kirim → lihat hasil dan status → jawab klarifikasi → lihat tindak lanjut.**

Aplikasi ini React SPA yang memanggil API dosen langsung. Tampilan dirancang **mobile-first**: satu kolom, tombol besar, aksi utama selalu terjangkau ibu jari, lalu melebar ke sidebar dan panel ringkasan di layar besar.

## 2. Syarat Utama dari Dosen

1. Hanya frontend; web atau mobile, framework bebas.
2. Setiap assessment membawa identitas mahasiswa (`nim`, `nama`, `kelas`); semua data difilter `?nim=`.
3. Halaman wajib: Identitas, Beranda, Petunjuk, Pengisian bertahap, Periksa, Konfirmasi, Riwayat, Hasil, Tracking status, Klarifikasi, Tindak lanjut. GAD-7 = bonus.
4. Formulir dirender **dinamis** dari `GET /forms/{id}` (termasuk `show_if`).
5. Prinsip materi: bahasa sederhana, satu gagasan per pertanyaan, periode waktu jelas, validasi per kolom, "Tidak" ≠ "Belum diisi", status tidak membingungkan, penegasan bukan diagnosis.
6. Tangani error 401, 409, 422 dengan pesan jelas.
7. Token di konfigurasi, tidak diunggah ke repository publik.
8. Dinilai dari **10 bukti fitur** yang tercatat otomatis (`GET /uts/{nim}`); kirim laporan lebih awal agar klarifikasi dan tindak lanjut sempat diuji.

## 3. Tujuan dan Metrik

| Tujuan | Metrik keberhasilan |
|---|---|
| Memenuhi semua bukti fitur | `/uts/{nim}` menunjukkan **10/10** |
| Nyaman dipakai di ponsel | Semua halaman lulus uji pada lebar 360, 390, 412, 768, 1024, 1440 px; **tanpa scroll horizontal** |
| Formulir dinamis benar | Semua kondisi `show_if` bekerja; nilai `0` dianggap terisi |
| Penanganan error jelas | 401/403/404/409/422/jaringan punya pesan ramah |
| Kualitas teknis | Lighthouse mobile: Accessibility ≥ 90, Performance ≥ 80 |
| Kelengkapan tugas | 13 skenario uji end-to-end lulus; status penilaian `disetujui` |

**Bukan tujuan:** dashboard petugas, login pengguna, backend/database sendiri, notifikasi push, menghitung skor di klien.

## 4. Pengguna

| Peran | Pelaku | Hak |
|---|---|---|
| Pasien | Pengguna aplikasi (token pasien P-001/P-002/P-003) | Isi, simpan draf, kirim, lihat hasil dan status, jawab klarifikasi |
| Petugas | Dosen (dashboard dosen) | Tinjau, minta klarifikasi, catat tindak lanjut |

**Persona:** pasien umum dan pendamping/keluarga yang mengisi atas nama pasien. Perangkat utama: **ponsel**, jaringan seluler yang kadang lambat, penguasaan istilah medis rendah.

## 5. Kebutuhan Responsif (inti dokumen ini)

### 5.1 Prinsip
- **Mobile-first:** gaya dasar untuk ponsel; breakpoint hanya menambah.
- **Satu kolom di mobile**, dua kolom (form + ringkasan) mulai tablet/desktop.
- **Aksi utama di bawah layar** (jangkauan ibu jari) lewat *sticky action bar*.
- Tidak ada konten yang terpotong atau scroll horizontal pada lebar ≥ 320 px.

### 5.2 Breakpoint dan perangkat uji

| Nama | Lebar | Perilaku utama |
|---|---|---|
| Mobile kecil | 320–359 | Tetap utuh; chip skala membungkus ke baris baru |
| **Mobile (utama)** | 360–639 | Satu kolom, top bar + drawer, sticky action bar |
| Tablet (`md`) | 640–1023 | Dua kolom di Beranda; form lebar maks. 640 px di tengah |
| Desktop (`lg`) | ≥ 1024 | Sidebar kiri 220 px; form + panel ringkasan 290 px |
| Lebar (`xl`) | ≥ 1280 | Konten maks. 1100 px, di tengah |

Perangkat uji minimum: 360×800 (Android), 390×844 (iPhone), 412×915, 768×1024 (tablet), 1280×720, 1440×900. Uji juga orientasi landscape ponsel.

### 5.3 Aturan teknis responsif

| Area | Aturan |
|---|---|
| Viewport | `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` |
| Satuan | `rem`, `%`, `flex`/`grid`; tinggi layar penuh memakai `dvh`, bukan `vh` |
| Safe area | Sticky bar memberi `padding-bottom: env(safe-area-inset-bottom)` |
| Target sentuh | Minimal **44×44 px**, jarak antar target ≥ 8 px |
| Ukuran font input | **≥ 16 px** agar iOS tidak auto-zoom saat fokus |
| Papan ketik | `type="date"`, `inputmode="decimal"` untuk suhu, `inputmode="numeric"` untuk jumlah hari, `autocomplete` yang sesuai |
| Papan ketik menutupi | Input fokus di-`scrollIntoView({block:'center'})`; sticky bar disembunyikan saat papan ketik terbuka |
| Gambar/ikon | SVG; `max-width:100%` |
| Tabel/daftar | Di mobile menjadi **kartu bertumpuk**; tabel lebar hanya di ≥ `md` |
| Teks panjang | `overflow-wrap:anywhere` agar tidak meluber |
| Gerak | Hormati `prefers-reduced-motion` |
| Mode gelap | Opsional (P2), memakai token warna yang sama |

### 5.4 Navigasi per ukuran layar

| Layar | Navigasi |
|---|---|
| Mobile | **Top bar** (judul halaman, tombol kembali, menu) + **drawer** menu: Beranda, Riwayat, Status UTS, Identitas. Tanpa bottom-nav (agar tidak sama dengan demo dosen) |
| Tablet | Top bar + drawer, konten lebih lebar |
| Desktop | **Sidebar** tetap di kiri |

### 5.5 Perilaku mobile per halaman

| Halaman | Perilaku di mobile |
|---|---|
| Beranda | Sapaan, lalu statistik **kisi 2×2**, alert klarifikasi tepat di bawahnya, kartu formulir bertumpuk, kartu status UTS paling bawah |
| Petunjuk | Teks petunjuk ringkas, checkbox persetujuan besar, tombol **Mulai** lebar penuh di sticky bar; nonaktif sampai dicentang |
| Pengisian | Satu bagian per layar; indikator **"Bagian 2 dari 4" + progress bar** (stepper penuh hanya ≥ `md`); sticky bar berisi **Simpan draf** dan **Lanjut** |
| Periksa | Kelengkapan di atas; daftar "perlu diperbaiki" dengan tautan ke bagian; ringkasan jawaban sebagai daftar label–nilai bertumpuk; tombol **Ubah jawaban** dan **Kirim** di sticky bar |
| Konfirmasi | Ikon sukses, nomor laporan, status; dua tombol lebar penuh (Lihat ringkasan, Pantau status) |
| Riwayat | Kartu per laporan dengan dua badge; filter berupa **chip yang dapat digeser horizontal**; tombol aksi lebar penuh dalam kartu |
| Hasil | Kartu bertumpuk: skor/kategori (gauge sederhana), kelengkapan, perubahan, jawaban, keterbatasan (alert amber) |
| Status | Dua badge sejajar, pesan status, klarifikasi, tindak lanjut, **timeline vertikal** |
| Klarifikasi | Textarea lebar penuh, tombol kirim lebar penuh; satu kartu per pertanyaan |
| Tindak lanjut | Kartu jenis tindak lanjut, arahan, jadwal konsultasi (WIB) menonjol |
| GAD-7 | Satu butir per kartu; opsi skala 0–3 berupa **empat tombol vertikal** berlabel penuh |

## 6. Arsitektur dan Tech Stack

```
Browser (React SPA, mobile-first)  →  API Dosen (telehealth.informatikaunimus.site/api)
   token + identitas dari .env          sumber data dan logika
```

| Keputusan | Alasan |
|---|---|
| React + Vite, tanpa backend | Tugas hanya frontend; API sudah mengurus logika |
| Token di `.env` (`VITE_API_TOKEN`) | Sesuai contoh kode dosen; repository wajib privat |
| Satu modul `api.js` | Header, JSON, error terstruktur (`status`, `errors`) di satu tempat |
| NIM disuntik di `api.js` | Mencegah lupa `?nim=` dan objek `mahasiswa` |
| React Router + TanStack Query | Routing dan cache/refetch data server |
| Tailwind CSS (mobile-first) | Utilitas breakpoint `sm/md/lg/xl` sesuai tabel 5.2 |
| Vitest + React Testing Library + MSW | Uji `isVisible`, validasi, dan modul API |

**Konfigurasi `.env`** (jangan di-commit; sediakan `.env.example` tanpa token):

```
VITE_API_URL=https://telehealth.informatikaunimus.site/api
VITE_API_TOKEN=<token pasien dari dosen>
VITE_MHS_NIM=C2C023156
VITE_MHS_NAMA=Julius Ferdinan
VITE_MHS_KELAS=E
```

**Struktur proyek (usulan):**

```
src/
  lib/api.js          # fetch + header + error terstruktur
  lib/config.js       # env + identitas mahasiswa
  lib/formEngine.js   # isVisible, validasi, bersihkan jawaban tersembunyi
  hooks/              # useAssessment, useForm, useStatus
  components/form/    # TextQ, TextareaQ, SingleChoiceQ, MultiChoiceQ, ScaleQ, NumberQ, DateQ
  components/ui/      # AppShell, TopBar, Drawer, Sidebar, StickyBar, StatusBadge, Timeline, Alert, Disclaimer
  pages/              # Beranda, Petunjuk, Isi, Periksa, Konfirmasi, Riwayat, Hasil, Status
```

## 7. Kebutuhan Fungsional per Halaman

Setiap halaman wajib mengikuti perilaku mobile pada bagian 5.5.

### 7.0 Identitas mahasiswa
- Dibaca dari `.env`, ditampilkan read-only di menu/footer.
- **AC:** setiap `POST /assessments` memuat `mahasiswa {nim, nama, kelas}`. Validasi: NIM 5–20 huruf/angka, nama 3–100, kelas ≤ 20.

### 7.1 Beranda · `GET /me?nim=`, `GET /forms`, `GET /uts/{nim}`
- Profil, statistik (total, draf, menunggu, perlu klarifikasi, sudah ditinjau), pilihan formulir (FRM-KELUHAN wajib, FRM-GAD7 bonus), kartu status UTS.
- Alert mencolok bila ada laporan `perlu_klarifikasi`, tautan langsung ke jawab.
- **AC:** hanya data NIM sendiri; loading/kosong/error tertangani; 404 pada `/uts/{nim}` ditampilkan sebagai "Belum ada laporan terkirim".

### 7.2 Petunjuk dan persetujuan · `GET /forms/{id}`, `POST /assessments`
- Tujuan, petunjuk, estimasi waktu, periode pelaporan, teks persetujuan.
- **Mulai** aktif setelah centang; mengirim `persetujuan: true` (boolean) + `mahasiswa`.
- **AC:** draf terbentuk (201); ID masuk URL (`/isi/SA-xxxx`) agar aman saat refresh. Bukti `buat`.

### 7.3 Pengisian bertahap · `PATCH /assessments/{id}`
- Satu bagian per layar; jumlah bagian dinamis mengikuti `show_if`.
- **Simpan draf** dan **Lanjut** memanggil PATCH; draf dibuka kembali dari Riwayat lewat `GET /assessments/{id}`.
- Error per kolom (`errors[question_id]`) di bawah input, fokus ke error pertama.
- Autosave saat pindah bagian (P2).
- **AC:** pertanyaan muncul/hilang sesuai `show_if`; jawaban tersembunyi dikosongkan (`null`); 409 dialihkan ke status. Bukti `simpan_draf`.

### 7.4 Periksa sebelum kirim · `POST /forms/{id}/validate`
- Body wajib memuat `nim` dan `answers`.
- Kelengkapan (persen, daftar belum lengkap + tautan), ringkasan jawaban; "Tidak" tampil biasa, "Belum diisi" tampil miring/abu-abu.
- **Kirim** aktif hanya jika `valid: true`; ada dialog konfirmasi karena laporan tidak bisa diubah setelah dikirim.
- **AC:** data `pengukuran` diberi label berbeda dari `subjektif`. Bukti `validasi`.

### 7.5 Konfirmasi · `POST /assessments/{id}/submit`
- "Formulir Anda telah diterima", nomor laporan, waktu kirim, status **Menunggu peninjauan**.
- 422 kembali ke form dengan error; 409 menampilkan status, bukan error merah.
- **AC:** tombol kirim dilindungi dari klik ganda. Bukti `kirim`.

### 7.6 Riwayat · `GET /assessments?nim=`
- Kartu: judul, formulir, nomor, tanggal, dua badge, skor GAD-7.
- Filter: Semua, Draf, Diproses, Perlu klarifikasi, Sudah ditinjau.
- Aksi: Draf → Lanjutkan / Hapus (konfirmasi, `DELETE`); Terkirim → Lihat ringkasan / Pantau status; `perlu_klarifikasi` → Jawab; `sudah_ditinjau` → Lihat tindak lanjut.
- **AC:** tidak pernah memanggil tanpa `?nim=`. Bukti `riwayat`.

### 7.7 Hasil · `GET /assessments/{id}/hasil`
- Ringkasan (`jawaban_teks`), kelengkapan, skor + kategori (GAD-7), perubahan vs pengisian sebelumnya, **keterbatasan hasil**, **langkah berikutnya**.
- **AC:** "bukan diagnosis" terlihat tanpa scroll tambahan; FRM-KELUHAN tanpa skor. Bukti `hasil`.

### 7.8 Tracking status · `GET /assessments/{id}/status`
- Status pengiriman dan peninjauan **terpisah**, `pesan` dari API, timeline.
- Tombol **Muat ulang** + polling ringan (30 dtk, berhenti saat tab tidak aktif).
- **AC:** bukti `status`.

### 7.9 Klarifikasi · `POST /assessments/{id}/clarifications/{cid}/reply`
- Tampil bila `klarifikasi_menunggu` tidak kosong; satu form per klarifikasi.
- Jawaban kosong ditolak (klien + 422); jawaban ganda (409) dijelaskan ramah.
- **AC:** setelah semua terjawab, status menjadi "Klarifikasi sudah dijawab". Bukti `klarifikasi`.

### 7.10 Tindak lanjut · `GET /assessments/{id}/status`
- Jenis (`jadwalkan_konsultasi`, `pemantauan_mandiri`, `rujuk_faskes`, `kunjungan_langsung`, `tidak_perlu`), `arahan`, jadwal konsultasi (WIB), pencatat.
- **AC:** bukti `tindak_lanjut` tercatat saat dibuka setelah laporan ditinjau.

### 7.11 Bonus GAD-7 · `FRM-GAD7`
- 7 butir skala 0–3 (wajib) + 1 butir dampak (opsional), periode "2 minggu terakhir"; dikirim langsung dengan `kirim: true` bila lengkap.
- Hasil: total/21, kategori (Minimal 0–4, Ringan 5–9, Sedang 10–14, Berat 15–21), perubahan skor. Isi **dua kali** agar perbandingan muncul.
- **AC:** nilai `0` dianggap terisi. Bukti `gad7`.

## 8. Mesin Formulir Dinamis

| `type` | Komponen (mobile) | Nilai dikirim |
|---|---|---|
| `text` | Input + penghitung karakter (`max_length`) | string |
| `textarea` | Textarea auto-tinggi + penghitung | string |
| `single_choice` | Kartu/radio lebar penuh | kode opsi |
| `multi_choice` | Kartu dengan kotak centang; opsi `exclusive` melepas lainnya | array kode |
| `scale` | Chip tersegmen berlabel (membungkus di layar sempit) | **angka** |
| `number` | Input angka + satuan, `inputmode`, `min`/`max` | number |
| `date` | `type="date"`, maks. hari ini | `YYYY-MM-DD` |

Aturan wajib:
1. **Render dari definisi API**, jangan hard-code pertanyaan.
2. `show_if` rekursif (`equals`, `in`, `includes`, `filled`, `any`, `all`) pada bagian dan pertanyaan.
3. **Terisi ≠ truthy:** `0` adalah jawaban sah; string kosong dan array kosong = belum diisi.
4. **"Tidak" ≠ "Belum diisi":** pertanyaan belum dijawab tidak dikirim (atau `null`), tanpa default "tidak".
5. Saat jawaban pemicu berubah, jawaban dependen dikosongkan dan dikirim `null` lewat PATCH.
6. Validasi klien memakai atribut definisi; `errors` dari server tetap penentu akhir.
7. `tanggal_pengukuran` wajib bila `suhu_tubuh` atau `berat_badan` terisi, tidak boleh melewati hari ini.
8. `data_type` `pengukuran` dan `subjektif` dibedakan secara visual.

## 9. Pemetaan Endpoint

| Fitur UI | Endpoint (relatif ke base URL) | Catatan |
|---|---|---|
| Cek koneksi | `GET /api` | tanpa token |
| Profil dan statistik | `GET /me?nim=` | |
| Daftar / definisi formulir | `GET /forms`, `GET /forms/{id}` | cache pendek |
| Periksa jawaban | `POST /forms/{id}/validate` | sertakan `nim` |
| Buat draf | `POST /assessments` | `mahasiswa` + `persetujuan: true` |
| Riwayat | `GET /assessments?nim=` | filter opsional |
| Detail | `GET /assessments/{id}` | |
| Simpan sebagian | `PATCH /assessments/{id}` | draf saja |
| Hapus draf | `DELETE /assessments/{id}` | 409 jika terkirim |
| Kirim | `POST /assessments/{id}/submit` | 422 bila kurang |
| Hasil | `GET /assessments/{id}/hasil` | |
| Status | `GET /assessments/{id}/status` | |
| Jawab klarifikasi | `POST /assessments/{id}/clarifications/{cid}/reply` | |
| Status UTS | `GET /uts/{nim}` | |

Endpoint `/review/*` (khusus petugas) tidak dipakai; token pasien akan mendapat 403.

## 10. Penanganan Error

| Kode | Perilaku UI |
|---|---|
| 400 | Pesan umum "Terjadi kesalahan, coba lagi" (pastikan `Content-Type` dan `JSON.stringify`) |
| 401 | Layar "Koneksi ke layanan gagal" (token salah/hilang di konfigurasi, bukan salah pasien) |
| 403 | Pesan akses ditolak |
| 404 | Halaman "Data tidak ditemukan" + tombol kembali ke Riwayat |
| 409 | Pesan ramah, mis. "Laporan ini sudah dikirim dan tidak dapat diubah"; arahkan ke status |
| 422 | Pesan `errors` di bawah tiap input + ringkasan di atas form |
| Jaringan/5xx | Banner "Gagal terhubung" + Coba lagi; jawaban di layar tidak hilang |

## 11. Status dan Badge

| Jenis | Kode → Label | Warna |
|---|---|---|
| Pengiriman | `draft` Draf · `terkirim` Terkirim | abu-abu · hijau |
| Peninjauan | `belum_dikirim` Belum dikirim | abu-abu |
| | `menunggu_peninjauan` Menunggu peninjauan | kuning |
| | `sedang_ditinjau` Sedang ditinjau | biru |
| | `perlu_klarifikasi` Perlu klarifikasi | oranye (dengan CTA) |
| | `klarifikasi_dijawab` Klarifikasi sudah dijawab | ungu |
| | `sudah_ditinjau` Sudah ditinjau | hijau |

Logika memakai `kode`, teks memakai `label`. Warna tidak boleh menjadi satu-satunya pembeda.

## 12. Kebutuhan Non-Fungsional

- **Keamanan:** token hanya di `.env`, repository privat, `.env` di `.gitignore`; variabel `VITE_*` ikut terbundel sehingga pendekatan ini hanya layak untuk tugas kuliah.
- **Privasi:** hanya data NIM sendiri; jawaban tidak dicatat di konsol/log; data draf sementara di klien dibersihkan setelah kirim.
- **Kinerja (4G):** halaman pertama < 3 dtk; *code-splitting* per halaman; skeleton loading; cache definisi formulir; bundle awal sekecil mungkin.
- **Ketahanan:** retry terbatas untuk GET, timeout jelas, banner offline, jawaban di layar tidak hilang saat gagal.
- **Aksesibilitas:** label terhubung ke input, `aria-live` untuk error, navigasi keyboard, kontras ≥ 4.5:1, ikon tombol punya `aria-label`.
- **Bahasa:** Indonesia sederhana, satu gagasan per pertanyaan, istilah medis dijelaskan.
- **Kompatibilitas:** Chrome, Edge, Firefox, Safari (iOS 15+) versi terbaru.

## 13. Arahan Desain (ringkas; detail di `design.md`)

- **Berbeda dari demo dosen** (demo: teal, satu kolom, bottom-nav).
- Palet indigo `#3730A3` + aksen amber `#F59E0B`, latar `#F8FAFC`, teks `#334155`; font Plus Jakarta Sans.
- Mobile: top bar + drawer + sticky action bar. Desktop: sidebar kiri + panel ringkasan.
- Footer permanen: "Hasil self-assessment bukan diagnosis."

## 14. Pengujian

### 14.1 Bukti fitur

| Kode | Dipicu oleh | Halaman |
|---|---|---|
| `buat` | `POST /assessments` dengan persetujuan | Petunjuk |
| `simpan_draf` | `PATCH/PUT /assessments/{id}` | Pengisian |
| `validasi` | `POST /forms/{id}/validate` + `nim` | Periksa |
| `kirim` | FRM-KELUHAN terkirim | Konfirmasi |
| `riwayat` | `GET /assessments?nim=` | Riwayat |
| `hasil` | `GET /assessments/{id}` atau `/hasil` | Hasil |
| `status` | `GET /assessments/{id}/status` | Status |
| `klarifikasi` | `POST …/reply` | Klarifikasi |
| `tindak_lanjut` | Buka status setelah ditinjau | Tindak lanjut |
| `gad7` | FRM-GAD7 terkirim | Bonus |

### 14.2 Skenario end-to-end (dosen)
1. Mulai dengan persetujuan → draf 201.
2. Simpan draf, tutup, buka lagi dari Riwayat → jawaban masih ada.
3. Ubah "ada keluhan" Ya ↔ Tidak dan pengisi pasien ↔ pendamping → pertanyaan muncul/hilang.
4. Lanjut/Kirim dengan kolom kosong → pesan per kolom.
5. Halaman Periksa → "Belum diisi" berbeda dari "Tidak".
6. Kirim saat lengkap → konfirmasi + "Menunggu peninjauan".
7. Riwayat dengan `?nim=` → hanya laporan sendiri.
8. Hasil → ringkasan, kelengkapan, keterbatasan.
9. Status → dua badge terpisah + timeline.
10. Klarifikasi → jawab setelah dosen meminta.
11. Tindak lanjut → arahan dan jadwal tampil.
12. GAD-7 dikirim dua kali → skor, kategori, perubahan.
13. Token salah / ubah laporan terkirim → pesan 401 / 409 yang dapat dipahami.

### 14.3 Uji responsif (wajib, per halaman)
- [ ] 360, 390, 412, 768, 1024, 1440 px: tanpa scroll horizontal, tanpa teks terpotong.
- [ ] Target sentuh ≥ 44 px; input ≥ 16 px (tanpa auto-zoom iOS).
- [ ] Sticky bar tidak menutupi input saat papan ketik terbuka; aman terhadap notch/home indicator.
- [ ] Landscape ponsel tetap bisa dipakai.
- [ ] Zoom teks 200% tetap terbaca.
- [ ] Lighthouse mobile: Accessibility ≥ 90, Performance ≥ 80.

### 14.4 Uji teknis
- Unit test `isVisible` untuk semua bentuk kondisi.
- Nilai `0` terisi; opsi eksklusif `tidak_ada` melepas pilihan lain; `jumlah_hari` 9 ditolak; tanggal masa depan ditolak.
- Uji `api.js` dengan MSW: status dan body error diteruskan utuh, header Authorization terkirim, NIM tersuntik.
- Jalankan koleksi Postman 01 → 17 sebagai pembanding.

## 15. Rencana Kerja 7 Hari

| Hari | Tanggal | Fokus | Hasil |
|---|---|---|---|
| 1 | Sel, 17 Nov | Setup Vite + Tailwind, `.env`, `api.js`, AppShell responsif (top bar, drawer, sidebar); uji `GET /api` dan `/me` | Kerangka responsif + koneksi sukses |
| 2 | Rab, 18 Nov | `formEngine`, komponen per tipe, Beranda, Petunjuk, `POST /assessments` | Draf bisa dibuat |
| 3 | Kam, 19 Nov | Pengisian bertahap + sticky bar, simpan draf, Periksa, Kirim, Konfirmasi | **FRM-KELUHAN terkirim** (dosen mulai meninjau) |
| 4 | Jum, 20 Nov | Riwayat, Hasil, Tracking status + timeline | 7 bukti fitur |
| 5 | Sab, 21 Nov | Klarifikasi, Tindak lanjut (setelah ditinjau), penanganan error global | 9 bukti fitur |
| 6 | Min, 22 Nov | GAD-7 (dua kali kirim), polish responsif, aksesibilitas, Lighthouse | 10/10 |
| 7 | Sen, 23 Nov | Uji 13 skenario + daftar uji responsif, perbaiki bug, README, deploy (bila diminta) | Siap dinilai (cadangan 1 hari) |

## 16. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Dosen terlambat meninjau, klarifikasi/tindak lanjut tak bisa diuji | Kirim laporan hari ke-3; hubungi dosen bila belum diproses hari ke-5 |
| Token dipakai banyak mahasiswa | Selalu `?nim=`; disuntik di `api.js` |
| Token bocor (repo publik, chat, screenshot, bundle browser) | Repository privat, `.env` tidak di-commit, minta rotasi bila tersebar |
| Layout pecah di layar sempit/landscape | Mobile-first, uji 320–1440 px, tanpa lebar tetap dalam px |
| Papan ketik menutupi input/tombol | `scrollIntoView`, sticky bar disembunyikan saat papan ketik terbuka |
| Salah kirim nilai skala (label vs angka) | Simpan nilai opsi dari definisi |
| Nilai `0` dianggap kosong | Cek `v !== undefined && v !== null && v !== ''` |
| Pertanyaan di-hard-code padahal definisi berubah | Render dinamis dari `GET /forms/{id}` |
| API lambat/mati di jaringan seluler | Timeout, retry, banner Coba lagi, jawaban tidak hilang |
| Laporan terkirim tak bisa diubah | Halaman Periksa + dialog konfirmasi sebelum kirim |

## 17. Pertanyaan Terbuka

1. Nilai **kelas** untuk identitas (contoh dosen `TI-5A`; apakah cukup `D`?).
2. Perlu **deploy** online (mis. Vercel/Netlify) atau cukup dijalankan lokal dan didemokan?
3. Apakah token di `.env` frontend diterima dosen? (Contoh kode dosen memakai pendekatan yang sama.)
4. Format pengumpulan: repository, tautan demo, laporan Word, atau video?
5. Akun pasien mana (P-001/P-002/P-003) yang dipakai?

## 18. Daftar Periksa Sebelum Dinilai

- [ ] "Bukan diagnosis" tampil di halaman kunci
- [ ] Semua request membawa NIM sendiri
- [ ] Token tidak ada di kode maupun repository publik
- [ ] `/uts/{nim}` menunjukkan 10/10 bukti fitur
- [ ] 401/403/404/409/422 punya pesan jelas
- [ ] Semua halaman lulus uji responsif (bagian 14.3)
- [ ] Tampilan berbeda dari demo dosen

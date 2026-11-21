# design.md – Web Responsif Self-Assessment Telehealth (React + Vite)

Panduan desain **mobile-first** untuk frontend pasien. Ponsel (360–430 px) adalah layar utama; tablet dan desktop memperluasnya. Tampilan sengaja **berbeda dari demo dosen** (demo: teal, satu kolom, bottom-nav).

## 1. Prinsip
1. **Mobile-first:** tulis gaya untuk ponsel dulu, breakpoint hanya menambah.
2. Satu gagasan per pertanyaan, bahasa sederhana, periode waktu selalu tertulis.
3. 'Tidak' ≠ 'Belum diisi' (kosong tampil miring/abu-abu).
4. Status pengiriman dan peninjauan selalu **dua badge terpisah**.
5. 'Hasil self-assessment bukan diagnosis' terlihat di footer, hasil, dan konfirmasi.
6. Aksi utama selalu terjangkau ibu jari (sticky action bar di bawah).
7. Tenang dan lega; warna alarm hanya untuk error.

## 2. Breakpoint dan layout

| Nama | Lebar | Tailwind | Layout |
|---|---|---|---|
| Mobile kecil | 320–359 | (dasar) | Tetap utuh; chip membungkus |
| **Mobile** | 360–639 | (dasar) | Satu kolom, top bar + drawer, sticky bar |
| Tablet | 640–1023 | `sm:` / `md:` | Beranda 2 kolom; form maks. 640 px di tengah |
| Desktop | ≥ 1024 | `lg:` | Sidebar kiri 220 px; form + panel ringkasan 290 px |
| Lebar | ≥ 1280 | `xl:` | Konten maks. 1100 px, di tengah |

- Padding halaman 16 px (mobile), 24 px (tablet), 32–40 px (desktop).
- Tanpa lebar tetap dalam px untuk konten; pakai `%`, `rem`, `flex`, `grid`.
- Tinggi layar penuh memakai `dvh`. Tidak boleh ada scroll horizontal pada ≥ 320 px.
- Viewport: `width=device-width, initial-scale=1, viewport-fit=cover`.

## 3. Navigasi

| Layar | Pola |
|---|---|
| Mobile / tablet | **Top bar** 56 px (tombol menu/kembali 44 px + judul) dan **drawer** (Beranda, Riwayat, Status UTS, Identitas). Tanpa bottom-nav |
| Desktop | **Sidebar** tetap di kiri |
| Pengisian, Periksa | Top bar berisi tombol kembali; aksi lewat **sticky bar** |

**Sticky bar:** `position: sticky/fixed` di bawah, latar putih, garis atas 1 px, `padding-bottom: calc(12px + env(safe-area-inset-bottom))`. Disembunyikan saat papan ketik terbuka.

## 4. Warna (design tokens - Edisi Julius Ferdinan)

| Token | Hex | Pakai untuk |
|---|---|---|
| `ink` | `#0F172A` | Top bar, sidebar, judul utama (Slate 900) |
| `primary` | `#0284C7` | Tombol utama, langkah aktif, tautan (Ocean Blue 600) |
| `primary-soft` | `#F0F9FF` | Pilihan terpilih, aksen latar kartu (Sky 50) |
| `accent` | `#F43F5E` | Progress, sorotan detak medis (Rose 500) |
| `accent-soft` | `#FFF1F2` | Alert, badge sorotan (Rose 50) |
| `bg` | `#F8FAFC` | Latar halaman (Slate 50) |
| `surface` | `#FFFFFF` | Kartu & modul |
| `border` | `#E2E8F0` | Garis batas modern (Slate 200) |
| `text` | `#1E293B` | Teks isi (Slate 800) |
| `muted` | `#64748B` | Teks sekunder (kontras ≥ 4.5:1) |
| `danger` | `#E11D48` | Error validasi (Rose 600) |

### Badge status (logika pakai `kode`, teks pakai `label`)

| Kode | Latar | Teks |
|---|---|---|
| `draft`, `belum_dikirim` | `#E2E8F0` | `#334155` |
| `terkirim`, `sudah_ditinjau` | `#DCFCE7` | `#166534` |
| `menunggu_peninjauan` | `#FEF3C7` | `#92400E` |
| `sedang_ditinjau` | `#DBEAFE` | `#1E40AF` |
| `perlu_klarifikasi` | `#FFEDD5` | `#9A3412` |
| `klarifikasi_dijawab` | `#EDE9FE` | `#5B21B6` |

Warna bukan satu-satunya pembeda: selalu sertakan teks label.

## 5. Tipografi
- Font **Plus Jakarta Sans** (400/500/600/700), fallback `system-ui, sans-serif`.
- Skala mobile: judul halaman 24/700 · judul kartu 16–18/700 · pertanyaan 16/600 · isi 14–15/400 · caption 12–13.
- Skala desktop: judul halaman 28/700, judul kartu 18–22/700.
- **Input ≥ 16 px** agar iOS tidak auto-zoom. Line-height isi 1.5; lebar teks maks. ±70 karakter.

## 6. Spasi, radius, elevasi
- Grid 4 px: 4 · 8 · 12 · 16 · 24 · 32 · 48. Jarak antar kartu 12 px (mobile).
- Radius: input/tombol 10 px · kartu 14–16 px · badge 999 px.
- Elevasi: hanya border 1 px; bayangan lembut hanya untuk drawer dan dialog.

## 7. Komponen

| Komponen | Spesifikasi |
|---|---|
| Tombol primer | Isi `primary`, teks putih, **tinggi ≥ 44 px**, fokus ring 2 px `accent`; lebar penuh di mobile |
| Tombol sekunder | Outline 2 px `primary`, latar putih |
| Tombol bahaya | Outline `danger` + dialog konfirmasi (Hapus draf) |
| Input / textarea | Tinggi 48 px, font 16 px, penghitung karakter (`max_length`), error di bawah input |
| Pilihan tunggal | **Chip** tinggi 44 px; terpilih: border 2 px `primary` + latar `primary-soft`; opsi panjang jadi kartu lebar penuh |
| Pilihan ganda | Kartu dengan kotak centang; opsi `exclusive` melepas lainnya |
| Skala 1–5 | Kisi 5 kolom, chip dengan angka + label ujung (mis. Sangat jarang … Sangat sering) |
| Skala GAD-7 (0–3) | **Empat tombol vertikal** berlabel penuh; nilai `0` sah |
| Angka + satuan | Input dengan sufiks (hari, °C, kg), `inputmode="numeric"` atau `"decimal"` |
| Tanggal | `type="date"`, maks. hari ini |
| Progress bagian | Mobile: teks 'Bagian x dari n' + bar; ≥ tablet: stepper bernomor |
| Kartu statistik | Kisi 2×2 di mobile, 4 kolom di desktop; angka besar + label |
| Alert | Amber (klarifikasi/peringatan), indigo muda (info), merah (error) |
| Timeline | Vertikal, titik berwarna, waktu WIB, terbaru di atas |
| Panel ringkasan | Hanya ≥ `lg` (progress + jawaban sementara); di mobile pindah ke halaman Periksa |
| Tanda pengukuran | Label kecil 'pengukuran' pada suhu/berat (`data_type`) |
| Gauge GAD-7 | Bar 0–21 dengan 4 segmen (Minimal/Ringan/Sedang/Berat) |
| Drawer | Lebar 280 px, overlay gelap, tutup dengan tap luar atau Esc |
| Daftar/tabel | Mobile: kartu bertumpuk; tabel hanya ≥ `md` |

## 8. Pola layar mobile

| Layar | Susunan (atas ke bawah) |
|---|---|
| Beranda | Top bar → sapaan → statistik 2×2 → alert klarifikasi → kartu formulir → kartu GAD-7 → status UTS → disclaimer |
| Petunjuk | Judul → petunjuk → centang persetujuan → sticky **Mulai** |
| Pengisian | Top bar → progress → pertanyaan → sticky **Simpan draf / Lanjut** |
| Periksa | Kelengkapan → 'perlu diperbaiki' (tautan) → ringkasan → sticky **Ubah jawaban / Kirim** |
| Konfirmasi | Ikon sukses → nomor + status → dua tombol lebar penuh |
| Riwayat | Chip filter (geser horizontal) → kartu laporan dengan dua badge |
| Hasil | Skor/kategori → perubahan → jawaban → keterbatasan → sticky **Pantau status** |
| Status | Dua badge → pesan → klarifikasi → tindak lanjut → timeline |

## 9. State
- **Loading:** skeleton kartu, bukan spinner layar penuh.
- **Kosong:** ilustrasi sederhana + CTA ('Belum ada laporan, mulai self-assessment').
- **Error 422:** teks merah di bawah input + ringkasan di atas form; fokus ke error pertama.
- **Jaringan/5xx:** banner 'Gagal terhubung' + Coba lagi; jawaban di layar tidak hilang.
- **409:** pesan ramah ('Laporan ini sudah dikirim dan tidak dapat diubah'), arahkan ke status.
- **401:** layar 'Koneksi layanan bermasalah' (bukan salah pasien).
- **Offline:** banner tipis di bawah top bar.

## 10. Aksesibilitas
- `<label>` terhubung ke input; error memakai `aria-live="polite"`.
- Navigasi keyboard penuh, fokus terlihat, urutan tab logis.
- Kontras teks ≥ 4.5:1; tombol ikon punya `aria-label`.
- Target sentuh ≥ 44×44 px, jarak ≥ 8 px.
- Hormati `prefers-reduced-motion`; teks tetap terbaca pada zoom 200%.

## 11. Microcopy
- Ramah, singkat, tanpa jargon medis. Contoh: 'Formulir Anda telah diterima. Status: Menunggu peninjauan.'
- Pesan dari API (`message`, `pesan`, `errors`) ditampilkan apa adanya.
- Tombol berupa kata kerja: Mulai, Simpan draf, Lanjut, Ubah jawaban, Kirim jawaban, Pantau status, Jawab klarifikasi.

## 12. Implementasi (Tailwind v3)

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    extend: {
      colors: {
        ink: '#1E1B4B', primary: '#3730A3', 'primary-soft': '#EEF2FF',
        accent: '#F59E0B', 'accent-soft': '#FEF3C7',
        danger: '#B91C1C', muted: '#475569',
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '16px', control: '10px' },
      spacing: { safe: 'env(safe-area-inset-bottom)' },
    },
  },
}
```

Pola kelas mobile-first: `grid grid-cols-2 gap-3 lg:grid-cols-4`, `px-4 md:px-6 lg:px-10`, `fixed bottom-0 inset-x-0 pb-[calc(12px+env(safe-area-inset-bottom))] lg:static`.

## 13. Pemetaan canvas ke halaman PRD

| Artboard | Halaman PRD |
|---|---|
| Wireframe W1–W5 | 7.1 Beranda · 7.3 Pengisian · 7.4 Periksa · 7.7 Hasil · 7.8 Status |
| Mobile – Beranda | 7.1 |
| Mobile – Pengisian | 7.3 |
| Mobile – Periksa | 7.4 |
| Mobile – Status | 7.8–7.10 (status, klarifikasi, tindak lanjut) |
| Desktop – Beranda, Pengisian | 7.1, 7.3 pada ≥ `lg` |

Halaman yang belum digambar (Petunjuk, Konfirmasi, Riwayat, GAD-7) memakai komponen dan token yang sama.

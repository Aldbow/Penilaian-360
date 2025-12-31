# Product Requirement Document (PRD)

## Aplikasi Penilaian 360° BerAKHLAK – UKPBJ

**Versi:** 1.3
**Tanggal:** 30 Desember 2025
**Status:** Tambahan Dokumentasi
**Penulis:** AI Assistant

---

## 1. Pendahuluan

### 1.1 Latar Belakang

Unit Kerja Pengadaan Barang/Jasa (UKPBJ) memerlukan sistem evaluasi kinerja perilaku yang objektif berdasarkan core values ASN **BerAKHLAK**:

* Berorientasi Pelayanan
* Akuntabel
* Kompeten
* Harmonis
* Loyal
* Adaptif
* Kolaboratif

Metode yang digunakan adalah **360-degree feedback**, di mana setiap anggota menilai seluruh anggota lainnya secara **anonim** untuk menjaga objektivitas.

### 1.2 Tujuan

* Mendigitalkan proses penilaian perilaku pegawai UKPBJ dengan antarmuka menarik
* Menjamin kerahasiaan (anonimitas) penilai
* Memudahkan rekapitulasi nilai menggunakan **Google Sheets**
* Memberikan pengalaman pengguna (UX) modern dengan animasi halus

### 1.3 Ruang Lingkup

* **Platform:** Web Application (Responsive Mobile & Desktop)
* **Target Pengguna:**

  * User: Seluruh anggota UKPBJ
  * Admin: Pimpinan / Sekretariat
* **Database:** Google Sheets (via API / Google Apps Script)

---

## 2. Profil Pengguna (User Personas)

### 2.1 User (Pegawai UKPBJ)

**Peran:** Penilai dan Ter-nilai

**Kebutuhan:**

* Login aman ke akun pribadi
* Melihat daftar rekan kerja dengan progres jelas
* Penilaian intuitif menggunakan bintang
* Identitas penilai tidak diketahui oleh siapa pun

### 2.2 Admin (Pimpinan / Sekretariat)

**Peran:** Pengelola dan pemantau hasil

**Kebutuhan:**

* Login khusus Admin
* Manajemen data pegawai
* Monitoring progres penilaian real-time
* Melihat hasil akhir tanpa mengetahui identitas penilai

---

## 3. Spesifikasi Fungsional & Desain

### 3.1 Fitur Otentikasi (Login)

* Akses dibatasi untuk user terdaftar
* Input: Username (NIP/Email) & Password
* Validasi melalui **Sheet `Users`**
* Animasi:

  * Shake halus jika login gagal
  * Fade-out jika login berhasil

### 3.2 Dashboard User

* Tampilan kartu modern (rounded corner, soft shadow)
* Progress bar animatif
* Daftar rekan kerja:

  * Grid (Desktop), List (Mobile)
  * Nama & Avatar
  * Status:

    * **Belum Dinilai:** Tombol aktif
    * **Sudah Dinilai:** Icon centang hijau
* User tidak dapat menilai dirinya sendiri

### 3.3 Formulir Penilaian

* Header: Nama pegawai yang dinilai
* 7 aspek BerAKHLAK
* Input: **Star Rating (1–5 bintang)**
* Deskripsi indikator muncul otomatis sesuai bintang

**Konversi Skor:**

| Bintang | Kategori        | Nilai |
| ------- | --------------- | ----- |
| ⭐       | Sangat Kurang   | 20    |
| ⭐⭐      | Kurang          | 40    |
| ⭐⭐⭐     | Butuh Perbaikan | 60    |
| ⭐⭐⭐⭐    | Baik            | 80    |
| ⭐⭐⭐⭐⭐   | Sangat Baik     | 100   |

* Submit dengan animasi loading & success feedback

### 3.4 Dashboard Admin & Rekap

* Monitoring progres penilaian
* Anonimitas penuh
* Rekap nilai rata-rata per pegawai

### 3.5 Standar UI/UX & Animasi

* **Gaya:** Modern, minimalis, clean UI
* **Warna:** Biru gradasi, putih, abu-abu lembut
* **Font:** Inter / Poppins / Roboto

**Animasi Wajib:**

* Hover card lift-up
* Star bounce effect
* Page transition halus
* Toast notification

**Optimasi:**

* 60 FPS
* CSS `transform` & `opacity`
* Mobile-first performance

---

## 4. Struktur Data (Google Sheets Schema)

### Tab 1: `Users`

| Kolom            | Deskripsi    |
| ---------------- | ------------ |
| ID_Pegawai       | NIP (Unique) |
| Nama_Lengkap     | Nama         |
| Password         | String       |
| Role             | User / Admin |
| Jabatan          | String       |
| Status_Penilaian | Boolean      |

### Tab 2: `Questions`

| Kolom         | Deskripsi       |
| ------------- | --------------- |
| Aspek         | Nilai BerAKHLAK |
| Deskripsi_100 | Bintang 5       |
| Deskripsi_80  | Bintang 4       |
| Deskripsi_60  | Bintang 3       |
| Deskripsi_40  | Bintang 2       |
| Deskripsi_20  | Bintang 1       |

### Tab 3: `Assessments`

| Kolom                       | Deskripsi            |
| --------------------------- | -------------------- |
| Timestamp                   | Waktu input          |
| ID_Target                   | NIP dinilai          |
| ID_Evaluator                | NIP penilai (hashed) |
| Skor_Berorientasi_Pelayanan | 20–100               |
| Skor_Akuntabel              | 20–100               |
| Skor_Kompeten               | 20–100               |
| Skor_Harmonis               | 20–100               |
| Skor_Loyal                  | 20–100               |
| Skor_Adaptif                | 20–100               |
| Skor_Kolaboratif            | 20–100               |

---

## 5. Detail Interaksi Penilaian

* Default: 5 bintang kosong + teks instruksi
* Klik bintang → warna berubah + deskripsi muncul
* User menyesuaikan pilihan berdasarkan deskripsi
* Menjamin penilaian berbasis indikator, bukan subjektif

---

## 6. Arsitektur Teknis & Keamanan

### 6.1 Tech Stack

* **Frontend:** HTML5, Tailwind CSS, JavaScript (React / Vue)
* **Animasi:** GSAP / Framer Motion / Animate.css
* **Backend:** Google Apps Script
* **Database:** Google Sheets

### 6.2 Mekanisme Anonimitas

* ID penilai disimpan untuk validasi teknis
* Admin hanya melihat data agregat (rata-rata)

---

## 7. Alur Pengguna (User Flow)

1. Login
2. Dashboard
3. Pilih rekan kerja
4. Isi 7 aspek penilaian
5. Submit
6. Success feedback
7. Logout

---

## 8. Kriteria Penerimaan (Acceptance Criteria)

1. UI modern & tidak kaku
2. Sistem bintang berjalan akurat
3. Animasi smooth & ringan
4. Data tersimpan real-time
5. Anonimitas terjamin

---

## 9. Dokumentasi & Serah Terima

### 9.1 Dokumentasi Teknis

* Readme kode
* Setup & deployment guide
* Kamus data

### 9.2 User Manual

* Panduan Admin (PDF)
* Panduan User
* **Video Tutorial (Wajib):**

  * Alur User
  * Alur Admin

---


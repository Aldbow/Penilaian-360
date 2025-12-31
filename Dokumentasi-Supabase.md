# Migrasi ke Supabase - Panduan Lengkap

Dokumentasi ini menjelaskan cara migrasi aplikasi dari Google Sheets ke Supabase secara rinci.

## 1. Persyaratan Awal

Pastikan Anda memiliki:
- Akun email untuk registrasi
- Node.js (versi 18.17 atau lebih baru)
- npm (tersedia bersama Node.js)

## 2. Membuat Akun dan Proyek Supabase

### A. Registrasi Akun Supabase
1. Buka [https://supabase.com](https://supabase.com)
2. Klik tombol "Start your project"
3. Pilih metode registrasi (email, GitHub, atau Google)
4. Ikuti instruksi verifikasi email jika menggunakan registrasi email
5. Setelah verifikasi, Anda akan diarahkan ke dashboard

### B. Membuat Proyek Baru
1. Di dashboard Supabase, klik "New Project"
2. Isi informasi proyek:
   - **Project Name**: Beri nama proyek (misalnya: "penilaian-360")
   - **Organization**: Gunakan nama default atau buat baru
   - **Region**: Pilih region terdekat (misalnya: United States, Singapore, dll)
3. Pilih plan:
   - **Free Plan**: Cukup untuk pengembangan dan pengujian
   - Klik "Create new project"
4. Tunggu proses pembuatan proyek selesai (biasanya 1-2 menit)
5. Setelah selesai, Anda akan diarahkan ke dashboard proyek

## 3. Mendapatkan Informasi Proyek

### A. Dapatkan Project URL dan API Keys
1. Di dashboard proyek, klik "Settings" (ikon roda gigi) di sidebar kiri
2. Klik "Project Settings"
3. Catat informasi berikut:
   - **Project URL**: Formatnya seperti `https://[project_ref].supabase.co`
   - **Project API Keys > anon (Public)**: Kunci panjang yang dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 4. Membuat Tabel Database

### A. Buka SQL Editor
1. Di dashboard Supabase, klik "SQL" di sidebar kiri
2. Klik "New query" (atau buka editor SQL yang sudah tersedia)

### B. Jalankan Skrip Pembuatan Tabel
Copy dan paste skrip SQL berikut ke dalam editor SQL, lalu klik "Run":

```sql
-- Tabel users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'User', -- 'Admin' or 'User'
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel assessments
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluator_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  pelayanan INTEGER CHECK (pelayanan BETWEEN 1 AND 5),
  akuntabel INTEGER CHECK (akuntabel BETWEEN 1 AND 5),
  kompeten INTEGER CHECK (kompeten BETWEEN 1 AND 5),
  harmonis INTEGER CHECK (harmonis BETWEEN 1 AND 5),
  loyal INTEGER CHECK (loyal BETWEEN 1 AND 5),
  adaptif INTEGER CHECK (adaptif BETWEEN 1 AND 5),
  kolaboratif INTEGER CHECK (kolaboratif BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tambahkan data pengguna awal
INSERT INTO users (username, name, role, position) VALUES
('admin', 'Admin', 'Admin', 'Administrator'),
('pegawai1', 'Budi Santoso', 'User', 'Staff'),
('pegawai2', 'Siti Aminah', 'User', 'Staff'),
('pegawai3', 'Ahmad Fauzi', 'User', 'Supervisor'),
('pegawai4', 'Rina Kusuma', 'User', 'Staff');
```

### C. Verifikasi Pembuatan Tabel
1. Klik "Table editor" di sidebar kiri
2. Pastikan tabel `users` dan `assessments` sudah muncul
3. Klik pada masing-masing tabel untuk memastikan data pengguna awal sudah dimasukkan

## 5. Konfigurasi Otentikasi Supabase

### A. Konfigurasi Pengaturan Otentikasi
1. Di dashboard Supabase, klik "Authentication" di sidebar kiri
2. Klik "Settings" (ikon roda gigi)
3. Pastikan pengaturan berikut diaktifkan:
   - **Site URL**: Isi dengan `http://localhost:3000` (atau URL production Anda)
   - **Redirect URLs**: Tambahkan `http://localhost:3000` dan `http://localhost:3000/*`
   - **Enable email signups**: Centang kotak ini
   - **Enable email confirmations**: Bisa dicentang atau tidak tergantung kebutuhan
4. Gulir ke bawah ke bagian "Secure Email Change" dan biarkan default
5. Klik "Save" di pojok kanan atas

### B. Konfigurasi Provider Otentikasi
1. Tetap di halaman Authentication > Settings
2. Gulir ke bawah ke bagian "Providers"
3. Pastikan "Email" provider dalam keadaan **diaktifkan** (toggle biru)
4. Jika ingin menggunakan provider lain (Google, GitHub, dll), aktifkan juga sesuai kebutuhan

### C. Membuat User di Supabase Auth
Karena aplikasi ini menggunakan format email khusus `{username}@penilaian360.com`, kita perlu membuat user di Supabase Auth:

1. Di dashboard Supabase, klik "Authentication" > "Users" di sidebar kiri
2. Klik "New User"
3. Isi form:
   - **Email**: `admin@penilaian360.com`
   - **Password**: Buat password yang kuat (minimal 6 karakter)
   - **Confirm Password**: Ulangi password yang sama
   - **Role**: Biarkan default "authenticated"
4. Klik "Create user"
5. Ulangi langkah 2-4 untuk user lainnya:
   - `pegawai1@penilaian360.com`
   - `pegawai2@penilaian360.com`
   - `pegawai3@penilaian360.com`
   - `pegawai4@penilaian360.com`

Catatan: Pastikan password yang Anda buat untuk setiap user disimpan karena akan digunakan saat login.

## 6. Konfigurasi Aplikasi Lokal

### A. Install Dependencies
Di terminal, dari folder proyek aplikasi, jalankan:
```bash
npm install
```

### B. Buat File Konfigurasi Lingkungan
1. Di root folder proyek, buat file baru bernama `.env.local`
2. Buka file tersebut dengan editor teks
3. Tambahkan konten berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
NODE_ENV=development
```

4. Ganti placeholder dengan nilai sebenarnya:
   - Ganti `[PROJECT_REF]` dengan project reference dari URL proyek Anda (bagian sebelum `.supabase.co`)
   - Ganti `[YOUR_ANON_KEY]` dengan anonymous key yang Anda catat sebelumnya

Contoh file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM2RlZjQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk5MDA3LCJleHAiOjE5NTY1NzUwMDd9.abcdef123456
NODE_ENV=development
```

### C. Verifikasi Konfigurasi
Pastikan file `.env.local` berada di root folder proyek dan tidak terdaftar di `.gitignore` jika Anda menggunakan Git.

## 7. Menjalankan Aplikasi

### A. Jalankan Development Server
Di terminal, dari folder proyek, jalankan:
```bash
npm run dev
```

### B. Akses Aplikasi
Buka browser dan kunjungi:
```
http://localhost:3000
```

### C. Login ke Aplikasi
1. Aplikasi akan secara otomatis mengarahkan Anda ke halaman login
2. Untuk login sebagai admin:
   - Username: `admin`
   - Password: password yang Anda buat untuk user `admin@penilaian360.com`
3. Sistem akan otomatis mengonversi username menjadi `admin@penilaian360.com` untuk proses otentikasi Supabase
4. Jika login berhasil, Anda akan diarahkan ke dashboard sesuai role

## 8. Testing Fungsionalitas

### A. Testing Login
1. Coba login sebagai admin dan user biasa
2. Pastikan redirect ke halaman yang benar (admin ke `/admin`, user ke `/dashboard`)

### B. Testing Dashboard
1. Login sebagai user
2. Pastikan daftar pegawai muncul dengan benar
3. Pastikan progres penilaian terhitung dengan benar

### C. Testing Formulir Penilaian
1. Pilih pegawai untuk dinilai
2. Berikan penilaian untuk semua aspek (1-5 bintang)
3. Klik "Kirim Penilaian"
4. Pastikan penilaian berhasil disimpan

### D. Testing Admin Dashboard
1. Login sebagai admin
2. Pastikan data penilaian muncul di tabel hasil
3. Pastikan progres penilaian terupdate

## 9. Troubleshooting

### A. Masalah Umum dan Solusi

**1. Error saat login: "Invalid login credentials"**
- Pastikan Anda membuat user di Supabase Auth dengan format email yang benar (`{username}@penilaian360.com`)
- Pastikan password yang dimasukkan benar
- Pastikan Project URL dan API key sudah benar di file `.env.local`

**2. Data tidak muncul di dashboard**
- Pastikan tabel `users` sudah dibuat dan berisi data
- Pastikan konfigurasi RLS (Row Level Security) tidak menghalangi akses (untuk awal, pastikan RLS dimatikan)

**3. Tidak bisa mengakses Supabase API**
- Pastikan Project URL dan API key benar
- Pastikan koneksi internet stabil
- Cek browser console untuk error lebih detail

**4. Aplikasi tidak bisa connect ke Supabase**
- Pastikan file `.env.local` sudah dibuat dengan benar
- Pastikan variabel lingkungan diawali dengan `NEXT_PUBLIC_`
- Restart development server setelah mengubah file `.env.local`

### B. Debugging Tips

**1. Cek Browser Console**
- Buka Developer Tools (F12)
- Lihat tab Console untuk error pesan

**2. Cek Network Tab**
- Lihat apakah permintaan ke Supabase berhasil atau gagal
- Periksa status HTTP dan response body

**3. Cek Dashboard Supabase**
- Pastikan data benar-benar masuk ke tabel
- Periksa log otentikasi di Authentication > Logs

**4. Cek File Log Aplikasi**
- Lihat output di terminal tempat Anda menjalankan `npm run dev`

## 10. Production Deployment

### A. Konfigurasi untuk Production
1. Di platform hosting (Vercel, Netlify, dll), tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Pastikan nilai-nilai ini sama dengan yang digunakan di development

### B. Keamanan Tambahan (Opsional)
1. Aktifkan Row Level Security (RLS) di Supabase untuk kontrol akses lebih ketat
2. Tambahkan aturan RLS sesuai kebutuhan aplikasi
3. Pertimbangkan untuk menggunakan service role key hanya di server-side

## 11. Ringkasan Proses

1. ✅ Buat akun Supabase
2. ✅ Buat proyek baru
3. ✅ Dapatkan Project URL dan API Keys
4. ✅ Buat tabel database menggunakan SQL Editor
5. ✅ Konfigurasi otentikasi dan buat user
6. ✅ Install dependencies (`npm install`)
7. ✅ Buat file `.env.local` dengan konfigurasi
8. ✅ Jalankan aplikasi (`npm run dev`)
9. ✅ Akses di `http://localhost:3000`
10. ✅ Login dan test fungsionalitas

Setelah semua langkah di atas selesai, aplikasi Penilaian 360° BerAKHLAK akan berjalan dengan Supabase sebagai backend database dan otentikasi.
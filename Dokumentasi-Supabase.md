# Migrasi ke Supabase

Dokumentasi ini menjelaskan cara migrasi aplikasi dari Google Sheets ke Supabase.

## 1. Persyaratan Awal

Pastikan Anda memiliki akun Supabase:
- Buat akun di [supabase.com](https://supabase.com)
- Buat proyek baru

## 2. Konfigurasi Supabase

### A. Dapatkan Informasi Proyek
- Setelah membuat proyek, salin:
  - **Project URL** (dari Settings > Project Settings)
  - **Anonymous Key** (dari Settings > API)

### B. Buat Tabel Database

Jalankan SQL berikut di SQL Editor Supabase:

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

### C. Konfigurasi Otentikasi Supabase

Supabase Auth perlu dikonfigurasi untuk mendukung login dengan username:

1. Di dashboard Supabase, pergi ke Authentication > Settings
2. Aktifkan "Allow sign ups"
3. Di Authentication > Providers, pastikan email provider diaktifkan
4. Untuk login dengan username, kita akan menggunakan email format khusus: `{username}@penilaian360.com`

## 3. Konfigurasi Aplikasi

### A. Update Environment Variables

Ubah file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
NODE_ENV="development"
```

### B. Install Dependencies

Tambahkan dependensi Supabase:

```bash
npm install @supabase/supabase-js
```

## 4. Struktur File Baru

- `lib/supabase.ts`: Konfigurasi klien Supabase
- `types/supabase.ts`: Definisi tipe untuk Supabase
- `utils/supabase.ts`: Fungsi-fungsi utilitas untuk berinteraksi dengan Supabase
- `components/AuthProvider.tsx`: Provider otentikasi yang menggunakan Supabase Auth

## 5. Perbedaan Implementasi

### A. Otentikasi
- Sebelumnya: Login dengan username/password langsung ke Google Sheets
- Sekarang: Login dengan Supabase Auth (menggunakan email format `{username}@penilaian360.com`) dan verifikasi di tabel users

### B. Database
- Sebelumnya: Data disimpan di Google Sheets
- Sekarang: Data disimpan di PostgreSQL Supabase

### C. Real-time
- Supabase menyediakan kemampuan real-time (opsional)

## 6. Testing

1. Jalankan aplikasi: `npm run dev`
2. Coba login dengan akun admin:
   - Username: `admin`
   - Password: sesuai dengan konfigurasi Supabase Auth
3. Verifikasi bahwa data muncul dengan benar di dashboard
4. Coba memberikan penilaian dan verifikasi bahwa data disimpan di Supabase

## 7. Production Deployment

Untuk deployment ke production:

1. Set environment variables di platform hosting (Vercel, Netlify, dll)
2. Pastikan database Supabase siap untuk production
3. Pertimbangkan untuk menambahkan Row Level Security (RLS) di Supabase untuk keamanan tambahan
4. Backup database secara berkala

## 8. Troubleshooting

### Masalah Umum:
- **Auth error**: Pastikan email format benar (`{username}@penilaian360.com`)
- **Data tidak muncul**: Periksa apakah RLS diaktifkan dan aturan aksesnya benar
- **Connection timeout**: Pastikan URL dan key Supabase benar

### Debugging:
- Periksa browser console untuk error
- Gunakan SQL Editor di dashboard Supabase untuk memeriksa data
- Aktifkan logging di aplikasi untuk debugging lebih lanjut
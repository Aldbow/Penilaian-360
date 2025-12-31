# Aplikasi Penilaian 360° BerAKHLAK – UKPBJ

Aplikasi web untuk sistem evaluasi kinerja perilaku berbasis metode 360-degree feedback dengan core values ASN BerAKHLAK.

## Teknologi yang Digunakan

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animasi**: Framer Motion
- **Icons**: Lucide React
- **Notifikasi**: Sonner
- **Database**: Supabase (PostgreSQL)
- **Otentikasi**: Supabase Auth

## Fitur Utama

- **Otentikasi Aman**: Login dengan username dan password
- **Dashboard Pengguna**: Tampilan progres penilaian dan daftar rekan kerja
- **Formulir Penilaian**: Sistem bintang (1-5) untuk 7 aspek BerAKHLAK
- **Dashboard Admin**: Monitoring progres dan hasil penilaian
- **Anonimitas**: Identitas penilai tidak diketahui oleh siapa pun
- **Animasi Halus**: Pengalaman pengguna modern dengan animasi

## Struktur Proyek

```
penilaian-360-next/
├── components/           # Komponen reusable
│   ├── ui/             # Komponen shadcn/ui
│   ├── AuthProvider.tsx # Context otentikasi
│   ├── StarRating.tsx   # Komponen rating bintang
│   ├── AnimatedProgressBar.tsx # Progress bar animasi
│   └── ...
├── pages/               # Halaman aplikasi
│   ├── index.tsx        # Halaman utama
│   ├── login.tsx        # Halaman login
│   ├── dashboard.tsx    # Dashboard pengguna
│   ├── rating/[id].tsx  # Formulir penilaian
│   ├── admin.tsx        # Dashboard admin
│   └── api/             # API routes
├── types/               # Definisi tipe TypeScript
├── utils/               # Fungsi utilitas
│   └── supabase.ts      # Integrasi Supabase
├── lib/                 # Fungsi bantuan
│   └── supabase.ts      # Konfigurasi Supabase
├── public/              # File statis
└── styles/              # File CSS global
```

## Instalasi

1. Clone repository ini
2. Masuk ke direktori proyek
3. Install dependensi:

```bash
npm install
```

4. Buat file `.env.local` dan tambahkan variabel lingkungan:

```env
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
NODE_ENV="development"
```

## Konfigurasi Supabase

### 1. Buat Proyek Supabase

1. Buka [supabase.com](https://supabase.com) dan buat akun
2. Buat proyek baru
3. Salin Project URL dan Anonymous Key dari Settings > Project Settings > API

### 2. Buat Tabel Database

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

### 3. Konfigurasi Otentikasi

Supabase Auth perlu dikonfigurasi untuk mendukung login dengan username. Aplikasi ini menggunakan format email khusus: `{username}@penilaian360.com`

## Penggunaan

### Login
- Akses halaman login
- Masukkan username dan password
- Sistem akan memverifikasi kredensial melalui Supabase Auth dan tabel users

### Dashboard Pengguna
- Melihat progres penilaian
- Melihat daftar rekan kerja
- Klik pegawai untuk memberikan penilaian

### Formulir Penilaian
- Menilai 7 aspek BerAKHLAK menggunakan sistem bintang (1-5)
- Setiap bintang memiliki deskripsi yang muncul saat dipilih
- Mengirim penilaian setelah semua aspek diisi

### Dashboard Admin
- Melihat progres penilaian secara keseluruhan
- Melihat hasil penilaian agregat
- Menjaga anonimitas penilai

## Aspek Penilaian BerAKHLAK

1. **Berorientasi Pelayanan**: Responsif dan proaktif terhadap kebutuhan pelayanan
2. **Akuntabel**: Bertanggung jawab dan transparan
3. **Kompeten**: Memiliki kemampuan dan keahlian yang diperlukan
4. **Harmonis**: Mampu bekerja sama dan menciptakan kerukunan
5. **Loyal**: Setia dan membanggakan organisasi
6. **Adaptif**: Mampu menyesuaikan diri dengan perubahan
7. **Kolaboratif**: Mampu bekerja sama dan membangun tim

## Konversi Skor

| Bintang | Kategori | Nilai |
|---------|----------|-------|
| ⭐ | Sangat Kurang | 1 |
| ⭐⭐ | Kurang | 2 |
| ⭐⭐⭐ | Butuh Perbaikan | 3 |
| ⭐⭐⭐⭐ | Baik | 4 |
| ⭐⭐⭐⭐⭐ | Sangat Baik | 5 |

## Kontribusi

Silakan buat pull request untuk kontribusi pengembangan aplikasi ini.

## Lisensi

Proyek ini dibuat untuk keperluan internal UKPBJ.
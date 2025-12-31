# Panduan Instalasi dan Penggunaan Aplikasi Penilaian 360° BerAKHLAK

## Daftar Isi
1. [Prasyarat Sistem](#prasyarat-sistem)
2. [Instalasi Aplikasi](#instalasi-aplikasi)
3. [Konfigurasi Google Sheets](#konfigurasi-google-sheets)
4. [Menjalankan Aplikasi](#menjalankan-aplikasi)
5. [Struktur Folder](#struktur-folder)
6. [Penggunaan Aplikasi](#penggunaan-aplikasi)
7. [Troubleshooting](#troubleshooting)

## Prasyarat Sistem

Sebelum memulai, pastikan sistem Anda telah terinstall:

- **Node.js** (versi 18.17 atau lebih baru)
- **npm** atau **yarn** (tersedia secara otomatis dengan Node.js)
- **Git** (opsional, untuk clone repository)

## Instalasi Aplikasi

### 1. Clone atau Download Repository
```bash
git clone <url-repository-anda>
# atau download zip dan extract ke folder lokal
```

### 2. Masuk ke Direktori Proyek
```bash
cd penilaian-360
```

### 3. Install Dependensi
```bash
npm install
```

## Konfigurasi Google Sheets

Aplikasi ini menggunakan Google Sheets sebagai database. Ikuti langkah-langkah berikut:

### 1. Buat Google Spreadsheet Baru
- Buka [Google Sheets](https://sheets.google.com)
- Buat spreadsheet baru dengan nama "Penilaian-360-BerAKHLAK"

### 2. Buat 3 Sheet dengan Struktur Berikut

#### Sheet: `Users`
| ID_Pegawai | Nama_Lengkap | Password | Role | Jabatan | Status_Penilaian |
|------------|--------------|----------|------|---------|------------------|
| 001        | Admin        | admin123 | Admin| Administrator | FALSE |
| 002        | Budi Santoso | password1| User | Staff   | FALSE |
| 003        | Siti Aminah  | password2| User | Staff   | FALSE |
| 004        | Ahmad Fauzi  | password3| User | Supervisor | FALSE |
| 005        | Rina Kusuma  | password4| User | Staff   | FALSE |

#### Sheet: `Questions` (Opsional untuk deskripsi lanjutan)
| Aspek | Deskripsi_100 | Deskripsi_80 | Deskripsi_60 | Deskripsi_40 | Deskripsi_20 |
|-------|---------------|--------------|--------------|--------------|--------------|
| Berorientasi Pelayanan | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |
| Akuntabel | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |
| Kompeten | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |
| Harmonis | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |
| Loyal | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |
| Adaptif | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |
| Kolaboratif | Deskripsi untuk nilai sangat baik | ... | ... | ... | ... |

#### Sheet: `Assessments`
| Timestamp | ID_Target | ID_Evaluator | Skor_Berorientasi_Pelayanan | Skor_Akuntabel | Skor_Kompeten | Skor_Harmonis | Skor_Loyal | Skor_Adaptif | Skor_Kolaboratif |
|-----------|-----------|--------------|-----------------------------|----------------|---------------|--------------|-----------|-------------|------------------|

### 3. Buat Google Apps Script

1. Buka [Google Apps Script](https://script.google.com/)
2. Klik "New Project"
3. Ganti semua kode dengan kode berikut:

```javascript
// Spreadsheet ID - ganti dengan ID spreadsheet Anda
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Nama sheet
const SHEET_NAMES = {
  USERS: 'Users',
  QUESTIONS: 'Questions',
  ASSESSMENTS: 'Assessments'
};

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getUsers') {
    return handleGetUsers();
  } else if (action === 'getQuestions') {
    return handleGetQuestions();
  } else if (action === 'getAssessmentResults') {
    return handleGetAssessmentResults();
  }

  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);

  if (action === 'authenticate') {
    return handleAuthenticate(data);
  } else if (action === 'saveAssessment') {
    return handleSaveAssessment(data);
  } else if (action === 'updateUserStatus') {
    return handleUpdateUserStatus(data);
  }

  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const rows = sheet.getDataRange().getValues();

  // Ambil header
  const headers = rows[0];
  const users = [];

  // Ambil data (mulai dari baris ke-1 karena baris ke-0 adalah header)
  for (let i = 1; i < rows.length; i++) {
    const user = {};
    for (let j = 0; j < headers.length; j++) {
      user[headers[j]] = rows[i][j];
    }
    users.push(user);
  }

  return ContentService.createTextOutput(JSON.stringify({users: users}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAuthenticate(data) {
  const {username, password} = data;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const rows = sheet.getDataRange().getValues();

  // Ambil header
  const headers = rows[0];
  const usernameIndex = headers.indexOf('Username') !== -1 ? headers.indexOf('Username') : headers.indexOf('ID_Pegawai');
  const passwordIndex = headers.indexOf('Password');
  const nameIndex = headers.indexOf('Nama_Lengkap');
  const roleIndex = headers.indexOf('Role');
  const jabatanIndex = headers.indexOf('Jabatan');

  // Cari user
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][usernameIndex] === username && rows[i][passwordIndex] === password) {
      const user = {
        id: rows[i][usernameIndex],
        username: rows[i][usernameIndex],
        name: rows[i][nameIndex],
        role: rows[i][roleIndex],
        position: rows[i][jabatanIndex],
        evaluated: rows[i][headers.indexOf('Status_Penilaian')] === true
      };

      return ContentService.createTextOutput(JSON.stringify({success: true, user: user}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({success: false}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSaveAssessment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.ASSESSMENTS);

  // Tambahkan data penilaian ke sheet
  const rowData = [
    new Date(), // Timestamp
    data.targetId, // ID_Target
    data.evaluatorId, // ID_Evaluator
    data.ratings.pelayanan * 20, // Skor_Berorientasi_Pelayanan (konversi bintang ke nilai)
    data.ratings.akuntabel * 20, // Skor_Akuntabel
    data.ratings.kompeten * 20, // Skor_Kompeten
    data.ratings.harmonis * 20, // Skor_Harmonis
    data.ratings.loyal * 20, // Skor_Loyal
    data.ratings.adaptif * 20, // Skor_Adaptif
    data.ratings.kolaboratif * 20 // Skor_Kolaboratif
  ];

  sheet.appendRow(rowData);

  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleUpdateUserStatus(data) {
  const {userId, evaluated} = data;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const rows = sheet.getDataRange().getValues();

  // Ambil header
  const headers = rows[0];
  const idIndex = headers.indexOf('ID_Pegawai') !== -1 ? headers.indexOf('ID_Pegawai') : headers.indexOf('Username');
  const statusIndex = headers.indexOf('Status_Penilaian');

  // Update status penilaian
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === userId) {
      // Update cell di sheet (indeks dimulai dari 1, bukan 0)
      sheet.getRange(i + 1, statusIndex + 1).setValue(evaluated);
      break;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetQuestions() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  const rows = sheet.getDataRange().getValues();

  // Ambil header
  const headers = rows[0];
  const questions = [];

  // Ambil data (mulai dari baris ke-1 karena baris ke-0 adalah header)
  for (let i = 1; i < rows.length; i++) {
    const question = {};
    for (let j = 0; j < headers.length; j++) {
      question[headers[j]] = rows[i][j];
    }
    questions.push(question);
  }

  return ContentService.createTextOutput(JSON.stringify({questions: questions}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetAssessmentResults() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.ASSESSMENTS);
  const rows = sheet.getDataRange().getValues();

  // Ambil header
  const headers = rows[0];
  const results = [];

  // Ambil data (mulai dari baris ke-1 karena baris ke-0 adalah header)
  for (let i = 1; i < rows.length; i++) {
    const result = {};
    for (let j = 0; j < headers.length; j++) {
      result[headers[j]] = rows[i][j];
    }
    results.push(result);
  }

  return ContentService.createTextOutput(JSON.stringify({results: results}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Ganti `YOUR_SPREADSHEET_ID_HERE`** dengan ID spreadsheet Anda
   - ID spreadsheet adalah bagian dari URL: `https://docs.google.com/spreadsheets/d/[ID_SPREADSHEET]/edit`
   - Contoh: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v`

5. Simpan script (Ctrl+S)

### 4. Deploy Google Apps Script

1. Klik "Deploy" > "New Deployment"
2. Pilih tipe "Web App"
3. Atur:
   - "Execute as" ke "Me"
   - "Who has access" ke "Anyone"
4. Klik "Deploy"
5. Salin URL Web App yang muncul

### 5. Konfigurasi Aplikasi

Buat file `.env.local` di root direktori dan tambahkan:

```env
GOOGLE_SHEETS_API_URL=""
GOOGLE_SHEETS_ID="ID_SPREADSHEET_ANDA"
GOOGLE_APPS_SCRIPT_URL="URL_WEB_APP_YANG_ANDA_SALIN"
NODE_ENV="development"
```

## Menjalankan Aplikasi

### 1. Development Mode
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`

### 2. Production Build
```bash
npm run build
npm start
```

## Struktur Folder

```
penilaian-360/
├── components/           # Komponen reusable
│   ├── ui/             # Komponen shadcn/ui
│   ├── AuthProvider.tsx # Context otentikasi
│   ├── StarRating.tsx   # Komponen rating bintang
│   └── AnimatedProgressBar.tsx # Progress bar animasi
├── pages/               # Halaman aplikasi
│   ├── index.tsx        # Halaman utama
│   ├── login.tsx        # Halaman login
│   ├── dashboard.tsx    # Dashboard pengguna
│   ├── rating/[id].tsx  # Formulir penilaian
│   ├── admin.tsx        # Dashboard admin
│   └── api/             # API routes
├── types/               # Definisi tipe TypeScript
├── utils/               # Fungsi utilitas
│   └── google-sheets.ts # Integrasi Google Sheets
├── lib/                 # Fungsi bantuan
├── public/              # File statis
├── styles/              # File CSS global
├── .env.local           # Konfigurasi lingkungan
├── package.json         # Dependensi dan skrip
└── README.md            # Dokumentasi
```

## Penggunaan Aplikasi

### 1. Login
- Akses `http://localhost:3000`
- Gunakan kredensial:
  - Admin: username `admin`, password `admin123`
  - User: username `pegawai1`, password `password1` (atau sesuai data di Google Sheets)

### 2. Dashboard Pengguna
- Lihat progres penilaian
- Klik pegawai untuk memberikan penilaian

### 3. Formulir Penilaian
- Berikan penilaian 1-5 bintang untuk 7 aspek BerAKHLAK
- Setiap bintang memiliki deskripsi yang muncul saat dipilih
- Klik "Kirim Penilaian" setelah semua aspek diisi

### 4. Dashboard Admin
- Monitor progres penilaian secara keseluruhan
- Lihat hasil penilaian agregat
- Data anonim untuk menjaga privasi

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
| ⭐ | Sangat Kurang | 20 |
| ⭐⭐ | Kurang | 40 |
| ⭐⭐⭐ | Butuh Perbaikan | 60 |
| ⭐⭐⭐⭐ | Baik | 80 |
| ⭐⭐⭐⭐⭐ | Sangat Baik | 100 |

## Troubleshooting

### 1. Error saat login
- Pastikan kredensial sudah benar
- Periksa koneksi internet
- Pastikan Google Apps Script sudah di-deploy dengan akses "Anyone"

### 2. Data tidak muncul
- Pastikan URL Google Apps Script sudah benar di `.env.local`
- Pastikan struktur sheet di Google Sheets sudah sesuai

### 3. Error CORS
- Pastikan Google Apps Script di-deploy dengan akses "Anyone"
- Pastikan URL di `.env.local` tidak memiliki trailing slash

### 4. Aplikasi tidak bisa diakses
- Pastikan port 3000 tidak digunakan aplikasi lain
- Jalankan `npm run dev` dan akses `http://localhost:3000`

### 5. Build gagal
- Pastikan semua dependensi sudah terinstall
- Jalankan `npm install` ulang jika perlu

## Deployment

Untuk deployment ke production (misalnya Vercel):

1. Push kode ke GitHub
2. Import project ke Vercel
3. Tambahkan environment variables di Vercel dashboard:
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_APPS_SCRIPT_URL`
   - `NODE_ENV` (production)

---

**Catatan Penting**: Aplikasi ini dirancang untuk UKPBJ (Unit Kerja Pengadaan Barang/Jasa) dengan sistem penilaian 360-degree feedback berbasis nilai-nilai BerAKHLAK ASN. Pastikan untuk menjaga kerahasiaan data dan mengikuti kebijakan privasi organisasi.
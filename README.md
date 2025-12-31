# Aplikasi Penilaian 360° BerAKHLAK – UKPBJ

Aplikasi web untuk sistem evaluasi kinerja perilaku berbasis metode 360-degree feedback dengan core values ASN BerAKHLAK.

## Teknologi yang Digunakan

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animasi**: Framer Motion
- **Icons**: Lucide React
- **Notifikasi**: Sonner
- **Backend**: Google Apps Script (untuk integrasi Google Sheets)

## Fitur Utama

- **Otentikasi Aman**: Login dengan username (NIP/Email) dan password
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
│   └── google-sheets.ts # Integrasi Google Sheets
├── lib/                 # Fungsi bantuan
│   └── utils.ts         # Fungsi utilitas
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
GOOGLE_SHEETS_API_URL=your_google_sheets_api_url
GOOGLE_SHEETS_ID=your_google_sheets_id
GOOGLE_APPS_SCRIPT_URL=your_google_apps_script_url
```

## Konfigurasi Google Sheets

### 1. Membuat Struktur Google Sheets

Buat spreadsheet Google Sheets dengan 3 sheet berikut:

#### Sheet: `Users`
| ID_Pegawai | Nama_Lengkap | Password | Role | Jabatan | Status_Penilaian |
|------------|--------------|----------|------|---------|------------------|
| 001        | Admin        | admin123 | Admin| Administrator | FALSE |
| 002        | Budi Santoso | password1| User | Staff   | FALSE |
| 003        | Siti Aminah  | password2| User | Staff   | FALSE |

#### Sheet: `Questions`
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

### 2. Membuat Google Apps Script

1. Buka [Google Apps Script](https://script.google.com/)
2. Buat proyek baru
3. Ganti kode default dengan kode berikut:

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

### 3. Deploy Google Apps Script

1. Simpan script Anda
2. Klik "Deploy" > "New Deployment"
3. Pilih tipe "Web App"
4. Atur:
   - "Execute as" ke "Me"
   - "Who has access" ke "Anyone"
5. Klik "Deploy"
6. Salin URL Web App yang muncul

### 4. Konfigurasi Aplikasi Web

1. Ganti `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` di file `.env.local` dengan URL Web App yang telah Anda salin

## Penggunaan

### Login
- Akses halaman login
- Masukkan username (NIP/Email) dan password
- Sistem akan memverifikasi kredensial

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
| ⭐ | Sangat Kurang | 20 |
| ⭐⭐ | Kurang | 40 |
| ⭐⭐⭐ | Butuh Perbaikan | 60 |
| ⭐⭐⭐⭐ | Baik | 80 |
| ⭐⭐⭐⭐⭐ | Sangat Baik | 100 |

## Kontribusi

Silakan buat pull request untuk kontribusi pengembangan aplikasi ini.

## Lisensi

Proyek ini dibuat untuk keperluan internal UKPBJ.
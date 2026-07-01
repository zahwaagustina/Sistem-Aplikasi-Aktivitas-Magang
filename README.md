# 🎓 Sistem Aplikasi Aktivitas Magang (End-to-End)

Sistem Aplikasi Aktivitas Magang adalah platform **Full-stack (MERN/PERN stack variant)** terintegrasi yang dirancang untuk mengelola seluruh *lifecycle* magang/internship. Platform ini mencakup pendaftaran kandidat, proses seleksi oleh HR, penempatan, *logbook* harian oleh peserta, manajemen tugas, hingga evaluasi akhir dan penerbitan sertifikat digital.

---

## 🌟 Fitur Utama (Berdasarkan BRD)

Aplikasi ini dibagi menjadi beberapa modul utama yang melayani berbagai alur proses magang:

1. **Portal & Manajemen Kandidat:** Landing page lowongan, registrasi akun, upload dokumen (CV, KTP), dan proses *screening* oleh HR.
2. **Seleksi & Onboarding:** Penjadwalan interview, konfirmasi penerimaan (LoA), dan penempatan peserta ke divisi/unit terkait.
3. **Manajemen Peserta & Mentor:** Pemetaan peserta magang dengan mentor/pembimbing masing-masing perusahaan.
4. **Logbook & Absensi:** Pencatatan kehadiran (*check-in/out*) harian dan *logbook* (laporan aktivitas) yang divalidasi oleh mentor.
5. **Task Management (Kanban):** Papan tugas kolaboratif antara mentor dan anak magang (To Do, In Progress, Done).
6. **Evaluasi & Penyelesaian:** Penilaian performa akhir (mid-term & final evaluation), *clearance checklist*, laporan akhir, dan otomatisasi pembuatan Sertifikat Digital.
7. **Audit Trail & Notifikasi:** Pencatatan semua riwayat sistem untuk keamanan (Audit Logs) dan notifikasi status.

---

## 👥 Role & Hak Akses

Sistem menggunakan kontrol akses berbasis peran (Role-Based Access Control / RBAC) dengan JWT:
- **SUPER ADMIN / HR:** Mengelola keseluruhan program, lowongan, seleksi kandidat, dokumen master, dan *user management*.
- **MENTOR / PEMBIMBING:** Menyetujui *logbook*, memberikan tugas harian, dan menilai performa peserta magang.
- **KANDIDAT:** Melakukan pendaftaran, mengisi form kesanggupan, dan memantau status aplikasi lamaran.
- **MAGANG (Peserta Aktif):** Mengisi absensi, logbook, mengerjakan tugas, dan mengunduh sertifikat saat selesai.

---

## 🚀 Teknologi yang Digunakan

| Bagian | Teknologi / Library Utama |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, React Router, Axios, Zustand/Context, Recharts |
| **Backend** | Node.js, Express.js, JWT (Auth), Bcryptjs, Multer (File Upload), Nodemailer |
| **Database** | Prisma ORM (Mendukung MySQL / PostgreSQL) |
| **Validasi** | Zod (Validasi Skema API) |

---

## 📂 Struktur Direktori

```text
Sistem-Aplikasi-Aktivitas-Magang/
├── frontend/                # Aplikasi Client (React/Vite)
│   ├── src/
│   │   ├── components/      # Komponen UI Reusable
│   │   ├── context/         # React Context (Manajemen Auth)
│   │   ├── pages/           # Halaman Aplikasi (Admin, Magang, Kandidat)
│   │   ├── api.js           # Konfigurasi Axios & Interceptor
│   │   └── App.jsx          # Routing Utama
│   └── package.json
│
├── backend/                 # API Server (Express.js)
│   ├── controllers/         # Logika Bisnis per endpoint
│   ├── middleware/          # Middleware Auth (JWT) & Audit Trail
│   ├── prisma/              # Skema Database (schema.prisma)
│   ├── routes/              # Definisi Endpoint API
│   ├── validators/          # Skema Validasi Zod
│   ├── server.js            # Entry Point Backend
│   └── package.json
└── brd.md                   # Business Requirements Document (BRD)
```

---

## 🛠️ Panduan Instalasi & Development

### 1. Kebutuhan Sistem
- **Node.js** (v18.x atau versi terbaru)
- **Database Server** (MySQL atau PostgreSQL) berjalan di lokal atau remote.

### 2. Setup Database & Backend
```bash
cd backend
npm install

# Buat file .env dan isi dengan (sesuaikan dengan environment Anda):
# PORT=5000
# DATABASE_URL="mysql://root:@localhost:3306/db_magang"
# JWT_SECRET="dev_secret_key"

npx prisma generate
npx prisma db push
npm run dev
```
*Backend akan berjalan di `http://localhost:5000`*

### 3. Setup Frontend
Di terminal baru:
```bash
cd frontend
npm install
npm run dev
```
*Frontend akan berjalan di `http://localhost:5173`*

---

## 🚨 PERINGATAN PRODUCTION & CARA PERBAIKANNYA (Wajib Baca)
Berdasarkan *security audit*, aplikasi ini **BELUM SIAP/AMAN UNTUK PRODUCTION**. Anda wajib mengimplementasikan perbaikan kode berikut sebelum melakukan *deployment*:

### 1. Masalah Keamanan Token (Hardcoded JWT)
**Masalah:** Di `backend/middleware/auth.js`, aplikasi menggunakan `process.env.JWT_SECRET || 'secret_key'`. Jika env tidak terbaca, token bisa dibobol dengan sangat mudah.
**Solusi:** Hapus nilai fallback. Ubah baris verifikasi JWT menjadi:
```javascript
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("CRITICAL ERROR: JWT_SECRET is not defined!");
  process.exit(1); // Matikan server secara paksa jika secret tidak ada
}
jwt.verify(token, secret, async (err, decoded) => { ... });
```

### 2. Konfigurasi CORS Terlalu Terbuka
**Masalah:** `app.use(cors())` di `backend/server.js` mengizinkan *request* dari domain mana pun (Rentan serangan injeksi lintas domain).
**Solusi:** Batasi hanya untuk URL frontend production Anda.
```javascript
// Di backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
```

### 3. Pencegahan Brute Force (Rate Limiting)
**Masalah:** Endpoint `/api/auth/login` tidak dibatasi, membuat *hacker* bisa mencoba menebak *password* (Brute-force) ribuan kali per detik.
**Solusi:** Instal `npm install express-rate-limit` di folder backend dan tambahkan pada rute otentikasi.
```javascript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Batasi 5 kali percobaan per IP
  message: "Terlalu banyak percobaan login, silakan coba lagi dalam 15 menit"
});

// Terapkan ke routes/authRoutes.js
router.post('/login', loginLimiter, login);
```

### 4. Global Error Handler (Pencegah Server Crash)
**Masalah:** Tidak ada perlindungan global terhadap error *runtime*. Error yang tidak tertangkap (*uncaught exception*) bisa membocorkan arsitektur internal server (HTML Stack Trace) ke pengguna.
**Solusi:** Tambahkan kode ini di **BARIS PALING BAWAH** `backend/server.js` (sebelum `app.listen`):
```javascript
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
    // Hanya tampilkan detail error di mode development
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});
```

### 5. Rekomendasi Penyimpanan Token
Saat ini `frontend/src/api.js` menyimpan JWT di `localStorage`. Di masa depan, sangat disarankan mengubah alur otentikasi menggunakan **HttpOnly Cookies** untuk menghindari pencurian token melalui celah *Cross-Site Scripting (XSS)*.

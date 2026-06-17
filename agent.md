# Pedoman Agen AI (AI Agent Guidelines) - Platform Manajemen Internship Terpadu

## 1. Konteks Proyek
Proyek ini adalah transformasi dari aplikasi "Logbook Magang" sederhana menjadi **Sistem Manajemen Internship End-to-End (HRIS)**. 
Sistem ini menangani seluruh siklus hidup peserta magang: mulai dari **Pendaftaran/Rekrutmen (Kandidat)**, **Seleksi (HR)**, **Onboarding**, **Operasional Harian (Logbook & Absensi)**, **Penilaian & Evaluasi (Mentor)**, hingga **Kelulusan & Penerbitan Sertifikat Otomatis**.

Tujuan dokumen ini adalah memberikan instruksi yang terstruktur dan sangat mendetail bagi AI Agent agar dapat mengimplementasikan fitur demi fitur tanpa merusak arsitektur keseluruhan.

---

## 2. Tech Stack & Konvensi
### Frontend
- **Framework:** React.js (menggunakan Vite).
- **Routing:** React Router v6 (struktur berbasis komponen).
- **Styling:** Tailwind CSS. Selalu prioritaskan komponen fungsional yang estetik, bersih, modern, dan responsif.
- **Iconography:** Lucide-React.
- **HTTP Client:** Axios (selalu sertakan *Bearer token* untuk rute terlindungi).

### Backend
- **Runtime:** Node.js (Format ES Modules: `import/export`).
- **Framework:** Express.js.
- **Database ORM:** Prisma Client.
- **Database Engine:** PostgreSQL.
- **Autentikasi:** JSON Web Token (JWT) + bcryptjs untuk hashing password.
- **File Management:** Multer (penyimpanan lokal di direktori `uploads/`).

### Konvensi Penulisan Kode
- Selalu pisahkan *logic* ke dalam pola arsitektur **Route -> Controller -> Service/Model (Prisma)**.
- Selalu gunakan `try/catch` pada Controller.
- Berikan penanganan error (Status 400/500) yang jelas.
- Jika mengubah database, agen harus selalu mengupdate `backend/prisma/schema.prisma` dan menyarankan perintah `npx prisma format` serta `npx prisma db push`.

---

## 3. Arsitektur Database (Prisma Schema)
Berdasarkan `brd.md`, sistem ini bersifat **Multi-Role**. Satu tabel `User` berelasi dengan banyak entitas profil dan aktivitas.

### Role Enum
`SUPER_ADMIN`, `HR_ADMIN`, `MENTOR`, `UNIT`, `KANDIDAT`, `MAGANG`, `MANAJEMEN`, `KAMPUS`

### Struktur Entitas Utama yang Harus Dijaga:
1. **User**: Tabel sentral autentikasi (id, username, password, email, role).
2. **Profil**: `ProfilKandidat` (data universitas kandidat) & `ProfilMagang` (divisi, mentor, status magang aktif).
3. **Rekrutmen**: `ProgramBatch` (periode), `Lowongan` (posisi), `Pendaftaran` (lamaran), `Interview` (jadwal).
4. **Operasional**: `AktivitasHarian` (logbook), `Absensi` (check-in/out), `Tugas` (Kanban/Assignment).
5. **Penilaian & Dokumen**: `Evaluasi` (Mid/Final), `Dokumen` (LoA, Sertifikat), `AuditTrail`.

---

## 4. Fase Implementasi (Roadmap Pengerjaan 17 Modul BRD)

Agar pengerjaan tidak berantakan, Agen AI harus menyelesaikan modul secara berurutan sesuai fase di bawah ini:

### Fase 1: Core Authentication & Public Portal (Modul 1)
- **Tujuan:** Publik bisa melihat lowongan dan mendaftar sebagai Kandidat.
- **Tugas Backend:** 
  - API Register (`/api/public/register`) -> Role: `KANDIDAT`.
  - API Login (mendeteksi Role dan mengembalikan JWT).
  - API Get Lowongan Aktif.
- **Tugas Frontend:** 
  - `LandingPage.jsx` (Menampilkan lowongan).
  - `RegisterKandidat.jsx`.

### Fase 2: Recruitment & Candidate Dashboard (Modul 2, 3)
- **Tujuan:** Kandidat melamar pekerjaan (Upload CV), HR menyeleksi dan menjadwalkan wawancara.
- **Tugas Backend:**
  - API Apply Lowongan (`/api/kandidat/apply`) menggunakan `multer` (CV, Transkrip, KTP).
  - API HR Manajemen Kandidat (Membaca list pelamar, update status: *Submitted*, *Reviewed*, *Shortlisted*, *Rejected*).
  - API HR Penjadwalan Interview.
- **Tugas Frontend:**
  - `ApplyLowongan.jsx` (Form upload dokumen).
  - `DashboardKandidat.jsx` (Melihat status lamaran & jadwal interview).
  - `ManajemenKandidat.jsx` (Dashboard HR, tabel, filter, tombol ubah status).

### Fase 3: Onboarding & Account Transition (Modul 4, 5, 6)
- **Tujuan:** Kandidat berstatus *Accepted* diubah menjadi anak magang aktif (`MAGANG`).
- **Tugas Backend:**
  - Fungsi khusus saat HR menekan tombol "Terima/Accept". Sistem otomatis membuat entitas `ProfilMagang`, menentukan mentor, divisi, dan LoA (Letter of Acceptance).
  - Role user berubah dari `KANDIDAT` menjadi `MAGANG`.
- **Tugas Frontend:**
  - `OnboardingDashboard.jsx` (HR mengatur batch dan penugasan mentor).
  - `ProfilPeserta.jsx` (Admin/HR melihat data lengkap anak magang aktif).

### Fase 4: Operasional Harian Peserta Magang (Modul 8, 9, 10)
- **Tujuan:** Absensi harian, Logbook, dan Task Management.
- **Tugas Backend:**
  - API Check-In & Check-Out Absensi (waktu dan koordinat lokasi).
  - API Logbook Harian (simpan deskripsi, file output).
  - API Task Management (CRUD tugas dari Mentor ke Peserta).
- **Tugas Frontend:**
  - `Absensi.jsx` (Tombol check-in).
  - `Logbook.jsx` (Tabel logbook dengan status: Draft, Submitted, Approved).
  - `TaskBoard.jsx` (Board Kanban: To Do, In Progress, Done).

### Fase 5: Dashboard Mentor & Approval (Modul 7, 11)
- **Tujuan:** Mentor memantau peserta, melakukan *approval* logbook, dan memberikan nilai evaluasi.
- **Tugas Backend:**
  - API `GET /api/mentor/anak-magang` (List anak bimbingan).
  - API `PUT /api/mentor/logbook/:id/approve`.
  - API Input Evaluasi (Mid-term & Final evaluation).
- **Tugas Frontend:**
  - `DashboardMentor.jsx` (Daftar anak bimbingan).
  - `ApprovalLogbook.jsx`.
  - `FormEvaluasi.jsx`.

### Fase 6: Penyelesaian & Sertifikat (Modul 12, 13)
- **Tujuan:** Peserta menyelesaikan program, mengunggah laporan akhir, dan mendapatkan sertifikat.
- **Tugas Backend:**
  - API Final Report & Clearance Checklist.
  - Skrip Auto-Generate PDF (misalnya menggunakan `pdfkit` atau `puppeteer`) untuk Sertifikat Kelulusan.
- **Tugas Frontend:**
  - `PenyelesaianProgram.jsx` (Upload Laporan).
  - `UnduhSertifikat.jsx`.

### Fase 7: Reporting, Dashboard Manajemen, & Audit (Modul 14, 15, 16, 17)
- **Tujuan:** Analytics dan Notifikasi.
- **Tugas Backend:**
  - API Aggregate (Total pendaftar, funnel seleksi, rata-rata absensi).
  - Logika Audit Trail (Middleware yang mencatat setiap aksi POST/PUT/DELETE ke tabel `AuditTrail`).
- **Tugas Frontend:**
  - `DashboardAnalitik.jsx` (Grafik pie/bar chart menggunakan library seperti `chart.js` atau `recharts`).

---

## 6. Instruksi Eksekusi untuk Agen (Cara Bekerja)
1. **Pilih Satu Fokus:** Agen tidak boleh mengerjakan lebih dari satu fase dalam satu permintaan kecuali diinstruksikan oleh pengguna. Fokus pada satu sub-modul (misalnya: API Absensi saja).
2. **Baca Konteks:** Sebelum menulis kode, periksa *Routing* di `frontend/src/App.jsx` dan *Schema* di `backend/prisma/schema.prisma` untuk memastikan variabel/tabel apa saja yang sudah ada.
3. **Checklist Update:** Setiap kali menyelesaikan sebuah fitur, ingatkan pengguna (atau perbarui dokumen `task.md`) agar progres dapat dilacak secara struktural.
4. **Handling File Path:** Ingat bahwa React frontend berjalan di port `5173` dan Backend di port `5000`. Jika merender gambar/dokumen (seperti CV), gunakan path URL statis `http://localhost:5000/uploads/...`.
5. **Estetika UI:** Sistem HRIS ini harus terasa premium. Gunakan *badges* untuk status (`bg-green-100 text-green-800`), *cards* bersudut tumpul (`rounded-xl`), bayangan halus (`shadow-sm`), dan *empty states* yang memanjakan mata jika tabel kosong.

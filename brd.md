# Business Requirements Document (BRD) - Platform Internship End-to-End

Untuk membuat **platform internship/magang dari pendaftaran sampai selesai**, sistem ini tidak hanya berisi form pendaftaran, tetapi mencakup seluruh **lifecycle peserta magang**: pendaftaran, seleksi, penempatan, pelaksanaan, monitoring, evaluasi, sampai sertifikat.

Berikut komponen yang perlu ada:

## 1. Portal Pendaftaran Internship
Fitur awal untuk calon peserta magang.

| Fitur | Keterangan |
| --- | --- |
| Landing Page Program | Informasi program, kuota, periode, syarat, benefit, timeline |
| Daftar Lowongan Internship | Posisi magang berdasarkan divisi/unit/proyek |
| Detail Posisi | Deskripsi pekerjaan, kompetensi, durasi, lokasi, mode kerja |
| Registrasi Akun | Calon peserta membuat akun |
| Form Pendaftaran | Biodata, pendidikan, jurusan, kampus/sekolah, kontak |
| Upload Dokumen | CV, surat pengantar, transkrip, portofolio, KTP/KTM |
| Pilihan Posisi | Peserta memilih posisi atau bidang minat |
| Status Pendaftaran | Draft, submitted, reviewed, accepted, rejected |

---

## 2. Manajemen Kandidat
Digunakan oleh admin/HR untuk mengelola pelamar.

| Fitur | Keterangan |
| --- | --- |
| Daftar Kandidat | Semua pendaftar dalam satu dashboard |
| Filter Kandidat | Berdasarkan jurusan, kampus, posisi, status, periode |
| Review Dokumen | HR/admin memeriksa kelengkapan dokumen |
| Scoring Kandidat | Penilaian berdasarkan CV, IPK, skill, pengalaman |
| Shortlist Kandidat | Kandidat yang lolos administrasi |
| Catatan Reviewer | Catatan internal dari HR/user |
| Riwayat Pendaftaran | Jika kandidat pernah ikut program sebelumnya |

---

## 3. Seleksi dan Interview
Untuk proses seleksi peserta magang.

| Fitur | Keterangan |
| --- | --- |
| Jadwal Interview | Atur jadwal wawancara |
| Undangan Interview | Notifikasi email/WhatsApp |
| Link Meeting Online | Zoom/Google Meet/Teams jika online |
| Form Penilaian Interview | Skill, komunikasi, motivasi, budaya kerja |
| Assignment/Test | Tes teknis atau tugas seleksi |
| Upload Hasil Tes | Kandidat mengunggah jawaban/tugas |
| Keputusan Seleksi | Lulus, cadangan, tidak lulus |
| Offer Internship | Surat penerimaan atau penawaran magang |

---

## 4. Verifikasi dan Onboarding
Setelah kandidat diterima.

| Fitur | Keterangan |
| --- | --- |
| Konfirmasi Peserta | Kandidat menerima/menolak tawaran |
| Verifikasi Dokumen Final | Surat kampus, identitas, NDA, pakta integritas |
| Letter of Acceptance | Surat penerimaan magang |
| Onboarding Checklist | Daftar aktivitas sebelum mulai |
| Pembuatan Akun Sistem | Akun untuk peserta, mentor, admin |
| Penempatan Unit | Peserta ditetapkan ke divisi/unit tertentu |
| Penetapan Mentor | Mentor/pembimbing dari perusahaan |
| Jadwal Orientasi | Sesi pengenalan perusahaan dan aturan kerja |

---

## 5. Manajemen Program Internship
Untuk mengatur periode dan struktur program.

| Fitur | Keterangan |
| --- | --- |
| Periode Internship | Batch Januari, Batch Juli, dan sebagainya |
| Durasi Program | 1 bulan, 3 bulan, 6 bulan |
| Kuota Program | Kuota per batch, posisi, atau unit |
| Kategori Program | Magang reguler, kampus merdeka, riset, proyek khusus |
| Mode Kerja | WFO, WFH, hybrid |
| Lokasi Penempatan | Kantor pusat, cabang, unit kerja |
| Kurikulum/Rencana Kerja | Target pembelajaran atau work plan |
| Timeline Program | Pendaftaran, seleksi, mulai, evaluasi, selesai |

---

## 6. Manajemen Peserta Internship
Data peserta yang sudah diterima.

| Fitur | Keterangan |
| --- | --- |
| Profil Peserta | Biodata lengkap peserta |
| Status Peserta | Aktif, cuti, selesai, mengundurkan diri, diberhentikan |
| Data Kampus/Sekolah | Nama institusi, jurusan, pembimbing akademik |
| Penempatan | Unit, posisi, mentor, lokasi |
| Periode Magang | Tanggal mulai dan selesai |
| Dokumen Peserta | Surat penerimaan, surat tugas, NDA, kontrak |
| Riwayat Aktivitas | Log aktivitas peserta selama magang |

---

## 7. Mentor dan Pembimbing
Agar peserta tidak hanya tercatat, tetapi benar-benar dibimbing.

| Fitur | Keterangan |
| --- | --- |
| Data Mentor | Nama, jabatan, unit kerja |
| Assignment Mentor | Mentor ditugaskan ke peserta tertentu |
| Dashboard Mentor | Daftar peserta bimbingan |
| Catatan Bimbingan | Mentor memberi catatan perkembangan |
| Approval Aktivitas | Mentor menyetujui logbook/tugas |
| Evaluasi Mentor | Mentor menilai performa peserta |
| Komunikasi Mentor-Peserta | Pesan, komentar, atau diskusi internal |

---

## 8. Logbook / Daily Activity
Fitur penting untuk monitoring aktivitas magang.

| Fitur | Keterangan |
| --- | --- |
| Daily Logbook | Peserta mencatat aktivitas harian |
| Weekly Report | Ringkasan aktivitas mingguan |
| Upload Evidence | Screenshot, dokumen, link pekerjaan, file output |
| Approval Mentor | Mentor memvalidasi logbook |
| Komentar Mentor | Feedback atas aktivitas peserta |
| Status Logbook | Draft, submitted, approved, revision |
| Rekap Aktivitas | Laporan kehadiran dan kontribusi peserta |

---

## 9. Absensi dan Kehadiran
Untuk memantau kehadiran peserta magang.

| Fitur | Keterangan |
| --- | --- |
| Check-in/Check-out | Presensi masuk dan pulang |
| Lokasi Presensi | GPS/geotagging jika diperlukan |
| QR Attendance | Presensi menggunakan QR |
| Izin/Sakit | Pengajuan ketidakhadiran |
| Approval Izin | Disetujui mentor/HR |
| Rekap Kehadiran | Hadir, izin, sakit, alpa, terlambat |
| Integrasi Jadwal | Sesuai hari kerja atau shift |

---

## 10. Task dan Project Management
Agar peserta memiliki pekerjaan yang jelas.

| Fitur | Keterangan |
| --- | --- |
| Assignment Tugas | Mentor memberikan tugas ke peserta |
| Project Board | To do, in progress, review, done |
| Deadline Tugas | Batas waktu pengerjaan |
| Prioritas Tugas | Low, medium, high |
| Upload Output | Peserta mengunggah hasil pekerjaan |
| Review Tugas | Mentor memberi feedback |
| Progress Tracking | Persentase penyelesaian tugas/proyek |

---

## 11. Evaluasi dan Penilaian
Untuk mengukur hasil internship.

| Fitur | Keterangan |
| --- | --- |
| Evaluasi Tengah Program | Mid-term evaluation |
| Evaluasi Akhir | Final evaluation |
| Rubrik Penilaian | Disiplin, komunikasi, skill teknis, inisiatif, teamwork |
| Penilaian Mentor | Mentor menilai peserta |
| Self Assessment | Peserta menilai dirinya sendiri |
| Evaluasi dari HR | Penilaian administratif dan perilaku |
| Feedback Peserta | Peserta memberi masukan terhadap program |
| Rekomendasi Akhir | Lulus, tidak lulus, direkomendasikan rekrutmen |

---

## 12. Penyelesaian Program
Tahap akhir setelah magang selesai.

| Fitur | Keterangan |
| --- | --- |
| Clearance Checklist | Pengembalian aset, akun, dokumen, tugas akhir |
| Final Report | Peserta mengunggah laporan akhir |
| Approval Laporan Akhir | Mentor menyetujui laporan |
| Exit Survey | Survei pengalaman peserta |
| Surat Keterangan Magang | Dokumen resmi penyelesaian magang |
| Sertifikat Digital | Sertifikat otomatis berdasarkan template |
| Arsip Peserta | Data peserta disimpan sebagai alumni internship |

---

## 13. Sertifikat dan Dokumen Otomatis
Dokumen yang sebaiknya bisa dibuat otomatis oleh sistem.

| Dokumen | Keterangan |
| --- | --- |
| Surat Penerimaan | Letter of Acceptance |
| Surat Tugas Mentor | Jika diperlukan |
| NDA / Pakta Integritas | Untuk menjaga kerahasiaan |
| Surat Keterangan Aktif Magang | Jika peserta membutuhkan |
| Surat Selesai Magang | Setelah program selesai |
| Sertifikat Magang | Dengan nomor sertifikat unik |
| Berita Acara Penyelesaian | Opsional untuk instansi formal |

---

## 14. Dashboard dan Laporan
Dashboard untuk HR, admin, mentor, dan manajemen.

| Dashboard | Keterangan |
| --- | --- |
| Jumlah Pendaftar | Total kandidat per batch/periode |
| Funnel Seleksi | Submitted, shortlisted, interview, accepted, rejected |
| Peserta Aktif | Jumlah peserta aktif per unit |
| Kehadiran Peserta | Rekap absensi |
| Progress Logbook | Peserta yang rutin/tidak rutin mengisi logbook |
| Kinerja Peserta | Skor evaluasi mentor |
| Program Hampir Selesai | Peserta mendekati tanggal akhir |
| Sertifikat Belum Terbit | Peserta selesai tetapi belum menerima sertifikat |

Laporan yang perlu ada:

| Laporan | Keterangan |
| --- | --- |
| Laporan Pendaftar | Kandidat per periode, jurusan, kampus |
| Laporan Seleksi | Status seleksi dan hasil interview |
| Laporan Peserta Aktif | Peserta berdasarkan unit/mentor |
| Laporan Kehadiran | Rekap presensi |
| Laporan Logbook | Aktivitas harian/mingguan |
| Laporan Evaluasi | Nilai peserta |
| Laporan Penyelesaian | Peserta selesai, gagal, resign |
| Laporan Alumni | Riwayat peserta magang |

---

## 15. Role dan Hak Akses
Minimal role yang perlu ada:

| Role | Hak Akses |
| --- | --- |
| Super Admin | Mengatur seluruh sistem |
| HR/Admin Internship | Mengelola program, kandidat, peserta, dokumen |
| Mentor/Pembimbing | Memberi tugas, approve logbook, menilai peserta |
| User/Unit Kerja | Mengajukan kebutuhan intern dan melihat peserta |
| Kandidat | Daftar, upload dokumen, cek status seleksi |
| Peserta Intern | Mengisi logbook, absensi, upload laporan |
| Manajemen | Melihat dashboard dan laporan |
| Pembimbing Kampus | Melihat progress peserta dari kampus, jika diperlukan |

---

## 16. Notifikasi
Notifikasi penting agar proses tidak macet.

| Notifikasi | Penerima |
| --- | --- |
| Pendaftaran berhasil | Kandidat |
| Dokumen belum lengkap | Kandidat |
| Jadwal interview | Kandidat dan interviewer |
| Hasil seleksi | Kandidat |
| Reminder onboarding | Peserta |
| Reminder logbook belum diisi | Peserta |
| Logbook butuh approval | Mentor |
| Tugas baru | Peserta |
| Deadline tugas | Peserta dan mentor |
| Program hampir selesai | HR, mentor, peserta |
| Sertifikat tersedia | Peserta |

---

## 17. Audit Trail
Setiap aktivitas penting perlu tercatat.

| Aktivitas | Contoh |
| --- | --- |
| Pendaftaran | Kandidat submit form |
| Update status | HR mengubah status kandidat |
| Review dokumen | Reviewer memberi keputusan |
| Approval logbook | Mentor approve/revisi |
| Penilaian | Mentor mengisi evaluasi |
| Generate sertifikat | Admin menerbitkan sertifikat |
| Perubahan data | Update profil, dokumen, atau penempatan |
| Login dan akses | Opsional untuk keamanan |

---

# Struktur Modul yang Direkomendasikan
Secara ringkas, modul platform internship sebaiknya terdiri dari:
1. Portal Program Internship
2. Registrasi dan Pendaftaran
3. Manajemen Kandidat
4. Seleksi dan Interview
5. Onboarding Peserta
6. Manajemen Program/Batch
7. Manajemen Peserta Internship
8. Manajemen Mentor
9. Absensi
10. Logbook Harian/Mingguan
11. Task dan Project Management
12. Evaluasi dan Penilaian
13. Final Report
14. Sertifikat dan Dokumen Otomatis
15. Dashboard dan Laporan
16. Notifikasi
17. Role dan Permission
18. Audit Trail
19. Pengaturan Sistem

---

# Alur Utama Sistem
Kandidat daftar → upload dokumen → admin review → seleksi/interview → diterima → onboarding → penempatan ke unit → mentor ditentukan → peserta mengisi absensi/logbook/tugas → mentor memantau dan menilai → peserta upload laporan akhir → clearance → sertifikat terbit → peserta menjadi alumni.

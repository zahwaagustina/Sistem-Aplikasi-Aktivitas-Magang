import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================
// MANAJEMEN KANDIDAT & SELEKSI
// ========================

// Tarik daftar semua pendaftaran
export const getDaftarKandidat = async (req, res) => {
  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      include: {
        user: {
          select: { id: true, nama: true, email: true, no_telepon: true, profilKandidat: true, dokumen: true }
        },
        lowongan: {
          select: { posisi: true, program: { select: { nama: true } } }
        },
        interview: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: pendaftaran });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// Ubah status lamaran secara manual (DRAFT -> SUBMITTED -> REVIEWED -> SHORTLISTED -> REJECTED)
export const updateStatusLamaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_hr } = req.body;

    const pendaftaran = await prisma.pendaftaran.update({
      where: { id: parseInt(id) },
      data: { status, catatan_hr },
      include: { lowongan: true }
    });

    // Buat notifikasi
    await prisma.notifikasi.create({
      data: {
        user_id: pendaftaran.user_id,
        judul: 'Pembaruan Status Lamaran',
        pesan: `Status lamaran Anda untuk posisi ${pendaftaran.lowongan.posisi} telah berubah menjadi ${status}.`,
        link: '/kandidat/dashboard'
      }
    });

    res.json({ message: `Status berhasil diubah menjadi ${status}`, data: pendaftaran });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status', error: error.message });
  }
};

// Jadwalkan Wawancara
export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params; // ID pendaftaran
    const { tanggal_waktu, link_meeting } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ubah status pendaftaran menjadi INTERVIEW
      const pendaftaran = await tx.pendaftaran.update({
        where: { id: parseInt(id) },
        data: { status: 'INTERVIEW' },
        include: { lowongan: true, user: true }
      });

      // 2. Simpan jadwal ke tabel Interview (upsert agar bisa update jika sudah ada)
      const interview = await tx.interview.upsert({
        where: { pendaftaran_id: pendaftaran.id },
        update: {
          tanggal_waktu: new Date(tanggal_waktu),
          link_meeting
        },
        create: {
          pendaftaran_id: pendaftaran.id,
          tanggal_waktu: new Date(tanggal_waktu),
          link_meeting
        }
      });

      // 3. Buat notifikasi jadwal interview
      await tx.notifikasi.create({
        data: {
          user_id: pendaftaran.user_id,
          judul: 'Jadwal Wawancara',
          pesan: `Anda mendapat undangan wawancara pada tanggal ${new Date(tanggal_waktu).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. Harap cek halaman Status Lamaran.`,
          link: '/kandidat/dashboard'
        }
      });

      // 4. Kirim email undangan wawancara beserta link zoom
      const { sendEmail } = await import('../utils/emailService.js');
      const formattedDate = new Date(tanggal_waktu).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const emailText = `Halo ${pendaftaran.user.nama},\n\nSelamat! Anda telah lolos tahap administrasi untuk posisi ${pendaftaran.lowongan.posisi}.\n\nAnda diundang untuk mengikuti wawancara pada:\nTanggal & Waktu: ${formattedDate} WIB\nLink Meeting: ${link_meeting}\n\nHarap hadir tepat waktu dan persiapkan diri Anda dengan baik.\n\nSalam,\nTim HR`;
      const emailHtml = `
        <p>Halo <strong>${pendaftaran.user.nama}</strong>,</p>
        <p>Selamat! Anda telah lolos tahap administrasi untuk posisi <strong>${pendaftaran.lowongan.posisi}</strong>.</p>
        <p>Anda diundang untuk mengikuti wawancara pada:</p>
        <ul>
          <li><strong>Tanggal & Waktu:</strong> ${formattedDate} WIB</li>
          <li><strong>Link Meeting:</strong> <a href="${link_meeting}">${link_meeting}</a></li>
        </ul>
        <p>Harap hadir tepat waktu dan persiapkan diri Anda dengan baik.</p>
        <br/>
        <p>Salam,</p>
        <p><strong>Tim HR</strong></p>
      `;
      sendEmail(pendaftaran.user.email, 'Undangan Wawancara Magang', emailText, emailHtml);

      return { pendaftaran, interview };
    });

    res.status(201).json({ message: 'Jadwal interview berhasil dibuat', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menjadwalkan wawancara', error: error.message });
  }
};

// Nilai Wawancara & Keputusan
export const submitNilaiInterview = async (req, res) => {
  try {
    const { id } = req.params; // ID pendaftaran
    const { skor_wawancara, skor_psikotes, skor_teknikal, catatan, keputusan } = req.body; // keputusan = 'ACCEPTED' | 'REJECTED'

    // Hitung rata-rata
    const w = parseFloat(skor_wawancara) || 0;
    const p = parseFloat(skor_psikotes) || 0;
    const t = parseFloat(skor_teknikal) || 0;
    const rataRata = (w + p + t) / 3;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Simpan nilai ke tabel Interview
      const interview = await tx.interview.update({
        where: { pendaftaran_id: parseInt(id) },
        data: {
          skor_wawancara: w,
          skor_psikotes: p,
          skor_teknikal: t,
          hasil_score: parseFloat(rataRata.toFixed(2)),
          catatan
        }
      });

      // 2. Ubah status pendaftaran menjadi keputusan akhir (Lulus / Tidak Lulus)
      const pendaftaran = await tx.pendaftaran.update({
        where: { id: parseInt(id) },
        data: { status: keputusan },
        include: { lowongan: true }
      });

      // 3. Notifikasi ke Kandidat
      await tx.notifikasi.create({
        data: {
          user_id: pendaftaran.user_id,
          judul: keputusan === 'ACCEPTED' ? 'Selamat! Anda Diterima' : 'Pengumuman Hasil Wawancara',
          pesan: keputusan === 'ACCEPTED' 
            ? `Selamat, Anda diterima magang untuk posisi ${pendaftaran.lowongan.posisi}. Silakan cek portal untuk tahap Onboarding.`
            : `Mohon maaf, Anda belum berhasil lolos untuk posisi ${pendaftaran.lowongan.posisi}. Tetap semangat!`,
          link: '/kandidat/dashboard'
        }
      });

      // Jika diterima, trigger onboarding!
      if (keputusan === 'ACCEPTED') {
        const existingOnboarding = await tx.onboarding.findUnique({
          where: { pendaftaran_id: pendaftaran.id }
        });
        
        if (!existingOnboarding) {
          await tx.onboarding.create({
            data: { pendaftaran_id: pendaftaran.id }
          });
          
          // Kirim email notifikasi secara asinkron
          const user = await tx.user.findUnique({ where: { id: pendaftaran.user_id } });
          const { sendEmail } = await import('../utils/emailService.js');
          
          const emailText = `Halo ${user.nama},\n\nSelamat! Anda telah resmi diterima magang untuk posisi ${pendaftaran.lowongan.posisi}.\n\nSilakan segera login ke portal web sistem aplikasi aktivitas magang untuk melengkapi data dan masuk ke tahap Onboarding.\n\nSalam,\nTim HR`;
          const emailHtml = `
            <p>Halo <strong>${user.nama}</strong>,</p>
            <p>Selamat! Anda telah resmi <strong>diterima magang</strong> untuk posisi <strong>${pendaftaran.lowongan.posisi}</strong>.</p>
            <p>Silakan segera login ke portal web untuk melengkapi data Anda dan masuk ke tahap <strong>Onboarding</strong>.</p>
            <br/>
            <p>Salam,</p>
            <p><strong>Tim HR</strong></p>
          `;
          
          sendEmail(user.email, 'Selamat! Anda Diterima Magang', emailText, emailHtml);
        }
      }

      return { interview, pendaftaran };
    });

    res.json({ message: 'Penilaian berhasil disimpan', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan penilaian', error: error.message });
  }
};

export const getMentors = async (req, res) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: { id: true, nama: true, email: true, no_telepon: true }
    });
    res.status(200).json({ data: mentors });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data mentor', error: error.message });
  }
};

// ========================
// MANAJEMEN LOWONGAN & PROGRAM
// ========================

export const getProgramBatch = async (req, res) => {
  try {
    let programs = await prisma.programBatch.findMany({
      orderBy: { id: 'desc' }
    });
    
    // Auto-create default if empty
    if (programs.length === 0) {
      const defaultProgram = await prisma.programBatch.create({
        data: {
          nama: 'Batch Magang Default',
          tanggal_mulai: new Date(),
          tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          is_active: true
        }
      });
      programs = [defaultProgram];
    }
    
    res.json({ data: programs });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const getLowonganHR = async (req, res) => {
  try {
    const lowongan = await prisma.lowongan.findMany({
      include: {
        program: true,
        _count: { select: { pendaftaran: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Map _count.pendaftaran to frontend format
    const formatted = lowongan.map(l => ({
      ...l,
      _count: { pendaftaran: l._count.pendaftaran }
    }));
    
    res.json({ data: formatted });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const createLowonganHR = async (req, res) => {
  try {
    const { program_nama, posisi, deskripsi, kualifikasi, benefit, divisi, lokasi, mode_kerja, kuota, status } = req.body;
    
    // Find or create ProgramBatch based on program_nama
    let program = await prisma.programBatch.findFirst({
      where: { nama: program_nama }
    });

    if (!program) {
      const now = new Date();
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(now.getMonth() + 6);
      
      program = await prisma.programBatch.create({
        data: {
          nama: program_nama,
          tanggal_mulai: now,
          tanggal_selesai: sixMonthsLater,
          is_active: true
        }
      });
    }

    const newLowongan = await prisma.lowongan.create({
      data: {
        program_id: program.id,
        posisi,
        deskripsi,
        kualifikasi,
        benefit,
        divisi,
        lokasi,
        mode_kerja: mode_kerja || 'WFO',
        kuota: parseInt(kuota),
        status: status || 'DRAFT'
      }
    });
    res.status(201).json({ message: 'Lowongan berhasil dibuat', data: newLowongan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat lowongan', error: error.message });
  }
};

export const updateLowonganHR = async (req, res) => {
  try {
    const { id } = req.params;
    const { program_nama, posisi, deskripsi, kualifikasi, benefit, divisi, lokasi, mode_kerja, kuota, status } = req.body;
    
    // Find or create ProgramBatch based on program_nama
    let program = await prisma.programBatch.findFirst({
      where: { nama: program_nama }
    });

    if (!program) {
      const now = new Date();
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(now.getMonth() + 6);
      
      program = await prisma.programBatch.create({
        data: {
          nama: program_nama,
          tanggal_mulai: now,
          tanggal_selesai: sixMonthsLater,
          is_active: true
        }
      });
    }
    
    const updated = await prisma.lowongan.update({
      where: { id: parseInt(id) },
      data: {
        program_id: program.id,
        posisi,
        deskripsi,
        kualifikasi,
        benefit,
        divisi,
        lokasi,
        mode_kerja,
        kuota: parseInt(kuota),
        status
      }
    });
    
    res.json({ message: 'Lowongan berhasil diperbarui', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui lowongan', error: error.message });
  }
};

export const deleteLowonganHR = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah lowongan sudah memiliki pelamar
    const pelamarCount = await prisma.pendaftaran.count({
      where: { lowongan_id: parseInt(id) }
    });

    if (pelamarCount > 0) {
      return res.status(400).json({ 
        message: 'Lowongan ini tidak bisa dihapus karena sudah ada pelamar yang mendaftar. Silakan ubah status lowongan menjadi CLOSED jika ingin menutupnya.' 
      });
    }

    await prisma.lowongan.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Lowongan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus lowongan', error: error.message });
  }
};

// Data Peserta Aktif
export const getPesertaAktif = async (req, res) => {
  try {
    const peserta = await prisma.profilMagang.findMany({
      include: {
        user: { select: { nama: true, email: true } }
      },
      orderBy: { id: 'desc' }
    });

    const mentorIds = peserta.map(p => p.mentor_id).filter(id => id !== null);
    const mentors = await prisma.user.findMany({
      where: { id: { in: mentorIds } },
      select: { id: true, nama: true }
    });

    const mentorMap = {};
    mentors.forEach(m => mentorMap[m.id] = m);

    const mappedPeserta = peserta.map(p => ({
      ...p,
      mentor: p.mentor_id ? mentorMap[p.mentor_id] : null
    }));

    res.json({ data: mappedPeserta });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

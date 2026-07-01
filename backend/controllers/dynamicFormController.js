import prisma from '../utils/prisma.js';
import { generateExcelKesanggupan, generatePDFKesanggupan } from '../utils/exportFormService.js';

// ==========================================
// ADMIN: Manajemen Dynamic Form
// ==========================================

export const getForms = async (req, res) => {
  try {
    const { tipe } = req.query; // KESANGGUPAN atau EVALUASI
    const forms = await prisma.dynamicForm.findMany({
      where: tipe ? { tipe } : undefined,
      include: {
        pertanyaan: { orderBy: { urutan: 'asc' } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: forms });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await prisma.dynamicForm.findUnique({
      where: { id: parseInt(id) },
      include: {
        pertanyaan: { orderBy: { urutan: 'asc' } }
      }
    });
    if (!form) return res.status(404).json({ message: 'Form tidak ditemukan' });
    res.json({ data: form });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const createForm = async (req, res) => {
  try {
    const { judul, deskripsi, tipe, is_active } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Jika diset active, nonaktifkan form lain dengan tipe yang sama
      if (is_active) {
        await tx.dynamicForm.updateMany({
          where: { tipe: tipe || 'KESANGGUPAN' },
          data: { is_active: false }
        });
      }

      const form = await tx.dynamicForm.create({
        data: {
          judul,
          deskripsi,
          tipe: tipe || 'KESANGGUPAN',
          is_active: is_active || false
        }
      });
      return form;
    });

    res.status(201).json({ message: 'Form berhasil dibuat', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat form', error: error.message });
  }
};

export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi, tipe, is_active } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Jika form ini di-set active, nonaktifkan yang lain
      if (is_active) {
        const existingForm = await tx.dynamicForm.findUnique({ where: { id: parseInt(id) } });
        const formTipe = tipe || existingForm.tipe;
        await tx.dynamicForm.updateMany({
          where: { tipe: formTipe, id: { not: parseInt(id) } },
          data: { is_active: false }
        });
      }

      const form = await tx.dynamicForm.update({
        where: { id: parseInt(id) },
        data: { judul, deskripsi, tipe, is_active }
      });
      return form;
    });

    res.json({ message: 'Form berhasil diupdate', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate form', error: error.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dynamicForm.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Form berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus form', error: error.message });
  }
};

// ==========================================
// ADMIN: Manajemen Pertanyaan
// ==========================================

export const createQuestion = async (req, res) => {
  try {
    const { formId } = req.params;
    const { pertanyaan, tipe_pertanyaan, is_required, opsi_json, urutan } = req.body;

    const question = await prisma.dynamicFormQuestion.create({
      data: {
        form_id: parseInt(formId),
        pertanyaan,
        tipe_pertanyaan,
        is_required,
        opsi_json: opsi_json || null,
        urutan: urutan || 0
      }
    });

    res.status(201).json({ message: 'Pertanyaan berhasil ditambahkan', data: question });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan pertanyaan', error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { pertanyaan, tipe_pertanyaan, is_required, opsi_json, urutan } = req.body;

    const question = await prisma.dynamicFormQuestion.update({
      where: { id: parseInt(questionId) },
      data: { pertanyaan, tipe_pertanyaan, is_required, opsi_json, urutan }
    });

    res.json({ message: 'Pertanyaan berhasil diupdate', data: question });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate pertanyaan', error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    await prisma.dynamicFormQuestion.delete({ where: { id: parseInt(questionId) } });
    res.json({ message: 'Pertanyaan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pertanyaan', error: error.message });
  }
};

export const reorderQuestions = async (req, res) => {
  try {
    const { formId } = req.params;
    const { orders } = req.body; // Array of { id, urutan }

    await prisma.$transaction(
      orders.map((item) =>
        prisma.dynamicFormQuestion.update({
          where: { id: item.id },
          data: { urutan: item.urutan }
        })
      )
    );

    res.json({ message: 'Urutan pertanyaan berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate urutan pertanyaan', error: error.message });
  }
};

// ==========================================
// KANDIDAT: Mengambil Form Aktif & Submit
// ==========================================

export const getActiveKesanggupanForm = async (req, res) => {
  try {
    const form = await prisma.dynamicForm.findFirst({
      where: { tipe: 'KESANGGUPAN', is_active: true },
      include: {
        pertanyaan: { orderBy: { urutan: 'asc' } }
      }
    });



    if (!form) {
      return res.status(404).json({ message: 'Tidak ada form kesanggupan yang aktif' });
    }

    res.json({ data: form });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const submitKesanggupanForm = async (req, res) => {
  try {
    const { pendaftaranId } = req.params;
    const { form_id, answers } = req.body; // answers: array of { question_id, jawaban_teks, jawaban_array }
    const userId = req.user.id; // from auth middleware

    // Verifikasi Pendaftaran
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: parseInt(pendaftaranId) },
      include: { lowongan: true, user: true }
    });

    if (!pendaftaran || pendaftaran.user_id !== userId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    if (pendaftaran.status !== 'WAITING_KESANGGUPAN') {
      return res.status(400).json({ message: 'Status lamaran Anda tidak valid untuk mengisi form ini' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Response
      const response = await tx.dynamicFormResponse.create({
        data: {
          form_id: parseInt(form_id),
          user_id: userId,
          pendaftaran_id: parseInt(pendaftaranId),
          status: 'SUBMITTED'
        }
      });

      // 2. Simpan Jawaban
      const answerData = answers.map((ans) => ({
        response_id: response.id,
        question_id: ans.question_id,
        jawaban_teks: ans.jawaban_teks || null,
        jawaban_array: ans.jawaban_array || null
      }));

      await tx.dynamicFormAnswer.createMany({
        data: answerData
      });

      // 3. Update Status Pendaftaran
      await tx.pendaftaran.update({
        where: { id: parseInt(pendaftaranId) },
        data: { status: 'KESANGGUPAN_FILLED' }
      });

      // 4. Buat Notifikasi untuk Kandidat
      await tx.notifikasi.create({
        data: {
          user_id: userId,
          judul: 'Form Kesanggupan Terkirim',
          pesan: `Anda telah berhasil mengirim Form Kesanggupan untuk posisi ${pendaftaran.lowongan.posisi}. Silakan tunggu informasi jadwal wawancara.`,
          link: '/kandidat/dashboard'
        }
      });

      // 5. Buat Notifikasi untuk Admin (HR)
      const admins = await tx.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      const adminNotifData = admins.map(admin => ({
        user_id: admin.id,
        judul: 'Form Kesanggupan Diisi',
        pesan: `Kandidat ${pendaftaran.user.nama} telah mengisi form kesanggupan untuk posisi ${pendaftaran.lowongan.posisi}.`,
        link: '/hr/kandidat' // Link ke halaman kandidat
      }));
      
      if (adminNotifData.length > 0) {
        await tx.notifikasi.createMany({ data: adminNotifData });
      }

      return response;
    });

    res.status(201).json({ message: 'Form kesanggupan berhasil dikirim', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim form', error: error.message });
  }
};

// ==========================================
// ADMIN: Melihat Hasil Form Kesanggupan
// ==========================================

export const getKesanggupanResponses = async (req, res) => {
  try {
    const { startDate, endDate, divisi, search } = req.query;

    const whereClause = {
      form: { tipe: 'KESANGGUPAN' }
    };

    if (startDate && endDate) {
      whereClause.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (divisi) {
      whereClause.pendaftaran = {
        lowongan: { divisi: { contains: divisi, mode: 'insensitive' } }
      };
    }

    if (search) {
      whereClause.user = {
        nama: { contains: search, mode: 'insensitive' }
      };
    }

    const responses = await prisma.dynamicFormResponse.findMany({
      where: whereClause,
      include: {
        user: { select: { nama: true, email: true } },
        pendaftaran: { include: { lowongan: true } },
        form: { select: { judul: true } },
        jawaban: {
          include: {
            question: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ data: responses });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const exportKesanggupan = async (req, res) => {
  try {
    const { startDate, endDate, divisi, search, format } = req.query;

    const whereClause = {
      form: { tipe: 'KESANGGUPAN' }
    };

    if (startDate && endDate) {
      whereClause.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (divisi) {
      whereClause.pendaftaran = {
        lowongan: { divisi: { contains: divisi, mode: 'insensitive' } }
      };
    }
    if (search) {
      whereClause.user = {
        nama: { contains: search, mode: 'insensitive' }
      };
    }

    const responses = await prisma.dynamicFormResponse.findMany({
      where: whereClause,
      include: {
        user: { select: { nama: true, email: true } },
        pendaftaran: { include: { lowongan: true } },
        form: { select: { judul: true } },
        jawaban: {
          include: {
            question: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (format === 'excel') {
      return await generateExcelKesanggupan(responses, res);
    } else if (format === 'pdf') {
      return await generatePDFKesanggupan(responses, res);
    } else {
      return res.status(400).json({ message: 'Format export tidak didukung' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal melakukan export data', error: error.message });
  }
};

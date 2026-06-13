import { z } from 'zod';

export const registerSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  divisi: z.string().optional()
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi")
});

export const aktivitasSchema = z.object({
  tanggal: z.string().refine((val) => {
    const inputDate = new Date(val);
    if (isNaN(inputDate.getTime())) return false;
    
    // Normalize time to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - inputDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    // Allow any past date (diffDays >= 0) but block future dates (diffDays < 0)
    return diffDays >= 0;
  }, {
    message: "Tidak bisa mengisi logbook untuk tanggal di masa depan.",
  }),
  deskripsi_kegiatan: z.string().min(1, "Deskripsi wajib diisi"),
  hasil_kegiatan: z.string().min(1, "Hasil wajib diisi"),
  waktu_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu mulai tidak valid"),
  waktu_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu selesai tidak valid"),
  kendala: z.string().optional(),
  status: z.enum(['DRAFT', 'TERKIRIM', 'DISETUJUI', 'TELAT_MENGISI']).optional(),
});

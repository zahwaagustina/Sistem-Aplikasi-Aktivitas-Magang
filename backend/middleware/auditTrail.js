import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getActionName = (method, url) => {
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return 'UNKNOWN';
};

const getEntityName = (url) => {
  // Parsing URL untuk menentukan entitas (misal: /api/hr/lowongan -> LOWONGAN)
  const segments = url.split('/').filter(Boolean);
  if (segments.length >= 2) {
    // biasanya segments[1] adalah grup (hr, admin, magang, dll)
    // dan segments[2] adalah entitas (lowongan, kandidat, users, aktivitas)
    if (segments[2]) {
      return segments[2].toUpperCase().split('?')[0]; // buang query param jika ada
    }
    return segments[1].toUpperCase().split('?')[0];
  }
  return 'SYSTEM';
};

export const auditTrail = (req, res, next) => {
  // Hanya catat metode yang mengubah data
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Dengarkan event 'finish' dari response untuk memastikan aksi berhasil
    res.on('finish', async () => {
      // Hanya catat jika status success (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user ? req.user.id : null;
          const aksi = getActionName(req.method, req.originalUrl);
          const entitas = getEntityName(req.originalUrl);
          
          // Ambil ID dari params jika ada (misal: /api/hr/lowongan/5 -> 5)
          const paramsValues = Object.values(req.params);
          const entitas_id = paramsValues.length > 0 ? parseInt(paramsValues[0]) : null;

          // Detail tambahan (misal payload body)
          // Hati-hati jangan mencatat password atau data sensitif
          const sanitizeBody = { ...req.body };
          if (sanitizeBody.password) sanitizeBody.password = '***';
          
          await prisma.auditTrail.create({
            data: {
              user_id: userId,
              aksi,
              entitas,
              entitas_id: isNaN(entitas_id) ? null : entitas_id,
              detail: `Path: ${req.originalUrl} | Status: ${res.statusCode} | Data: ${JSON.stringify(sanitizeBody).substring(0, 200)}`
            }
          });
        } catch (error) {
          console.error('Audit Trail Error:', error.message);
          // Kita tidak perlu crash aplikasi jika audit gagal
        }
      }
    });
  }
  next();
};

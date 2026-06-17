const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Pastikan ada ProgramBatch aktif
  let program = await prisma.programBatch.findFirst({
    where: { is_active: true }
  });

  if (!program) {
    program = await prisma.programBatch.create({
      data: {
        nama: 'Batch Juli 2025',
        tanggal_mulai: new Date('2025-07-01'),
        tanggal_selesai: new Date('2025-12-31'),
        is_active: true
      }
    });
  }

  // Hapus data lama agar bersih (opsional)
  await prisma.lowongan.deleteMany({});

  const dataLowongan = [
    {
      posisi: 'Software development',
      deskripsi: 'Kembangkan fitur produk bersama tim engineer senior menggunakan stack modern.',
      kualifikasi: 'Mahasiswa IT/Ilmu Komputer',
      divisi: 'IT & Digital',
      lokasi: 'Jakarta Selatan',
      mode_kerja: 'HYBRID',
      kuota: 10
    },
    {
      posisi: 'Data analyst',
      deskripsi: 'Eksplorasi data, buat visualisasi, dan bantu keputusan bisnis berbasis data.',
      kualifikasi: 'Mahasiswa Statistika/Matematika/IT',
      divisi: 'IT & Digital',
      lokasi: 'Jakarta Selatan',
      mode_kerja: 'HYBRID',
      kuota: 6
    },
    {
      posisi: 'Keuangan & akuntansi',
      deskripsi: 'Bantu proses rekonsiliasi, laporan keuangan, dan analisis anggaran perusahaan.',
      kualifikasi: 'Mahasiswa Akuntansi/Keuangan',
      divisi: 'Keuangan',
      lokasi: 'Jakarta Selatan',
      mode_kerja: 'WFO',
      kuota: 5
    },
    {
      posisi: 'SDM & rekrutmen',
      deskripsi: 'Terlibat dalam proses rekrutmen, pelatihan, dan manajemen talenta perusahaan.',
      kualifikasi: 'Mahasiswa Psikologi/Manajemen SDM',
      divisi: 'SDM',
      lokasi: 'Jakarta Selatan',
      mode_kerja: 'WFO',
      kuota: 4
    },
    {
      posisi: 'Riset & inovasi',
      deskripsi: 'Lakukan riset produk, analisis kompetitor, dan eksplorasi teknologi baru.',
      kualifikasi: 'Berbagai jurusan',
      divisi: 'Riset',
      lokasi: 'Remote',
      mode_kerja: 'WFH',
      kuota: 3
    },
    {
      posisi: 'Komunikasi & pemasaran',
      deskripsi: 'Bantu strategi konten, media sosial, dan komunikasi perusahaan ke publik.',
      kualifikasi: 'Mahasiswa Ilmu Komunikasi/Marketing',
      divisi: 'Komunikasi',
      lokasi: 'Jakarta Selatan',
      mode_kerja: 'HYBRID',
      kuota: 5
    }
  ];

  for (const item of dataLowongan) {
    await prisma.lowongan.create({
      data: {
        ...item,
        program_id: program.id
      }
    });
  }

  console.log('Seed lowongan berhasil ditambahkan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Pastikan Mentor ada
  let mentor = await prisma.user.findUnique({ where: { username: 'mentor1' } });
  if (!mentor) {
    mentor = await prisma.user.create({
      data: {
        username: 'mentor1',
        email: 'mentor1@example.com',
        password: hashedPassword,
        nama: 'Budi (Mentor IT)',
        role: 'MENTOR',
        no_telepon: '081234567891'
      }
    });
    console.log('Mentor created:', mentor.username);
  } else {
    console.log('Mentor already exists');
  }

  // Buat atau perbarui Anak Magang
  const magangUser = await prisma.user.upsert({
    where: { email: 'magang_seed@example.com' },
    update: {
      role: 'MAGANG',
    },
    create: {
      username: 'magang_seed',
      email: 'magang_seed@example.com',
      password: hashedPassword,
      nama: 'Dummy Anak Magang',
      role: 'MAGANG',
      no_telepon: '081234567899',
      profilMagang: {
        create: {
          id_magang: 'MAG-001',
          universitas: 'Universitas Indonesia',
          jurusan: 'Sistem Informasi',
          angkatan: '2021',
          semester: '6',
          mentor_id: mentor.id,
          divisi: 'IT Development',
          lokasi: 'Jakarta Selatan',
          tanggal_mulai: new Date(),
          tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          status: 'AKTIF'
        }
      }
    }
  });
  
  // Jika sudah ada (update), pastikan profilMagang-nya ada
  const existingProfil = await prisma.profilMagang.findUnique({ where: { user_id: magangUser.id } });
  if (!existingProfil) {
    await prisma.profilMagang.create({
      data: {
        user_id: magangUser.id,
        id_magang: 'MAG-001',
        universitas: 'Universitas Indonesia',
        jurusan: 'Sistem Informasi',
        angkatan: '2021',
        semester: '6',
        mentor_id: mentor.id,
        divisi: 'IT Development',
        lokasi: 'Jakarta Selatan',
        tanggal_mulai: new Date(),
        tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        status: 'AKTIF'
      }
    });
  }
  
  console.log('Peserta Magang created:', magangUser.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

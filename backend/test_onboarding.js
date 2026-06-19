import { PrismaClient } from '@prisma/client';
import { sendEmail } from './utils/emailService.js';

const prisma = new PrismaClient();

async function testGetMyOnboarding() {
  try {
    // Find a candidate with ACCEPTED status
    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: { status: 'ACCEPTED' },
      include: {
        lowongan: { include: { program: true } },
        user: { include: { profilKandidat: true, dokumen: true } }
      }
    });

    if (!pendaftaran) {
      console.log('No ACCEPTED pendaftaran found. Cannot test.');
      return;
    }

    const userId = pendaftaran.user_id;
    const req = { user: pendaftaran.user };

    let onboarding = await prisma.onboarding.findUnique({
      where: { pendaftaran_id: pendaftaran.id },
      include: { checklist: true, mentor: { select: { nama: true, email: true, no_telepon: true } } }
    });

    if (!onboarding) {
      console.log('Creating onboarding...');
      onboarding = await prisma.onboarding.create({
        data: {
          pendaftaran_id: pendaftaran.id,
          status: 'WAITING_CONFIRMATION',
        },
        include: { checklist: true }
      });
      await sendEmail(req.user.email, 'Selamat! Anda Diterima Magang', `Halo ${req.user.nama}`);
    }

    const dokumen = await prisma.dokumen.findMany({
      where: { user_id: userId, tipe: { in: ['KTP', 'NDA', 'PAKTA_INTEGRITAS', 'LOA'] } }
    });

    console.log('SUCCESS!');
    console.log(JSON.stringify({ data: { onboarding, pendaftaran, dokumen } }).substring(0, 200) + '...');
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testGetMyOnboarding();
